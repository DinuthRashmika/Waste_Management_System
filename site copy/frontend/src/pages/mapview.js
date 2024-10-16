import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaArrowLeft } from 'react-icons/fa';

// Fix Leaflet's default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = () => {
    const [tenants, setTenants] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token found. Please log in.');
                    setIsLoading(false);
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`, // Attach token to the request
                    },
                };

                // Fetch tenant addresses from the backend
                const response = await axios.get('http://localhost:4000/api/user', config);
                setTenants(response.data.addresses); // Set tenants list
                setIsLoading(false);
            } catch (error) {
                setError('Error fetching tenants: ' + (error.response?.data?.message || error.message));
                setIsLoading(false);
            }
        };

        fetchTenants();
    }, []);

    // Function to parse the address string into latitude and longitude
    const parseCoordinates = (address) => {
        try {
            const latLng = address.split(', ').map(part => part.split(': ')[1]);
            const lat = parseFloat(latLng[0]);
            const lng = parseFloat(latLng[1]);
            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Invalid coordinates');
            }
            return [lat, lng];
        } catch (error) {
            console.error('Error parsing coordinates:', error);
            return [23.8103, 90.4125]; // Default coordinates (Dhaka, Bangladesh)
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            {/* Back Button */}
            <button
                className="self-start mb-4 text-blue-500 flex items-center"
                onClick={() => navigate('/customerdashboard')}
            >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
            </button>

            <h1 className="text-3xl font-light mb-8">Tenant Locations</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <>
                    {tenants.length === 0 ? (
                        <p>No tenant locations available.</p>
                    ) : (
                        <div className="w-full max-w-4xl h-96 mb-8">
                            <MapContainer
                                center={[23.8103, 90.4125]} // Center the map to a default location
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {tenants.map((tenant) => {
                                    const coordinates = parseCoordinates(tenant.address);
                                    return (
                                        <Marker key={tenant._id} position={coordinates}>
                                            <Popup>
                                                <div>
                                                    <p><strong>Address:</strong> {tenant.address}</p>
                                                    <p><strong>Monthly Payment:</strong> Rs {tenant.monthlyPayment}</p>
                                                    {/* Add more tenant details here if needed */}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </div>
                    )}
                </>
            )}

            <p className="mt-6 text-sm text-gray-500">Smart Waste Management System.</p>
        </div>
    );
};

export default MapView;
