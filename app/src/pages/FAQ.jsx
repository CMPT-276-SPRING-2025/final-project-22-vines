import Navbar from '../components/Navbar';
import React from 'react';
import { useState } from 'react';

/**
 * FAQ Component
 * 
 * This component renders a Frequently Asked Questions page with expandable/collapsible
 * question and answer sections.
 */

const FAQ = () => {
    // State to track which FAQ item is currently open
    const [openIndex, setOpenIndex] = useState(null);
    // Array of FAQ objects containing questions and answers
    const faqs = [
        { question: "What if the weather doesn't display?", answer: "If the webpage does not display the weather, please ensure that location access is granted and try uploading the photo again." },
        { question: "Can I upload multiple plants in one photo?", answer: "It's recommended to upload one plant per photo. If there are multiple plants, the AI may misidentify the species or provide inaccurate health information." },
        { question: "What image formats are supported?" , answer: "Currently, we support PNG, JPEG, JPG, WEBP, or GIF formats. Please ensure your image is in one of these formats before uploading." },
        { question: "Does the website store my plant data?", answer: "Sorry, we don't have this function yet. The data will be deleted after you exit the analyze page." },
        { question: "How often should I check my plant's health?", answer: "You can check as often as you'd like! However, we suggest uploading a new photo every 1–2 weeks or after any major change in appearance to monitor your plant's condition." }
        
        /* Add or edit questions and answers as needed */
    ];
    
    /**
     * Toggles the visibility of an answer based on its index
     * If the clicked item is already open, it closes it
     * If another item is clicked, it closes the previous one and opens the new one
     */
    const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
};

return (
    <div>
        <Navbar />
        {/* Main content container */}
        <div className="max-w-[1240px] mx-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-6 ">Frequently Asked Questions</h2>
            {/* FAQ container*/}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                {faqs.map((faq, index) => (
                    <div key={index} className="p-4">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{faq.question}</p>
                            <button 
                                className="bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:bg-green-700"
                                onClick={() => toggleAnswer(index)}
                            >
                                {openIndex === index ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* Sliding animation */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                            <p className="text-gray-600 mb-4">{faq.answer}</p>
                        </div>

                        {/* Horizontal divider between FAQ items*/}
                        {index < faqs.length - 1 && <hr className="border-gray-300 my-6" />}
                    </div>
                ))}
            </div>
        </div>
    </div>
);
};

export default FAQ;
