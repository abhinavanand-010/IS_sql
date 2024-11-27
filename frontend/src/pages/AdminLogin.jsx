import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', { username, password });
            if (response.data.success) {
                localStorage.setItem('admin', JSON.stringify(response.data.admin));
                navigate('/admin/dashboard');
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to login');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h1>Admin Login</h1>
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
    );
}

export default AdminLogin;
