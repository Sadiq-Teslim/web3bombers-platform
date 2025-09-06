// src/pages/CohortDetailsPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../api/apiClient";

// Define types for our data
interface User {
  id: string;
  matricNumber: string;
  username: string;
  status: string;
  points: number;
}

interface CohortDetails {
  id: string;
  cohortNumber: number;
  name: string | null;
  users: User[];
}

export const CohortDetailsPage = () => {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [cohort, setCohort] = useState<CohortDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for the new user form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchCohortDetails = async () => {
    if (!cohortId) return;
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/admin/cohorts/${cohortId}`);
      setCohort(response.data);
    } catch (err) {
      setError("Failed to load cohort details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortDetails();
  }, [cohortId]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!cohortId) return;

    try {
      await apiClient.post(`/admin/cohorts/${cohortId}/users`, {
        users: [{ username: newUsername, password: newPassword }],
      });
      // Clear form and refresh the list
      setNewUsername("");
      setNewPassword("");
      fetchCohortDetails();
    } catch (err) {
      setError("Failed to add user. Username might already exist.");
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8 text-white">Loading...</div>;
  if (error && !cohort) return <div className="p-8 text-red-500">{error}</div>;
  if (!cohort) return <div className="p-8 text-white">Cohort not found.</div>;

  const rankedUsers = [...cohort.users].sort((a, b) => b.points - a.points);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-10">
        <Link to="/admin/dashboard" className="text-blue-400 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mt-2">
          Cohort {cohort.cohortNumber}
          {cohort.name && (
            <span className="text-2xl text-gray-400 ml-3">({cohort.name})</span>
          )}
        </h1>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Participant List */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Participants ({cohort.users.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-600">
                <tr>
                  <th className="text-left py-2 px-3">Rank</th>
                  <th className="text-left py-2 px-3">Matric No.</th>
                  <th className="text-left py-2 px-3">Username</th>
                  <th className="text-left py-2 px-3">Points</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankedUsers.length > 0 ? (
                  rankedUsers.map(
                    (
                      user,
                      index // Use the sorted array
                    ) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-700 hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-3 font-bold">{index + 1}</td>{" "}
                        {/* Display Rank */}
                        <td className="py-3 px-3 font-mono">
                          {user.matricNumber}
                        </td>
                        <td className="py-3 px-3">{user.username}</td>
                        <td className="py-3 px-3 font-bold text-blue-300">
                          {user.points}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {/* Action buttons (e.g., warn, suspend) will go here */}
                          <button className="text-gray-400 hover:text-white text-sm">
                            ...
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No participants added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Add Participant Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg self-start">
          <h2 className="text-2xl font-semibold mb-4">Add Participant</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Initial Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add User
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
