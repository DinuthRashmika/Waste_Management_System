import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom"

const Login = () => {
    const [name, setName] = useState(''); // For username
    const [password, setPassword] = useState(''); // For password
    const [message, setMessage] = useState(''); // For messages
    const [showPopup, setShowPopup] = useState(false); // For popup visibility
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Log the entered password before sending the request
        console.log('Entered password:', password); // Ensure this is inside handleLogin

        try {
            // Send login request to the backend
            const response = await axios.post('http://localhost:4000/api/login', {
                name, // Username
                password, // Plain text password
            });

            const { token, user } = response.data; // Extract token and user data
            localStorage.setItem('token', token); // Store the JWT in local storage

            setShowPopup(true); // Show the success popup
            setMessage('Login successful!');


            // Redirect based on the user's role
            if (user.role === 'admin') {
                navigate('/admindashboard'); // Navigate to Admin Dashboard
            } else if (user.role === 'collector') {
                navigate('/collectordashboard'); // Navigate to Collector Dashboard
            } else {
                navigate('/customerdashboard'); // Navigate to Customer Dashboard
            }

            // For debugging: log user data
            console.log('User data:', user); 
        } catch (error) {
            // Handle login failure and display error message
            setMessage('Login failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const closePopup = () => {
        setShowPopup(false); // Close the popup
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <img
                src="./images.png" // Logo
                alt="Login Logo"
                className="w-32 h-32 mb-4"
            />

            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                    <div>
                        <input
                            type="text" // Input type for username
                            placeholder="Username" // Placeholder for username
                            value={name} // Bind to state
                            onChange={(e) => setName(e.target.value)} // Update state on input change
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required // Make this field required
                        />
                    </div>

                    <div>
                        <input
                            type="password" // Input type for password
                            placeholder="Password" // Placeholder for password
                            value={password} // Bind to state
                            onChange={(e) => setPassword(e.target.value)} // Update state on input change
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required // Make this field required
                        />
                    </div>

                    <button
                        type="submit" // Submit button
                        className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>

            <p className="mt-6 text-sm text-gray-500">Smart Waste Management System.</p>

            {showPopup && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
                        <h2 className="text-xl font-bold mb-4">Success!</h2>
                        <p className="mb-4">{message}</p>
                        <button
                            onClick={closePopup} // Close button
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

export default Login;
