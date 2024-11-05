import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null during loading
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    setIsAuthenticated(!!token); // Set true if token exists, false otherwise
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      // Redirect to login if not authenticated
      navigate('/');
    }
    console.log(isAuthenticated)
  }, [isAuthenticated, navigate]);

  // if (isAuthenticated === null) {
  //   return null; // Show loader during authentication check
  // }

  // Render Outlet if authenticated
  return children;
};

export default PrivateRoute;
