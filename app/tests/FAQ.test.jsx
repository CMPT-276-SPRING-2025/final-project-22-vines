// tests/FAQ.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQ from '../src/pages/FAQ';
import '@testing-library/jest-dom';

vi.mock('../src/components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}));

describe('FAQ Component', () => {
  test('renders FAQ questions and toggles answers', () => {
    render(<FAQ />);

    // Verify FAQ questions are present.
    expect(screen.getByText('Question 1?')).toBeInTheDocument();
    expect(screen.getByText('Question 2?')).toBeInTheDocument();
    expect(screen.getByText('Question 3?')).toBeInTheDocument();

    // Find the answer text and its container.
    const answer = screen.getByText('Answer to question 1...');
    const answerContainer = answer.parentElement;

    // Instead of using toBeVisible (jsdom may not compute visibility from Tailwind classes),
    // we check that initially the container has the "opacity-0" class.
    expect(answerContainer.className).toContain('opacity-0');

    // Click "Show" to reveal the answer.
    const showButton = screen.getAllByText('Show')[0];
    fireEvent.click(showButton);

    // Now, the container should have changed to "opacity-100".
    expect(answerContainer.className).toContain('opacity-100');

    // Click "Hide" to collapse the answer.
    const hideButton = screen.getAllByText('Hide')[0];
    fireEvent.click(hideButton);

    // The container should revert to "opacity-0".
    expect(answerContainer.className).toContain('opacity-0');
  });
});
