import { useEffect, useRef } from "react";

// ── Physical parameters (canvas pixels) ──────────────────────────────────────
const R_SHADOW = 50;   // apparent shadow (photon sphere ≈ 2.6× Schwarzschild radius)
const R_ISCO   = 70;   // innermost stable circular orbit — sharp inner disk edge
const R_OUTER  = 320;  // outer disk edge
const INCL     = 0.30; // disk inclination factor: ry = rx × INCL (~17° from edge-on)
const TILT     = -0.18; // overall disk plane rotation

interface Particle {
  angle: number;
  radius: number;
  size: number;
  alpha: number;
  speed: number;
  infall: number;
}

function spawnParticle(): Particle {
  return {
    angle: Math.random() * Math.PI * 2,
    radius: R_ISCO + 10 + Math.random() * (R_OUTER + 70),
    size: 0.2 + Math.random() * 1.1,
    alpha: 0.1 + Math.random() * 0.5,
    speed: (0.55 + Math.random() * 1.3) * (Math.random() < 0.5 ? 1 : -1),
    infall: 0.035 + Math.random() * 0.12,
  };
}

// ── Blackbody-inspired thermal color mapping ──────────────────────────────────
// heat 0 = cold outer disk, 1 = white-hot inner edge
function thermal(heat: number): [number, number, number] {
  if (heat < 0.22) {
    const t = heat / 0.22;
    return [Math.round(110 + t * 100), Math.round(18 + t * 32), 4];
  }
  if (heat < 0.48) {
    const t = (heat - 0.22) / 0.26;
    return [Math.round(210 + t * 45), Math.round(50 + t * 95), Math.round(4 + t * 16)];
  }
  if (heat < 0.72) {
    const t = (heat - 0.48) / 0.24;
    return [255, Math.round(145 + t * 90), Math.round(20 + t * 65)];
  }
  if (heat < 0.90) {
    const t = (heat - 0.72) / 0.18;
    return [255, Math.round(235 + t * 18), Math.round(85 + t * 110)];
  }
  const t = (heat - 0.90) / 0.10;
  return [255, 253, Math.round(195 + t * 60)];
}

// ── Main component ────────────────────────────────────────────────────────────

