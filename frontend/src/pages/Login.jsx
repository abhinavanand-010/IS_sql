import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/polls'); // Redirect to polls page
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert('Admins must log in through the Admin Login page!');
        } else {
            alert('Invalid credentials');
        }
    }
};


  const handleAdminRedirect = () => {
    navigate('/admin'); // Redirect to admin login page
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h1>User Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleAdminRedirect}>Admin Login</button> {/* Admin Login Button */}
    </div>
  );
}

export default Login;
