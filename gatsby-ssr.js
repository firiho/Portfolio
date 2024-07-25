/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it

// gatsby-ssr.js
import React from 'react';

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link
      key="apple-touch-icon"
      rel="apple-touch-icon"
      sizes="180x180"
      href="/apple-touch-icon.png"
    />,
    <link key="icon32" rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />,
    <link key="icon16" rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />,
    <link key="manifest" rel="manifest" href="/site.webmanifest" />,
    <link key="mask-icon" rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />,
    <meta key="msapplication-TileColor" name="msapplication-TileColor" content="#da532c" />,
    <meta key="theme-color" name="theme-color" content="#ffffff" />,
    <script
      key="gtag"
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-KBJ3HD59L2"
    />,
    <script
      key="gtag-init"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-KBJ3HD59L2');
        `,
      }}
    />,
  ]);
};
