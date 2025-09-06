// src/pages/ParticipantDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ... (keep the Checkpoint interface)
interface Checkpoint {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  points: number;
}

// New component for a single checkpoint card
// In src/pages/ParticipantDashboard.tsx

const CheckpointCard = ({ checkpoint }: { checkpoint: Checkpoint }) => {
  // State for two separate files
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [socialProofFile, setSocialProofFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!certificateFile || !socialProofFile) {
      setMessage('Please select both a certificate and a social proof screenshot.');
      return;
    }
    setIsSubmitting(true);
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('certificateFile', certificateFile);
    formData.append('socialProofFile', socialProofFile);
    formData.append('checkpointId', checkpoint.id);

    try {
      await apiClient.post('/users/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Submitted successfully! Pending review.');
    } catch (error) {
      console.error('Submission failed', error);
      setMessage('❌ Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      {/* Header section remains the same */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-blue-300">{checkpoint.title}</h3>
          <p className="text-sm text-amber-400 mt-1">
            Deadline: {new Date(checkpoint.deadline).toLocaleString()}
          </p>
        </div>
        <span className="font-mono text-lg">{checkpoint.points} PTS</span>
      </div>
      <p className="text-gray-400 mt-4">{checkpoint.description}</p>
      
      {/* Updated submission section */}
      <div className="mt-6 border-t border-gray-700 pt-4 space-y-4">
        <h4 className="font-semibold">Submit Your Work</h4>
        
        {/* Certificate Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">1. Course Certificate Image</label>
          <input type="file" onChange={(e) => e.target.files && setCertificateFile(e.target.files[0])} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
        </div>

        {/* Social Proof Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">2. Social Media Post Screenshot</label>
          <input type="file" onChange={(e) => e.target.files && setSocialProofFile(e.target.files[0])} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!certificateFile || !socialProofFile || isSubmitting}
          className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Both Files'}
        </button>
        
        {message && <p className="text-sm mt-2 text-center">{message}</p>}
      </div>
    </div>
  );
};

// The main dashboard component
export const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ... (useEffect and handleLogout functions remain the same)
  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        const response = await apiClient.get('/users/checkpoints');
        setCheckpoints(response.data);
      } catch (error) {
        console.error('Failed to fetch checkpoints', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCheckpoints();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Your Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 font-semibold bg-red-600 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </header>
      <main>
        <h2 className="text-2xl font-semibold mb-4">Active Checkpoints</h2>
        {isLoading ? <p>Loading...</p> : checkpoints.length > 0 ? (
          <div className="space-y-6">
            {checkpoints.map((cp) => (
              <CheckpointCard key={cp.id} checkpoint={cp} />
            ))}
          </div>
        ) : <p className="text-gray-400">No active checkpoints right now. Stay tuned!</p>}
      </main>
    </div>
  );
};