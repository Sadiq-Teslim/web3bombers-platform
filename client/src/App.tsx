// client/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin Pages
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CohortDetailsPage } from "./pages/CohortDetailsPage";
import { CheckpointManagerPage } from "./pages/CheckpointManager";
import { SubmissionReviewPage } from "./pages/SubmissionReviewPage";

// Participant Pages
import { ParticipantLogin } from "./pages/ParticipantLogin"; // <-- Import
import { ParticipantDashboard } from "./pages/Participantdashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<ParticipantLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Participant Dashboard */}
          <Route path="/dashboard" element={<ParticipantDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/cohorts/:cohortId"
            element={<CohortDetailsPage />}
          />
          <Route
            path="/admin/checkpoints"
            element={<CheckpointManagerPage />}
          />
          <Route path="/admin/review" element={<SubmissionReviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
