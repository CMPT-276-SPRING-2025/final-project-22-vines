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

const mockGeolocation = {
  getCurrentPosition: (success) => {
      success({
          coords: { latitude: 0, longitude: 0 },
      });
  },
};
global.navigator.geolocation = mockGeolocation;

const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

//test api call
global.fetch = vi.fn((url, options) => {
  if (url.includes('api.openweathermap.org/data/2.5/forecast') && url.includes(OPENWEATHER_API_KEY)) {
      //test openweather api
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          list: [
            {
              dt: Date.now() / 1000,
              main: { temp: 20, humidity: 50 },
              weather: [{ description: 'clear sky' }],
            },
            ...Array(49).fill({
              dt: Date.now() / 1000 + 3600,
              main: { temp: 22, humidity: 55 },
              weather: [{ description: 'cloudy' }],
            }),
          ],
          city: { name: 'MockCity', coord: { lat: 0, lon: 0 } },
        }),
    });
  }
  // gemini api
  if (url.includes('generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent') && url.includes(GOOGLE_API_KEY) && options?.method === 'POST') {
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        name: "Rose",
                        scientificName: "Rosa",
                        description: "A red rose",
                        healthAnalysis: "Healthy",
                      }),
                    },
                  ],
                  role: "model",
                },
                finishReason: "STOP",
                index: 0,
                safetyRatings: [],
              },
            ],
          })
        ),
    });
  }

  return Promise.reject(new Error(`Unexpected fetch call in mock: ${url} ${options?.method || 'GET'}`));
});

const originalFileReader = window.FileReader;
beforeAll(() => {
  class MockFileReader {
    onload = null;
    onerror = null;
    readAsDataURL(file) {
        setTimeout(() => {
            if (this.onload) {
                this.onload({ target: { result: 'data:image/png;base64,dummybase64' } });
            }
        }, 10);
    }
  }
  window.FileReader = MockFileReader;
});

afterAll(() => {
  window.FileReader = originalFileReader;
  alertSpy.mockRestore();
  vi.restoreAllMocks();
});

beforeEach(() => {
    vi.mocked(fetch).mockClear();
    alertSpy.mockClear();
})

describe('Upload Component', () => {

  test('renders file input and initial text', async () => {
    render(<Upload />);
    expect(await screen.findByText(/Upload Your Plant Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop photo or click/i)).toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  test('shows error for unsupported file type', async () => {
    render(<Upload />);
    const input = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    //used waitFor to wrap the assertions, allowing time for the popup to render
    await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/i)).toBeInTheDocument();
        expect(screen.getByText(/Please upload one of these image types/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Close/i})).toBeInTheDocument();
    });

  });

  test('processes a valid image file and displays plant details', async () => {
    render(<Upload />);
    const input = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Analyze Plant/i });
    fireEvent.click(button);

     await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('api.openweathermap.org')
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('gemini-2.0-flash:generateContent'),
            expect.objectContaining({ method: 'POST' })
        );
     });

  // wait for plant detail by gemini
    await waitFor(() => {
      const roseElements = screen.getAllByText(/Rose/i);
      expect(roseElements.length).toBeGreaterThan(0);
    }, { timeout: 10000 });

    expect(alertSpy).not.toHaveBeenCalled();

}, 15000);
});