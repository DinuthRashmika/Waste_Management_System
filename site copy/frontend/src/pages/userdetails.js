import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
    const { id } = useParams(); // Extract the user ID from the URL params
    const [userDetails, setUserDetails] = useState(null); // Store user details
    const [addresses, setAddresses] = useState([]); // Store user addresses
    const [error, setError] = useState(''); // Store any error messages
    const [loading, setLoading] = useState(true); // Show loading state

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Fetch user details by ID
                const userResponse = await axios.get(`http://localhost:4000/api/users/${id}`, config);
                const fetchedUser = userResponse.data;
                setUserDetails(fetchedUser);

                // Fetch addresses by passing the username from the user details
                const addressResponse = await axios.get(`http://localhost:4000/api/samj/${id}`);
                setAddresses(addressResponse.data.addresses);

            } catch (error) {
                setError('Error fetching user details or addresses.');
                console.error('Error:', error);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchUserDetails();
    }, [id]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-light mb-8">User Details</h1>

            {userDetails ? (
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <p className="text-xl font-bold mb-4">{userDetails.name}</p>
                    <p className="mb-2"><strong>Email:</strong> {userDetails.email || 'N/A'}</p>
                    <p className="mb-2"><strong>Role:</strong> {userDetails.role}</p>

                    {addresses.length > 0 ? (
                        <div className="mt-4">
                            <h3 className="font-semibold text-lg">Addresses:</h3>
                            <ul>
                                {addresses.map((address, index) => (
                                    <li key={index}>{address.address}</li> // Display the address field
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No addresses found for this user.</p>
                    )}
                </div>
            ) : (
                <p>No user details found.</p>
            )}
        </div>
    );
};

export default UserDetails;