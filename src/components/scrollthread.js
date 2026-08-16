import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

/**
 * ScrollThread — a continuous circuit-trace that travels the page with
 * the reader.
 *
 * Born at the base of the hero globe, it runs down the outer lanes in
 * straight verticals with 45°-chamfered corners (like a PCB trace),
 * crossing the content column only in the empty gaps between sections.
 * It draws itself in sync with scroll — a bright head segment leads the
 * way — and every section is a "station" node that lights up as you
 * pass. The route terminates in a ring above the Say Hello button.
 *
 * Plotted from the live layout (transform-immune offset measurement) and
 * rebuilt whenever the content resizes. Desktop only; reduced motion gets
 * the static full route. No dependencies.
 */

const StyledThread = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s var(--ease-out-expo);

  &.ready {
    opacity: 1;
  }

  @media (max-width: 768px) {
    display: none;
  }

  .thread-base {
    fill: none;
    stroke: var(--green);
    stroke-opacity: 0.08;
    stroke-width: 1.5;
  }

  .thread-head {
    fill: none;
    stroke: var(--green);
    stroke-opacity: 0.5;
    stroke-width: 1.5;
  }

  .thread-stop {
    fill: var(--navy);
    stroke: var(--dark-slate);
    stroke-width: 1.5;
    transition: stroke 0.5s var(--ease-out-expo), fill 0.5s var(--ease-out-expo);

    &.passed {
      stroke: var(--green);
      fill: rgba(100, 255, 218, 0.15);
    }
  }

  .thread-terminal {
    fill: none;
    stroke: var(--green);
    stroke-width: 1.5;
    stroke-opacity: 0.35;
  }

  .thread-tip circle:first-child {
    fill: var(--green);
  }

  .thread-tip circle:last-child {
    fill: none;
    stroke: var(--green);
    stroke-opacity: 0.35;
    stroke-width: 1.5;
  }
