import "./App.css";

import {
  Canvas,
  ThreeElements,
  ThreeEvent,
  useFrame,
} from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import TouchTexture from "./components/TouchTexture";

const WIDTH = 4;
const HEIGHT = 6;

function Plane(props: ThreeElements["mesh"]) {
  const mesh = useRef<THREE.Mesh>(null!);
  const touchTexture = useMemo(() => new TouchTexture(true, 128, 60, 0.2), []);

  const uniforms = useMemo(
    () => ({
      uTouch: { value: touchTexture.texture },
    }),
    []
  );

  useFrame(() => {
    if (!touchTexture) return;

    touchTexture.update();
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    touchTexture.canDraw = true;
    const normalizedX = e.point.x / WIDTH + 0.5;
    const normalizedY = e.point.y / HEIGHT + 0.5;
    touchTexture.addTouch({ x: normalizedX, y: normalizedY });
  };

  return (
    <mesh {...props} ref={mesh} onPointerMove={handlePointerMove}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
        

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform sampler2D uTouch;

          void main(){
            vec4 touch = texture2D(uTouch, vUv);
            vec3 primaryColor = vec3(.0, 0.0, 0.0);
            vec3 secondaryColor = vec3(vUv, .0);

  

            gl_FragColor = vec4(mix(primaryColor, secondaryColor, touch.x), 1.0);
          }
        `}
      />
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
