import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // If there's no token, redirect to the login page
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

