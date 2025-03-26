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
  const [errorMessage, setErrorMessage] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [plantInfo, setPlantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

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
        setCurrentWeather({
          temp: Math.round(current.main.temp),
          humidity: current.main.humidity,
          condition: current.weather[0].main,
          description: current.weather[0].description,
          date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        });

        const forecastDays = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        // Get one forecast per day for the next 5 days
        for (let i = 0; i < 5; i++) {
          const index = i * 8 + 8; // Each day has 8 entries (3-hour intervals)
          if (data.list[index]) {
            const dayData = data.list[index];
            const date = new Date(dayData.dt * 1000);
            forecastDays.push({
              day: days[i],
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

  // Get weather icon based on condition
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

  //handle the uploaded image file
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

  //handle identify button
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
          <div className="plant-info">
            <h2>{plantInfo.name || "Unknown Plant"}</h2>
            <p className="scientific-name">{plantInfo.scientificName || ""}</p>
            
            {/*health overview*/}
            {plantInfo.healthOverview && (
              <div className="health-overview">
                <h3>Health Overview</h3>
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

            {/*potential health condition*/}
            {Array.isArray(plantInfo.potentialHealthConditions) && plantInfo.potentialHealthConditions.length > 0 && (
              <div className="potential-health-conditions">
                <h3>Potential Health Conditions</h3>
                {plantInfo.potentialHealthConditions.map((condition, index) => (
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
                    <h4 className="watering">Watering</h4>
                    <ul>
                      {plantInfo.plantCare.watering.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
                {/*light*/}
                {Array.isArray(plantInfo.plantCare.light) && plantInfo.plantCare.light.length > 0 && (
                  <div className="care-item">
                    <h4 className="light">Light</h4>
                    <ul>
                      {plantInfo.plantCare.light.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
                {/*humidity*/}
                {Array.isArray(plantInfo.plantCare.humidity) && plantInfo.plantCare.humidity.length > 0 && (
                  <div className="care-item">
                    <h4 className="humidity">Humidity</h4>
                    <ul>
                      {plantInfo.plantCare.humidity.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
                {/*temperature*/}
                {Array.isArray(plantInfo.plantCare.temperature) && plantInfo.plantCare.temperature.length > 0 && (
                  <div className="care-item">
                    <h4 className="temperature">Temperature</h4>
                    <ul>
                      {plantInfo.plantCare.temperature.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
                {/*fertilization */}
                {Array.isArray(plantInfo.plantCare.fertilization) && plantInfo.plantCare.fertilization.length > 0 && (
                  <div className="care-item">
                    <h4 className="fertilization">Fertilization</h4>
                    <ul>
                      {plantInfo.plantCare.fertilization.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
                {/*soil*/}
                {Array.isArray(plantInfo.plantCare.soil) && plantInfo.plantCare.soil.length > 0 && (
                  <div className="care-item">
                    <h4 className="soil">Soil & Potting</h4>
                    <ul>
                      {plantInfo.plantCare.soil.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Today's Weather */}
          {currentWeather && (
            <div className="weather-container">
              <h2>Today's Weather</h2>
              <div className="todays-weather">
                <div className="weather-date">
                  {currentWeather.date}
                </div>
                <div className="weather-icon">
                  {getWeatherIcon(currentWeather.condition)}
                </div>
                <div className="weather-condition">
                  {currentWeather.condition === 'Clouds' ? 'Mostly Cloudy' : currentWeather.condition}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
                <div className="weather-temp">
                  <h3>Temperature</h3>
                  <div className="temp-value">{currentWeather.temp}°C</div>
                  <div className="temp-label">{plantInfo.healthOverview?.temperatureSuitability || 'Normal'}</div>
                </div>
                
                <div className="weather-humidity">
                  <h3>Humidity</h3>
                  <div className="humidity-value">{currentWeather.humidity}%</div>
                  <div className="humidity-label">{plantInfo.healthOverview?.humiditySuitability || 'Normal'}</div>
                </div>
              </div>
              
              <div className="weather-details">
                <p>
                  Ideal range: 18-24°C. {plantInfo.healthOverview?.temperatureSuitability || 'Current temperature is suitable'} 
                  for {plantInfo.name}.
                </p>
                <p>
                  Ideal range: 40-70% humidity. {plantInfo.healthOverview?.humiditySuitability || 'Current humidity level is suitable'} 
                  for optimal growth.
                </p>
              </div>
            </div>
          )}

          {/* Weather Forecast */}
          {forecast.length > 0 && (
            <div className="weather-container">
              <h3>Weather Forecast</h3>
              <div className="forecast-days">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <div className="forecast-day-name">{day.day}</div>
                    <div className="forecast-icon">{day.icon}</div>
                    <div className="forecast-temp">{day.temp}°C</div>
                    <div className="forecast-humidity">{day.humidity}%</div>
                    <div className="forecast-notes">
                      {index === 0 && 'Normal conditions. Keep watering schedule.'}
                      {index === 1 && 'Ideal humidity. No extra care needed.'}
                      {index === 2 && 'Reduce watering due to high humidity.'}
                      {index === 3 && 'Slightly dry air, consider misting.'}
                      {index === 4 && 'Move plant indoors and away from windows.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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