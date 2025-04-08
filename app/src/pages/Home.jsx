import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom'
import FeatureImage from '../assets/feature-weather.png';
import FeatureImage1 from '../assets/feature-care.png';
import FeatureImage2 from '../assets/feature-care2.png';
import Step1 from '../assets/Step1.png';
import Step2 from '../assets/Step2.png';
import Step3 from '../assets/Step3.png';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      
      {/* First Feature Section */}
      <div className="py-12">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-6">
          {/* Image */}
          <div className="relative">
            <img src={FeatureImage1} alt="Another App Feature" className="w-7/8 rounded-2xl shadow-lg" />
            <img
              src={FeatureImage2}
              alt="Small Feature"
              className="absolute bottom-[-20px] right-10 w-2/3 rounded-lg shadow-lg"
            />
          </div>
          
          {/* Text Content */}
          <div>
            <h2 className="text-4xl font-bold mb-4">Smart, Personalized Plant Care</h2>
            <p className="text-black text-lg">
            Get detailed care instructions based on your plant’s health and environment. 
             Our AI analyzes your plant 
             and gives you easy-to-follow tips to help it thrive — no guesswork required.
            </p>
          </div>
        </div>
      </div>

      {/* Second Feature Section */}
      <div className="py-12">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-6">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl font-bold mb-4">Let the Weather Guide You</h2>
            <p className="text-black text-lg">
            You’ll always know how to care for your plant in any weather. Using real-time climate data,
            we’ll help you adjust your care routine to keep your plant happy and healthy.
            </p>
          </div>

          {/* Image with Overlay */}
          <div className="relative">
            <img src={FeatureImage} alt="Another App Feature" className="w-7/8 rounded-lg shadow-lg mx-auto" />
          </div>
        </div>
      </div>

      {/* How To Use Section */}
      <div className="py-12 bg-[#E2FFDB]">
        <div className="max-w-[1240px] mx-auto text-center px-6">
          <h2 className="text-3xl font-bold">How To Use</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-80 h-80 flex items-center justify-center">
                <img src={Step1} alt="Take Photo" className="w-25" />
              </div>
              <p className="text-lg font-medium">Take Photo</p>
            </div>
            {/* Arrow */}
            <div className="hidden md:block text-5xl font-bold">→</div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-80 h-80 flex items-center justify-center">
                <img src={Step2} alt="Upload Photo" className="w-50" />
              </div>
              <p className="text-lg font-medium">Upload Photo</p>
            </div>
            {/* Arrow */}
            <div className="hidden md:block text-5xl font-bold">→</div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-80 h-80 flex items-center justify-center">
                <img src={Step3} alt="Receive Insights" className="w-60" />
              </div>
              <p className="text-lg font-medium">Receive Insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-12 text-black">
        <div className="max-w-[1240px] mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Your Plant Care to the Next Level?</h2>
          <Link to="/Upload"><button className='bg-green-600 text-white w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3 cursor-pointer hover:bg-green-700 transition duration-300'>Get Started Now</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
