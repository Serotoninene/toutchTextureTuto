import "./App.css";

import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Plane(props: ThreeElements["mesh"]) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {});

  return (
    <mesh {...props} ref={mesh}>
      <planeGeometry args={[4, 6]} />
      <meshStandardMaterial color="#2f74c0" />
    </mesh>
  );
}

function Scene() {
  return (
    <Canvas style={{ height: "100vh", width: "100vw" }}>
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Plane />
    </Canvas>
  );
}

function App() {
  return (
    <div className="bg-red-50">
      <header className="App-header">
        <Scene />
      </header>
    </div>
  );
}

export default App;
