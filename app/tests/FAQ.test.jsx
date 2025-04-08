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
    expect(screen.getByText("What if the weather doesn't display?")).toBeInTheDocument();
    expect(screen.getByText('Can I upload multiple plants in one photo?')).toBeInTheDocument();
    expect(screen.getByText('Does the website store my plant data?')).toBeInTheDocument();

    // Find the answer text and its container.
    const answer = screen.getByText("If the webpage does not display the weather, please ensure that location access is granted and try uploading the photo again.");
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
