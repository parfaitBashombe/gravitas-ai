import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  twinkle: number;
  twinkleSpeed: number;
  planet: boolean;
}

// ── Sun rendering ────────────────────────────────────────────────────────────

function drawSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
) {
  // Outer halo — wide, very faint
  const halo = ctx.createRadialGradient(x, y, 0, x, y, 300);
  halo.addColorStop(0, "rgba(249,115,22,0.13)");
  halo.addColorStop(0.4, "rgba(249,115,22,0.05)");
  halo.addColorStop(0.75, "rgba(249,115,22,0.015)");
  halo.addColorStop(1, "transparent");
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, 300, 0, Math.PI * 2);
  ctx.fillStyle = halo;
  ctx.fill();

  // Mid corona
  const mid = ctx.createRadialGradient(x, y, 0, x, y, 75);
  mid.addColorStop(0, "rgba(255,210,100,0.32)");
  mid.addColorStop(0.5, "rgba(249,115,22,0.14)");
  mid.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(x, y, 75, 0, Math.PI * 2);
  ctx.fillStyle = mid;
  ctx.fill();

  // Corona rays — 12 animated spikes
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + t * 0.00017;
    const inner = 20 + Math.sin(t * 0.0021 + i * 1.4) * 3;
    const outer = 56 + Math.sin(t * 0.0016 + i * 0.8) * 18;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    ctx.strokeStyle = "rgba(249,115,22,0.28)";
    ctx.lineWidth = 0.9;
    ctx.globalAlpha = 0.55;
    ctx.stroke();
  }

  // Bright pulsing core
  const pulse = 1 + Math.sin(t * 0.0032) * 0.14;
  const coreR = 17 * pulse;
  const core = ctx.createRadialGradient(x, y, 0, x, y, coreR);
  core.addColorStop(0, "rgba(255,252,220,0.98)");
  core.addColorStop(0.3, "rgba(255,190,70,0.75)");
  core.addColorStop(0.65, "rgba(249,115,22,0.4)");
  core.addColorStop(1, "transparent");
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, coreR, 0, Math.PI * 2);
  ctx.fillStyle = core;
  ctx.fill();
}

// ── Orbital rings ────────────────────────────────────────────────────────────

