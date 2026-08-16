import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig, email } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledContactSection = styled.section`
  max-width: 600px;
  margin: 0 auto 100px;
  text-align: center;

  @media (max-width: 768px) {
    margin: 0 auto 50px;
  }

  .overline {
    display: block;
    margin-bottom: 20px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 400;

    &:before {
      bottom: 0;
      font-size: var(--fz-sm);
    }

    &:after {
      display: none;
    }
  }

  .title {
    font-size: clamp(40px, 5vw, 60px);
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }
`;

const Contact = () => {
  const revealOverline = useRef(null);
  const revealTitle = useRef(null);
  const revealText = useRef(null);
  const revealButton = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    // Finale cadence: overline leads, title lands a beat later, then the
    // paragraph, and the Say Hello button arrives last.
    sr.reveal(revealOverline.current, srConfig(100));
    sr.reveal(revealTitle.current, srConfig(200));
    sr.reveal(revealText.current, srConfig(300));
    sr.reveal(revealButton.current, srConfig(450));
  }, []);

  return (
    <StyledContactSection id="contact">
      <h2 className="numbered-heading overline" ref={revealOverline}>
        What’s Next?
      </h2>

      <h2 className="title" ref={revealTitle}>
        Get In Touch
      </h2>

      <p ref={revealText}>
        My inbox is always open. Whether you have an opportunity for me, a question or just want to
        say hi, I'll get back to you as soon as possible!
      </p>

      <a className="email-link" href={`mailto:${email}`} ref={revealButton}>
        Say Hello
      </a>
    </StyledContactSection>
  );
};

export default Contact;
