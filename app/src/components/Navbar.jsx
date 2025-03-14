import React from 'react'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-black'>
        <h1 className='w-full text-3xl font-bold'>Digital Garden</h1>
        <ul className='flex' >
            <li className='p-4'>About</li>
            <li className='p-4'>FAQ</li>
            <li className='p-4'>Contact</li>
            <li className='p-4'>Analyze</li>
        </ul>
    </div>
  )
}

export default Navbar