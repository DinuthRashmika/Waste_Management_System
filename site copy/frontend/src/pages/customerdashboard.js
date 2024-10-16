import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { jwtDecode } from 'jwt-decode';

const CustomerDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState('');
    const [requestId, setRequestId] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [error, setError] = useState(''); // Add error handling
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAddressesAndRequest = async () => {
            try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                setError('No token found. Please log in.');
                return;
            }

            const decoded = jwtDecode(token);
            console.log("Decoded Token:", decoded);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const userResponse = await axios.get(`http://localhost:4000/api/users/${decoded.id}`, config);
            console.log("User Data:", userResponse.data); // Add this to check the userData
            setUserData(userResponse.data);

                // Fetch user addresses
                const addressResponse = await axios.get('http://localhost:4000/api/user', config);
                
                if (addressResponse.data.addresses.length > 0) {
                    setAddresses(addressResponse.data.addresses); // Store addresses
                } else {
                    setAddresses([]); // No addresses found
                }

                // Fetch the latest request status
                const requestStatusResponse = await axios.get('http://localhost:4000/api/status', config);
                setRequestStatus(requestStatusResponse.data.status || 'No Request');

                // Fetch the request ID (optional)
                try {
                    const requestIdResponse = await axios.get('http://localhost:4000/api/requests/id', config);
                    setRequestId(requestIdResponse.data.requestId);
                } catch {
                    setRequestId(null);
                }

                 
            } catch (err) {
                setError('Failed to fetch data. Please try again.');
            } finally {
                setIsLoading(false); // Ensure this is called only once
            }
        };

        fetchUserAddressesAndRequest();
    }, []);

    // Function to calculate next collection date
    const getNextCollectionDate = () => {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Next month's 1st day
        return nextMonth.toDateString(); // Format the date as "Mon Jan 01 2024"
    };

    // After adding a tenant, refetch addresses
    const handleAddTenant = () => {
        navigate('/add-tenant');
    };

    const handleMakeRequest = () => {
        navigate('/select-address');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleAddressClick = () => {
        navigate('/map-view');
    };


     

    const defaultAddress = {
        address: 'N/A',
        collectionDate: getNextCollectionDate(), // Show next month 1st as the collection date
        garbageWeight: 0,
        monthlyPayment: 3190,
    };

    const address = addresses?.[0] || defaultAddress;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-light mb-8">Customer Dashboard</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h2 className="text-2xl text-blue-500 mb-4">Hello, {userData?.name || 'User'}</h2>

                    {addresses.length === 0 ? (
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
                            <p className="text-gray-500">No addresses found for this user.</p>
                            <button
                                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mt-4"
                                onClick={handleAddTenant}
                            >
                                Add Address
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
                            <div className="flex justify-between mb-4">
                                <p className="text-gray-700">Your Address</p>
                                <div 
                                    className="bg-gray-200 rounded p-2 cursor-pointer hover:bg-gray-300 transition-colors"
                                    onClick={handleAddressClick}
                                >
                                    <p className="text-gray-500">{address.address}</p>
                                </div>
                            </div>
                            

                            <div className="bg-gray-200 p-2 rounded-lg mb-4">
                            <button
                                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mt-4"
                                onClick={handleAddTenant}
                            >Add tenent</button>
                                <p className="text-gray-500">Next Collection Date</p>
                                <p className="text-black">{getNextCollectionDate()}</p>
                            </div>
                            

                            <div className="bg-gray-200 p-2 rounded-lg mb-4">
                                <p className="text-gray-500">Monthly Payment</p>
                                <p className="text-black">LKR {address.monthlyPayment}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
                        <h3 className="text-lg text-gray-400 font-semibold mb-2">Collector Request</h3>
                        <p className="text-gray-500">{requestStatus || 'No Request'}</p>
                        <button 
                            className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            onClick={handleMakeRequest}
                            disabled={requestStatus === 'Pending' || requestStatus === 'Confirmed'}
                        >
                            {requestStatus === 'Pending' || requestStatus === 'Confirmed' ? 'Request Pending' : 'Make a Request'}
                        </button>
                    </div>

                    <button className="w-full max-w-md py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                     onClick={() => navigate(`/pay-bill/${address._id}`) }>
                        Pay Bill
                    </button>

                    <button className="text-red-500 mt-4" onClick={handleLogout}>
                        Logout
                    </button>

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