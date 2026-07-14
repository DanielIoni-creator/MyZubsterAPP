// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { fetchCsrfToken } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    let userRole = user.role || 'user';
    try {
      const decoded = jwtDecode(token);
      if (decoded.role) {
        userRole = decoded.role;
      }
    } catch (e) {
      console.error('Token non valido');
    }

    if (requireAdmin && userRole !== 'admin') {
      setIsAdmin(false);
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    fetchCsrfToken()
      .then(() => {
        setIsAuthenticated(true);
        if (requireAdmin) {
          setIsAdmin(userRole === 'admin');
        }
        setIsLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login');
      });
  }, [navigate, requireAdmin]);

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
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