import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PollList from './pages/PollList';
import PollDetails from './pages/PollDetails';
import ProtectedRoute from './ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import './styles.css';


function App() {
  return (
    <div>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/" element={<Login />} />
        <Route
          path="/polls"
          element={
            <ProtectedRoute>
              <PollList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/polls/:pollId"
          element={
            <ProtectedRoute>
              <PollDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
