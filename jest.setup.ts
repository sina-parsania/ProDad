// Optional: configure or set up a testing framework before each test
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: (props: any) => React.createElement('div', props, props.children),
      section: (props: any) => React.createElement('section', props, props.children),
      nav: (props: any) => React.createElement('nav', props, props.children),
      header: (props: any) => React.createElement('header', props, props.children),
      footer: (props: any) => React.createElement('footer', props, props.children),
      p: (props: any) => React.createElement('p', props, props.children),
      span: (props: any) => React.createElement('span', props, props.children),
    },
    AnimatePresence: (props: any) => React.createElement(React.Fragment, null, props.children),
  };
});

// Mock Cookies
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Mock IndexedDB (Dexie)
jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn(),
}));

// Silence console warnings and errors in tests
// global.console = {
//   ...global.console,
//   error: jest.fn(),
//   warn: jest.fn(),
//   log: jest.fn(),
// };
