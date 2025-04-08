import React from 'react';
import Navbar from '../components/Navbar';

const About = () => {
  return (
    <div className="bg-gray-100">
      <Navbar />
      <div className="md:text-center max-w-[1240px] mx-auto px-6 py-12">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800">About Virtual Garden</h2>
          <p className="text-gray-600 mt-2">
            Virtual Garden is a web application designed to help plant owners identify and care for their plants. 
            Using AI, we analyze your plant photos to provide accurate identification and health assessments.
            The application also offers weather-based insights to help you adjust your care routine based on real-time climate data.

          </p>
          
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
          <p className="text-gray-600 mt-2">
            Our mission is to simplify plant care for all plant owners through AI-powered 
            identification, health assessment, and weather-based insights.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Who We Are</h2>
          <p className="text-gray-600 mt-2">
            We are a passionate group of developers and designers working on Virtual Garden to 
            make plant care easier for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;