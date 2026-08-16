import { css } from 'styled-components';

// https://reactcommunity.org/react-transition-group/css-transition

const TransitionStyles = css`
  /* Fade up */
  .fadeup-enter {
    opacity: 0.01;
    transform: translateY(24px);
    transition: opacity var(--dur-entrance) var(--ease-out-expo),
      transform var(--dur-entrance) var(--ease-out-expo);
  }

  .fadeup-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity var(--dur-entrance) var(--ease-out-expo),
      transform var(--dur-entrance) var(--ease-out-expo);
  }

  /* Fade down */
  .fadedown-enter {
    opacity: 0.01;
    transform: translateY(-16px);
    transition: opacity var(--dur-entrance) var(--ease-out-expo),
      transform var(--dur-entrance) var(--ease-out-expo);
  }

  .fadedown-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity var(--dur-entrance) var(--ease-out-expo),
      transform var(--dur-entrance) var(--ease-out-expo);
  }

  /* Fade */
  .fade-enter {
    opacity: 0;
  }
  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms var(--easing);
  }
  .fade-exit {
    opacity: 1;
  }
  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms var(--easing);
  }

  /* Mask reveal (hero overture): lines rise out of an invisible sleeve.
     Padding + negative margin keep tight line-heights (h3 is 0.9) from
     clipping descenders at rest; clipping happens at the padding edge.
     overflow is hidden only DURING the entrance so hover shadows on the
     revealed content are never clipped afterwards. */
  .mask-sleeve {
    padding: 0.6em 0;
    margin: -0.6em 0;
  }
  .maskup-enter,
  .maskup-enter-active {
    /* clip (not hidden): clip boxes are not scroll containers, so tabbing
       to a link mid-overture can never scroll the sleeve out of sync */
    overflow: hidden;
    overflow: clip;
  }
  .maskup-enter .mask-inner {
    opacity: 0.01;
    transform: translate3d(0, calc(100% + 16px), 0);
  }
  .maskup-enter-active .mask-inner {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: transform var(--dur-mask) var(--ease-out-expo), opacity 300ms ease-out;
  }
`;

export default TransitionStyles;
