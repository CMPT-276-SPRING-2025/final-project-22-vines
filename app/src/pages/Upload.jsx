import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import "./Upload.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const BASE_PLANT_PROMPT = `
Identify the plant species, analyze its health, and provide care recommendations.
If the uploaded image does not appear to be of a plant, return JSON with an "error" field with an appropriate message (Plant not detected, this seems to be an image of..., please try again).

Provide care tips separately based on:
1. The current weather conditions.
2. The upcoming weather forecast (4 days).

Return JSON format:
{
  "name": "Plant name",
  "scientificName": "Scientific name",
  "description": "Short description about the plant",
  "healthAnalysis": "Detect health issues, diseases, or deficiencies",
  "currentWeatherCareGuide": [
      "1. [First care tip for current weather]",
      "2. [Second care tip for current weather]",
      "3. [...]"
  ],
  "forecastCareGuide": [
      "1. [First care tip for forecast]",
      "2. [Second care tip for forecast]",
      "3. [...]"
  ]
}
`;

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentWeather, setCurrentWeather] = useState('Loading');
  const [forecast, setForecast] = useState('Loading');
  const [plantInfo, setPlantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch weather data using OpenWeatherAPI and geolocation
  const getWeatherData = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const OPENWEATHER_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

            fetch(OPENWEATHER_API)
              .then(res => res.json())
              .then(data => resolve(data))
              .catch(error => reject(error));
          },
          (error) => reject(error)
        );
      } else {
        reject(new Error("Cannot get user location"));
      }
    });
  };

  // Handle the weather data response
  useEffect(() => {
    getWeatherData()
      .then((data) => {
        const current = data.list[0];
        const currentSummary = `Today: ${current.weather[0].description}, Temp: ${current.main.temp}°C, Humidity: ${current.main.humidity}%`;
        setCurrentWeather(currentSummary);

        const forecastDays = data.list.slice(8, 40);
        const dailyForecasts = [];
        for (let i = 0; i < forecastDays.length; i += 8) {
          const dayData = forecastDays[i];
          if (dayData) {
            const date = new Date(dayData.dt * 1000).toLocaleDateString();
            dailyForecasts.push(`${date}: ${dayData.weather[0].description}, Temp: ${dayData.main.temp}°C, Humidity: ${dayData.main.humidity}%`);
          }
        }
        const forecastSummary = dailyForecasts.join("; ");
        setForecast(forecastSummary);
      })
      .catch((error) => {
        setCurrentWeather("Unavailable");
        setForecast("Unavailable");
        console.error("Weather error:", error);
      });
  }, []);

  // Handle the uploaded image file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Unsupported file type. Please upload a PNG, JPG, JPEG, or WEBP image");
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setErrorMessage(''); // Clear previous error if valid file

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Handle identify button
  const handleIdentify = () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setPlantInfo(null);

    // Get weather data for the main prompt
    getWeatherData()
      .then((data) => {
        const current = data.list[0];
        const currentWeatherStr = `Current weather: ${current.weather[0].description}, Temp: ${current.main.temp}°C, Humidity: ${current.main.humidity}%`;

        const forecastDays = data.list.slice(8, 40);
        const dailyForecasts = [];

        for (let i = 0; i < forecastDays.length; i += 8) {
          const dayData = forecastDays[i];
          if (dayData) {
            const date = new Date(dayData.dt * 1000).toLocaleDateString();
            dailyForecasts.push(`${date}: ${dayData.weather[0].description}, Temp: ${dayData.main.temp}°C, Humidity: ${dayData.main.humidity}%`);
          }
        }
        const forecastSummary = dailyForecasts.join("\n");

        const weatherInfo = `
Additional weather details:
${currentWeatherStr}
Forecast for next 4 days: ${forecastSummary}
Please provide care recommendations considering these weather conditions.
        `;

        const fullPrompt = BASE_PLANT_PROMPT + weatherInfo;

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result.split(",")[1];

          const payload = {
            contents: [
              {
                parts: [
                  { text: fullPrompt },
                  {
                    inline_data: {
                      mime_type: selectedFile.type,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          };

          try {
            fetch(`${GEMINI_API_ENDPOINT}?key=${GOOGLE_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
              .then((response) => {
                if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
                return response.text();
              })
              .then((responseText) => {
                try {
                  const responseData = JSON.parse(responseText);
                  let jsonString = responseData.candidates[0].content.parts[0].text;
                  if (jsonString.startsWith("```json\n")) {
                    jsonString = jsonString.substring(7, jsonString.length - 3);
                  }
                  jsonString = jsonString.trim();
                  const plantData = JSON.parse(jsonString);

                  if (plantData.error) {
                    setErrorMessage(plantData.error);
                  } else {
                    setPlantInfo(plantData);
                  }
                } catch (error) {
                  alert("Error processing the response: " + error);
                }
              })
              .catch((error) => {
                alert("Plant identifying failed");
                console.error("Fetch error", error);
              })
              .finally(() => {
                setLoading(false);
              });
          } catch (error) {
            alert("Error during Google Gemini API request: " + error.message);
            console.error("Google Gemini error:", error);
            setLoading(false);
          }
        };
        reader.readAsDataURL(selectedFile);
      })
      .catch((error) => {
        alert("Failed to get weather data: " + error.message);
        setLoading(false);
      });
  };

  // Error popup 
  const ErrorPopup = ({ message, onClose }) => {
    if (!message) return null;
    return (
      <div className="error-popup-overlay">
        <div className="error-popup">
          <p>{message}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className="upload-page">
      <Navbar />
      <div className="upload-container">
        <h2>Upload Your Plant Image</h2>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        {previewUrl && <img src={previewUrl} alt="Preview" className="preview-image" />}
        <button onClick={handleIdentify} disabled={loading}>
          {loading ? "Identifying" : "Identify"}
        </button>
      </div>

      <div className="weather-container">
        <h2>Weather Information</h2>
        <p><strong>Current Weather:</strong> {currentWeather}</p>
        <p><strong>Forecast:</strong> {forecast}</p>
      </div>

      {plantInfo && (
        <div className="plant-info">
          <h2>Plant Details</h2>
          <p><strong>Name:</strong> {plantInfo.name || "N/A"}</p>
          <p><strong>Scientific Name:</strong> {plantInfo.scientificName || "N/A"}</p>
          <p><strong>Description:</strong> {plantInfo.description || "N/A"}</p>
          <p><strong>Health Analysis:</strong> {plantInfo.healthAnalysis || "N/A"}</p>
          <h3><strong>Care Recommendation:</strong></h3>
          <h4>Current Weather Care:</h4>
          <p>
            {Array.isArray(plantInfo.currentWeatherCareGuide)
              ? <span dangerouslySetInnerHTML={{ __html: "<br>" + plantInfo.currentWeatherCareGuide.join("<br>") }} />
              : plantInfo.currentWeatherCareGuide || "N/A"}
          </p>
          <h4>Forecast-Based Care:</h4>
          <p>
            {Array.isArray(plantInfo.forecastCareGuide)
              ? <span dangerouslySetInnerHTML={{ __html: "<br>" + plantInfo.forecastCareGuide.join("<br>") }} />
              : plantInfo.forecastCareGuide || "N/A"}
          </p>
        </div>
      )}

      <ErrorPopup message={errorMessage} onClose={() => setErrorMessage('')} />
    </div>
  );
};

export default Upload;
