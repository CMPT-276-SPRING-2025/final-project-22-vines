import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onReset }) => {
  const location = useLocation();

  const handleButtonClick = () => {
    if (location.pathname === '/Upload' && onReset) {
      // If on the Upload page, call the reset function
      onReset();
    }
  };

  return (
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-6 text-black'>
      <h1 className='w-full text-4xl font-bold'>
        <Link to="/">Virtual Garden</Link>
      </h1>
      <ul className='flex'>
        <li className='p-4 font-medium text-lg transition-all duration-300 text-black hover:text-green-600'>
          <Link to="/About">About</Link>
        </li>
        <li className='p-4 font-medium text-lg transition-all duration-300 text-black hover:text-green-600'>
          <Link to="/FAQ">FAQ</Link>
        </li>
        <li className='p-4 font-medium text-lg transition-all duration-300 text-black hover:text-green-600'>
          <Link to="/Contact">Contact</Link>
        </li>
      </ul>
      <Link to="/Upload">
        <button
          className='bg-green-600 text-white w-[175px] rounded-md text-lg font-medium my-6 mx-auto px-6 py-3 cursor-pointer hover:bg-green-700 transition duration-300'
          onClick={handleButtonClick}
        >
          Analyze Plant
        </button>
      </Link>
    </div>
  );
};

export default Navbar;