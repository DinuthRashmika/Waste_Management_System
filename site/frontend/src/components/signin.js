// src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            // Send signup request to the backend
            const response = await axios.post('http://localhost:4000/api/signup', {
                name,
                email,
                password,
            });

            // If successful, show success message
            setShowPopup(true);
            setMessage('Signup successful!');
            console.log(response.data); // Logging user data and token
        } catch (error) {
            // Handle signup failure
            setMessage('Signup failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            {/* Logo Image */}
            <img
                src="./images.png" // Placeholder image, replace with your own image URL
                alt="Signup Logo"
                className="w-32 h-32 mb-4"
            />

            {/* Signup Form */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>
                <form onSubmit={handleSignup} className="flex flex-col space-y-4">
                    {/* Name Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Signup Button */}
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Sign Up
                    </button>
                </form>
            </div>

            {/* Footer */}
            <p className="mt-6 text-sm text-gray-500">Smart Waste Management System.</p>

            {/* Success Popup */}
            {showPopup && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
                        <h2 className="text-xl font-bold mb-4">Success!</h2>
                        <p className="mb-4">{message}</p>
                        <button
                            onClick={closePopup}
                            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;