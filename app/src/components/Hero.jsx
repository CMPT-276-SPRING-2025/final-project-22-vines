import React from 'react';
import HeroPlant from '../assets/hero-plant.png';
import { Link } from 'react-router-dom';

/**
* Hero Component
* 
* This component renders the main hero section on the homepage with a call-to-action.
*/

function Hero() {
  return (
    <div className="text-black w-full bg-[#E2FFDB] px-4">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 px-6 items-center">
        {/* Text Side */}
        <div className="py-12">
          <h1 className="text-5xl font-bold py-4">
            Identify Plants And Receive Care Insights Using AI
          </h1>
          <p className="text-xl">
            Upload a photo, and AI will assess your plant's health and provide tips to help it thrive.
          </p>
          <Link to="/Upload">
            <button className="bg-green-600 text-white w-[200px] rounded-md font-medium my-6 px-6 py-3 cursor-pointer hover:bg-green-700 transition duration-300">
              Upload Photo
            </button>
          </Link>
        </div>

        {/* Image + Dots with Fade */}
        <div
          className="relative"
          style={{
            backgroundImage: `radial-gradient(circle, #00000020 5px, transparent 5px)`,
            backgroundSize: '30px 30px',
            maskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
          }}
        >
          <img
            src={HeroPlant}
            alt="hero plant"
            className="w-full relative z-10"
          />
        </div>
      </div>
    </div>
  );
}

export default Hero;
