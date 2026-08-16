/**
 * Self-drawing section rules.
 *
 * Marks every `.numbered-heading` below the fold as `rule-ready` (number
 * hidden, hairline collapsed) and draws it (`rule-drawn`) the first time it
 * approaches the viewport. JS applies the hidden state, so SSR / no-JS /
 * reduced-motion HTML always shows fully drawn rules.
 */
const initRuleDraw = () => {
  if (
    typeof window === 'undefined' ||
    typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {};
  }

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('rule-drawn');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -20% 0px' },
  );

  document.querySelectorAll('.numbered-heading').forEach(heading => {
    if (heading.getBoundingClientRect().top > window.innerHeight * 0.8) {
      heading.classList.add('rule-ready');
      io.observe(heading);
    }
  });

  return () => io.disconnect();
};

export default initRuleDraw;
