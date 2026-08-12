"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PALETTE = ["#ffffff", "#8052ff", "#ffb829", "#bdbdbd", "#9a9a9a"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Particles({ count = 1600 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color();
    const rand = mulberry32(42);
    for (let i = 0; i < count; i++) {
      const r = 3.4 * Math.cbrt(rand());
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      color.set(PALETTE[Math.floor(rand() * PALETTE.length)]);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    p.rotation.y = state.clock.elapsedTime * 0.02 + pointer.x * 0.06;
    p.rotation.x = pointer.y * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleField({
  className,
  count,
}: {
  className?: string;
  count?: number;
}) {
  // Fewer particles on small / low-power screens keeps the page smooth.
  const [resolvedCount] = useState(() => {
    if (typeof window === "undefined") return count ?? 1000;
    const isMobile = window.innerWidth < 768;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    return count ?? (isMobile ? 500 : reduced ? 400 : 1000);
  });

  return (
    <div className={className ?? "absolute inset-0"}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Particles count={resolvedCount} />
      </Canvas>
    </div>
  );
}
