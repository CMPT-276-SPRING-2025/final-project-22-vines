import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import "./Upload.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Base plant prompt remains unchanged
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
  // All state variables remain unchanged
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [plantInfo, setPlantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // All functions remain unchanged
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

  useEffect(() => {
    getWeatherData()
      .then((data) => {
        const current = data.list[0];
        setCurrentWeather({
          temp: Math.round(current.main.temp),
          humidity: current.main.humidity,
          condition: current.weather[0].main,
          description: current.weather[0].description,
          date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        });

        const forecastDays = [];
        
        // Get one forecast per day for the next 4 days
        for (let i = 0; i < 4; i++) {
          const index = i * 8 + 8; 
          if (data.list[index]) {
            const dayData = data.list[index];
            const date = new Date(dayData.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            forecastDays.push({
              day: dayName,
              temp: Math.round(dayData.main.temp),
              humidity: dayData.main.humidity,
              condition: dayData.weather[0].main,
              icon: getWeatherIcon(dayData.weather[0].main)
            });
          }
        }
        setForecast(forecastDays);
      })
      .catch((error) => {
        console.error("Weather error:", error);
      });
  }, []);

  const getWeatherIcon = (condition) => {
    if (!condition) {
      return '☁️'; // Return a default icon if the condition is undefined
    }
    switch (condition.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '⛅';
      case 'rain':
        return '🌧️';
      case 'snow':
        return '❄️';
      default:
        return '☁️';
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
  
    const allowedTypes = [
      "image/png",
      "image/jpeg", 
      "image/jpg", 
      "image/webp", 
      "image/gif"
    ];
  
    const fileType = file.type.toLowerCase();

    if (!allowedTypes.includes(fileType)) {
      setErrorMessage(`Unsupported file type: ${file.type}. 
        Please upload one of these image types: 
        PNG, JPEG, JPG, WEBP, or GIF`);
      
      // Clear file input
      event.target.value = null;
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File is too large. Maximum file size is 5MB.`);
      event.target.value = null;
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

  const handleDragOver = (event) => {
    if (event.target.closest('.upload-area')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleDrop = (event) => {
    if (event.target.closest('.upload-area')) {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files[0];
      if (file) {
        const fileEvent = { target: { files: [file] } };
        handleFileChange(fileEvent);
      }
    }
  };

  const handleIdentify = () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setPlantInfo(null);
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress > 90) clearInterval(progressInterval);
      setAnalysisProgress(progress);
    }, 300);

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
                  
                  // Stop the progress simulation
                  clearInterval(progressInterval);
                  setAnalysisProgress(100);
                  
                  // After a delay, set loading to false
                  setTimeout(() => {
                    setLoading(false);
                  }, 500);
                } catch (error) {
                  alert("Error processing the response: " + error);
                  clearInterval(progressInterval);
                  setLoading(false);
                }
              })
              .catch((error) => {
                alert("Plant identifying failed");
                console.error("Fetch error", error);
                clearInterval(progressInterval);
                setLoading(false);
              });
          } catch (error) {
            alert("Error during Google Gemini API request: " + error.message);
            console.error("Google Gemini error:", error);
            clearInterval(progressInterval);
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

  // This is the inline weather component for today's weather
  const TodaysWeatherInline = () => {
    if (!currentWeather) return null;
    
    return (
      <div className="weather-inline">
        <h4>Today's Weather</h4>
        <div className="weather-inline-content">
          <div className="weather-inline-main">
            <div className="weather-inline-icon">
              {getWeatherIcon(currentWeather.condition)}
            </div>
            <div className="weather-inline-info">
              <div className="weather-inline-date">{currentWeather.date}</div>
              <div className="weather-inline-condition">
                {currentWeather.condition === 'Clouds' ? 'Mostly Cloudy' : currentWeather.condition}
              </div>
            </div>
          </div>
          <div className="weather-inline-metrics">
            <div className="weather-inline-metric">
              <span className="metric-label">Temp:</span>
              <span className="metric-value">{currentWeather.temp}°C</span>
              <span className="metric-status">{plantInfo?.healthOverview?.temperatureSuitability || 'Normal'}</span>
            </div>
            <div className="weather-inline-metric">
              <span className="metric-label">Humidity:</span>
              <span className="metric-value">{currentWeather.humidity}%</span>
              <span className="metric-status">{plantInfo?.healthOverview?.humiditySuitability || 'Normal'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // This is the inline forecast component
  const ForecastInline = () => {
    if (forecast.length === 0) return null;
    
    return (
      <div className="forecast-inline">
        <h4>4-Day Forecast</h4>
        <div className="forecast-inline-days">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-inline-day">
              <div className="forecast-inline-day-name">{day.day}</div>
              <div className="forecast-inline-icon">{day.icon}</div>
              <div className="forecast-inline-temp">{day.temp}°C</div>
              <div className="forecast-inline-humidity">{day.humidity}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="upload-page">
        {!loading && !plantInfo && (
          <div className="upload-container">
            <h1>Digital Garden</h1>
            <div 
              className={`upload-area ${previewUrl ? 'with-preview' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!previewUrl ? (
                <>
                  <div className="upload-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C11.4477 2 11 2.4477 11 3V11H3C2.4477 11 2 11.4477 2 12C2 12.5523 2.4477 13 3 13H11V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H13V3C13 2.4477 12.5523 2 12 2Z" />
                    </svg>
                  </div>

                  <p>Drag and drop photo or click to Upload Your Plant Image.</p>
                  <input 
                    type="file" 
                    className="file-input"
                    onChange={handleFileChange} 
                    accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/jpg,image/webp"
                  />
                </>
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="preview-image" 
                />
              )}
            </div>
            {previewUrl && (
              <div className="upload-actions">
                <button 
                  className="analyze-btn" 
                  onClick={handleIdentify}
                  disabled={!selectedFile}
                >
                  Analyze Plant
                </button>
              </div>
            )}
          </div>
        )}
      
      {loading && (
        <div className="upload-container">
          <h2>Upload Photo Of Plant</h2>
          {previewUrl && <img src={previewUrl} alt="Preview" className="preview-image" />}
          <div className="analyzing-container">
            <div className="analyzing-text">Analyzing...</div>
            <div className="analyzing-progress">
              <div 
                className="analyzing-progress-fill" 
                style={{ width: `${analysisProgress}%` }}>
                {analysisProgress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {plantInfo && (
        <>
          <div className="results-container">
            {/* Left Column */}
            <div className="results-left-column">
              {/* Plant Image */}
              <div className="plant-image-container">
                <img src={previewUrl} alt={plantInfo.name || "Plant"} />
              </div>
              
              {/* New: Weather section integrated into left column */}
              <div className="section-card weather-section">
                <TodaysWeatherInline />
                <ForecastInline />
              </div>
              
              {/* Potential Health Conditions */}
              <div className="section-card">
                <h3>Potential Health Conditions</h3>
                {Array.isArray(plantInfo.potentialHealthConditions) && plantInfo.potentialHealthConditions.length > 0 ? (
                  plantInfo.potentialHealthConditions.map((condition, index) => (
                    <div key={index} className="health-condition-item">
                      <div className="health-condition-title">
                        {condition.title}
                      </div>
                      <h4>Possible Causes:</h4>
                      <ul>
                        {condition.possibleCauses.map((cause, i) => <li key={i}>{cause}</li>)}
                      </ul>
                      <h4>Solutions:</h4>
                      <ul>
                        {condition.solutions.map((sol, i) => <li key={i}>{sol}</li>)}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>No health issues detected.</p>
                )}
              </div>
            </div>
            
            {/* Right Column */}
            <div className="results-right-column">
              {/* Overview */}
              <div className="section-card">
                <h3>Overview</h3>
                <h2>{plantInfo.name || "Unknown Plant"}</h2>
                <p className="scientific-name">{plantInfo.scientificName || ""}</p>
                <p>{plantInfo.description || ""}</p>
                
                {plantInfo.healthOverview && (
                  <div className="health-overview">
                    <div className="progress-bar">
                      <label>Overall Health</label>
                      <div className="progress">
                        <div
                          className="progress-fill progress-fill-overall"
                          style={{ width: `${plantInfo.healthOverview.overallHealth || 0}%` }}
                        >
                          {plantInfo.healthOverview.overallHealth || 0}%
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <label>Watering Needs</label>
                      <div className="progress">
                        <div
                          className="progress-fill progress-fill-watering"
                          style={{ width: `${plantInfo.healthOverview.wateringNeeds || 0}%` }}
                        >
                          {plantInfo.healthOverview.wateringNeeds || 0}%
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <label>Light Exposure</label>
                      <div className="progress">
                        <div
                          className="progress-fill progress-fill-light"
                          style={{ width: `${plantInfo.healthOverview.lightExposure || 0}%` }}
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
              </div>
              
              {/* Plant Care */}
              <div className="section-card">
                <h3>Plant Care</h3>
                {plantInfo.plantCare ? (
                  <>
                    {/* Watering */}
                    {Array.isArray(plantInfo.plantCare.watering) && plantInfo.plantCare.watering.length > 0 && (
                      <div className="care-item">
                        <h4 className="watering">Watering</h4>
                        <ul>
                          {plantInfo.plantCare.watering.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                    {/* Light */}
                    {Array.isArray(plantInfo.plantCare.light) && plantInfo.plantCare.light.length > 0 && (
                      <div className="care-item">
                        <h4 className="light">Light</h4>
                        <ul>
                          {plantInfo.plantCare.light.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                    {/* Humidity */}
                    {Array.isArray(plantInfo.plantCare.humidity) && plantInfo.plantCare.humidity.length > 0 && (
                      <div className="care-item">
                        <h4 className="humidity">Humidity</h4>
                        <ul>
                          {plantInfo.plantCare.humidity.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                    {/* Temperature */}
                    {Array.isArray(plantInfo.plantCare.temperature) && plantInfo.plantCare.temperature.length > 0 && (
                      <div className="care-item">
                        <h4 className="temperature">Temperature</h4>
                        <ul>
                          {plantInfo.plantCare.temperature.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                    {/* Fertilization */}
                    {Array.isArray(plantInfo.plantCare.fertilization) && plantInfo.plantCare.fertilization.length > 0 && (
                      <div className="care-item">
                        <h4 className="fertilization">Fertilization</h4>
                        <ul>
                          {plantInfo.plantCare.fertilization.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                    {/* Soil */}
                    {Array.isArray(plantInfo.plantCare.soil) && plantInfo.plantCare.soil.length > 0 && (
                      <div className="care-item">
                        <h4 className="soil">Soil & Potting</h4>
                        <ul>
                          {plantInfo.plantCare.soil.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No care information available.</p>
                )}
              </div>
            </div>
          </div>

          <a href="#" className="analyze-another-btn" onClick={() => {
            setPlantInfo(null);
            setSelectedFile(null);
            setPreviewUrl('');
          }}>
            Analyze Another Plant
          </a>
        </>
      )}

      <ErrorPopup message={errorMessage} onClose={() => setErrorMessage('')} />
    </div>
    </div>
  );
};

export default Upload;