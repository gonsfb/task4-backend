import React from 'react';
import UserManagementPage from './pages/UserManagementPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar'; // Ensure this path is correct
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute if you have created it

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<h1>Welcome to the User Management App</h1>} />
        <Route 
          path="/users"
          element={
            <PrivateRoute>
              <UserManagementPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

