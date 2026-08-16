import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { navDelay } from '@utils';
import { usePrefersReducedMotion, useScrollProgress } from '@hooks';
import HexGlobe from '../hexglobe';

const StyledHeroSection = styled.section`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  min-height: 100vh;
  height: 100vh;
  padding: 0;

  @media (max-height: 700px) and (min-width: 700px), (max-width: 360px) {
    height: auto;
    padding-top: var(--nav-height);
  }

  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    z-index: 1;
    width: 100%;
  }

  /* Type hierarchy: the name owns the hero; the statement supports it */
  h2.big-heading {
    font-size: clamp(48px, 8.5vw, 94px);
  }

  h3.big-heading {
    margin-top: 12px;
    font-size: clamp(24px, 4vw, 52px);
    line-height: 1.1;
    max-width: 780px;
  }

  /* Scroll recession: as About arrives, the hero rises, shrinks a hair,
     and dims — scrubbed 1:1 by the shared --sp engine, identity at rest. */
  @media (prefers-reduced-motion: no-preference) {
    .hero-inner {
      transform: perspective(1200px) translate3d(0, calc(var(--sp, 0) * -64px), 0)
        rotateX(calc(var(--sp, 0) * 8deg)) scale(calc(1 - var(--sp, 0) * 0.045));
      opacity: calc(1 - var(--sp, 0) * 0.45);
      transform-origin: center top;
    }
    &.in-view .hero-inner {
      will-change: transform, opacity;
    }
  }

  h1 {
    margin: 0 0 30px 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: clamp(var(--fz-sm), 5vw, var(--fz-md));
    font-weight: 400;

    @media (max-width: 480px) {
      margin: 0 0 20px 2px;
    }
  }

  h3 {
    margin-top: 5px;
    color: var(--slate);
    line-height: 0.9;
    font-size: clamp(34px, 5vw, 100px);
  }

  p {
    margin: 20px 0 0;
    max-width: 540px;
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }
`;

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const track = useScrollProgress(!prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  const one = <h1 style={{ marginTop: '20px' }}>Hi, my name is</h1>;
  const two = <h2 className="big-heading">Flambeau Iriho</h2>;
  const three = (
    <h3 className="big-heading">I turn complex problems into simple, useful software.</h3>
  );
  const four = (
    <>
      <p>
        Software Engineer at{' '}
        <a href="https://www.ebay.com/" target="_blank" rel="noreferrer">
          eBay
        </a>{' '}
        (Seller Experience), building AI-enabled listing experiences — the listing platform I built
        as an intern boosted listing speed 3×. Co-founder & CTO of{' '}
        <a href="https://www.uapply.africa/" target="_blank" rel="noreferrer">
          UAPPLY
        </a>
        , an angel-funded platform that submits 4,000+ university applications at once in under 10
        seconds.{' '}
        <a href="https://www.minerva.edu/" target="_blank" rel="noreferrer">
          Minerva University
        </a>{' '}
        B.S. in Computer Science & AI, Class of 2026.
      </p>
    </>
  );
  const five = (
    <a
      className="email-link"
      href="https://drive.google.com/file/d/1g7k8ielM8HHrm4j-xVjuPyYkIaTtrSW1/view?usp=sharing"
      target="_blank"
      rel="noreferrer">
      Check out my resume!
    </a>
  );

  const items = [one, two, three, four, five];

  return (
    <StyledHeroSection ref={track}>
      <HexGlobe />
      <div className="hero-inner">
        {prefersReducedMotion ? (
          <>
            {items.map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {isMounted &&
              items.map((item, i) => (
                <CSSTransition key={i} classNames="maskup" timeout={700 + i * 180}>
                  <div className="mask-sleeve">
                    <div className="mask-inner" style={{ transitionDelay: `${i * 180}ms` }}>
                      {item}
                    </div>
                  </div>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </div>
    </StyledHeroSection>
  );
};

export default Hero;
