import React from 'react';
import Navbar from '../components/Navbar';

const FAQ = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        
        <div className="border-b border-gray-300 py-4">
          <h3 className="text-lg font-semibold">Question 1?</h3>
          <p className="text-gray-600">Answer...</p>
        </div>

        <div className="border-b border-gray-300 py-4">
          <h3 className="text-lg font-semibold">Question 2?</h3>
          <p className="text-gray-600">Answer...</p>
        </div>

        <div className="py-4">
          <h3 className="text-lg font-semibold">Question 3?</h3>
          <p className="text-gray-600">Answer...</p>
        </div>

        {/* Add or edited questions and answers as needed */}

      </div>
    </div>
  );
};

export default FAQ;
