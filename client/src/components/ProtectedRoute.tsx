// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('authToken');

  // If there's a token, show the nested page (e.g., Dashboard)
  // If not, redirect them to the login page
  return token ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;