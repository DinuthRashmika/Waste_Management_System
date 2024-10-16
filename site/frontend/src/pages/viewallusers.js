import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewUsers = () => {
    const [users, setUsers] = useState([]); // Store fetched users
    const [searchTerm, setSearchTerm] = useState(''); // Store search term
    const [filteredUsers, setFilteredUsers] = useState([]); // Store filtered users
    const [error, setError] = useState(''); // Store error message

    const navigate = useNavigate(); // Initialize navigate for redirection

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`, // Ensure token for admin is passed
                    },
                };
                const response = await axios.get('http://localhost:4000/api/admin/users', config);
                setUsers(response.data.users); // Set users from response
                setFilteredUsers(response.data.users); // Initially, display all users
            } catch (error) {
                setError('Error fetching users.');
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Handle search functionality
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredUsers(users); // Reset to all users when search term is empty
        } else {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered); // Filter users based on search term
        }
    }, [searchTerm, users]);

    // Handle user click and navigate to user details
    const handleUserClick = (userId) => {
        navigate(`/users/${userId}`); // Navigate to the user details page with the user ID
    };

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-light mb-8">View Users</h1>

            {/* Search bar */}
            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 p-2 border rounded w-full max-w-md"
            />

            {/* Users table */}
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
                {filteredUsers.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left text-gray-500">Name</th>
                                <th className="text-left text-gray-500">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr
                                    key={user._id}
                                    className="cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleUserClick(user._id)} // Navigate on user click
                                >
                                    <td className="py-2">{user.name}</td>
                                    <td className="py-2">{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No users found.</p>
                )}
            </div>
        </div>
    );
};

export default ViewUsers;