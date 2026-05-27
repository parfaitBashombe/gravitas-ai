import { useEffect, useRef } from "react";

// ── Galaxy geometry ───────────────────────────────────────────────────────────
const DISK_R   = 300;
const BULGE_R  = 55;
const ARM_A    = 26;
const ARM_B    = 0.26;
const NUM_ARMS = 2;
const INCL     = 0.88;
const MAJOR    = 0;

interface Star {
  angle: number;
  radius: number;
  rotSpeed: number;
  size: number;
  alpha: number;
  twinkle: number;
  twinkleSpeed: number;
  r: number; g: number; b: number;
}

// ── Color palettes ────────────────────────────────────────────────────────────

function armStarColor(): [number, number, number] {
  const roll = Math.random();
  if (roll < 0.22) return [220 + ~~(Math.random() * 35), 235 + ~~(Math.random() * 20), 255];
  if (roll < 0.52) return [248 + ~~(Math.random() * 7),  245 + ~~(Math.random() * 10), 230 + ~~(Math.random() * 20)];
  if (roll < 0.76) return [255, 210 + ~~(Math.random() * 35), 120 + ~~(Math.random() * 60)];
  return              [255, 155 + ~~(Math.random() * 45),  30 + ~~(Math.random() * 40)];
}

function bulgeStarColor(): [number, number, number] {
  const roll = Math.random();
  if (roll < 0.50) return [255, 180 + ~~(Math.random() * 40),  60 + ~~(Math.random() * 50)];
  if (roll < 0.80) return [255, 215 + ~~(Math.random() * 30), 130 + ~~(Math.random() * 50)];
  return              [255, 145 + ~~(Math.random() * 30),  22 + ~~(Math.random() * 30)];
}

function haloStarColor(): [number, number, number] {
  const roll = Math.random();
  if (roll < 0.5) return [200 + ~~(Math.random() * 55), 195 + ~~(Math.random() * 50), 185 + ~~(Math.random() * 40)];
  return [160 + ~~(Math.random() * 60), 170 + ~~(Math.random() * 50), 200 + ~~(Math.random() * 40)];
}

// ── Galaxy star generation ────────────────────────────────────────────────────