`;

const HEAD = 150; // bright leading segment length (px along the path)
const CHAMFER = 26; // 45° corner size

/**
 * Circuit-trace path: vertical runs, and lane changes as
 * vertical → 45° chamfer → horizontal → 45° chamfer → vertical,
 * with each horizontal crossing placed in the gap above its section.
 * Waypoints: { x, stationY, gapY } — gapY is where the crossing happens.
 */
const tracePath = (start, waypoints, end) => {
  const seg = [];
  let cx = start[0];
  let cy = start[1];
  seg.push(`M ${cx.toFixed(1)} ${cy.toFixed(1)}`);
  const runTo = (x, y) => {
    seg.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    cx = x;
    cy = y;
  };

  const laneChange = (targetX, gapY) => {
    if (Math.abs(targetX - cx) < 1) {
      return;
    }
    const dir = targetX > cx ? 1 : -1;
    const jogY = Math.max(gapY, cy + CHAMFER + 8);
    runTo(cx, jogY - CHAMFER);
    runTo(cx + dir * CHAMFER, jogY);
    runTo(targetX - dir * CHAMFER, jogY);
    runTo(targetX, jogY + CHAMFER);
  };

  waypoints.forEach(wp => {
    laneChange(wp.x, wp.gapY);
    if (wp.stationY > cy) {
      runTo(cx, wp.stationY);
    }
  });

  if (end) {
    // Side approach: drop to the button's level in the current lane, then
    // run horizontally through empty space into the terminal ring.
    const dir = end[0] > cx ? 1 : -1;
    runTo(cx, end[1] - CHAMFER);
    runTo(cx + dir * CHAMFER, end[1]);
    runTo(end[0], end[1]);
  }
  return seg.join(' ');
};

const ScrollThread = () => {
  const svgRef = useRef(null);
  const baseRef = useRef(null);
  const headRef = useRef(null);
  const tipRef = useRef(null);
  const stopRefs = useRef([]);
  const geom = useRef(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const content = document.getElementById('content');
    if (!content) {
      return undefined;
    }

    let raf = null;
    let rebuildTimer = null;

    // Layout-based measurement via the offsetParent chain — immune to the
    // transient transforms ScrollReveal and the --sp engine apply.
    const absRect = el => {
      let top = 0;
      let left = 0;
      let node = el;
      while (node) {
        top += node.offsetTop;
        left += node.offsetLeft;
        node = node.offsetParent;
      }
      return {
        top,
        bottom: top + el.offsetHeight,
        right: left + el.offsetWidth,
        cx: left + el.offsetWidth / 2,
        cy: top + el.offsetHeight / 2,
      };
    };

    const build = () => {
      const vw = document.documentElement.clientWidth;
      if (vw < 769) {
        setRoute(null);
        geom.current = null;
        return;
      }
      const globe = document.querySelector('.hex-globe');
      const heroCta = document.querySelector('.hero-inner .email-link');
      const about = document.getElementById('about');
      const jobs = document.getElementById('jobs');
      const education = document.getElementById('education');
      const featured = document.querySelectorAll('#projects > ul > li');
      const grid = document.querySelector('.projects-grid');
      const contactBtn = document.querySelector('#contact .email-link');

      const laneL = Math.max(100, vw * 0.07);
      const laneR = vw - laneL;

      // Start at the base of the globe. Its wrapper is translateY(-50%),
      // which offset measurement ignores — so the measured center IS the
      // visual bottom edge.
      let start = null;
      if (globe) {
        const g = absRect(globe);
        start = [g.cx, g.cy - 30];
      } else if (heroCta) {
        const r = absRect(heroCta);
        start = [r.cx, r.bottom + 40];
      }

      const waypoints = [];
      const addStation = (el, x) => {
        if (!el) {
          return;
        }
        const r = absRect(el);
        waypoints.push({ x, stationY: r.cy, gapY: r.top - 50, y: r.cy });
      };

      addStation(about, laneL);
      addStation(jobs, laneR);
      addStation(education, laneL);
      featured.forEach((card, i) => {
        addStation(card, i % 2 === 0 ? laneR : laneL);
      });
      addStation(grid, laneR);

      let end = null;
      if (contactBtn) {
        const r = absRect(contactBtn);
        end = [r.right + 26, r.cy];
      }

      // Only worth drawing on the full home page
      if (!start || waypoints.length < 4 || !end) {
        setRoute(null);
        geom.current = null;
        return;
      }

      setRoute({
        d: tracePath(start, waypoints, end),
        width: vw,
        height: content.scrollHeight,
        stops: waypoints.map(wp => ({ x: wp.x, y: wp.stationY })),
        end,
        startY: start[1],
        endY: end[1],
      });
    };

    const measurePath = () => {
      const path = baseRef.current;
      if (!path || !geom.current) {
        return;
      }
      const L = path.getTotalLength();
      geom.current.L = L;
      // Map each stop to its length along the path (coarse sampling)
      const samples = 500;
      const stops = geom.current.stops.map(s => ({ ...s, len: 0, best: Infinity }));
      for (let i = 0; i <= samples; i++) {
        const len = (L * i) / samples;
        const p = path.getPointAtLength(len);
        stops.forEach(s => {
          const d = (p.x - s.x) ** 2 + (p.y - s.y) ** 2;
          if (d < s.best) {
            s.best = d;
            s.len = len;
          }
        });
      }
      geom.current.stopLens = stops.map(s => s.len);
      const base = baseRef.current;
      const head = headRef.current;
      base.style.strokeDasharray = `${L} ${L}`;
      head.style.strokeDasharray = `${HEAD} ${L}`;
      if (reduced) {
        base.style.strokeDashoffset = 0;
        head.style.strokeDashoffset = HEAD + L; // hide the head
      }
    };

    const frame = () => {
      raf = null;
      const g = geom.current;
      const path = baseRef.current;
      if (!g || !path || !g.L) {
        return;
      }
      const target = window.scrollY + window.innerHeight * 0.55;
      let p = Math.min(1, Math.max(0, (target - g.startY) / (g.endY - g.startY)));
      // At the very bottom of the page the journey is always complete
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        p = 1;
      }
      const len = g.L * p;
      path.style.strokeDashoffset = g.L - len;
      headRef.current.style.strokeDashoffset = HEAD - len;
      const tip = path.getPointAtLength(len);
      tipRef.current.setAttribute('transform', `translate(${tip.x}, ${tip.y})`);
      tipRef.current.style.opacity = p > 0.001 && p < 0.999 ? 1 : 0;
      g.stopLens.forEach((sl, i) => {
        const el = stopRefs.current[i];
        if (el) {
          el.classList.toggle('passed', len >= sl - 2);
        }
      });
    };

    const schedule = () => {
      if (raf === null) {
        raf = window.requestAnimationFrame(frame);
      }
    };

    const ro = new ResizeObserver(() => {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(build, 250);
    });
    ro.observe(content);

    build();
    if (!reduced) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
    }

    const api = { measurePath, schedule, reduced };
    svgRef.current.__api = api;

    return () => {
      ro.disconnect();
      clearTimeout(rebuildTimer);
      if (raf !== null) {
        window.cancelAnimationFrame(raf);
      }
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // After each rebuild renders, measure the new path and sync
  useEffect(() => {
    if (!route || !svgRef.current || !svgRef.current.__api) {
      return;
    }
    geom.current = {
      stops: route.stops,
      startY: route.startY,
      endY: route.endY,
      L: 0,
      stopLens: [],
    };
    const api = svgRef.current.__api;
    api.measurePath();
    if (!api.reduced) {
      api.schedule();
    }
  }, [route]);

  if (!route) {
    return <StyledThread ref={svgRef} aria-hidden="true" width="0" height="0" />;
  }

  return (
    <StyledThread
      ref={svgRef}
      aria-hidden="true"
      className="ready"
      width={route.width}
      height={route.height}
      viewBox={`0 0 ${route.width} ${route.height}`}>
      <path ref={baseRef} className="thread-base" d={route.d} />
      <path ref={headRef} className="thread-head" d={route.d} />
      {route.stops.map((s, i) => (
        <circle
          key={i}
          ref={el => (stopRefs.current[i] = el)}
          className="thread-stop"
          cx={s.x}
          cy={s.y}
          r="3.5"
        />
      ))}
      <circle className="thread-terminal" cx={route.end[0]} cy={route.end[1]} r="7" />
      <g ref={tipRef} className="thread-tip" style={{ opacity: 0 }}>
        <circle r="3" />
        <circle r="8" />
      </g>
    </StyledThread>
  );
};

export default ScrollThread;