function drawRings(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const rings = [
    { rx: 115, ry: 38, tilt: -0.28, a: 0.07 },
    { rx: 200, ry: 66, tilt: -0.22, a: 0.045 },
    { rx: 305, ry: 98, tilt: -0.18, a: 0.028 },
  ];
  for (const ring of rings) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ring.tilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(249,115,22,${ring.a})`;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.restore();
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const stars = useRef<Star[]>([]);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sunAt = () => ({
      x: canvas.width * 0.68,
      y: canvas.height * 0.44,
    });

    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;
      const sun = sunAt();
      const count = Math.min(Math.floor((W * H) / 6800), 140);

      stars.current = Array.from({ length: count }, () => {
        const x = Math.random() * W;
        const y = Math.random() * H;

        // Seed stars with tangential orbital velocity around the sun
        const dx = x - sun.x;
        const dy = y - sun.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const spd = 0.055 * (0.6 + Math.random() * 0.8);
        const isPlanet = Math.random() < 0.04;

        return {
          x,
          y,
          vx: (-dy / d) * spd + (Math.random() - 0.5) * 0.18,
          vy: (dx / d) * spd + (Math.random() - 0.5) * 0.18,
          r: isPlanet ? 1.8 + Math.random() * 2 : 0.25 + Math.random() * 1.1,
          a: isPlanet ? 0.55 + Math.random() * 0.3 : 0.1 + Math.random() * 0.4,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.005 + Math.random() * 0.022,
          planet: isPlanet,
        };
      });
    };

    const animate = () => {
      tick.current += 1;
      const t = tick.current;
      const W = canvas.width;
      const H = canvas.height;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const sun = sunAt();

      ctx.clearRect(0, 0, W, H);

      // 1 — Sun outer halo + orbital rings (drawn first, behind stars)
      drawSun(ctx, sun.x, sun.y, t);
      drawRings(ctx, sun.x, sun.y);

      // 2 — Stars
      for (const s of stars.current) {
        // Weak solar gravity
        const gx = sun.x - s.x;
        const gy = sun.y - s.y;
        const gd = Math.sqrt(gx * gx + gy * gy) || 1;
        s.vx += (gx / gd) * 0.00038;
        s.vy += (gy / gd) * 0.00038;

        // Mouse repulsion
        const dx = s.x - mx;
        const dy = s.y - my;
        const md = Math.sqrt(dx * dx + dy * dy) || 1;
        if (md < 130) {
          const f = ((130 - md) / 130) * 3.2;
          s.vx += (dx / md) * f;
          s.vy += (dy / md) * f;
        }

        s.vx *= 0.965;
        s.vy *= 0.965;

        // Wrap at canvas edges
        s.x = (s.x + s.vx + W) % W;
        s.y = (s.y + s.vy + H) % H;

        // Twinkle
        s.twinkle += s.twinkleSpeed;
        const alpha = s.a + Math.sin(s.twinkle) * 0.065;

        // Colour temperature based on distance to sun
        const ds = Math.sqrt((s.x - sun.x) ** 2 + (s.y - sun.y) ** 2);
        const color = s.planet
          ? "#f9b96c"
          : ds < 130
            ? "#fbbf60"   // warm near sun
            : ds < 270
              ? "#f5e8cc"  // warm-white mid range
              : "#dce8ff"; // cool blue-white at distance

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fill();
      }

      // 3 — Sun core drawn on top so it's never hidden by stars
      const midG = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 72);
      midG.addColorStop(0, "rgba(255,205,90,0.35)");
      midG.addColorStop(0.55, "rgba(249,115,22,0.13)");
      midG.addColorStop(1, "transparent");
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, 72, 0, Math.PI * 2);
      ctx.fillStyle = midG;
      ctx.fill();

      // Rays pass
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.00017;
        const inner = 19 + Math.sin(t * 0.0021 + i * 1.4) * 3;
        const outer = 55 + Math.sin(t * 0.0016 + i * 0.8) * 17;
        ctx.beginPath();
        ctx.moveTo(sun.x + Math.cos(angle) * inner, sun.y + Math.sin(angle) * inner);
        ctx.lineTo(sun.x + Math.cos(angle) * outer, sun.y + Math.sin(angle) * outer);
        ctx.strokeStyle = "rgba(249,115,22,0.3)";
        ctx.lineWidth = 0.9;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
      }

      const pulse = 1 + Math.sin(t * 0.0032) * 0.14;
      const coreR = 17 * pulse;
      const core = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, coreR);
      core.addColorStop(0, "rgba(255,252,220,0.98)");
      core.addColorStop(0.3, "rgba(255,185,60,0.75)");
      core.addColorStop(0.65, "rgba(249,115,22,0.4)");
      core.addColorStop(1, "transparent");
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, coreR, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();

      ctx.globalAlpha = 1;
      raf.current = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    init();
    animate();
    window.addEventListener("resize", init);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

// ── Cursor glow (extra punch in the hero only) ───────────────────────────────

export const CursorGlow = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;

    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      el.style.left = `${e.clientX - r.left}px`;
      el.style.top = `${e.clientY - r.top}px`;
      el.style.opacity = "1";
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", () => { el.style.opacity = "0"; });

    return () => {
      section.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none rounded-full opacity-0 transition-opacity duration-700"
      style={{
        width: "700px",
        height: "700px",
        transform: "translate(-50%, -50%)",
        background:
          "radial-gradient(circle, rgba(249,115,22,0.07) 0%, rgba(249,115,22,0.02) 40%, transparent 70%)",
      }}
    />
  );
};
