"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, mounted } = useTheme();

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: any[] = [];
    const particleCount = window.innerWidth < 768 ? 400 : 800;
    
    // Sphere settings
    const radius = Math.min(width, height) * 0.35;
    const centerX = width / 2;
    const centerY = height / 2;

    // Golden ratio for even distribution on a sphere
    const phi = Math.PI * (3 - Math.sqrt(5));

    // Theme-specific colors (solid colors, no gradients)
    const themeColors = {
      default: {
        primary: '#00ff87',
        secondary: '#ffffff',
        grid: '#ffffff',
        connection: '#ffffff'
      },
      sky: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        grid: '#93c5fd',
        connection: '#93c5fd'
      },
      diva: {
        primary: '#ec4899',
        secondary: '#f472b6',
        grid: '#f9a8d4',
        connection: '#f9a8d4'
      },
      manga: {
        primary: '#ffffff',
        secondary: '#cccccc',
        grid: '#ffffff',
        connection: '#ffffff'
      }
    };

    const colors = themeColors[theme as keyof typeof themeColors] || themeColors.default;

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      
      const theta = phi * i; // golden angle increment
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Randomize distance from center slightly for a "fuzzy" sphere look
      const fuzz = 0.9 + Math.random() * 0.2;

      particles.push({
        x: x * radius * fuzz,
        y: y * radius * fuzz,
        z: z * radius * fuzz,
        baseX: x * radius * fuzz,
        baseY: y * radius * fuzz,
        baseZ: z * radius * fuzz,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.8 ? colors.primary : colors.secondary
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let rotationX = 0;
    let rotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.0005;
      mouseY = (e.clientY - height / 2) * 0.0005;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let autoRotateX = 0;
    let autoRotateY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid background (removed as requested)

      // Smooth mouse rotation interaction - slowed down
      autoRotateX += (mouseY - autoRotateX) * 0.02 + 0.0003;
      autoRotateY += (mouseX - autoRotateY) * 0.02 + 0.0006;

      const cosX = Math.cos(autoRotateX);
      const sinX = Math.sin(autoRotateX);
      const cosY = Math.cos(autoRotateY);
      const sinY = Math.sin(autoRotateY);

      // Sort particles by Z index for proper 3D rendering (back to front)
      particles.sort((a, b) => {
        const az = a.baseZ * cosX - a.baseY * sinX;
        const bz = b.baseZ * cosX - b.baseY * sinX;
        return az - bz;
      });

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D Rotation
        // Rotate around X axis
        const y1 = p.baseY * cosX - p.baseZ * sinX;
        const z1 = p.baseZ * cosX + p.baseY * sinX;

        // Rotate around Y axis
        const x2 = p.baseX * cosY + z1 * sinY;
        const z2 = z1 * cosY - p.baseX * sinY;

        // Perspective projection
        const fov = 800;
        const scale = fov / (fov + z2);

        const x2d = centerX + x2 * scale;
        const y2d = centerY + y1 * scale;

        // Mouse Repulsion
        const dx = x2d - mouseX * 2000 - centerX;
        const dy = y2d - mouseY * 2000 - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let offsetX = 0;
        let offsetY = 0;
        
        if (dist < 150) {
            const force = (150 - dist) / 150;
            offsetX = (dx / dist) * force * 30;
            offsetY = (dy / dist) * force * 30;
        }

        const finalX = x2d + offsetX;
        const finalY = y2d + offsetY;

        // Draw particle
        ctx.beginPath();
        ctx.arc(finalX, finalY, p.size * scale, 0, Math.PI * 2);
        
        // Connect close particles
        if (i > 0 && Math.random() > 0.95 && z2 > -radius * 0.5) {
          const prev = particles[i-1];
          const py1 = prev.baseY * cosX - prev.baseZ * sinX;
          const pz1 = prev.baseZ * cosX + prev.baseY * sinX;
          const px2 = prev.baseX * cosY + pz1 * sinY;
          const pz2 = pz1 * cosY - prev.baseX * sinY;
          const pscale = fov / (fov + pz2);
          const px2d = centerX + px2 * pscale;
          const py2d = centerY + py1 * pscale;
          
          ctx.strokeStyle = colors.connection;
          ctx.lineWidth = 0.5;
          ctx.moveTo(finalX, finalY);
          ctx.lineTo(px2d, py2d);
          ctx.stroke();
        }

        ctx.fillStyle = p.color;
        // Fade out particles far away in the back
        ctx.globalAlpha = Math.max(0.1, Math.min(1, scale * 1.5 - 0.5));
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, mounted]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}
