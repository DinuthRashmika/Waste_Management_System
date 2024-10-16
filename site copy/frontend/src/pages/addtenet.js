import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import jwtDecode from 'jwt-decode'; // Ensure jwt-decode is installed
import { jwtDecode } from 'jwt-decode';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'; // If using Leaflet for map
import 'leaflet/dist/leaflet.css'

const AddTenant = () => {
    const [location, setLocation] = useState([23.8103, 90.4125]); // Default to a location
    const [address, setAddress] = useState('');
    const [monthlyPayment] = useState(3190); // Default monthly payment
    const [tenants, setTenants] = useState([]); // List of tenants
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTenants = async () => {
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

                // Fetch tenants (addresses) from the backend
                const response = await axios.get('http://localhost:4000/api/user', config);
                setTenants(response.data.addresses); // Set tenants list
            } catch (error) {
                setError('Error fetching tenants: ' + (error.response?.data?.message || error.message));
            }
        };

        fetchTenants();
    }, []);

    // Handle clicking on the map
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setLocation([e.latlng.lat, e.latlng.lng]);
                setAddress(`Lat: ${e.latlng.lat}, Lng: ${e.latlng.lng}`); // Simulate an address
            },
        });
        return location === null ? null : <Marker position={location} />;
    };

    // Handle adding a new tenant
    const handleAddTenant = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const newTenant = { address, monthlyPayment };
            const response = await axios.post('http://localhost:4000/api/add', newTenant, config);
            console.log('New tenant added:', response.data);

            // After adding the tenant, update the list of tenants
            setTenants([...tenants, response.data.address]); // Add the new tenant to the list
        } catch (error) {
            setError('Error adding tenant: ' + (error.response?.data?.message || error.message));
        }
    };

    // Handle deleting a tenant
    const handleDeleteTenant = async (tenantId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Send DELETE request to delete the tenant by ID
            await axios.delete(`http://localhost:4000/api/${tenantId}`, config);
            console.log('Tenant deleted:', tenantId);

            // Remove the tenant from the list on the frontend
            setTenants(tenants.filter(tenant => tenant._id !== tenantId));
        } catch (error) {
            setError('Error deleting tenant: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-light mb-8">Add Tenant</h1>

            {/* Map Section */}
            <div className="w-full max-w-2xl mb-8">
                <MapContainer center={location} zoom={13} style={{ height: '300px', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                </MapContainer>
            </div>

            {/* Form Section */}
            <div className="w-full max-w-md">
                <label htmlFor="address" className="block text-gray-700">Selected Address</label>
                <input
                    id="address"
                    className="border p-2 w-full"
                    value={address}
                    readOnly
                />

                <button
                    className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                    onClick={handleAddTenant}
                >
                    Add Tenant
                </button>
            </div>

            {/* Tenants List Section */}
            <h2 className="text-2xl mt-8">Added Tenants</h2>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {tenants.length === 0 ? (
                <p className="mt-4">No tenants added yet.</p>
            ) : (
                <ul className="mt-4 w-full max-w-md">
                    {tenants.map((tenant) => (
                        <li key={tenant._id} className="bg-white p-4 mb-2 rounded shadow-md">
                            <p><strong>Address:</strong> {tenant.address}</p>
                            <p><strong>Monthly Payment:</strong> Rs {tenant.monthlyPayment}</p>
                            <button
                                className="text-red-500 mt-2"
                                onClick={() => handleDeleteTenant(tenant._id)} // Call delete function
                            >
                                Delete Tenant
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <button
                className="mt-8 text-blue-500"
                onClick={() => navigate('/dashboard')} // Navigate back to dashboard
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default AddTenant;