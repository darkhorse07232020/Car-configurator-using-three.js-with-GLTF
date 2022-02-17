import React, { useRef, useState, useEffect } from "react"
import { proxy, useProxy } from "valtio"
import { useGLTF } from "@react-three/drei"

export default function Model({ state, updateState, car }) {
  const { scene: theModel } = useGLTF(`assets/cars/${car}`);

  const arrayColor = {};
  const arrayModel = [];

  const [renderGroup, setRenderGroup] = useState([]);
  const loadPartName = (parent) => {
    parent.traverse(o => {
      if (o.isMesh) {
        arrayColor[o.name] = "#" + o.material.color.getHexString();
        const tempGeo = o.geometry;
        tempGeo.name = o.name;
        tempGeo.center = o.position

        const tempMat = o.material.clone();
        switch (o.material.name) {
          case 'chrome':
          case 'rim':
            tempMat.metalness = 0.6;
            tempMat.roughness = 0.2;
            break;
          case 'carpaint':
            tempMat.roughness = 0.05;
            tempMat.metalness = 0.1;
            tempMat.envMapIntensity = 0.2;
            break;
          default:
            break;
        }

        if (o.material.name.includes("glass")) {
          tempMat.roughness = 0.0;
          tempMat.metalness = 0.5;
          tempMat.envMapIntensity = 1;
        }

        tempMat.name = o.name;

        arrayModel.push({ name: o.name, geometry: tempGeo, material: tempMat });
      }
    });

    updateState({
      current: null,
      items: arrayColor
    });
    setRenderGroup([...arrayModel]);
  }

  useEffect(() => {
    if (theModel) {
      loadPartName(theModel);
    }
  }, [theModel])

  const ref = useRef();

  const snap = useProxy(proxy(state));
  // Drei's useGLTF hook sets up draco automatically, that's how it differs from useLoader(GLTFLoader, url)

  // Cursor showing current color
  const [hovered, setHovered] = useState(null)
  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`
    document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(hovered ? cursor : auto)}'), auto`
  }, [hovered])

  // Using the GLTFJSX output here to wire in app-state and hook up events
  return (
    <group
      ref={ref}
      dispose={null}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(e.object.material.name))}
      onPointerOut={(e) => e.intersections.length === 0 && setHovered(null)}
      onPointerMissed={() => (updateState(prev => ({ ...prev, current: null })))}
      onPointerDown={(e) => (e.stopPropagation(), (updateState(prev => ({ ...prev, current: e.object.material.name }))))}>
      {
        renderGroup.map((object) => {
          return <mesh geometry={object.geometry} material={object.material} material-color={snap.items[object.name]} key={object.name} scale={[0.01, 0.01, 0.01]} />
        })
      }
    </group>
  )
};
