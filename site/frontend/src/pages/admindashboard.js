import React, { useEffect, useState } from 'react';
import axios from 'axios';
 
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker images
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon issue in Leaflet with Webpack
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]); // Store all requests
  const [collectors, setCollectors] = useState([]); // Store list of collectors
  const [users, setUsers] = useState([]); // Store list of users
  const [error, setError] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // For displaying request details
  const [selectedCollectorId, setSelectedCollectorId] = useState(''); // For storing selected collector
  const [view, setView] = useState('dashboard'); // 'dashboard', 'users', 'collectors', 'report'
  const [showAddCollectorModal, setShowAddCollectorModal] = useState(false); // For adding collectors
  const [newCollector, setNewCollector] = useState({ name: '', email: '', role:'collector',password: '' }); // Collector form data
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        setAdminName(decoded.name); // Set admin's name from the token

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch all requests
        const requestsResponse = await axios.get('http://localhost:4000/api/admin/requests', config);
        setRequests(requestsResponse.data);

        // Fetch collectors
        const collectorsResponse = await axios.get('http://localhost:4000/api/admin/collectors', config);
        setCollectors(collectorsResponse.data);

        // Fetch users
        const usersResponse = await axios.get('http://localhost:4000/api/admin/users', config);
        setUsers(usersResponse.data.users);

        setIsLoading(false);
      } catch (err) {
        
        console.error('Error fetching data:', err);
        setCollectors([]); // Ensure collectors is an array even if the API call fails
        setUsers([]); // Ensure users is an array even if the API call fails
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to handle assigning a collector to a request
  const handleAssignCollector = async () => {
    try {
      if (!selectedRequest || !selectedCollectorId) {
        alert('Please select a collector.');
        return;
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Assign the collector and confirm the request
      await axios.put(
        'http://localhost:4000/api/admin/requests/assign',
        {
          requestId: selectedRequest._id,
          collectorId: selectedCollectorId,
        },
        config
      );

      alert('Collector assigned and request confirmed successfully');

      // Update the requests state to remove the confirmed request
      const updatedRequests = requests.filter((request) => request._id !== selectedRequest._id);
      setRequests(updatedRequests);

      // Clear the selected request and collector
      setSelectedRequest(null);
      setSelectedCollectorId('');
    } catch (err) {
      setError('Error assigning collector: ' + (err.response?.data?.message || err.message));
      console.error('Error assigning collector:', err);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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

  // Function to handle adding a new collector
  const handleAddCollector = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Add the new collector
      const response = await axios.post('http://localhost:4000/api/signup', newCollector, config);

      alert('Collector added successfully');

      // Update the collectors list
      setCollectors([...collectors, response.data.collector]);

      // Clear the form and close the modal
      setNewCollector({ name: '', email: '', password: '' });
      setShowAddCollectorModal(false);
    } catch (err) {
      setError('Error adding collector: ' + (err.response?.data?.message || err.message));
      console.error('Error adding collector:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo and Title */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-2xl font-bold text-teal-600">Admin Dashboard</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full text-left py-3 px-4 flex items-center ${
              view === 'dashboard' ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-teal-200'
            }`}
          >
            {/* Using emojis as icons */}
            <span className="mr-2 text-lg">🏠</span>
            Dashboard
          </button>
          <button
            onClick={() => setView('users')}
            className={`w-full text-left py-3 px-4 flex items-center ${
              view === 'users' ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-teal-200'
            }`}
          >
            <span className="mr-2 text-lg">👥</span>
            View Users
          </button>
          <button
            onClick={() => setView('collectors')}
            className={`w-full text-left py-3 px-4 flex items-center ${
              view === 'collectors' ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-teal-200'
            }`}
          >
            <span className="mr-2 text-lg">🚚</span>
            View Collectors
          </button>
          <button
            onClick={() => setView('report')}
            className={`w-full text-left py-3 px-4 flex items-center ${
              view === 'report' ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-teal-200'
            }`}
          >
            <span className="mr-2 text-lg">📊</span>
            Collector Report
          </button>
        </nav>

        {/* Logo at the Bottom */}
        <div className="mt-auto p-4">
          <img
            src="./images.png" // Replace with your logo path
            alt="Logo"
            className="w-32 h-32 mx-auto"
          />
        </div>

        {/* Logout Button */}
        <button
          className="w-full text-left py-3 px-4 flex items-center text-red-500 hover:bg-red-100"
          onClick={handleLogout}
        >
          <span className="mr-2 text-lg">🚪</span>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {view === 'dashboard' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Welcome, {adminName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Dashboard cards */}
                  <div className="bg-white shadow-lg rounded-lg p-4 flex items-center">
                    <span className="text-teal-500 text-3xl mr-4">👥</span>
                    <div>
                      <p className="text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                  </div>
                  <div className="bg-white shadow-lg rounded-lg p-4 flex items-center">
                    <span className="text-teal-500 text-3xl mr-4">🚚</span>
                    <div>
                      <p className="text-gray-600">Total Collectors</p>
                      <p className="text-2xl font-bold">{collectors.length}</p>
                    </div>
                  </div>
                  <div className="bg-white shadow-lg rounded-lg p-4 flex items-center">
                    <span className="text-teal-500 text-3xl mr-4">📍</span>
                    <div>
                      <p className="text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold">
                        {requests.filter((request) => request.status === 'Pending').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-semibold mb-4">Pending Requests Map</h3>
                  <div className="h-96 w-full">
                    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {requests
                        .filter((request) => request.status === 'Pending') // Only show pending requests
                        .map((request) => {
                          const position = extractLatLng(request.address);
                          if (position) {
                            return (
                              <Marker key={request._id} position={[position.lat, position.lng]}>
                                <Popup>
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="max-w-xs"
                                  >
                                    <p>
                                      <strong>User:</strong> {request.user.name}
                                    </p>
                                    <p>
                                      <strong>Status:</strong> {request.status}
                                    </p>
                                    <button
                                      className="bg-blue-500 text-white px-2 py-1 rounded mt-2 hover:bg-blue-600"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setSelectedCollectorId('');
                                      }}
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
                </div>

                {/* Selected Request Details Modal */}
                {selectedRequest && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    style={{ zIndex: 1000 }}
                  >
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-2">Request Details</h3>
                      <p>
                        <strong>User:</strong> {selectedRequest.user.name}
                      </p>
                      <p>
                        <strong>Address:</strong> {selectedRequest.address}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedRequest.status}
                      </p>

                      <div className="mt-4">
                        <label htmlFor={`collector-select-${selectedRequest._id}`} className="block mb-2">
                          Assign Collector:
                        </label>
                        <select
                          id={`collector-select-${selectedRequest._id}`}
                          className="border rounded px-2 py-1 w-full"
                          value={selectedCollectorId}
                          onChange={(e) => setSelectedCollectorId(e.target.value)}
                        >
                          <option value="" disabled>
                            Select a collector
                          </option>
                          {Array.isArray(collectors) && collectors.length > 0 ? (
                            collectors.map((collector) => (
                              <option key={collector._id} value={collector._id}>
                                {collector.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No collectors available</option>
                          )}
                        </select>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                          onClick={handleAssignCollector}
                        >
                          Confirm Assignment
                        </button>
                        <button
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          onClick={() => {
                            setSelectedRequest(null);
                            setSelectedCollectorId('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === 'users' && (
              <>
                <h1 className="text-2xl font-semibold mb-6">View Users</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Name</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b">{user.name}</td>
                          <td className="py-2 px-4 border-b">{user.email}</td>
                          <td className="py-2 px-4 border-b">{user.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {view === 'collectors' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold">View Collectors</h1>
                  <button
                    className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                    onClick={() => setShowAddCollectorModal(true)}
                  >
                    Add Collector
                  </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Name</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectors.map((collector, index) => (
                        <tr key={collector._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b">{collector.name}</td>
                          <td className="py-2 px-4 border-b">{collector.email}</td>
                          <td className="py-2 px-4 border-b">{collector.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Collector Modal */}
                {showAddCollectorModal && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    style={{ zIndex: 1000 }}
                  >
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-4">Add New Collector</h3>
                      <div>
                        <label className="block mb-2">Name:</label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          value={newCollector.name}
                          onChange={(e) => setNewCollector({ ...newCollector, name: e.target.value })}
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block mb-2">Email:</label>
                        <input
                          type="email"
                          className="border rounded px-2 py-1 w-full"
                          value={newCollector.email}
                          onChange={(e) => setNewCollector({ ...newCollector, email: e.target.value })}
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block mb-2">Password:</label>
                        <input
                          type="password"
                          className="border rounded px-2 py-1 w-full"
                          value={newCollector.password}
                          onChange={(e) => setNewCollector({ ...newCollector, password: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end mt-6">
                        <button
                          className="bg-teal-500 text-white px-4 py-2 rounded mr-2 hover:bg-teal-600"
                          onClick={handleAddCollector}
                        >
                          Add Collector
                        </button>
                        <button
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          onClick={() => {
                            setShowAddCollectorModal(false);
                            setNewCollector({ name: '', email: '', password: '' });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === 'report' && (
              <>
                <h1 className="text-2xl font-semibold mb-6">Collector Report</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Request ID</th>
                        <th className="py-2 px-4 border-b text-left">User</th>
                        <th className="py-2 px-4 border-b text-left">Collector</th>
                        <th className="py-2 px-4 border-b text-left">Address</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request, index) => (
                        <tr key={request._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b">{request._id}</td>
                          <td className="py-2 px-4 border-b">{request.user.name}</td>
                          <td className="py-2 px-4 border-b">
                            {request.assignedCollector ? request.assignedCollector.name : 'Unassigned'}
                          </td>
                          <td className="py-2 px-4 border-b">{request.address}</td>
                          <td className="py-2 px-4 border-b">{request.status}</td>
                          <td className="py-2 px-4 border-b">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;