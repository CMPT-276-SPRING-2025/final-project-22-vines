import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import "./Upload.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;


const BASE_PLANT_PROMPT = `
Identify the plant species, analyze its health, and provide care recommendations.
If the image is not of a plant, return JSON with an "error" field.

Return JSON with these fields:
{
  "name": "Plant name",
  "scientificName": "Scientific name",
  "description": "Short description",
  "healthAnalysis": "Health issues/diseases",
  "healthOverview": {
    "overallHealth": 0-100 numeric,
    "wateringNeeds": 0-100 numeric,
    "lightExposure": 0-100 numeric,
    "temperatureSuitability": "e.g. 'Slightly Too Cold'",
    "humiditySuitability": "e.g. 'Slightly Too Dry'"
  },
  "potentialHealthConditions": [
    {
      "title": "Short problem description",
      "possibleCauses": ["cause 1", "cause 2"],
      "solutions": ["solution 1", "solution 2"]
    }
  ],
  "plantCare": {
    "watering": ["Tip1", "Tip2"],
    "light": ["Tip1", "Tip2"],
    "humidity": ["Tip1", "Tip2"],
    "temperature": ["Tip1", "Tip2"],
    "fertilization": ["Tip1", "Tip2"],
    "soil": ["Tip1", "Tip2"],
    "forecastCare": [
      { "day": "Day 1", "tips": ["Tip for that day", "Another tip"] },
      { "day": "Day 2", "tips": ["..."] }
    ]
  }
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

  //fetch weather data using OpenWeatherAPI and geolocation
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

  //handle the weather data response
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

  //handle the uploaded image file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file)
      return;

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

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  //handle identify button
  const handleIdentify = () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setPlantInfo(null);

    //get weather data
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
Forecast for next 4 days: 
${forecastSummary}
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
                  const parsed = JSON.parse(jsonString);

                  setPlantInfo(parsed);
                  if (parsed.error) {
                    setErrorMessage(parsed.error);
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

          {/*health overview*/}
          {plantInfo.healthOverview && (
            <div className="health-overview">
              <h3>Health Overview</h3>
              <div className="progress-bar">
                <label>Overall Health</label>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: "${plantInfo.healthOverview.overallHealth || 0}%"}}
                  >
                    {plantInfo.healthOverview.overallHealth || 0}%
                  </div>
                </div>
              </div>
              <div className="progress-bar">
                <label>Watering Needs</label>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: "${plantInfo.healthOverview.wateringNeeds || 0}%"}}
                  >
                    {plantInfo.healthOverview.wateringNeeds || 0}%
                  </div>
                </div>
              </div>
              <div className="progress-bar">
                <label>Light Exposure</label>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: "${plantInfo.healthOverview.lightExposure || 0}%"}}
                  >
                    {plantInfo.healthOverview.lightExposure || 0}%
                  </div>
                </div>
              </div>
              <div className="suitability">
                <p><strong>Temperature Suitability:</strong> {plantInfo.healthOverview.temperatureSuitability || "N/A"}</p>
                <p><strong>Humidity Suitability:</strong> {plantInfo.healthOverview.humiditySuitability || "N/A"}</p>
              </div>
            </div>
          )}

          {/*potential health condition*/}
          {Array.isArray(plantInfo.potentialHealthConditions) && plantInfo.potentialHealthConditions.length > 0 && (
            <div className="potential-health-conditions">
              <h3>Potential Health Conditions</h3>
              {plantInfo.potentialHealthConditions.map((condition, index) => (
                <div key={index}>
                  <p><strong> {condition.title}</strong></p>
                  <p><strong>Possible Causes:</strong></p>
                  <ul>
                    {condition.possibleCauses.map((cause, i) => <li key={i}>{cause}</li>)}
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    {condition.solutions.map((sol, i) => <li key={i}>{sol}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/*plant care*/}
          {plantInfo.plantCare && (
            <div className="plant-care">
              <h3>Plant Care</h3>

              {/*watering*/}
              {Array.isArray(plantInfo.plantCare.watering) && plantInfo.plantCare.watering.length > 0 && (
                <div className="care-item">
                  <h4>Watering</h4>
                  <ul>
                    {plantInfo.plantCare.watering.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {/*light*/}
              {Array.isArray(plantInfo.plantCare.light) && plantInfo.plantCare.light.length > 0 && (
                <div className="care-item">
                  <h4>Light</h4>
                  <ul>
                    {plantInfo.plantCare.light.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {/*humidity*/}
              {Array.isArray(plantInfo.plantCare.humidity) && plantInfo.plantCare.humidity.length > 0 && (
                <div className="care-item">
                  <h4>Humidity</h4>
                  <ul>
                    {plantInfo.plantCare.humidity.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {/*temperature*/}
              {Array.isArray(plantInfo.plantCare.temperature) && plantInfo.plantCare.temperature.length > 0 && (
                <div className="care-item">
                  <h4>Temperature</h4>
                  <ul>
                    {plantInfo.plantCare.temperature.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {/*fertilization */}
              {Array.isArray(plantInfo.plantCare.fertilization) && plantInfo.plantCare.fertilization.length > 0 && (
                <div className="care-item">
                  <h4>Fertilization</h4>
                  <ul>
                    {plantInfo.plantCare.fertilization.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {/*soil*/}
              {Array.isArray(plantInfo.plantCare.soil) && plantInfo.plantCare.soil.length > 0 && (
                <div className="care-item">
                  <h4>Soil</h4>
                  <ul>
                    {plantInfo.plantCare.soil.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {/*forecast tipsa*/}
              {Array.isArray(plantInfo.plantCare.forecastCare) && plantInfo.plantCare.forecastCare.length > 0 && (
                <div className="care-item">
                  <h4>Forecast-Based Care</h4>
                  {plantInfo.plantCare.forecastCare.map((fc, idx) => (
                    <div key={idx} className="forecast-care-item">
                      <strong>{fc.day}</strong>
                      <ul>
                        {fc.tips.map((tip, tIndex) => <li key={tIndex}>{tip}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ErrorPopup message={errorMessage} onClose={() => setErrorMessage('')} />
    </div>
  );
};

export default Upload;
