import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Import jwt-decode

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null during loading
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode the token
        const currentTime = Date.now() / 1000; // Current time in seconds

        if (decodedToken.exp < currentTime) {
          // Token is expired
          setIsAuthenticated(false);
          localStorage.removeItem('token'); // Optionally remove expired token from localStorage
          navigate('/'); // Redirect to login
        } else {
          // Token is valid
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Handle invalid token (e.g., if the token is malformed)
        setIsAuthenticated(false);
        navigate('/'); // Redirect to login
      }
    } else {
      // No token found, redirect to login
      setIsAuthenticated(false);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated === false) {
      // Redirect to login if not authenticated
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return null; // Show loader during authentication check
  }

  // Render children if authenticated
  return children;
};

export default PrivateRoute;
