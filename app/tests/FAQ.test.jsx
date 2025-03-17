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

    // verify FAQ
    expect(screen.getByText('Question 1?')).toBeInTheDocument();
    expect(screen.getByText('Question 2?')).toBeInTheDocument();
    expect(screen.getByText('Question 3?')).toBeInTheDocument();

    // Find the answer text and its container.
    const answer = screen.getByText('Answer to question 1...');
    const answerContainer = answer.parentElement;

    // we check that initially the container has the "opacity-0" class.
    expect(answerContainer.className).toContain('opacity-0');


    const showButton = screen.getAllByText('Show')[0];
    fireEvent.click(showButton);

    expect(answerContainer.className).toContain('opacity-100');


    const hideButton = screen.getAllByText('Hide')[0];
    fireEvent.click(hideButton);

    expect(answerContainer.className).toContain('opacity-0');
  });
});