function generateStars(): Star[] {
  const stars: Star[] = [];

  const add = (radius: number, angle: number, [r, g, b]: [number, number, number], size: number, alpha: number) => {
    stars.push({
      angle, radius,
      rotSpeed: 0.00012 / Math.max(0.08, radius * 0.0035),
      size, alpha,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.004 + Math.random() * 0.018,
      r, g, b,
    });
  };

  for (let arm = 0; arm < NUM_ARMS; arm++) {
    const armBase = (arm / NUM_ARMS) * Math.PI * 2;
    const count   = 900;
    for (let i = 0; i < count; i++) {
      const t     = (i / count) * 4.8 * Math.PI;
      const rBase = ARM_A * Math.exp(ARM_B * t);
      if (rBase > DISK_R * 1.08) continue;
      const rOff = (Math.random() - 0.5) * (rBase * 0.22 + 18);
      const aOff = (Math.random() - 0.5) * 0.28;
      const r    = Math.max(BULGE_R * 0.6, rBase + rOff);
      const a    = t + armBase + aOff;
      const density = Math.max(0, 1 - rBase / DISK_R);
      add(r, a, armStarColor(), 0.35 + density * 0.9 * Math.random(), 0.28 + density * 0.55 * Math.random());
    }
  }

  for (let i = 0; i < 700; i++) {
    const r = -Math.log(1 - Math.random() * 0.998) * BULGE_R * 0.45;
    const a = Math.random() * Math.PI * 2;
    const heat = Math.max(0, 1 - r / BULGE_R);
    add(Math.min(r, BULGE_R * 1.4), a, bulgeStarColor(), 0.4 + heat * 1.1, 0.35 + heat * 0.55);
  }

  for (let i = 0; i < 450; i++) {
    const r = BULGE_R + Math.random() * (DISK_R + 55);
    const a = Math.random() * Math.PI * 2;
    add(r, a, haloStarColor(), 0.22 + Math.random() * 0.55, 0.06 + Math.random() * 0.20);
  }

  return stars;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface GalaxyProps {
  /** Center X as a fraction of canvas width (default 0.70) */
  x?: number;
  /** Center Y as a fraction of canvas height (default 0.50) */
  y?: number;
  /** Uniform scale multiplier for galaxy geometry (default 1) */
  scale?: number;
  /** Canvas globalAlpha for the whole galaxy (default 1) */
  opacity?: number;
  /** Fill the canvas with the warm dark background (default true) */
  drawBackground?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Galaxy = ({
  x = 0.70,
  y = 0.50,
  scale = 1,
  opacity = 1,
  drawBackground = true,
}: GalaxyProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const tickRef   = useRef(0);
  const starsRef  = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      starsRef.current = generateStars();
    };

    const S = scale;
    const bulgeR = BULGE_R * S;

    const drawCore = (cx: number, cy: number, t: number) => {
      const haze = ctx.createRadialGradient(cx, cy, 0, cx, cy, bulgeR * 5);
      haze.addColorStop(0,    "rgba(249,115,22,0.18)");
      haze.addColorStop(0.22, "rgba(234,88,12,0.08)");
      haze.addColorStop(0.55, "rgba(180,60,5,0.03)");
      haze.addColorStop(1,    "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, bulgeR * 5, 0, Math.PI * 2);
      ctx.fillStyle = haze;
      ctx.fill();

      const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, bulgeR * 1.6);
      inner.addColorStop(0,    "rgba(255,245,220,0.95)");
      inner.addColorStop(0.10, "rgba(255,210,120,0.75)");
      inner.addColorStop(0.30, "rgba(249,115,22,0.42)");
      inner.addColorStop(0.65, "rgba(180,65,8,0.15)");
      inner.addColorStop(1,    "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, bulgeR * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = inner;
      ctx.fill();

      const pulse = 1 + Math.sin(t * 0.0018) * 0.10;
      const nR    = 5 * S * pulse;
      const nuc   = ctx.createRadialGradient(cx, cy, 0, cx, cy, nR);
      nuc.addColorStop(0,   "rgba(255,255,255,1)");
      nuc.addColorStop(0.4, "rgba(255,248,210,0.80)");
      nuc.addColorStop(1,   "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, nR, 0, Math.PI * 2);
      ctx.fillStyle = nuc;
      ctx.fill();
    };

    const drawDiskHaze = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(MAJOR);
      ctx.scale(S, S * INCL);

      const haze = ctx.createRadialGradient(0, 0, BULGE_R, 0, 0, DISK_R * 1.1);
      haze.addColorStop(0,    "rgba(249,115,22,0.06)");
      haze.addColorStop(0.35, "rgba(200,80,10,0.03)");
      haze.addColorStop(0.72, "rgba(120,45,5,0.015)");
      haze.addColorStop(1,    "transparent");
      ctx.beginPath();
      ctx.ellipse(0, 0, DISK_R * 1.1, DISK_R * 1.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = haze;
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      tickRef.current++;
      const t  = tickRef.current;
      const W  = canvas.width;
      const H  = canvas.height;
      const cx = W * x;
      const cy = H * y;

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = opacity;

      if (drawBackground) {
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.80);
        bg.addColorStop(0,    "rgba(22,11,3,1)");
        bg.addColorStop(0.28, "rgba(14,7,2,1)");
        bg.addColorStop(0.60, "rgba(10,5,1,1)");
        bg.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      drawDiskHaze(cx, cy);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(MAJOR);
      ctx.scale(S, S * INCL);

      for (const s of starsRef.current) {
        s.angle   += s.rotSpeed;
        s.twinkle += s.twinkleSpeed;

        const sx = Math.cos(s.angle) * s.radius;
        const sy = Math.sin(s.angle) * s.radius;

        const twinkleAlpha = s.alpha + Math.sin(s.twinkle) * 0.06;
        ctx.globalAlpha = Math.max(0, Math.min(1, twinkleAlpha * opacity));
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
        ctx.fill();
      }

      ctx.restore();
      ctx.globalAlpha = opacity;

      drawCore(cx, cy, t);

      rafRef.current = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", init);
    };
  }, [x, y, scale, opacity, drawBackground]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  );
};
