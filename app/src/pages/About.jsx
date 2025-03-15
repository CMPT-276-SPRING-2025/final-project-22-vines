import React from 'react';
import Navbar from '../components/Navbar';

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-4xl font-bold mb-4">About Digital Garden</h2>
        <p className="text-lg">
          Digital Garden is an AI-powered web application designed to help plant owners 
          with identification, health assessment, and personalized care tips based on 
          weather data.
        </p>
      </div>
    </div>
  );
};

export default About;
