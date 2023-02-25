import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { SketchPicker } from "react-color";
import "./Main.css";

const Main = () => {
  const [colors, setColors] = useState({});
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
        temp[key] = randomColor();
      }
    });
    setColors(temp);

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

  const handleColor = (color) => {
    let temp = JSON.parse(JSON.stringify(colors));
    temp[activeLayer.name] = color.hex;

    setColors(temp);
  };

  function Model() {
    console.log(nodes);
    console.log(activeLayer);

    console.log(colors);

    return (
      <group>
        {Object.keys(nodes).map((key) => {
          if (nodes[key].type === "Mesh") {
            return (
              <mesh
                key={nodes[key].uuid}
                receiveShadow
                castShadow
                geometry={nodes[key].geometry}
                onClick={(e) => (
                  e.stopPropagation(),
                  setActiveLayer({
                    desc: nodes[key].material.name,
                    name: nodes[key].name,
                  })
                )}
              >
                <meshStandardMaterial color={colors[key]} />
              </mesh>
            );
          }
        })}
      </group>
    );
  }

  return (
    <div className="MainContainer">
      <div className="ColorPicker">
        <select
          value={activeLayer.desc}
          onChange={(e) => setActiveLayer(handleActiveLayer(e.target.value))}
        >
          {options.map((option) => {
            return <option key={option}>{option}</option>;
          })}
        </select>
        <h1 style={{ textTransform: "capitalize", marginBottom: "60px" }}>
          {activeLayer.desc}
        </h1>
        <SketchPicker
          disableAlpha
          color={colors[activeLayer.name]}
          onChange={(color) => handleColor(color)}
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
