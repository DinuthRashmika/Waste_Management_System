import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; // QR code generator
 
import { jwtDecode } from 'jwt-decode';

const CustomerDashboard = () => {
    const [userData, setUserData] = useState(null); // Store user data
    const [error, setError] = useState(''); // Handle errors
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [requestStatus, setRequestStatus] = useState(''); // Store request status
    const [requestId, setRequestId] = useState(null); // Track request ID
    const [addresses, setAddresses] = useState([]); // Store user addresses
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAddressesAndRequest = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('No token found. Please log in.');
                    setIsLoading(false);
                    return;
                }

                const decoded = jwtDecode(token); // Decode JWT to get user details
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`, // Attach token to the request
                    },
                };

                // Fetch user addresses
                const addressResponse = await axios.get('http://localhost:4000/api/user', config);
                setAddresses(addressResponse.data.addresses);

                // Fetch the latest request status
                const requestStatusResponse = await axios.get('http://localhost:4000/api/status', config);
                setRequestStatus(requestStatusResponse.data.status || 'No Request');

                // Fetch the request ID (optional)
                try {
                    const requestIdResponse = await axios.get('http://localhost:4000/api/requests/id', config);
                    setRequestId(requestIdResponse.data.requestId); // Store the request ID
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setRequestId(null);
                    } else {
                        setError('Error fetching request ID: ' + (error.response?.data?.message || error.message));
                    }
                }

                // Fetch user data
                const userResponse = await axios.get(`http://localhost:4000/api/users/${decoded.id}`, config);
                setUserData(userResponse.data);

                setIsLoading(false);
            } catch (error) {
                setError('Error fetching data: ' + (error.response?.data?.message || error.message));
                setIsLoading(false);
            }
        };

        fetchUserAddressesAndRequest();
    }, []);

    // Handle Make Request button click - Navigate to address selection page
    const handleMakeRequest = () => {
        navigate('/select-address'); // Navigate to address selection page
    };

    // Handle Delete Request button click
    const handleDeleteRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Attach token to the request
                },
            };

            // Delete request API call
            await axios.delete(`http://localhost:4000/api/requests/${requestId}`, config);
            setRequestStatus('No Request'); // Reset request status after deletion
            setRequestId(null);

            alert('Request deleted successfully!');
        } catch (error) {
            setError('Error deleting request: ' + (error.response?.data?.message || error.message));
        }
    };

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token from localStorage
        navigate('/login'); // Redirect to the login page
    };

    const handleAddTenantClick = () => {
        navigate('/add-tenant');
    };

    const handleAddressClick = () => {
        navigate('/map-view');
    };

    const defaultAddress = {
        address: 'N/A',
        collectionDate: 'N/A',
        garbageWeight: 0,
    };

    const address = addresses?.[0] || defaultAddress;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-light mb-8">Customer Dashboard</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <>
                    <h2 className="text-2xl text-blue-500 mb-4">Hello, {userData?.name || 'User'}</h2>

                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
                        <div className="flex justify-between mb-4">
                            <p className="text-gray-700">Your Address</p>
                            <div 
                                className="bg-gray-200 rounded p-2 cursor-pointer hover:bg-gray-300 transition-colors"
                                onClick={handleAddressClick} // Navigate to the map view
                            >
                                <p className="text-gray-500">{address.address}</p>
                            </div>
                        </div>

                        <div className="bg-gray-200 p-2 rounded-lg mb-4">
                            <p className="text-gray-500">Next Collection Date</p>
                            <p className="text-black">{address.collectionDate}</p>
                        </div>
                    </div>

                    <div className="text-gray-700 mb-4">50kg this month</div>

                    {/* Request Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
                        <h3 className="text-lg text-gray-400 font-semibold mb-2">Collector Request</h3>
                        <p className="text-gray-500">{requestStatus || 'No Request'}</p>
                        <button 
                            className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            onClick={handleMakeRequest} // Make request when button is clicked
                            disabled={requestStatus === 'Pending' || requestStatus === 'Confirmed'} // Disable if the request is pending or confirmed
                        >
                            {requestStatus === 'Pending' || requestStatus === 'Confirmed' ? 'Request Pending' : 'Make a Request'}
                        </button>

                        {/* Show Delete button only if request is pending */}
                        {requestStatus === 'Pending' && (
                            <button 
                                className="w-full py-2 mt-4 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                                onClick={handleDeleteRequest}
                            >
                                Delete Request
                            </button>
                        )}
                    </div>

                    <button className="w-full max-w-md py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
                        Pay Bill
                    </button>

                    {/* Logout Button */}
                    <button className="text-red-500 mt-4" onClick={handleLogout}>
                        Logout
                    </button>

                    {/* QR Code Section */}
                    {userData && (
                        <div className="mt-6">
                            <h3 className="text-lg text-gray-400 font-semibold mb-2">QR Code with Your Details</h3>
                            <QRCodeCanvas value={JSON.stringify(userData)} size={256} />
                        </div>
                    )}
                </>
            )}

            <p className="mt-6 text-sm text-gray-500">Smart Waste Management System.</p>
        </div>
    );
};

export default CustomerDashboard;