import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import "./Upload.css";

const GOOGLE_API_KEY = "AIzaSyDnw3wbTZXTCQdAran37oMm9Vo5X1fjxYQ";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const OPENWEATHER_API_KEY = "5ee1fed90448749eccbf099844c6ecaf"; 


const BASE_PLANT_PROMPT = `
Identify the plant species, analyze its health, and provide care recommendations.
Return JSON format:
{
  "name": "Plant name",
  "scientificName": "Scientific name",
  "description": "Short description about the plant",
  "healthAnalysis": "Detect health issues, diseases, or deficiencies",
  "careGuide": [
      "1. [First care tip]",
      "2. [Second care tip]",
      "3. [Third care tip]"
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

//fetch weather data using openweatherapi and geolocation
  const getWeatherData = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
            const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

            Promise.all([
              fetch(weatherURL).then(res => res.json()),
              fetch(forecastURL).then(res => res.json())
            ])
            
              .then(([weatherData, forecastData]) => {
                resolve({ weather: weatherData, forecast: forecastData });
              })
              .catch((error) => reject(error));

          },
          (error) => reject(error)
        );

      } else {
        reject(new Error("Cannot get user location"));
      }
    });
  };

  //handle the res from openweatherapi (get weather desc and temp)
  useEffect(() => {
    getWeatherData()
      .then(({ weather, forecast }) => {
        const currentSummary = `${weather.weather[0].description}, ${weather.main.temp}°C`;
        setCurrentWeather(currentSummary);
        const forecastSummary = forecast.list.slice(0, 3)
          .map(item => `${item.dt_txt}: ${item.weather[0].description}, ${item.main.temp}°C`)
          .join("; ");
        setForecast(forecastSummary);
      })
      .catch((error) => {
        setCurrentWeather("Unavailable");
        setForecast("Unavailable");
        console.error("Weather error:", error);
      });
  }, []);

  //handel the uplaoded image
  const handleFileChange = (event) => {
    const file = event.target.files[0]; 
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //handle idenitfy button
  const handleIdentify = () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }
    setLoading(true);


    //get the weather data for the main prompt
    getWeatherData()
      .then(({ weather, forecast }) => {

        const currentWeatherStr = `Current weather: ${weather.weather[0].description}, Temp: ${weather.main.temp}°C.`;
        const forecastSummary = forecast.list.slice(0, 3)

          .map(item => `${item.dt_txt}: ${item.weather[0].description}, ${item.main.temp}°C`)
          .join("; ");

        //weather info for the prompt
        const weatherInfo = `
Additional weather details:
${currentWeatherStr}
Forecast: ${forecastSummary}
Please provide care recommendations considering these weather conditions.
        `;


        const fullPrompt = BASE_PLANT_PROMPT + weatherInfo;


        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result.split(",")[1]; //get the "encoded" iamge data

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

          //post the prompt to google gemini
          fetch(`${GEMINI_API_ENDPOINT}?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          
            .then((response) => {
              if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
              return response.text();
            })
            
            .then((responseText) => {  //recieve the data as json file, get the first candidates res from google gemini and then parse the text to display it
              try {
                const responseData = JSON.parse(responseText); //parsaing
                let jsonString = responseData.candidates[0].content.parts[0].text;
                if (jsonString.startsWith("```json\n")) {
                  jsonString = jsonString.substring(7, jsonString.length - 3);
                }

                jsonString = jsonString.trim();
                const plantData = JSON.parse(jsonString);

                setPlantInfo(plantData);
                
              } catch (error) {
                alert("Error processing the response" + error);
              }

            })
            .catch((error) => {
              alert("Plant indetifying failed");
              console.error("Fetch error", error);
            })
            .finally(() => {
              setLoading(false);
            });
        };
        reader.readAsDataURL(selectedFile);
      })
      .catch((error) => {
        alert("Failed to get weather data: " + error.message);
        setLoading(false);
      });
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
          <h3><strong>Care Reccomendation:</strong></h3>
          <p>
            {Array.isArray(plantInfo.careGuide)
              ? <span dangerouslySetInnerHTML={{ __html: "<br>" + plantInfo.careGuide.join("<br>") }} />
              : plantInfo.careGuide || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Upload;
