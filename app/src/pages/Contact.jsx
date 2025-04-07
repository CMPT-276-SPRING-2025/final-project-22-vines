import Navbar from '../components/Navbar';
import React, { useState, useRef } from "react";
import emailjs from '@emailjs/browser';

const ContactPage = () => {
    const form = useRef();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const sendEmail = (e) => {
        e.preventDefault();
        setStatus("Sending...");

        emailjs.sendForm(
            'service_0mr8xwn', // EmailJS service ID
            'template_1yvows1', // EmailJS template ID
            form.current,
            'Zz315oB8jsXUxeCqK' // EmailJS Public key
        )
        .then((result) => {
            setStatus("Message sent successfully!");
            setFormData({ name: "", email: "", message: "" });
            console.log(result.text);
        }, (error) => {
            setStatus("Failed to send message.");
            console.log(error.text);
        });
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen flex flex-col items-center justify-start px-6 pt-20 bg-gray-100 py-10 max-w-[1240px] mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-lg  w-full">
                    <h2 className="text-2xl font-bold text-center mb-4">Contact Us</h2>
                    <p className="text-gray-600 text-center mb-6">Any questions or remarks? Just write us a message!</p>

                    <form ref={form} onSubmit={sendEmail} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter a valid email address"
                                    className="w-full border p-3 rounded-md bg-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your Name"
                                    className="w-full border p-3 rounded-md bg-gray-100"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Enter your message"
                                className="w-full border p-3 rounded-md bg-gray-100"
                                rows="4"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-medium">
                            Submit
                        </button>
                    </form>

                    {status && (
                        <div className={`mt-4 p-3 rounded-md text-center ${status.includes("success") ? "bg-green-100 text-green-700" : status.includes("Failed") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {status}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-10">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Harman</h3>
                        <p className="text-gray-600">sssss</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Nicole</h3>
                        <p className="text-gray-600">Very nice application.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Peter Xu</h3>
                        <p className="text-gray-600">I love this website, It saves my cactus</p>
                    </div>
                    {/* Add or edit user reviews as needed */}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
