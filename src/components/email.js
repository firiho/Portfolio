import React from 'react';
import PropTypes from 'prop-types';
import styled, { css, keyframes } from 'styled-components';
import { email } from '@config';
import { Side } from '@components';

const railDraw = keyframes`
  from {
    transform: scaleY(0);
  }
`;

const StyledLinkWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &:after {
    content: '';
    display: block;
    width: 1px;
    height: 90px;
    margin: 0 auto;
    background-color: var(--light-slate);
  }

  /* On home, the hairline draws itself upward as part of the overture */
  ${({ isHome }) =>
    isHome &&
    css`
      @media (prefers-reduced-motion: no-preference) {
        &:after {
          transform-origin: bottom;
          animation: ${railDraw} 1s var(--ease-out-expo) 200ms backwards;
        }
      }
    `}

  a {
    margin: 20px auto;
    padding: 10px;
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    line-height: var(--fz-lg);
    letter-spacing: 0.1em;
    writing-mode: vertical-rl;

    &:hover,
    &:focus {
      transform: translateY(-3px);
    }
  }
`;

const Email = ({ isHome }) => (
  <Side isHome={isHome} orientation="right">
    <StyledLinkWrapper isHome={isHome}>
      <a href={`mailto:${email}`}>{email}</a>
    </StyledLinkWrapper>
  </Side>
);

Email.propTypes = {
  isHome: PropTypes.bool,
};

export default Email;
