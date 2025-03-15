import Navbar from '../components/Navbar';
import React from 'react';
import { useState } from 'react';

const FAQ = () => {

    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { question: "Question 1?", answer: "Answer to question 1..." },
        { question: "Question 2?", answer: "Answer to question 2..." },
        { question: "Question 3?", answer: "Answer to question 3..." }

        /* Add or edit questions and answers as needed */
    ];
    
    const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
};

return (
    <div>
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border rounded-2xl p-4 shadow-sm bg-white">
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
                            <p className="text-gray-600">{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
};

export default FAQ;