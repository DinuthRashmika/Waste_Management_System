import React, { useState } from 'react';
import axios from 'axios';

const GarbageForm = () => {
    const [userId, setUserId] = useState('');
    const [garbageWeight, setGarbageWeight] = useState('');
    const [recycleWeight, setRecycleWeight] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId || !garbageWeight || !recycleWeight) {
            setError('Please enter user ID, garbage weight, and recyclable weight.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Refund calculation: 319 per unit of recyclable garbage happens in backend
            const response = await axios.put('http://localhost:4000/api/update-address', {
                userId,
                garbageWeight,
                recycleWeight,
            });

            setSuccess('Garbage and recycling data submitted successfully!');
            setLoading(false);
        } catch (error) {
            setError('Failed to submit the data. Please try again.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">Submit Garbage and Recycling Data</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">User ID</label>
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter user ID"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Total Garbage Weight (kg)</label>
                <input
                    type="number"
                    value={garbageWeight}
                    onChange={(e) => setGarbageWeight(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter total garbage weight"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Recyclable Garbage Weight (kg)</label>
                <input
                    type="number"
                    value={recycleWeight}
                    onChange={(e) => setRecycleWeight(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter recyclable garbage weight"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
            >
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};

export default GarbageForm;