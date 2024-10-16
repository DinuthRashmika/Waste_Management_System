import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; // Import routing machine for directions

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

const CollectorDashboard = () => {
    const [confirmedRequests, setConfirmedRequests] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [collectorName, setCollectorName] = useState('');
    const [reportRequests, setReportRequests] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const navigate = useNavigate(); // Used for navigating to the RequestMapView

    // Fetch confirmed requests
    useEffect(() => {
        const fetchConfirmedRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const decoded = jwtDecode(token);
                const collectorId = decoded.id;
                setCollectorName(decoded.name || 'Collector');

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const response = await axios.get(`http://localhost:4000/api/requests/confirmed/${collectorId}`, config);
                setConfirmedRequests(response.data);
                setIsLoading(false);
            } catch (error) {
                 
                setIsLoading(false);
            }
        };

        fetchConfirmedRequests();
    }, [navigate]);

    // Function to navigate to Request Map View
    const handleViewRequest = (requestId) => {
        navigate(`/collector/request/${requestId}/map`); // Navigate to RequestMapView
    };

    // Function to extract latitude and longitude from the address string
    const extractLatLng = (address) => {
        if (address) {
            const latLngMatch = address.match(/Lat:\s*([0-9.-]+),\s*Lng:\s*([0-9.-]+)/);
            if (latLngMatch) {
                return {
                    lat: parseFloat(latLngMatch[1]),
                    lng: parseFloat(latLngMatch[2]),
                };
            }
        }
        return null;
    };

    // Function to fetch the collection report (all requests)
    const fetchCollectionReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.get('http://localhost:4000/api/admin/requests', config);
            setReportRequests(response.data);
            setShowReport(true);
        } catch (error) {
            setError('Error fetching collection report: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-100">
            <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Collector Dashboard</h1>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => localStorage.removeItem('token') || navigate('/login')}
                    >
                        Logout
                    </button>
                </div>
                <h2 className="text-xl text-blue-500 mb-4">Welcome, {collectorName}</h2>

                {isLoading ? (
                    <p>Loading confirmed requests...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <>
                        {/* Map Display */}
                        <div className="mb-6">
                            <MapContainer
                                center={[23.80592, 90.43275]} // Centered based on a default location
                                zoom={12}
                                style={{ height: '400px', width: '100%' }}
                            >
                                <TileLayer
                                    attribution="&copy; OpenStreetMap contributors"
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {/* Add markers dynamically based on confirmed requests */}
                                {confirmedRequests.map((request) => {
                                    const position = extractLatLng(request.address);
                                    if (position) {
                                        return (
                                            <Marker key={request._id} position={[position.lat, position.lng]}>
                                                <Popup>
                                                    <div>
                                                        <p>
                                                            <strong>User:</strong> {request.user.name}
                                                        </p>
                                                        <p>
                                                            <strong>Address:</strong> {request.address}
                                                        </p>
                                                        <p>
                                                            <strong>Status:</strong> {request.status}
                                                        </p>
                                                        <button
                                                            className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
                                                            onClick={() => handleViewRequest(request._id)} // Navigate to request map view
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    }
                                    return null;
                                })}
                            </MapContainer>
                        </div>

                        {/* Confirmed Requests List */}
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Confirmed Requests</h3>
                            {confirmedRequests.length === 0 ? (
                                <p>No confirmed requests assigned to you.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {confirmedRequests.map((request) => (
                                        <div
                                            key={request._id}
                                            className="bg-gray-100 p-4 rounded-lg shadow-md"
                                            onClick={() => handleViewRequest(request._id)} // Click to navigate
                                        >
                                            <p>
                                                <strong>User:</strong> {request.user.name}
                                            </p>
                                            <p>
                                                <strong>Address:</strong> {request.address}
                                            </p>
                                            <p>
                                                <strong>Status:</strong> {request.status}
                                            </p>
                                            <button
                                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                                                onClick={() => handleViewRequest(request._id)} // Navigate to RequestMapView
                                            >
                                                View on Map
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Collection Report Section */}
                        {showReport && (
                            <div className="mt-6 bg-white p-4 rounded-lg shadow-md w-full">
                                <h3 className="text-2xl font-semibold mb-4">Collection Report</h3>
                                {reportRequests.length === 0 ? (
                                    <p>No collection data available.</p>
                                ) : (
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr>
                                                <th className="py-2 px-4 border-b">Request ID</th>
                                                <th className="py-2 px-4 border-b">User Name</th>
                                                <th className="py-2 px-4 border-b">Address</th>
                                                <th className="py-2 px-4 border-b">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportRequests.map((request) => (
                                                <tr key={request._id}>
                                                    <td className="py-2 px-4 border-b">{request._id}</td>
                                                    <td className="py-2 px-4 border-b">{request.user.name}</td>
                                                    <td className="py-2 px-4 border-b">{request.address}</td>
                                                    <td className="py-2 px-4 border-b">{request.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Button to Fetch Collection Report */}
                        <div className="mt-6">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                onClick={fetchCollectionReport}
                            >
                                Generate Collection Report
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CollectorDashboard;