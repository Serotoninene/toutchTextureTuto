import "./App.css";

import {
  Canvas,
  ThreeElements,
  ThreeEvent,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import TouchTexture from "./components/TouchTexture";

const ASPECT_RATIO = 1808 / 2400;
const HEIGHT = 6;
const WIDTH = HEIGHT * ASPECT_RATIO;

function Plane(props: ThreeElements["mesh"]) {
  const mesh = useRef<THREE.Mesh>(null!);
  const touchTexture = useMemo(
    () =>
      new TouchTexture({
        debugCanvas: true,
      }),
    []
  );
  const texture = useLoader(
    THREE.TextureLoader,
    "https://utfs.io/f/YS7X7tdqhV1FV33EHgDSsQRd26ZuyLkJArjIG15wNcWSltMo"
  );

  const uniforms = useMemo(
    () => ({
      uTouch: { value: touchTexture.texture },
      uTexture: { value: texture },
    }),
    []
  );

  useFrame(() => {
    if (!touchTexture) return;

    touchTexture.update();
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const normalizedX = e.point.x / WIDTH + 0.5;
    const normalizedY = e.point.y / HEIGHT + 0.5;
    touchTexture.addTouch({ x: normalizedX, y: normalizedY });
  };

  return (
    <mesh {...props} ref={mesh} onPointerMove={handlePointerMove}>
      <planeGeometry args={[WIDTH, HEIGHT, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          uniform sampler2D uTouch;
        

          void main() {
            vUv = uv;

            float touch = texture2D(uTouch, vUv).x;
            vec3 newPosition = position;
            newPosition.z += touch;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform sampler2D uTouch;
          uniform sampler2D uTexture;

          void main(){
            float touch = texture2D(uTouch, vUv).x;
            vec4 texture = texture2D(uTexture, vUv);
            texture.rgb *= 2.;
            texture.rgb *= touch + 0.5;

            gl_FragColor = texture;
          }
        `}
        // wireframe={true}
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
