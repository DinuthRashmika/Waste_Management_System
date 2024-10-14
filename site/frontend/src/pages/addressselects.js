import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AddressSelection = () => {
    const [addresses, setAddresses] = useState([]); // Store the user's addresses
    const [selectedAddress, setSelectedAddress] = useState(''); // Store the selected address
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('No token found. Please log in.');
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`, // Attach token to the request
                    },
                };

                // Fetch user addresses
                const response = await axios.get('http://localhost:4000/api/user', config);
                setAddresses(response.data.addresses);
            } catch (error) {
                setError('Error fetching addresses: ' + (error.response?.data?.message || error.message));
            }
        };

        fetchAddresses();
    }, []);

    // Handle form submission to make a request with the selected address
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Attach token to the request
                },
            };

            if (!selectedAddress) {
                alert('Please select an address before making a request.');
                return;
            }

            // Make the request with the selected address
            await axios.post('http://localhost:4000/api/requests', { address: selectedAddress }, config);
            alert('Request made successfully!');

            navigate('/dashboard'); // Redirect back to the dashboard
        } catch (error) {
            setError('Error making request: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-light mb-8">Select an Address</h1>

            {error && <p className="text-red-500">{error}</p>}

            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Your Addresses</h2>
                <div className="flex flex-col space-y-4">
                    {addresses.length > 0 ? (
                        addresses.map((addressObj, index) => (
                            <label key={index} className="flex items-center space-x-4">
                                <input
                                    type="radio"
                                    value={addressObj.address} // Make sure to access the correct property of the object
                                    checked={selectedAddress === addressObj.address}
                                    onChange={() => setSelectedAddress(addressObj.address)} // Set the selected address
                                />
                                <span className="text-gray-700">{addressObj.address}</span> {/* Display the specific field */}
                            </label>
                        ))
                    ) : (
                        <p>No addresses found. Please add an address.</p>
                    )}
                </div>

                <button
                    className="mt-6 w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    onClick={handleSubmit}
                >
                    Make Request
                </button>
            </div>
        </div>
    );
};

export default AddressSelection;