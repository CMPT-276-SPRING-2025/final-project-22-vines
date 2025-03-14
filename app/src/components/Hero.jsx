import React from 'react'

function Hero() {
  return (
    <div className='text-black'>
        <div className='bg-[#E2FFDB] w-full h-150 mx-auto text-center flex flex-col justify-center'>
            <h1 className='text-4xl font-bold py-4'>Identify Plants And Receive Care Insights Using AI</h1>
            <p className='text-xl'>Upload a photo, and AI will assess your plant's health and provide tips to help it thrive.</p>
            <button className='bg-[#449C2C] text-white w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3'>Upload Photo</button>
        </div>
    </div>
  )
}

export default Hero