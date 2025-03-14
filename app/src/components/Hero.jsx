import React from 'react'
import HeroPlant from '../assets/hero-plant.png'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <div className='text-black w-full bg-[#E2FFDB]  px-4'>
        <div className='max-w-[1240px] mx-auto grid grid-cols-2 px-4'>
            <div className='py-30'>
                <h1 className='text-5xl font-bold py-4'>Identify Plants And Receive Care Insights Using AI</h1>
                <p className='text-xl'>Upload a photo, and AI will assess your plant's health and provide tips to help it thrive.</p>
                <Link to="/Upload"><button className='bg-green-600 text-white w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3 cursor-pointer hover:bg-green-700 transition duration-300'>Upload Photo</button></Link>
            </div>
            <img src={HeroPlant} alt='hero plant' className='w-full mt-auto' />
        </div>
    </div>
  )
}

export default Hero