export const BlackHole = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const tickRef   = useRef(0);
  const ptRef     = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const n = Math.min(Math.floor(canvas.width * canvas.height / 4200), 170);
      ptRef.current = Array.from({ length: n }, spawnParticle);
    };

    // ── Accretion disk ────────────────────────────────────────────────────────
    // Rendered via clipped gradient fills — cheap but visually rich.
    const drawDisk = (cx: number, cy: number, t: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(TILT);
      ctx.scale(1, INCL); // flatten Y → perspective foreshortening

      const pad = 8;
      const box = R_OUTER + pad;

      // Clip to donut (outer ellipse minus inner hole at ISCO)
      const clipDonut = (inner = R_ISCO, outer = R_OUTER + pad) => {
        ctx.beginPath();
        ctx.arc(0, 0, outer, 0, Math.PI * 2);
        ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
        ctx.clip("evenodd");
      };

      // 1. Radial temperature gradient ─────────────────────────────────────
      ctx.save();
      clipDonut();
      const temp = ctx.createRadialGradient(0, 0, R_ISCO, 0, 0, R_OUTER);
      temp.addColorStop(0.00, "rgba(255,252,210,0.96)"); // white-hot at ISCO
      temp.addColorStop(0.06, "rgba(255,225,130,0.90)");
      temp.addColorStop(0.16, "rgba(255,178,55,0.82)");
      temp.addColorStop(0.32, "rgba(249,115,22,0.72)");
      temp.addColorStop(0.52, "rgba(210,72,10,0.55)");
      temp.addColorStop(0.72, "rgba(140,38,5,0.35)");
      temp.addColorStop(0.88, "rgba(75,16,2,0.18)");
      temp.addColorStop(1.00, "rgba(30,5,1,0.06)");
      ctx.fillStyle = temp;
      ctx.fillRect(-box, -box, box * 2, box * 2);
      ctx.restore();

      // 2. Doppler beaming: approaching side (left) brighter ───────────────
      ctx.save();
      clipDonut();
      const dopp = ctx.createLinearGradient(-R_OUTER, 0, R_OUTER, 0);
      dopp.addColorStop(0.00, "rgba(255,200,90,0.60)");  // bright left
      dopp.addColorStop(0.18, "rgba(255,175,65,0.28)");
      dopp.addColorStop(0.38, "rgba(0,0,0,0)");
      dopp.addColorStop(0.58, "rgba(0,0,0,0.10)");
      dopp.addColorStop(0.80, "rgba(0,0,0,0.25)");
      dopp.addColorStop(1.00, "rgba(0,0,0,0.42)");       // dim right
      ctx.fillStyle = dopp;
      ctx.fillRect(-box, -box, box * 2, box * 2);
      ctx.restore();

      // 3. Inner bright ring — ISCO edge (hottest material just before plunge) ──
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, R_ISCO + 22, 0, Math.PI * 2);
      ctx.arc(0, 0, R_ISCO - 2,  0, Math.PI * 2, true);
      ctx.clip("evenodd");
      const hot = ctx.createRadialGradient(0, 0, R_ISCO - 2, 0, 0, R_ISCO + 22);
      hot.addColorStop(0.0, "rgba(255,255,240,0.95)");
      hot.addColorStop(0.4, "rgba(255,240,170,0.55)");
      hot.addColorStop(1.0, "transparent");
      ctx.fillStyle = hot;
      ctx.fillRect(-(R_ISCO + 30), -(R_ISCO + 30), (R_ISCO + 30) * 2, (R_ISCO + 30) * 2);
      ctx.restore();

      // 4. Soft feathered outer edge ─────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, R_OUTER + 70, 0, Math.PI * 2);
      ctx.arc(0, 0, R_OUTER - 10, 0, Math.PI * 2, true);
      ctx.clip("evenodd");
      const fade = ctx.createRadialGradient(0, 0, R_OUTER - 10, 0, 0, R_OUTER + 70);
      fade.addColorStop(0.00, "rgba(80,20,3,0.28)");
      fade.addColorStop(0.40, "rgba(40,9,1,0.12)");
      fade.addColorStop(1.00, "transparent");
      ctx.fillStyle = fade;
      ctx.fillRect(-(R_OUTER + 75), -(R_OUTER + 75), (R_OUTER + 75) * 2, (R_OUTER + 75) * 2);
      ctx.restore();

      // 5. Turbulent hot-spots orbiting in the inner disk ────────────────────
      const nSpots = 3;
      for (let i = 0; i < nSpots; i++) {
        const phase = t * (0.007 + i * 0.0015) + (i / nSpots) * Math.PI * 2;
        const sr    = R_ISCO + 10 + i * 12;
        const sx    = Math.cos(phase) * sr;
        const sy    = Math.sin(phase) * sr;
        ctx.save();
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30 + i * 5);
        sg.addColorStop(0,   `rgba(255,250,210,${0.38 - i * 0.08})`);
        sg.addColorStop(0.4, `rgba(255,200,90,${0.14 - i * 0.03})`);
        sg.addColorStop(1,   "transparent");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(sx, sy, 30 + i * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore(); // restore scale + tilt + translate
    };

    // ── Lensed secondary image ────────────────────────────────────────────────
    // The far side of the disk, bent over the shadow by gravity — appears as a
    // thin bright arc hugging the top of the photon sphere.
    const drawLensedArc = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(TILT);

      const lR  = R_SHADOW * 1.15;
      const lRy = lR * INCL * 0.55;
      const N   = 50;

      for (let i = 0; i < N; i++) {
        const a0  = Math.PI + (i / N) * Math.PI;
        const a1  = Math.PI + ((i + 1) / N) * Math.PI;
        const mid = Math.PI + ((i + 0.5) / N) * Math.PI;

        // Peaks at the two extremities (left & right), dimmer at top
        const shape   = 0.25 + 0.75 * Math.pow(Math.abs(Math.sin(mid)), 0.6);
        // Doppler: left (approaching side) slightly brighter
        const doppler = 0.55 + 0.45 * (-Math.cos(mid));
        const alpha   = shape * doppler * 0.88;

        ctx.beginPath();
        ctx.ellipse(0, 0, lR, lRy, 0, a0, a1);
        ctx.strokeStyle = `rgba(255,218,135,${alpha.toFixed(3)})`;
        ctx.lineWidth   = 2.2;
        ctx.stroke();
      }

      ctx.restore();
    };

    // ── Gravitational shadow + photon ring ────────────────────────────────────
    const drawShadow = (cx: number, cy: number) => {
      // Wide lensing glow (light bent around the photon sphere)
      const lens = ctx.createRadialGradient(cx, cy, R_SHADOW * 0.9, cx, cy, R_SHADOW * 4.5);
      lens.addColorStop(0.00, "rgba(255,160,45,0.22)");
      lens.addColorStop(0.18, "rgba(249,115,22,0.10)");
      lens.addColorStop(0.50, "rgba(249,100,15,0.04)");
      lens.addColorStop(1.00, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, R_SHADOW * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = lens;
      ctx.fill();

      // Pure black shadow — no light escapes
      ctx.beginPath();
      ctx.arc(cx, cy, R_SHADOW, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();

      // Photon ring — razor-thin, very bright
      // Rendered as a tight radial gradient stroke
      ctx.save();
      const ringR = R_SHADOW + 2.5;
      const ring  = ctx.createRadialGradient(cx, cy, ringR - 3, cx, cy, ringR + 4);
      ring.addColorStop(0.00, "transparent");
      ring.addColorStop(0.30, "rgba(255,240,170,0.82)");
      ring.addColorStop(0.55, "rgba(255,220,130,0.95)");
      ring.addColorStop(0.80, "rgba(255,200,100,0.60)");
      ring.addColorStop(1.00, "transparent");
      ctx.strokeStyle = ring;
      ctx.lineWidth   = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Inner black re-fill to keep the shadow crisp
      ctx.beginPath();
      ctx.arc(cx, cy, R_SHADOW, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
    };

    // ── Animation loop ────────────────────────────────────────────────────────
    const animate = () => {
      tickRef.current++;
      const t = tickRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W * 0.70;
      const cy = H * 0.50;

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      // Deep space background — warm dark centre
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.80);
      bg.addColorStop(0.00, "rgba(28,9,2,1)");
      bg.addColorStop(0.25, "rgba(14,4,1,1)");
      bg.addColorStop(0.60, "rgba(5,1,0,1)");
      bg.addColorStop(1.00, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Outer nebula haze (faint interstellar medium)
      const neb = ctx.createRadialGradient(cx, cy, R_OUTER * 0.75, cx, cy, R_OUTER * 2.4);
      neb.addColorStop(0.00, "rgba(140,40,5,0.07)");
      neb.addColorStop(0.45, "rgba(70,18,2,0.03)");
      neb.addColorStop(1.00, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, R_OUTER * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = neb;
      ctx.fill();

      // Disk
      drawDisk(cx, cy, t);

      // Orbiting dust/stars (spiral inward, heat up near ISCO)
      for (let i = 0; i < ptRef.current.length; i++) {
        const p = ptRef.current[i];

        p.radius -= p.infall;
        p.angle  += (p.speed * 0.013) / Math.max(0.1, p.radius * 0.007);

        if (p.radius < R_SHADOW + 3) {
          ptRef.current[i] = spawnParticle();
          continue;
        }

        // Project onto tilted disk plane
        const a  = p.angle + TILT;
        const px = cx + Math.cos(a) * p.radius;
        const py = cy + Math.sin(a) * p.radius * INCL;

        const heat = Math.max(0, 1 - (p.radius - R_ISCO) / (R_OUTER - R_ISCO + 60));
        const [rv, gv, bv] = thermal(heat);

        ctx.globalAlpha = Math.min(1, p.alpha * (1 + heat * 0.75));
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${rv},${gv},${bv})`;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      drawLensedArc(cx, cy);
      drawShadow(cx, cy);

      rafRef.current = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
