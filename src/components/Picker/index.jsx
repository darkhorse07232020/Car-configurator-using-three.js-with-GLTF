import React from "react";
import { useProxy, proxy } from "valtio";
import { Block } from '@uiw/react-color';
import colorsList from '../../assets/colors-list.json';


const Picker = ({ state, updateState }) => {
  const snap = useProxy(proxy(state));
  return (
    <div style={{ display: snap.current ? "block" : "none" }} className="picker-wrapper">
      <h1 style={{}} > {snap.current}</h1>
      <Block
        className="picker"
        color={snap.items[snap.current]}
        colors={colorsList}
        onChange={(color) => updateState(prev => ({ ...prev, items: { ...prev.items, [snap.current]: color.hex } }))}
      />
    </div >
  )
};

export default Picker;