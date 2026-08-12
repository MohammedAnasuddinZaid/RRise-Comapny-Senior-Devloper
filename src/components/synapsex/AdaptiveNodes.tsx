"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

const NODE_POSITIONS: [number, number, number][] = [
  [-2.7, -0.5, 0],
  [-0.9, -0.5, 0.4],
  [0.9, -0.5, 0.4],
  [2.7, -0.5, 0],
];

function Node({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.rotation.x = t * 0.4 + position[0];
    m.rotation.y = t * 0.55;
    m.position.y = position[1] + Math.sin(t * 1.2 + position[0]) * 0.18;
    const target = hovered ? 1.35 : 1;
    m.scale.x = THREE.MathUtils.lerp(m.scale.x, target, 0.1);
    m.scale.y = THREE.MathUtils.lerp(m.scale.y, target, 0.1);
    m.scale.z = THREE.MathUtils.lerp(m.scale.z, target, 0.1);
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={() => {
        setHovered(true);
        window.setTimeout(() => setHovered(false), 400);
      }}
    >
      <icosahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial
        color="#8052ff"
        wireframe
        emissive="#8052ff"
        emissiveIntensity={hovered ? 1.4 : 0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

export default function AdaptiveNodes() {
  return (
    <div className="pointer-events-auto absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 54 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 3.5]} intensity={4} color="#8052ff" />
        {NODE_POSITIONS.map((p, i) => (
          <Node key={i} position={p} />
        ))}
      </Canvas>
    </div>
  );
}
