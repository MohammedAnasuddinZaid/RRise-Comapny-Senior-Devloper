"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

type MeshRef = RefObject<THREE.Mesh | null>;

function ParrotScene() {
  const group = useRef<THREE.Group>(null);
  const leftPupil: MeshRef = useRef<THREE.Mesh>(null);
  const rightPupil: MeshRef = useRef<THREE.Mesh>(null);
  const leftEye: MeshRef = useRef<THREE.Mesh>(null);
  const rightEye: MeshRef = useRef<THREE.Mesh>(null);

  const blinkUntil = useRef(0);
  const nextBlink = useRef(2.5);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.35, 0.08);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.18, 0.08);
      g.position.y = Math.sin(t * 1.1) * 0.06;
    }

    const tx = pointer.x * 0.26;
    const ty = pointer.y * 0.2;
    for (const p of [leftPupil, rightPupil]) {
      const mesh = p.current;
      if (!mesh) continue;
      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, tx, 0.14);
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, ty, 0.14);
    }

    nextBlink.current -= delta;
    if (nextBlink.current <= 0) {
      nextBlink.current = 2.5 + Math.random() * 4;
      blinkUntil.current = t + 0.16;
    }
    const closed = t < blinkUntil.current;
    const targetScale = closed ? 0.05 : 1;
    if (leftEye.current)
      leftEye.current.scale.y = THREE.MathUtils.lerp(
        leftEye.current.scale.y,
        targetScale,
        0.35,
      );
    if (rightEye.current)
      rightEye.current.scale.y = THREE.MathUtils.lerp(
        rightEye.current.scale.y,
        targetScale,
        0.35,
      );
  });

  return (
    <group ref={group}>
      {/* Head */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[1.02, 48, 48]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.32} metalness={0.04} />
      </mesh>

      {/* Crest feathers */}
      {[
        [-0.36, 1.22, 0.1, -0.45],
        [0, 1.32, 0, 0],
        [0.36, 1.22, -0.1, 0.45],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2, 0, r]}>
          <coneGeometry args={[0.2, 0.62, 16]} />
          <meshStandardMaterial color="#ececec" roughness={0.42} />
        </mesh>
      ))}

      {/* Beak */}
      <mesh position={[0, -0.28, 1.0]} rotation={[0.45, 0, 0]}>
        <coneGeometry args={[0.4, 0.72, 24]} />
        <meshStandardMaterial
          color="#ffb829"
          roughness={0.35}
          emissive="#ffb829"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, -0.62, 0.9]} rotation={[1.35, 0, 0]}>
        <coneGeometry args={[0.26, 0.42, 20]} />
        <meshStandardMaterial color="#eaa41e" roughness={0.45} />
      </mesh>

      {/* Eyes (eye-tracking) */}
      <group ref={leftEye} position={[-0.5, 0.4, 0.8]}>
        <mesh>
          <sphereGeometry args={[0.33, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.18} />
        </mesh>
        <mesh position={[0, 0, 0.26]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial
            color="#8052ff"
            roughness={0.12}
            emissive="#8052ff"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh ref={leftPupil} position={[0, 0, 0.42]}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.1} />
        </mesh>
      </group>
      <group ref={rightEye} position={[0.5, 0.4, 0.8]}>
        <mesh>
          <sphereGeometry args={[0.33, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.18} />
        </mesh>
        <mesh position={[0, 0, 0.26]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial
            color="#8052ff"
            roughness={0.12}
            emissive="#8052ff"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh ref={rightPupil} position={[0, 0, 0.42]}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

export default function ParrotLogo3D({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ width: size, height: size, pointerEvents: "none" }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 36 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 4]} intensity={1.1} color="#ffffff" />
        <pointLight position={[-3, 1, 2]} intensity={3.2} color="#8052ff" />
        <pointLight position={[3, -1, 1]} intensity={1.5} color="#ffb829" />
        <ParrotScene />
      </Canvas>
    </div>
  );
}
