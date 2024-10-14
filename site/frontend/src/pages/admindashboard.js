import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AdminDashboard = () => {
    const [userDetails, setUserDetails] = useState({});
    const [totalPay, setTotalPay] = useState(3190);
    const [garbageAtCapacity, setGarbageAtCapacity] = useState(9);
    const [emptyGarbage, setEmptyGarbage] = useState(1);
    const [requests, setRequests] = useState([]); // To store list of pending requests
    const [newUsers, setNewUsers] = useState(9);
    const [totalUsers, setTotalUsers] = useState(31);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const decoded = jwtDecode(token);
            setUserDetails(decoded);

            // Fetch all pending requests for the admin
            fetchRequests(token);
        }
    }, []);

    const fetchRequests = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Fetch all pending requests
            const response = await axios.get('http://localhost:4000/api/admin/requests', config);
            setRequests(response.data); // Update state with pending requests
        } catch (error) {
            setError('Error fetching requests: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleConfirmRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Confirm the request
            await axios.put(`http://localhost:4000/api/admin/requests/${requestId}/confirm`, {}, config);
            alert('Request confirmed successfully!');

            // Refetch requests after confirming one
            fetchRequests(token);
        } catch (error) {
            setError('Error confirming request: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-light mb-8">Admin Dashboard</h1>

            {/* Display the user's name from the token */}
            <h2 className="text-xl text-blue-500 mb-6">
                Welcome, {userDetails.role === 'admin' ? userDetails.name : 'Admin'}
            </h2>

            {/* Monitor Garbage Collection Section */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
                <h2 className="text-lg text-gray-400 font-semibold mb-2">Monitor Garbage Collection</h2>
                <div className="flex justify-between mb-2">
                    <p className="text-gray-500">Garbage at Capacity</p>
                    <p className="text-black">{garbageAtCapacity}</p>
                </div>
                <div className="flex justify-between mb-2">
                    <p className="text-gray-500">Empty Garbage</p>
                    <p className="text-black">{emptyGarbage}</p>
                </div>

                {/* Requests Section */}
                <div className="bg-gray-300 p-2 rounded-lg mb-2">
                    <p className="text-center text-gray-700">Pending Requests</p>
                    {requests.length === 0 ? (
                        <p className="text-center text-black font-bold">No Pending Requests</p>
                    ) : (
                        <ul className="mt-4 w-full max-w-md space-y-2">
                            {requests.map((request) => (
                                <li key={request._id} className="bg-white p-4 mb-2 rounded shadow-md">
                                    <p><strong>User:</strong> {request.user.name}</p>
                                    <p><strong>Status:</strong> {request.status}</p>
                                    <button
                                        className="w-full py-2 mt-4 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                                        onClick={() => handleConfirmRequest(request._id)}
                                    >
                                        Accept Request
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* User Management Section */}
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
                <h2 className="text-lg text-gray-400 font-semibold mb-2">User Management</h2>
                <div className="flex justify-between mb-2">
                    <p className="text-gray-500">Number of New Registered Users</p>
                    <p className="text-black">{newUsers}</p>
                </div>
                <div className="flex justify-between mb-2">
                    <p className="text-gray-500">Total</p>
                    <p className="text-black">{totalUsers}</p>
                </div>
                <button className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
                    View All Users
                </button>
            </div>

            <p className="mt-6 text-sm text-gray-500">Smart Waste Management System.</p>
        </div>
    );
};

export default AdminDashboard;