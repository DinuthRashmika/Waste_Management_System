import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewCollectors = () => {
  const [collectors, setCollectors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get('http://localhost:4000/api/admin/collectors', config);
        setCollectors(response.data.collectors);
      } catch (error) {
        setError('Error fetching collectors: ' + (error.response?.data?.message || error.message));
      }
    };

    fetchCollectors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-light mb-8">View Collectors</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : collectors.length === 0 ? (
        <p className="text-center text-black font-bold">No Collectors Found</p>
      ) : (
        <ul className="w-full max-w-md space-y-4">
          {collectors.map((collector) => (
            <li key={collector._id} className="bg-white p-4 rounded shadow-md">
              <p><strong>Name:</strong> {collector.name}</p>
              <p><strong>Email:</strong> {collector.email}</p>
              <p><strong>Addresses:</strong> {collector.addresses.join(', ') || 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewCollectors;