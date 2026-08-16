import { useCallback, useEffect, useRef } from 'react';

/**
 * Shared scroll-progress engine.
 *
 * One IntersectionObserver + one rAF loop for the whole site. Each tracked
 * element gets a `--sp` custom property scrubbed between -1 (entering from
 * below) and 1 (leaving above), 0 when centered in the viewport, plus an
 * `in-view` class while near the viewport (used to scope will-change).
 * Consumers read `var(--sp, 0)` so SSR / no-JS / untracked elements compute
 * to identity.
 */

const isSSR = typeof window === 'undefined';

const tracked = new Set();
const active = new Set();
let io = null;
let rafId = null;
let listenersAttached = false;

const frame = () => {
  rafId = null;
  const vh = window.innerHeight;
  const writes = [];
  // Read phase
  active.forEach(el => {
    const r = el.getBoundingClientRect();
    let p = (vh / 2 - (r.top + r.height / 2)) / ((vh + r.height) / 2);
    p = Math.max(-1, Math.min(1, p));
    if (el.__sp === undefined || Math.abs(p - el.__sp) >= 0.001) {
      writes.push([el, p]);
    }
  });
  // Write phase
  writes.forEach(([el, p]) => {
    el.__sp = p;
    el.style.setProperty('--sp', p.toFixed(4));
  });
};

const schedule = () => {
  if (rafId === null) {
    rafId = window.requestAnimationFrame(frame);
  }
};

const ensureEngine = () => {
  if (!io) {
    io = new IntersectionObserver(
      entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            active.add(target);
            target.classList.add('in-view');
          } else {
            active.delete(target);
            target.classList.remove('in-view');
          }
        });
        schedule();
      },
      { rootMargin: '25% 0px 25% 0px' },
    );
  }
  if (!listenersAttached) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    listenersAttached = true;
  }
};

const teardownIfEmpty = () => {
  if (tracked.size > 0) {
    return;
  }
  if (listenersAttached) {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    listenersAttached = false;
  }
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (io) {
    io.disconnect();
    io = null;
  }
  active.clear();
};

const useScrollProgress = enabled => {
  const registered = useRef(new Set());

  const track = useCallback(
    el => {
      if (!el || isSSR || !enabled || typeof IntersectionObserver === 'undefined') {
        return;
      }
      if (registered.current.has(el)) {
        return;
      }
      ensureEngine();
      registered.current.add(el);
      tracked.add(el);
      io.observe(el);
      // Write --sp synchronously (ref callbacks run pre-paint) so consumers
      // never render one identity frame and snap on scroll-restored loads.
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      let p = (vh / 2 - (r.top + r.height / 2)) / ((vh + r.height) / 2);
      p = Math.max(-1, Math.min(1, p));
      el.__sp = p;
      el.style.setProperty('--sp', p.toFixed(4));
      schedule();
    },
    [enabled],
  );

  useEffect(() => {
    const set = registered.current;
    return () => {
      set.forEach(el => {
        if (io) {
          io.unobserve(el);
        }
        tracked.delete(el);
        active.delete(el);
      });
      set.clear();
      teardownIfEmpty();
    };
  }, []);

  return track;
};

export default useScrollProgress;
