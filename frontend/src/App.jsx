import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import Profile from './pages/shared/Profile';
import AllOwners from './pages/consumer/AllOwners'; // New Import

// Route Protection Logic
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required (like 'owner' or 'consumer') and doesn't match
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Owner Routes */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute allowedRole="owner">
            <OwnerDashboard />
          </ProtectedRoute>
        } />

        {/* Protected Consumer Routes */}
        <Route path="/consumer/dashboard" element={
          <ProtectedRoute allowedRole="consumer">
            <ConsumerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/consumer/owners" element={
          <ProtectedRoute allowedRole="consumer">
            <AllOwners />
          </ProtectedRoute>
        } />

        {/* Shared Protected Route (Accessible by both) */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;