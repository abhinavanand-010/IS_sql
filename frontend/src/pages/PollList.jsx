import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PollList() {
  const [polls, setPolls] = useState([]);



  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    navigate('/'); // Redirect to login page
  };



  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/polls');
        setPolls(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPolls();
  }, []);

  return (
    <div>
      <h1>Polls</h1>
      <button onClick={handleLogout}>Logout</button>
      <ul>
        {polls.map((poll) => (
          <li key={poll.id}>
            <Link to={`/polls/${poll.id}`}>{poll.question}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PollList;

