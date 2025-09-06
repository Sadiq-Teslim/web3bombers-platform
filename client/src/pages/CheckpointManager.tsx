/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/CheckpointManagerPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

interface Checkpoint {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  points: number;
}

export const CheckpointManagerPage = () => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [points, setPoints] = useState('');

  const fetchCheckpoints = async () => {
    try {
      const response = await apiClient.get('/admin/checkpoints');
      setCheckpoints(response.data);
    } catch (err) {
      setError('Failed to load checkpoints.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/checkpoints', { title, description, deadline, points });
      // Reset form and refresh list
      setTitle('');
      setDescription('');
      setDeadline('');
      setPoints('');
      fetchCheckpoints();
    } catch (err) {
      setError('Failed to create checkpoint.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-10">
        <Link to="/admin/dashboard" className="text-blue-400 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mt-2">Checkpoint Manager</h1>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg self-start">
          <h2 className="text-2xl font-semibold mb-4">Create Checkpoint</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md" />
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-gray-400" />
            <input type="number" placeholder="Points" value={points} onChange={(e) => setPoints(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md" />
            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Create</button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Existing Checkpoints</h2>
          {isLoading ? <p>Loading...</p> : (
            <ul className="space-y-4">
              {checkpoints.map(cp => (
                <li key={cp.id} className="bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{cp.title}</h3>
                    <span className="font-mono text-blue-300 bg-blue-500/20 px-2 py-1 rounded-md">{cp.points} PTS</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{cp.description}</p>
                  <p className="text-xs text-amber-400 mt-2">Deadline: {new Date(cp.deadline).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};