import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
 
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

// Sidebar Component
const Sidebar = ({ handleLogout }) => {
  return (
    <div className="bg-teal-100 min-h-screen w-64 py-8">
      <div className="bg-teal-600 text-white min-h-screen w-full px-4 py-8 shadow-lg">
        <div className="flex items-center mb-8">
          {/* Add any logo or header here */}
        </div>
        <nav className="space-y-4">
          <NavLink
            to="/admindashboard"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded-lg ${isActive ? 'bg-teal-700' : 'hover:bg-teal-500'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/view-users"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded-lg ${isActive ? 'bg-teal-700' : 'hover:bg-teal-500'}`
            }
          >
            View Users
          </NavLink>
          <NavLink
            to="/view-collectors"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded-lg ${isActive ? 'bg-teal-700' : 'hover:bg-teal-500'}`
            }
          >
            View Collectors
          </NavLink>
          <button
            onClick={handleLogout}
            className="block w-full py-2.5 px-4 mt-6 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Log Out
          </button>
        </nav>
      </div>
    </div>
  );
};

// Dashboard Component
const AdminDashboard = () => {
  const [userDetails, setUserDetails] = useState({});
  const [totalCollections, setTotalCollections] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [requests, setRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserDetails(decoded);
      if (decoded.role === 'admin') {
        fetchDashboardData(token);
      } else {
        setError('You are not authorized to view this page.');
      }
    }
  }, []);

  const fetchDashboardData = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const collectionsResponse = await axios.get('http://localhost:4000/api/admin/garbage-collections', config);
      const usersResponse = await axios.get('http://localhost:4000/api/admin/total-users', config);
      const requestsResponse = await axios.get('http://localhost:4000/api/admin/requests', config);
      const collectorsResponse = await axios.get('http://localhost:4000/api/admin/collectors', config);

      setTotalCollections(collectionsResponse.data.totalCollections);
      setTotalUsers(usersResponse.data.totalUsers);
      setRequests(requestsResponse.data);
      setCollectors(collectorsResponse.data.collectors);
    } catch (error) {
      setError('Error fetching dashboard data: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAssignCollector = async () => {
    if (!selectedRequest || !selectedCollector) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put('http://localhost:4000/api/admin/assign-collector', {
        requestId: selectedRequest._id,
        collectorId: selectedCollector,
      }, config);

      alert('Collector assigned successfully!');
      setSelectedRequest(null);
      setSelectedCollector('');
      // Optionally, refetch requests to update the UI
    } catch (error) {
      setError('Error assigning collector: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      
                 

      {/* Main content area */}
      <div className="flex-1 bg-gray-100 p-8">
        <h1 className="text-3xl font-light mb-8">Admin Dashboard</h1>

        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8">
              {/* Garbage Collection Monitoring */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg text-gray-400 font-semibold mb-2">Total Garbage Collections</h2>
                <p className="text-black text-2xl">{totalCollections}</p>
              </div>

              {/* User Management Section */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg text-gray-400 font-semibold mb-2">Total Users</h2>
                <p className="text-black text-2xl">{totalUsers}</p>
                <button
                  className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                  onClick={() => navigate('/view-users')}
                >
                  View All Users
                </button>
              </div>
            </div>

            {/* Requests Map Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
              <h2 className="text-lg text-gray-400 font-semibold mb-2">Requests Map</h2>
              <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {requests.map((request) => {
                  const lat = request.addressLat;
                  const lng = request.addressLng;

                  return (
                    <Marker key={request._id} position={[lat, lng]}>
                      <Popup>
                        <div>
                          <p><strong>Request ID:</strong> {request._id}</p>
                          <p><strong>Address:</strong> {request.address}</p>
                          <select onChange={(e) => setSelectedCollector(e.target.value)} value={selectedCollector}>
                            <option value="">Select Collector</option>
                            {collectors.map((collector) => (
                              <option key={collector._id} value={collector._id}>
                                {collector.name}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => setSelectedRequest(request)}>
                            Assign Collector
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Assign Collector Modal */}
            {selectedRequest && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-lg font-semibold mb-2">Assign Collector</h3>
                <p><strong>Request Address:</strong> {selectedRequest.address}</p>
                <p><strong>User:</strong> {selectedRequest.user.name}</p>

                <div className="mt-4">
                  <label className="block text-gray-700">Select Collector:</label>
                  <select
                    value={selectedCollector}
                    onChange={(e) => setSelectedCollector(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a collector</option>
                    {collectors.map((collector) => (
                      <option key={collector._id} value={collector._id}>
                        {collector.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAssignCollector}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
                >
                  Assign
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
