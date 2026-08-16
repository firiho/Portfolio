module.exports = {
  email: 'irihoflambeau@gmail.com',

  socialMedia: [
    {
      name: 'GitHub',
      url: 'https://github.com/firiho',
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/iriho-flambeau/',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/iflambeau/',
    },
  ],

  navLinks: [
    {
      name: 'About',
      url: '/#about',
    },
    {
      name: 'Experience',
      url: '/#jobs',
    },
    {
      name: 'Education',
      url: '/#education',
    },
    {
      name: 'Projects',
      url: '/#projects',
    },
  ],

  colors: {
    green: '#64ffda',
    navy: '#0a192f',
    darkNavy: '#020c1b',
  },

  srConfig: (delay = 200, viewFactor = 0.25) => ({
    origin: 'bottom',
    distance: '36px',
    duration: 650,
    delay,
    rotate: { x: 12, y: 0, z: 0 },
    opacity: 0,
    scale: 1,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    mobile: true,
    reset: false,
    useDelay: 'always',
    viewFactor,
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
  }),
};
