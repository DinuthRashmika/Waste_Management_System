import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const [addresses, setAddresses] = useState([]); // Store all addresses
    const [selectedAddress, setSelectedAddress] = useState(null); // Store selected address
    const [paymentMethod, setPaymentMethod] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem('token'); // Get the token for authorization
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Fetch user addresses
                const response = await axios.get('http://localhost:4000/api/user', config);
                setAddresses(response.data.addresses); // Assuming response data has addresses
            } catch (error) {
                setError('Error fetching address details');
            }
        };

        fetchAddresses();
    }, []);

    const handlePayment = async () => {
        if (!paymentMethod || !selectedAddress) {
            setError('Please select an address and a payment method');
            return;
        }

        setLoading(true);
        try {
            // Simulate a payment process
            await axios.post('http://localhost:4000/api/pay', {
                userId: selectedAddress.user,
                paymentMethod,
                addressId: selectedAddress._id, // Pass the selected address ID for the payment
            });

            alert('Payment successful!');
            navigate('/dashboard'); // Redirect to dashboard after payment
        } catch (error) {
            setError('Payment failed, please try again');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Pay Your Bill</h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {addresses.length > 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Select Address</h2>

                    <select 
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        value={selectedAddress?._id || ''}
                        onChange={(e) => setSelectedAddress(addresses.find(addr => addr._id === e.target.value))}
                    >
                        <option value="">Select an address...</option>
                        {addresses.map((address) => (
                            <option key={address._id} value={address._id}>
                                {address.address} - {address.monthlyPayment} LKR
                            </option>
                        ))}
                    </select>

                    {selectedAddress && (
                        <>
                            <p><strong>Garbage Weight:</strong> {selectedAddress.garbageWeight || 0} kg</p>
                            <p><strong>Recyclable Garbage Weight:</strong> {selectedAddress.recycleGarbageWeight || 0} kg</p>
                            <p><strong>Monthly Payment:</strong> {selectedAddress.monthlyPayment} LKR</p>

                            <div className="mt-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Select Payment Method:</label>
                                <select 
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                >
                                    <option value="">Select one...</option>
                                    <option value="online">Online Payment</option>
                                    <option value="bank">Bank Payment</option>
                                </select>
                            </div>

                            <button 
                                className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <p>Loading addresses...</p>
            )}
        </div>
    );
};

export default PaymentPage;