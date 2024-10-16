import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; // Import routing machine for directions
import { Html5QrcodeScanner } from 'html5-qrcode'; // Import the QR Code scanner
import GarbageForm from './garbageforms';

const RequestMapView = () => {
    const { requestId } = useParams(); // Get requestId from URL params
    const [requestDetails, setRequestDetails] = useState(null);
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [userLat, setUserLat] = useState(null); // Store user's latitude
    const [userLng, setUserLng] = useState(null); // Store user's longitude
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [map, setMap] = useState(null);
    const [showScanner, setShowScanner] = useState(false); // Toggle QR scanner visibility
    const [scannedData, setScannedData] = useState(null); // Store scanned QR data

    const navigate = useNavigate();

    // Request user's location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLat(position.coords.latitude);
                    setUserLng(position.coords.longitude);
                },
                (error) => {
                    setError('Failed to get current location: ' + error.message);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
        }
    }, []);

    useEffect(() => {
        const fetchRequestDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Fetch request and associated address from the backend
                const response = await axios.get(`http://localhost:4000/api/requests/${requestId}/address`, config);
                const addressString = response.data.address;

                // Extract lat and lng from the address string
                const latLngMatch = addressString.match(/Lat:\s*([0-9.-]+),\s*Lng:\s*([0-9.-]+)/);
                if (latLngMatch) {
                    setLat(parseFloat(latLngMatch[1]));
                    setLng(parseFloat(latLngMatch[2]));
                } else {
                    throw new Error('Invalid address format');
                }

                setRequestDetails(response.data);
                setIsLoading(false);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setError('Request not found');
                } else {
                    setError('Error fetching request details: ' + (error.response?.data?.message || error.message));
                }
                setIsLoading(false);
            }
        };

        fetchRequestDetails();
    }, [requestId]);

    // Initialize the map
    useEffect(() => {
        if (lat && lng && !map && document.getElementById('map')) {
            // Initialize the map only once
            const mapInstance = L.map('map').setView([lat, lng], 13); // Set view with lat and lng
            setMap(mapInstance);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapInstance);

            // Marker for the destination (request address)
            L.marker([lat, lng]).addTo(mapInstance).bindPopup('Request Location').openPopup();

            if (userLat && userLng) {
                // Add route from user's location to destination if available
                L.Routing.control({
                    waypoints: [
                        L.latLng(userLat, userLng), // User's current location
                        L.latLng(lat, lng),         // Request location
                    ],
                    routeWhileDragging: true,
                }).addTo(mapInstance);
            }
        }

        // Cleanup function to remove the map on unmount
        return () => {
            if (map) {
                map.off();    // Remove all map event listeners
                map.remove(); // Properly remove the map
                setMap(null); // Clear map reference
            }
        };
    }, [lat, lng, userLat, userLng, map]);

    // Function to initialize the QR code scanner
    const initializeQrScanner = () => {
        const qrCodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
        qrCodeScanner.render(onScanSuccess, onScanFailure);
    };

    // Function called on QR code scan success
    const onScanSuccess = (decodedText, decodedResult) => {
        setScannedData(decodedText); // Store scanned data
        setShowScanner(false);       // Hide scanner after scanning
        alert(`QR Code Scanned: ${decodedText}`);
    };

    // Function called on QR code scan failure
    const onScanFailure = (error) => {
        console.warn(`QR Scan Error: ${error}`);
    };

    // Function to handle completing the request
    const handleCompleteRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Mark the request as completed
            await axios.put(`http://localhost:4000/api/collector/requests/${requestId}/complete`, {}, config);
            alert('Request marked as complete');
            navigate('/collector-dashboard'); // Redirect after completion
        } catch (error) {
            setError('Error completing request: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-4">Request Details</h1>
                    <p><strong>User:</strong> {requestDetails?.request.user.name}</p>
                    <p><strong>Address:</strong> {requestDetails?.address}</p> {/* Display the address from request */}

                    {/* Map Container */}
                    <div id="map" style={{ height: '400px', width: '100%' }}></div>

                    {/* Complete button */}
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4"
                        onClick={handleCompleteRequest}
                    >
                        Mark Complete
                    </button>

                    {/* Toggle QR Scanner Button */}
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
                        onClick={() => {
                            setShowScanner(!showScanner);
                            if (!showScanner) {
                                setTimeout(() => initializeQrScanner(), 300); // Initialize scanner after ensuring element is loaded
                            }
                        }}
                    >
                        {showScanner ? 'Close QR Scanner' : 'Open QR Scanner'}
                    </button>

                    {/* QR Code Scanner */}
                    {showScanner && (
                        <div className="mt-4" id="qr-reader" style={{ width: '500px' }}></div>
                    )}

                    {/* Display scanned QR code data */}
                    {scannedData && (
                        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold">Scanned QR Code Data:</h3>
                            <p>{scannedData}</p>
                        </div>
                    )}
                </>
            )}
            <GarbageForm />
        </div>
    );
};

export default RequestMapView;
