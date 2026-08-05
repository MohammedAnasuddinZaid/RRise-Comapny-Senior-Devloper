"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Edit2, Check, Volume2, VolumeX } from "lucide-react";

const FOCUS_IMAGES = Array.from({ length: 10 }, (_, i) => `/focus/${i + 1}.webp`);
const STROKE_SRC = `/strokes/1.png`;
const DEFAULT_TIME = 25 * 60;

// Each "stroke" is a random transform to apply the brush PNG as a mask patch
interface StrokeDef {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number; // For smooth fade-in
  targetOpacity: number;
}

export function FocusReveal() {
  const [mounted, setMounted] = useState(false);

  // Canvas refs
  const canvasRef   = useRef<HTMLCanvasElement>(null);  // visible output canvas
  const maskRef     = useRef<HTMLCanvasElement>(null);  // offscreen mask (accumulates strokes)
  const strokeImgRef  = useRef<HTMLImageElement | null>(null);
  const paintImgRef   = useRef<HTMLImageElement | null>(null);
  const strokeDefsRef = useRef<StrokeDef[]>([]);

  // Timer state
  const [totalTime, setTotalTime] = useState(DEFAULT_TIME);
  const [timeLeft, setTimeLeft]  = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [inputH, setInputH] = useState("0");
  const [inputM, setInputM] = useState("25");
  const [inputS, setInputS] = useState("0");

  // Loading
  const [assetsReady, setAssetsReady] = useState(false);

  // Smooth animation
  const rafRef         = useRef<number | undefined>(undefined);
  const smoothTimeRef  = useRef<number>(DEFAULT_TIME); // float seconds
  const lastRafTs      = useRef<number>(0);
  const totalTimeRef   = useRef<number>(DEFAULT_TIME);

  // Audio
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);

  // ── mount guard (fixes hydration) ────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  // ── audio init ───────────────────────────────────────────────────────────
  useEffect(() => {
    musicRef.current = new Audio("/music/music.mp3");
    musicRef.current.loop = true;
    clickRef.current = new Audio("/sounds/click.mp3");
    return () => { musicRef.current?.pause(); };
  }, []);

  const playClick = () => {
    if (clickRef.current) { clickRef.current.currentTime = 0; clickRef.current.play().catch(() => {}); }
  };

  // ── load assets (stroke PNG + one random painting) ───────────────────────
  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed: ${src}`));
      img.src = src;
    });

  const loadAssets = useCallback(async () => {
    setAssetsReady(false);
    try {
      const strokeImg = await loadImage(STROKE_SRC);
      const idx       = Math.floor(Math.random() * FOCUS_IMAGES.length);
      const paintImg  = await loadImage(FOCUS_IMAGES[idx]);

      strokeImgRef.current = strokeImg;
      paintImgRef.current  = paintImg;

      // Build mask canvas sized to the stroke image (we'll scale it per-draw)
      // We use actual screen canvas size once DOM is ready; defer to initCanvas
      setAssetsReady(true);
    } catch (e) {
      console.error("FocusReveal asset load error:", e);
    }
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  // ── initialise main + mask canvases once DOM + assets are ready ───────────
  const initCanvases = useCallback(() => {
    const canvas = canvasRef.current;
    const mask   = maskRef.current;
    if (!canvas || !mask || !paintImgRef.current) return;

    // Use device pixel ratio for crisp HD rendering
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth  * dpr;
    const H   = canvas.offsetHeight * dpr;

    canvas.width = W;
    canvas.height = H;
    mask.width  = W;
    mask.height = H;

    // Clear mask to fully black (will be used as alpha mask)
    const mctx = mask.getContext("2d");
    if (mctx) { mctx.clearRect(0, 0, W, H); }

    // Calculate image aspect ratio to prevent stretching
    const img = paintImgRef.current;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = W / H;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas - fit to width
      drawWidth = W;
      drawHeight = W / imgAspect;
      offsetX = 0;
      offsetY = (H - drawHeight) / 2;
    } else {
      // Image is taller than canvas - fit to height
      drawHeight = H;
      drawWidth = H * imgAspect;
      offsetX = (W - drawWidth) / 2;
      offsetY = 0;
    }

    // Store draw dimensions for rendering
    (canvas as any)._drawDims = { drawWidth, drawHeight, offsetX, offsetY };

    // Generate stroke defs at this resolution
    const sw = strokeImgRef.current!.naturalWidth;
    const sh = strokeImgRef.current!.naturalHeight;
    const avgDim = (sw + sh) / 2;
    const numStrokes = 800;
    const defs: StrokeDef[] = [];
    for (let i = 0; i < numStrokes; i++) {
      // Scale stroke so it covers a patch roughly 8–25% of the canvas short side
      const patchFraction = 0.08 + Math.random() * 0.17;
      const scale = (Math.min(W, H) * patchFraction) / avgDim;
      const targetOpacity = 0.85 + Math.random() * 0.15;
      defs.push({
        x: Math.random() * W,
        y: Math.random() * H,
        rotation: Math.random() * 360,
        scale,
        flipX: Math.random() > 0.5,
        flipY: Math.random() > 0.5,
        opacity: 0, // Start at 0 for fade-in
        targetOpacity,
      });
    }
    // Shuffle for random reveal order
    for (let i = defs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [defs[i], defs[j]] = [defs[j], defs[i]];
    }
    strokeDefsRef.current = defs;
  }, []);

  useEffect(() => {
    if (!assetsReady) return;
    // Wait one frame so canvas has laid out
    const id = requestAnimationFrame(() => initCanvases());
    return () => cancelAnimationFrame(id);
  }, [assetsReady, initCanvases]);

  // ── draw a frame given a progress 0‥1 ────────────────────────────────────
  const renderFrame = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    const mask   = maskRef.current;
    const paintImg  = paintImgRef.current;
    const strokeImg = strokeImgRef.current;
    if (!canvas || !mask || !paintImg || !strokeImg) return;

    const ctx  = canvas.getContext("2d");
    const mctx = mask.getContext("2d");
    if (!ctx || !mctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const dims = (canvas as any)._drawDims || { drawWidth: W, drawHeight: H, offsetX: 0, offsetY: 0 };
    const { drawWidth, drawHeight, offsetX, offsetY } = dims;

    // --- 1. Update mask canvas with smooth fade-in ---
    // Number of strokes to reveal matches progress exactly
    const targetStrokes = Math.floor(progress * strokeDefsRef.current.length);
    const currentStrokes = (mask as any)._drawnStrokes ?? 0;

    // Smooth fade-in: interpolate opacity for strokes that are currently revealing
    // We redraw the mask each frame to animate opacity transitions
    mctx.clearRect(0, 0, W, H);
    
    for (let i = 0; i < targetStrokes; i++) {
      const d = strokeDefsRef.current[i];
      
      // Calculate fade-in progress based on stroke index and overall progress
      // Each stroke fades in over a small portion of the total progress
      const strokeProgress = (progress * strokeDefsRef.current.length - i) / 10; // 10 strokes fade-in window
      const clampedProgress = Math.max(0, Math.min(1, strokeProgress));
      
      // Smooth easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - clampedProgress, 3);
      
      // Interpolate opacity
      d.opacity = easedProgress * d.targetOpacity;
      
      mctx.save();
      mctx.translate(d.x, d.y);
      mctx.rotate((d.rotation * Math.PI) / 180);
      const sx = d.scale * (d.flipX ? -1 : 1);
      const sy = d.scale * (d.flipY ? -1 : 1);
      mctx.scale(sx, sy);
      mctx.globalAlpha = d.opacity;
      mctx.drawImage(
        strokeImg,
        -strokeImg.naturalWidth / 2,
        -strokeImg.naturalHeight / 2,
        strokeImg.naturalWidth,
        strokeImg.naturalHeight
      );
      mctx.restore();
    }
    
    (mask as any)._drawnStrokes = targetStrokes;

    // --- 2. Compose output canvas ---
    ctx.clearRect(0, 0, W, H);

    if (progress >= 1) {
      // Full reveal — draw painting directly at correct aspect ratio
      ctx.drawImage(paintImg, offsetX, offsetY, drawWidth, drawHeight);
      return;
    }

    // ── Base layer: always-visible dimmed image ──
    // Draw the painting at low opacity so the scene is always recognisable
    ctx.globalAlpha = 0.25;
    ctx.drawImage(paintImg, offsetX, offsetY, drawWidth, drawHeight);
    ctx.globalAlpha = 1;

    // ── Masked layer: full-quality image revealed through brush strokes ──
    // 1. Draw the full painting into an offscreen buffer
    const tmp = document.createElement("canvas");
    tmp.width  = W;
    tmp.height = H;
    const tctx = tmp.getContext("2d")!;
    tctx.drawImage(paintImg, offsetX, offsetY, drawWidth, drawHeight);

    // 2. Clip that buffer to only where strokes have been painted
    tctx.globalCompositeOperation = "destination-in";
    tctx.drawImage(mask, 0, 0, W, H);
    tctx.globalCompositeOperation = "source-over";

    // 3. Composite the masked painting on top of the dimmed base
    ctx.drawImage(tmp, 0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

  }, []);

  // ── animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!assetsReady) return;

    const loop = (ts: number) => {
      if (isRunning) {
        const delta = lastRafTs.current ? (ts - lastRafTs.current) / 1000 : 0;
        lastRafTs.current = ts;
        smoothTimeRef.current = Math.max(0, smoothTimeRef.current - delta);
        const p = totalTimeRef.current > 0
          ? 1 - smoothTimeRef.current / totalTimeRef.current
          : 1;
        renderFrame(Math.min(p, 0.999)); // cap at 0.999 — full only at 100%
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    lastRafTs.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, assetsReady, renderFrame]);

  // ── 1-second interval (drives timeLeft state) ────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsFinished(true);
          musicRef.current?.pause();
          smoothTimeRef.current = 0;
          renderFrame(1);      // full reveal at finish
          return 0;
        }
        const next = prev - 1;
        smoothTimeRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, renderFrame]);

  // ── reset mask helper ─────────────────────────────────────────────────────
  const resetMask = () => {
    const mask = maskRef.current;
    if (!mask) return;
    const mctx = mask.getContext("2d");
    if (mctx) mctx.clearRect(0, 0, mask.width, mask.height);
    (mask as any)._drawnStrokes = 0;
  };

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleStart = () => {
    playClick();
    if (isFinished) {
      setIsFinished(false);
      setTimeLeft(totalTime);
      smoothTimeRef.current = totalTime;
      totalTimeRef.current  = totalTime;
      resetMask();
      loadAssets(); // new random painting
    }
    lastRafTs.current = 0;
    setIsRunning(true);
    if (musicEnabled) {
      musicRef.current?.play().catch(() => {});
    }
  };

  const handlePause = () => {
    playClick();
    setIsRunning(false);
    musicRef.current?.pause();
  };

  const handleReset = () => {
    playClick();
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(totalTime);
    smoothTimeRef.current = totalTime;
    totalTimeRef.current  = totalTime;
    resetMask();
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0; }
    renderFrame(0);
  };

  const handleMusicToggle = () => {
    playClick();
    setMusicEnabled(prev => {
      const newState = !prev;
      if (newState && isRunning) {
        musicRef.current?.play().catch(() => {});
      } else {
        musicRef.current?.pause();
      }
      return newState;
    });
  };

  const handleEditOpen = () => {
    if (isRunning) return;
    playClick();
    const h = Math.floor(totalTime / 3600);
    const m = Math.floor((totalTime % 3600) / 60);
    const s = totalTime % 60;
    setInputH(String(h));
    setInputM(String(m));
    setInputS(String(s));
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    playClick();
    let h = Math.max(0, parseInt(inputH, 10) || 0);
    let m = Math.max(0, parseInt(inputM, 10) || 0);
    let s = Math.max(0, parseInt(inputS, 10) || 0);
    let total = h * 3600 + m * 60 + s;
    if (total <= 0) total = 25 * 60;
    setTotalTime(total);
    setTimeLeft(total);
    smoothTimeRef.current = total;
    totalTimeRef.current  = total;
    setIsEditing(false);
    setIsRunning(false);
    setIsFinished(false);
    resetMask();
    renderFrame(0);
  };

  const fmt = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const progressPct = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;

  if (!mounted) return null;

  return (
    /* Full-screen container — fills whatever space AppLayout gives us */
    <div className="relative w-full h-full overflow-hidden bg-black">

      {/* Hidden offscreen mask canvas — same size as visible canvas */}
      <canvas ref={maskRef} className="hidden" />

      {/* ── Full-screen painting canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: assetsReady ? "block" : "none" }}
      />

      {/* Loading state */}
      {!assetsReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* ── Overlay UI — centered on canvas ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

        {/* Timer display */}
        <div
          className="pointer-events-auto text-center select-none mb-6"
          onClick={handleEditOpen}
        >
          {isEditing ? (
            <div
              className="flex items-center justify-center gap-1"
              onClick={e => e.stopPropagation()}
            >
              {/* HH */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={inputH}
                onChange={e => setInputH(e.target.value.replace(/\D/g, ""))}
                className="w-16 bg-black/50 backdrop-blur text-white text-4xl font-bold text-center rounded-lg border border-white/30 focus:outline-none focus:border-white/70 appearance-none"
                style={{ MozAppearance: "textfield" } as React.CSSProperties}
              />
              <span className="text-white/70 text-3xl font-bold">:</span>
              {/* MM */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={inputM}
                onChange={e => setInputM(e.target.value.replace(/\D/g, ""))}
                className="w-16 bg-black/50 backdrop-blur text-white text-4xl font-bold text-center rounded-lg border border-white/30 focus:outline-none focus:border-white/70 appearance-none"
                style={{ MozAppearance: "textfield" } as React.CSSProperties}
              />
              <span className="text-white/70 text-3xl font-bold">:</span>
              {/* SS */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={inputS}
                onChange={e => setInputS(e.target.value.replace(/\D/g, ""))}
                className="w-16 bg-black/50 backdrop-blur text-white text-4xl font-bold text-center rounded-lg border border-white/30 focus:outline-none focus:border-white/70 appearance-none"
                style={{ MozAppearance: "textfield" } as React.CSSProperties}
              />
              <button
                onClick={handleSaveTime}
                className="ml-3 p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="group cursor-pointer">
              <div
                className="text-7xl md:text-8xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-tighter"
                style={{ fontFamily: "'Inter', sans-serif", textShadow: "0 0 30px rgba(0,0,0,0.8)" }}
              >
                {fmt(timeLeft)}
              </div>
              {!isRunning && (
                <div className="flex items-center justify-center gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4 text-white" />
                  <span className="text-white text-xs uppercase tracking-widest">Edit time</span>
                </div>
              )}
            </div>
          )}

          {/* Status label */}
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/60 drop-shadow-md">
            {isFinished
              ? "✦ Masterpiece complete ✦"
              : isRunning
              ? "Creating your masterpiece..."
              : "Click timer to set duration"}
          </p>
        </div>

        {/* Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={handleMusicToggle}
            disabled={isEditing}
            className="p-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl"
            title={musicEnabled ? "Music On" : "Music Off"}
          >
            {musicEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button
            onClick={handleStart}
            disabled={isRunning || isEditing}
            className="p-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            <Play className="w-6 h-6" />
          </button>
          <button
            onClick={handlePause}
            disabled={!isRunning || isEditing}
            className="p-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            <Pause className="w-6 h-6" />
          </button>
          <button
            onClick={handleReset}
            disabled={isEditing}
            className="p-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white disabled:opacity-40 transition-all shadow-xl"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ── Progress bar at the very bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-white/70 transition-none"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
