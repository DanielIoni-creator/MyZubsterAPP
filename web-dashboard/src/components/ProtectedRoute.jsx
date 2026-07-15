// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { fetchCsrfToken } from '../services/api';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Legge il token e lo usa come dipendenza per reagire ai cambiamenti
  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    let userRole = 'user';
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role || 'user';
    } catch (e) {
      console.warn('Token non decodificabile:', e);
      userRole = user.role || 'user';
    }

    if (requireAdmin && userRole !== 'admin') {
      setIsAuthenticated(true);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    fetchCsrfToken()
      .then(() => {
        setIsAuthenticated(true);
        setIsAdmin(userRole === 'admin');
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, [token, requireAdmin]); // 👈 Aggiunto token come dipendenza

  if (loading) {
    return <div className="spinner-container"><div className="spinner" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;