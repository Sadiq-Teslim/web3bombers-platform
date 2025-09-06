// src/pages/SubmissionReviewPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

interface Submission {
  id: string;
  fileUrl: string;
  socialProofUrl: string | null;
  user: {
    username: string;
    matricNumber: string;
  };
  checkpoint: {
    title: string;
    points: number;
  };
}

export const SubmissionReviewPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const response = await apiClient.get('/admin/submissions/pending');
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.patch(`/admin/submissions/${submissionId}/review`, { status });
      // Remove the reviewed submission from the list instantly for a better UX
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
    } catch (error) {
      console.error(`Failed to ${status} submission`, error);
      alert(`Could not ${status} submission.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-10">
        <Link to="/admin/dashboard" className="text-blue-400 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mt-2">Review Submissions</h1>
      </header>
      
      <main>
        {isLoading ? <p>Loading submissions...</p> : submissions.length === 0 ? (
          <p className="text-gray-400 text-center text-lg">No pending submissions. All caught up!</p>
        ) : (
          <div className="space-y-6">
            {submissions.map(sub => (
              <div key={sub.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{sub.checkpoint.title}</h2>
                    <p className="text-gray-400">
                      Submitted by: {sub.user.username} ({sub.user.matricNumber})
                    </p>
                  </div>
                  <span className="font-mono text-lg text-blue-300">{sub.checkpoint.points} PTS</span>
                </div>
                <div className="mt-4 flex gap-4 flex-wrap">
                  <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 text-sm">View Certificate</a>
                  {sub.socialProofUrl && <a href={sub.socialProofUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 text-sm">View Social Proof</a>}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end gap-3">
                  <button onClick={() => handleReview(sub.id, 'rejected')} className="px-4 py-2 font-bold text-white bg-amber-600 rounded-md hover:bg-amber-700">Reject</button>
                  <button onClick={() => handleReview(sub.id, 'approved')} className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">Approve</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};