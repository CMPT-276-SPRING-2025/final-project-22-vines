22 VINES

Group Members:  
 - Sadhika Huria  
 - Nathan Fassler  
 - Junhao Xu (Peter)  
 - Duong Ha Minh Khoa (Elton)

# Virtual Garden 🌱💻

## Project Overview

**Virtual Garden** is a web application designed to assist plant enthusiasts and gardeners in taking care and managing their plant collections. The app uses advanced AI technologies to analyze photos of plants, accurately identify species, assess plant health, and provide personalized care recommendations based on the current status of the plant. It also integrates real-time weather data to optimize care advice even more based on local conditions.

## Project Description

The **Virtual Garden** application allows users to upload photos of their plants to:

- **Identify Plant Species:** Use AI-powered recognition to identify plant species from images.
- **Health Assessment:** Detect early signs of diseases, pests, or nutrient deficiencies in plants.
- **Personalized Care Recommendations:** Get tailored advice on how to care for the plant based on its species and health condition.
- **Weather Integration:** Incorporate real-time and forecasted weather data to adjust care routines according to temperature, humidity, and upcoming weather events.

### APIs Integrated:

- **Google Gemini API:** Used for plant species identification, health assessment, and care recommendations.
- **OpenWeatherMap API:** Provides real-time weather data and short-term weather forecasts for climate-based care adjustments.
- **plant.id API (Backup):** A backup option for species identification, health diagnostics, and an AI chatbot for instant plant care advice.
- **Visual Crossing API (Backup):** Offers hyper-local weather data and alerts for extreme weather, such as frost or storms.

### Front End:

- **React**: Chosen for its flexibility and industry standard status, with a large ecosystem of libraries for ease of development.
- **Tailwind CSS**: Used for its customizability and ease of use in styling the web interface.

## User Personas

- **Emma (Novice Gardener):** Seeks easy-to-follow care advice and plant identification.
- **Liam (Experienced Gardener):** Requires advanced diagnostics and detailed care suggestions for a large variety of plants.
- **Sophia (Indoor Plant Enthusiast):** Needs specific guidance for maintaining indoor plants, with a focus on pest control and optimizing indoor conditions.

## Features

- **AI-powered Plant Identification**: Upload photos to identify plants and learn more about them.
- **Health Diagnostics**: Upload images of plants showing symptoms, such as yellow spots, for a health assessment and how to import the current health status.
- **Personalized Care Recommendations**: Get detailed care instructions based on plant species and current health status.
- **Weather-based Care Adjustments**: Receive local weather data and forecasts to adjust plant care routines according to it.

## Setup Instructions

### Prerequisites
- Node.js (prefer latest version)
- npm (Node package manager)  
Can be installed here:
```
https://nodejs.org/en/download
```
- Need API keys for:
  - Google Gemini API
    ```
    https://aistudio.google.com/apikey
    ```

  - OpenWeatherMap API
    ```
    https://openweathermap.org/api
    ```

### Installation
1. Clone the repository and navigate to the project directory
   ```
   git clone https://github.com/CMPT-276-SPRING-2025/final-project-22-vines.git
   cd final-project-22-vines
   ```

2. Install dependencies
   ```
   cd app # Navigate to the 'app' directory
   npm install
   ```

3. Set up environment variables (IMPORTANT)
   - Create a `.env` file in the 'app' directory
   
   - Add your API keys:
     ```
     VITE_OPENWEATHER_API_KEY=your_gemini_api_key
     VITE_GEMINI_API_KEY=your_open_weather_map_api_key
     ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173/` (Or the link it show on your Local) to view the application.

## Links
**Deployed Website:** [Link](https://demo-deploy-for-vine-22.onrender.com/)  
**Report:** [Link](https://docs.google.com/document/d/1GL3276joFisV9jS36vXO0D_JSRjekVRspwKewqxtKfI/edit?usp=sharing)  
**Demo Video:** [Link](https://youtu.be/-yDqJ07jOX8)  
**Video Presentation:** [Link](https://youtu.be/lThqun9LhFY)  




