// tests/Upload.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Upload from '../src/pages/Upload';
import '@testing-library/jest-dom';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

vi.mock('../src/components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}));

// Mock navigator geolocation so that getCurrentPosition succeeds
const mockGeolocation = {
  getCurrentPosition: (success) =>
    success({
      coords: { latitude: 0, longitude: 0 },
    }),
};
global.navigator.geolocation = mockGeolocation;

//test api call
global.fetch = vi.fn((url) => {
  //test openweather api
  if (url.includes('openweathermap.org') && url.includes(OPENWEATHER_API_KEY)) {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          list: [
            {
              dt: Date.now() / 1000,
              main: { temp: 20, humidity: 50 },
              weather: [{ description: 'clear sky' }],
            },
            ...Array(40).fill({
              dt: Date.now() / 1000,
              main: { temp: 22, humidity: 55 },
              weather: [{ description: 'cloudy' }],
            }),
          ],
        }),
    });
  }
  // gemini api
  if (url.includes('generativelanguage.googleapis.com') && url.includes(GOOGLE_API_KEY)) {
    return Promise.resolve({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text:
                        '{"name": "Rose", "scientificName": "Rosa", "description": "A red rose", "healthAnalysis": "Healthy", "currentWeatherCareGuide": ["Water daily"], "forecastCareGuide": ["Water sparingly"]}',
                    },
                  ],
                },
              },
            ],
          })
        ),
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

// test file reading
const originalFileReader = window.FileReader;
beforeAll(() => {
  class MockFileReader {
    constructor() {
      this.onload = null;
    }
    readAsDataURL(file) {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/png;base64,dummybase64' } });
      }
    }
  }
  window.FileReader = MockFileReader;
});
afterAll(() => {
  window.FileReader = originalFileReader;
});

describe('Upload Component', () => {
  test('renders file input and identify button', async () => {
    await act(async () => {
      render(<Upload />);
    });
    expect(screen.getByText('Upload Your Plant Image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /identify/i })).toBeInTheDocument();
  });

  test('shows error for unsupported file type', async () => {
    await act(async () => {
      render(<Upload />);
    });
    const input = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
  });

  test('processes a valid image file and displays plant details', async () => {
    await act(async () => {
      render(<Upload />);
    });
    const input = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    //wait for image to be render
    await waitFor(() => {
      expect(document.querySelector('img.preview-image')).toBeInTheDocument();
    });

    // identify
    const button = screen.getByRole('button', { name: /identify/i });
    await act(async () => {
      fireEvent.click(button);
    });

    //wait for plant detail by gemini
    await waitFor(() => {
      const roseElements = screen.getAllByText(/Rose/i);
      expect(roseElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Plant Details/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
