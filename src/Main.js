import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { SketchPicker } from "react-color";
import "./Main.css";

const Main = () => {
  const [colorsAndScale, setColorsAndScale] = useState({});
  const [activeLayer, setActiveLayer] = useState({});
  const [options, setOptions] = useState([]);

  //useGLTF lets me access the different properties of model.glb
  const { nodes } = useGLTF("model.glb");

  const randomColor = (e) => {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  };

  useEffect(() => {
    let temp = {};
    let tempOptions = [];

    Object.keys(nodes).forEach((key) => {
      if (nodes[key].type === "Mesh") {
        temp[key] = { color: randomColor(), scale: 1 };
      }
    });
    setColorsAndScale(temp);

    Object.keys(nodes).forEach((key) => {
      if (nodes[key].type === "Mesh") {
        tempOptions.push(nodes[key].material.name);
      }
    });
    setOptions(tempOptions);
    setActiveLayer(handleActiveLayer(tempOptions[0]));
  }, []);

  const handleActiveLayer = (desc) => {
    let temp = { desc: desc };
    Object.keys(nodes).forEach((key) => {
      if (nodes[key].material && nodes[key].material.name === desc) {
        temp.name = key;
      }
    });
    return temp;
  };

  const handleColorAndScale = (value, attribute) => {
    let temp = JSON.parse(JSON.stringify(colorsAndScale));
    temp[activeLayer.name][attribute] = value;

    setColorsAndScale(temp);
  };

  function Model() {
    console.log(colorsAndScale);

    return (
      <group>
        {Object.keys(nodes).map((key) => {
          if (nodes[key].type === "Mesh") {
            return (
              <mesh
                key={nodes[key].uuid}
                scale={colorsAndScale[key].scale}
                geometry={nodes[key].geometry}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLayer({
                    desc: nodes[key].material.name,
                    name: nodes[key].name,
                  });
                }}
              >
                <meshStandardMaterial color={colorsAndScale[key].color} />
              </mesh>
            );
          } else return "";
        })}
      </group>
    );
  }

  return (
    <div className="MainContainer">
      <div className="ColorPicker">
        <span className="Title">{activeLayer.desc}</span>
        <select
          value={activeLayer.desc}
          onChange={(e) => setActiveLayer(handleActiveLayer(e.target.value))}
        >
          {options.map((option) => {
            return <option key={option}>{option}</option>;
          })}
        </select>
        <SketchPicker
          disableAlpha
          color={
            colorsAndScale[activeLayer.name] &&
            colorsAndScale[activeLayer.name].color
          }
          onChange={(color) => handleColorAndScale(color.hex, "color")}
        />
        <span className="Title">Resize</span>
        <input
          type="range"
          min={0.5}
          max={2}
          value={
            colorsAndScale[activeLayer.name]
              ? colorsAndScale[activeLayer.name].scale
              : 1
          }
          onChange={(e) => handleColorAndScale(e.target.value, "scale")}
          step={0.1}
        />
      </div>
      <div className="CanvasContainer">
        <Canvas camera={{ position: [2, 1, 2], zoom: 2 }}>
          <OrbitControls />
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <Model />
        </Canvas>
      </div>
    </div>
  );
};

export default Main;
