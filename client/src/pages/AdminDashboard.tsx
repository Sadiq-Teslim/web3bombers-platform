// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/apiClient";

// Define a type for our cohort data for type safety
interface Cohort {
  id: string;
  cohortNumber: number;
  name: string | null;
  _count: {
    users: number;
  };
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for the new cohort form
  const [newCohortNumber, setNewCohortNumber] = useState("");
  const [newCohortName, setNewCohortName] = useState("");
  const [error, setError] = useState("");

  // Function to fetch cohorts from the API
  const fetchCohorts = async () => {
    try {
      const response = await apiClient.get("/admin/cohorts");
      setCohorts(response.data);
    } catch (error) {
      console.error("Failed to fetch cohorts", error);
      setError("Could not load cohort data.");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect runs once when the component mounts
  useEffect(() => {
    fetchCohorts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/admin/login");
  };

  // Function to handle the creation of a new cohort
  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/admin/cohorts", {
        cohortNumber: parseInt(newCohortNumber),
        name: newCohortName || null,
      });
      // Reset form and refresh the cohort list
      setNewCohortNumber("");
      setNewCohortName("");
      fetchCohorts();
    } catch (err) {
      console.error("Failed to create cohort", err);
      setError("Failed to create cohort. Please check the number.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 font-semibold bg-red-600 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <main className="space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Manage System</h2>
          <div className="flex gap-4">
            <Link
              to="/admin/checkpoints"
              className="inline-block px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Manage Checkpoints
            </Link>
            <Link
              to="/admin/review"
              className="inline-block px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700"
            >
              Review Submissions &rarr;
            </Link>
          </div>
        </div>

        {/* The rest of your dashboard content (Create Cohort, Manage Cohorts) */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 1: Create New Cohort */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg self-start">
              <h2 className="text-2xl font-semibold mb-4">Create New Cohort</h2>
              <form onSubmit={handleCreateCohort} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Cohort Number (e.g., 1, 2)
                  </label>
                  <input
                    type="number"
                    value={newCohortNumber}
                    onChange={(e) => setNewCohortNumber(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Cohort Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCohortName}
                    onChange={(e) => setNewCohortName(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Cohort
                </button>
              </form>
            </div>

            {/* Section 2: Manage Cohorts */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Manage Cohorts</h2>
              {isLoading ? (
                <p>Loading cohorts...</p>
              ) : cohorts.length === 0 ? (
                <p className="text-gray-400">No cohorts created yet.</p>
              ) : (
                <ul className="space-y-3">
                  {cohorts.map((cohort) => (
                    <Link to={`/admin/cohorts/${cohort.id}`} key={cohort.id}>
                      <li
                        key={cohort.id}
                        className="flex justify-between items-center bg-gray-700 p-3 rounded-md"
                      >
                        <div>
                          <span className="font-bold text-lg">
                            Cohort {cohort.cohortNumber}
                          </span>
                          {cohort.name && (
                            <span className="text-gray-400 ml-2">
                              ({cohort.name})
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          {cohort._count.users} Members
                        </span>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
          </main>
        </div>
      </main>
    </div>
  );
};
