import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PollDetails() {
  const { pollId } = useParams(); // Get pollId from the URL
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null); // State to store poll details
  const [loading, setLoading] = useState(true); // Loading state
  const [results, setResults] = useState([]); // State to store results
  const [comments, setComments] = useState([]); // State to store comments
  const [newComment, setNewComment] = useState(''); // State for new comment

  // Logout Functionality
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    navigate('/'); // Redirect to login page
  };

  // Fetch poll details, results, and comments
  useEffect(() => {
    const fetchPollDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/polls/${pollId}`);
        setPoll(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching poll details:', error);
        setLoading(false);
      }
    };

    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/polls/${pollId}/results`);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comments/${pollId}`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchPollDetails();
    fetchResults();
    fetchComments();
  }, [pollId]);

  // Handle voting
  const handleVote = async (option) => {
    const user = JSON.parse(localStorage.getItem('user')); // Get logged-in user
    try {
      const response = await axios.post('http://localhost:5000/api/polls/vote', {
        pollId,
        optionChosen: option,
        votedBy: user.id,
      });
      if (response.data.success) {
        alert('Vote recorded!');
        fetchResults(); // Refresh results after voting
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('You have already voted on this poll!');
      } else {
        console.error('Error voting:', error);
        alert('Failed to record vote');
      }
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    const user = JSON.parse(localStorage.getItem('user')); // Get logged-in user
    try {
      const response = await axios.post('http://localhost:5000/api/comments', {
        pollId,
        comment: newComment,
        commentedBy: user.id,
      });
      if (response.data.success) {
        setComments([...comments, { comment: newComment, commentedBy: user.id }]); // Update comments list
        setNewComment(''); // Clear input
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!poll) return <div>Poll not found!</div>;

  return (
    <div>
      <button onClick={handleLogout}>Logout</button> {/* Logout Button */}
      <h1>{poll.question}</h1>
      <ul>
        {poll.options.map((option, index) => (
          <li key={index}>
            {option} <button onClick={() => handleVote(option)}>Vote</button>
          </li>
        ))}
      </ul>

      <h2>Results</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            {result.option_chosen}: {result.votes} votes
          </li>
        ))}
      </ul>

      <h2>Comments</h2>
      <ul>
        {comments.map((comment, index) => (
          <li key={index}>{comment.comment}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Add a comment"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <button onClick={handleAddComment}>Submit</button>
    </div>
  );
}

export default PollDetails;
