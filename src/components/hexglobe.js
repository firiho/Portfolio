import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

/**
 * HexGlobe — a wireframe truncated icosahedron (a sphere of hexagons and
 * pentagons, echoing the site's hexagon logo) rendered with a tiny
 * hand-rolled 3D engine on canvas. No libraries.
 *
 * Behavior: slow idle tumble, tilts toward the cursor, and spins with
 * scroll. Depth-faded 1px lines and vertex points — machined, no glow.
 * Reduced motion: renders a single static frame.
 */

const StyledGlobe = styled.div`
  position: absolute;
  top: 50%;
  right: -60px;
  transform: translateY(-50%);
  width: min(46vw, 620px);
  aspect-ratio: 1;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  animation: globe-in 1.2s var(--ease-out-expo) 900ms forwards;

  @keyframes globe-in {
    from {
      opacity: 0;
      transform: translateY(-50%) scale(0.92);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  }

  @media (max-width: 1080px) {
    right: -100px;
    opacity: 0;
    animation-name: globe-in-dim;
    @keyframes globe-in-dim {
      to {
        opacity: 0.55;
        transform: translateY(-50%) scale(1);
      }
    }
  }

  @media (max-width: 768px) {
    right: 50%;
    transform: translate(50%, -50%);
    width: min(88vw, 480px);
    animation-name: globe-in-faint;
    @keyframes globe-in-faint {
      to {
        opacity: 0.22;
        transform: translate(50%, -50%) scale(1);
      }
    }
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

// ——— Geometry: truncated icosahedron (60 verts, 90 edges) ———
const buildGeometry = () => {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const base = [
    [0, 1, 3 * PHI],
    [1, 2 + PHI, 2 * PHI],
    [PHI, 2, 2 * PHI + 1],
  ];
  const evenPerms = ([a, b, c]) => [
    [a, b, c],
    [b, c, a],
    [c, a, b],
  ];
  const verts = [];
  const seen = new Set();
  base.forEach(v => {
    evenPerms(v).forEach(([x, y, z]) => {
      [1, -1].forEach(sx =>
        [1, -1].forEach(sy =>
          [1, -1].forEach(sz => {
            const p = [x * sx, y * sy, z * sz];
            const key = p.map(n => n.toFixed(5)).join(',');
            if (!seen.has(key)) {
              seen.add(key);
              verts.push(p);
            }
          }),
        ),
      );
    });
  });
  const r = Math.hypot(...verts[0]);
  const pts = verts.map(([x, y, z]) => [x / r, y / r, z / r]);
  // Edges connect vertex pairs at the polyhedron's edge length (2 / r)
  const edgeLen = 2 / r;
  const edges = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
      if (d < edgeLen * 1.05) {
        edges.push([i, j]);
      }
    }
  }
  return { pts, edges };
};

const GEO = buildGeometry();

const HexGlobe = () => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || typeof window === 'undefined') {
      return undefined;
    }
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = 1;
    let size = 0;
    const state = {
      ry: 0.6,
      rx: -0.25,
      mx: 0,
      my: 0,
      tmx: 0,
      tmy: 0,
      raf: null,
      visible: true,
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = wrap.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    };

    const render = () => {
      const { pts, edges } = GEO;
      const w = canvas.width;
      ctx.clearRect(0, 0, w, w);

      const scroll = reduced ? 0 : window.scrollY * 0.0012;
      const ry = state.ry + state.mx + scroll;
      const rx = state.rx + state.my;

      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);

      const f = 3.4;
      const half = w / 2;
      const scale = half * 0.9;

      const proj = pts.map(([x0, y0, z0]) => {
        // rotate Y then X
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y2 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const k = f / (f - z2);
        return [half + x1 * k * scale, half + y2 * k * scale, z2];
      });

      // Edges, depth-faded (far = faint, near = bright)
      ctx.lineWidth = Math.max(1, dpr * 0.8);
      edges.forEach(([a, b]) => {
        const t = (proj[a][2] + proj[b][2] + 2) / 4; // 0 far → 1 near
        ctx.strokeStyle = `rgba(100, 255, 218, ${0.05 + t * 0.32})`;
        ctx.beginPath();
        ctx.moveTo(proj[a][0], proj[a][1]);
        ctx.lineTo(proj[b][0], proj[b][1]);
        ctx.stroke();
      });

      // Vertex points
      proj.forEach(([x, y, z]) => {
        const t = (z + 1) / 2;
        ctx.fillStyle = `rgba(204, 214, 246, ${0.12 + t * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, (0.9 + t * 1.5) * dpr, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const frame = () => {
      state.raf = null;
      state.ry += 0.0028;
      state.mx += (state.tmx - state.mx) * 0.05;
      state.my += (state.tmy - state.my) * 0.05;
      render();
      if (state.visible) {
        state.raf = window.requestAnimationFrame(frame);
      }
    };

    const onMouse = e => {
      state.tmx = (e.clientX / window.innerWidth - 0.5) * 0.9;
      state.tmy = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };

    resize();

    if (reduced) {
      render();
      const ro = new ResizeObserver(() => {
        resize();
        render();
      });
      ro.observe(wrap);
      return () => ro.disconnect();
    }

    const ro = new ResizeObserver(() => {
      resize();
      render();
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible && state.raf === null) {
        state.raf = window.requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    window.addEventListener('mousemove', onMouse, { passive: true });
    state.raf = window.requestAnimationFrame(frame);

    return () => {
      if (state.raf !== null) {
        window.cancelAnimationFrame(state.raf);
      }
      window.removeEventListener('mousemove', onMouse);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <StyledGlobe ref={wrapRef} className="hex-globe" aria-hidden="true">
      <canvas ref={canvasRef} />
    </StyledGlobe>
  );
};

export default HexGlobe;
