import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Top border to visually separate the footer */}
      <div className="border-t-4 border-green-600">
        {/* Container */}
        <div className="max-w-[1240px] mx-auto py-8 px-4">
          {/* Upper portion: Logo / Title and short description */}
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Virtual Garden</h2>
              <p className="mt-2 text-gray-400 max-w-sm">
                Helping you nurture and grow your plant collection with AI-powered insights.
              </p>
            </div>

            {/* Quick links / Newsletter */}
            <div className="md:flex md:space-x-8 md:space-x-16">
              {/* Quick links section */}
              <div className="mb-6 md:mb-0">
                <h3 className="text-lg font-semibold mb-2">Links</h3>
                <ul className="space-y-1">
                  <li>
                    <Link to="/About" className="hover:text-green-400 transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/FAQ" className="hover:text-green-400 transition-colors">
                      FAQ
                    </Link>
                  </li>
                  {/* <li>
                    <Link to="/Contact" className="hover:text-green-400 transition-colors">
                      Contact
                    </Link>
                  </li> */}
                </ul>
              </div>

              {/* Think about something to add here later */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Something</h3>
                <form className="flex flex-col space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="p-1.5 rounded text-black bg-white border-gray-300 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white py-1.5 rounded transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Divider line */}
          <hr className="border-gray-700 my-6" />

          {/* Bottom text */}
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Virtual Garden. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
