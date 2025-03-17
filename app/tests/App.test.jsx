// tests/App.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Use Vitest's vi.mock to stub the pages that App renders.
// (App.jsx already wraps itself with a Router that uses future flags.)
vi.mock('../src/pages/Home', () => ({
  default: () => <div>Home Page</div>,
}));
vi.mock('../src/pages/Upload', () => ({
  default: () => <div>Upload Page</div>,
}));
vi.mock('../src/pages/About', () => ({
  default: () => <div>About Page</div>,
}));
vi.mock('../src/pages/FAQ', () => ({
  default: () => <div>FAQ Page</div>,
}));

describe('App Component', () => {
  test('renders home page by default', () => {
    window.history.pushState({}, 'Home', '/');
    render(<App />);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  test('navigates to Upload page', () => {
    window.history.pushState({}, 'Upload', '/Upload');
    render(<App />);
    expect(screen.getByText('Upload Page')).toBeInTheDocument();
  });

  test('navigates to About page', () => {
    window.history.pushState({}, 'About', '/About');
    render(<App />);
    expect(screen.getByText('About Page')).toBeInTheDocument();
  });

  test('navigates to FAQ page', () => {
    window.history.pushState({}, 'FAQ', '/FAQ');
    render(<App />);
    expect(screen.getByText('FAQ Page')).toBeInTheDocument();
  });
});
