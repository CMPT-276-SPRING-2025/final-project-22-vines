import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const About = () => {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="md:text-center max-w-5xl mx-auto px-6 py-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">About Digital Garden</h2>
                <p className="text-gray-600 mt-2">
                Placeholder: Includes description of app, value to users, how to use, etc.
                </p>
            </div>
          
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
                <p className="text-gray-600 mt-2">
                Our mission is to simplify plant care for all plant owners through AI-powered 
                identification, health assessment, and weather-based insights.
                </p>
            </div>
  
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Meet the Team</h2>
                <p className="text-gray-600 mt-2">
                We are a passionate group of developers and designers working on Virtual Garden to 
                make plant care easier for everyone.
                </p>
            </div>

            {/* Add more sections or edit text as needed */}

        </div>
        <Footer />
      </div>
    )
  }

export default About;
