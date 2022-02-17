import React, { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { ContactShadows, Loader, Environment, OrbitControls } from "@react-three/drei"
import Model from "./components/Models"
import Picker from "./components/Picker";
import carList from "./assets/car-list.json";

// Using a Valtio state model to bridge reactivity between
// the canvas and the dom, both can write to it and/or react to it.

export default function App() {
  const [state, setState] = useState({
    current: null,
    items: {}
  });
  const [currentCar, setCurrentCar] = useState(0);

  const updateCarIndex = (step) => {
    setCurrentCar(prev =>
      prev + step >= carList.length ? 0 : prev + step < 0 ? carList.length - 1 : prev + step
    );
  };

  return <>
    <Canvas concurrent pixelRatio={[1, 2]} camera={{ fov: 45, position: [7, 5, 2] }}>
      <ambientLight intensity={0.3} />
      <spotLight intensity={0.3} angle={0.1} penumbra={1} position={[5, 25, 20]} />
      <Suspense fallback={null}>
        <Model state={state} updateState={setState} car={carList[currentCar].name} />
        <ContactShadows
          opacity={0.5}
          width={10}
          height={10}
          blur={0.8} // Amount of blur (default=1)
          far={10} // Focal distance (default=10)
          resolution={256} // Rendertarget resolution (default=256)
        />
        <Environment files="assets/env.hdr" />
      </Suspense>
      <OrbitControls minPolarAngle={-Math.PI / 6} maxPolarAngle={Math.PI / 2} />
    </Canvas>
    <button className="arrow left" onClick={() => updateCarIndex(-1)}></button>
    <button className="arrow right" onClick={() => updateCarIndex(1)}></button>

    <Loader />
    {state.items && <Picker state={state} updateState={setState} />}
  </>
}
