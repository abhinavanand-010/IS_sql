import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [newPoll, setNewPoll] = useState({ question: '', options: '', createdBy: '' });
    const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false });

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddPoll = async (e) => {
        e.preventDefault();
        const admin = JSON.parse(localStorage.getItem('admin'));
        try {
            const optionsArray = newPoll.options.split(',').map((opt) => opt.trim());
            const response = await axios.post('http://localhost:5000/api/admin/polls', {
                question: newPoll.question,
                options: optionsArray,
                createdBy: admin.id,
            });
            if (response.data.success) {
                alert(response.data.message);
                setNewPoll({ question: '', options: '', createdBy: '' }); // Clear form
            }
        } catch (error) {
            console.error('Error adding poll:', error);
            alert('Failed to add poll');
        }
    };


    const handleAddUser = async (e) => {
      e.preventDefault();
      try {
          const response = await axios.post('http://localhost:5000/api/admin/users', newUser);
          if (response.data.success) {
              alert(response.data.message);
              setNewUser({ username: '', password: '', isAdmin: false }); // Clear the form
              fetchUsers(); // Refresh the users list
          }
      } catch (error) {
          console.error('Error adding user:', error);
          alert('Failed to add user');
      }
  };


    const fetchPolls = async () => {
      try {
          const response = await axios.get('http://localhost:5000/api/admin/polls'); // Add endpoint to fetch polls
          setPolls(response.data);
      } catch (error) {
          console.error('Error fetching polls:', error);
      }
  };

  const handleSeeVotes = async (pollId) => {
      try {
          const response = await axios.get(`http://localhost:5000/api/admin/polls/${pollId}/votes`);
          setVotes(response.data);
          setSelectedPoll(pollId);
      } catch (error) {
          console.error('Error fetching votes:', error);
      }
  };


    const handleLogout = () => {
        localStorage.removeItem('admin');
        navigate('/admin');
    };

    useEffect(() => {
        const admin = localStorage.getItem('admin');
        if (!admin) {
            navigate('/admin');
        } else {
            fetchUsers();
        }
    }, [navigate]);

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
            <h1>Admin Dashboard</h1>

            {/* Add Poll Form */}
            <form onSubmit={handleAddPoll}>
                <h2>Add New Poll</h2>
                <input
                    type="text"
                    placeholder="Poll Question"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Poll Options (comma-separated)"
                    value={newPoll.options}
                    onChange={(e) => setNewPoll({ ...newPoll, options: e.target.value })}
                    required
                />
                <button type="submit">Add Poll</button>
            </form>

            {/* User Management Section */}
            <h2>Manage Users</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Is Admin</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.is_admin ? 'Yes' : 'No'}</td>
                            <td>
                                <button onClick={() => alert('Feature to delete users goes here')}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminDashboard;
