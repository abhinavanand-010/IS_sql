const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'voting',
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Routes and Endpoints

// User Authentication
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Check for non-admin users only
  //  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}' AND is_admin = FALSE`;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Login failed' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials or admin accounts cannot log in here' });
        }
        res.json({ success: true, user: results[0] });
    });
});


app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json({ success: true, message: 'User registered successfully!' });
    });
});

// Polls
app.post('/api/polls', (req, res) => {
    const { question, options, createdBy } = req.body;
    const query = `INSERT INTO polls (question, options, created_by) VALUES ('${question}', '${JSON.stringify(options)}', ${createdBy})`;
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json({ success: true, message: 'Poll created successfully!' });
    });
});

app.get('/api/polls', (req, res) => {
    const query = 'SELECT * FROM polls';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// app.post('/api/polls/vote', (req, res) => {
//     const { pollId, optionChosen, votedBy } = req.body;
//     const query = `INSERT INTO votes (poll_id, option_chosen, voted_by) VALUES (${pollId}, '${optionChosen}', ${votedBy})`;
//     db.query(query, (err, results) => {
//         if (err) throw err;
//         res.json({ success: true, message: 'Vote recorded successfully!' });
//     });
// });


app.post('/api/polls/vote', (req, res) => {
    const { pollId, optionChosen, votedBy } = req.body;

    // Check if the user has already voted
    const checkQuery = `SELECT * FROM votes WHERE poll_id = ${pollId} AND voted_by = ${votedBy}`;
    db.query(checkQuery, (checkErr, checkResults) => {
        if (checkErr) {
            console.error(checkErr);
            return res.status(500).json({ error: 'Failed to check existing vote' });
        }
        
        if (checkResults.length > 0) {
            return res.status(400).json({ error: 'User has already voted on this poll' });
        }

        // If not voted, insert the vote
        const insertQuery = `INSERT INTO votes (poll_id, option_chosen, voted_by) VALUES (${pollId}, '${optionChosen}', ${votedBy})`;
        db.query(insertQuery, (insertErr, insertResults) => {
            if (insertErr) {
                console.error(insertErr);
                return res.status(500).json({ error: 'Failed to record vote' });
            }
            res.json({ success: true, message: 'Vote recorded successfully!' });
        });
    });
});


// // Comments
app.post('/api/comments', (req, res) => {
    const { pollId, comment, commentedBy } = req.body;
    const query = `INSERT INTO comments (poll_id, comment, commented_by) VALUES (${pollId}, '${comment}', ${commentedBy})`; // Vulnerable to XSS
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json({ success: true, message: 'Comment added successfully!' });
    });
});

app.get('/api/comments/:pollId', (req, res) => {
    const { pollId } = req.params;
    const query = `SELECT * FROM comments WHERE poll_id = ${pollId}`;
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


app.get('/api/polls/:pollId', (req, res) => {
  const { pollId } = req.params;
  const query = `SELECT * FROM polls WHERE id = ${pollId}`;
  
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to fetch poll details' });
      } else if (results.length === 0) {
          res.status(404).json({ error: 'Poll not found' });
      } else {
          res.json(results[0]);
      }
  });
});
////////////////////////////////////////////////////////////////////


//////////////////////


app.get('/api/polls/:pollId/results', (req, res) => {
  const { pollId } = req.params;
  const query = `
      SELECT option_chosen, COUNT(*) as votes 
      FROM votes 
      WHERE poll_id = ${pollId} 
      GROUP BY option_chosen
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to fetch results' });
      } else {
          res.json(results);
      }
  });
});



app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}' AND is_admin = TRUE`;

  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to login' });
      }
      if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials or not an admin' });
      }
      res.json({ success: true, admin: results[0] });
  });
});


// Get all users
app.get('/api/admin/users', (req, res) => {
  const query = `SELECT id, username, is_admin FROM users WHERE is_admin = FALSE`; // Exclude admins
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(results);
  });
});


// Delete a user
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM users WHERE id = ${id}`;
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete user' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
  });
});

app.post('/api/admin/users', (req, res) => {
  const { username, password, isAdmin } = req.body;

  // Validation
  if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
  }

  const isAdminFlag = isAdmin ? 1 : 0; // Ensure it's a boolean value for SQL

  const query = `INSERT INTO users (username, password, is_admin) VALUES ('${username}', '${password}', ${isAdminFlag})`;
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to add user' });
      }
      res.json({ success: true, message: 'User added successfully!' });
  });
});


app.post('/api/admin/polls', (req, res) => {
  const { question, options, createdBy } = req.body;

  // Validation
  if (!question || !options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: 'Invalid poll data' });
  }

  const query = `INSERT INTO polls (question, options, created_by) VALUES ('${question}', '${JSON.stringify(options)}', ${createdBy})`;

  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to add poll' });
      }
      res.json({ success: true, message: 'Poll added successfully!' });
  });
});

app.delete('/api/admin/polls/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM polls WHERE id = ${id}`;
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete poll' });
      }
      if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Poll not found' });
      }
      res.json({ success: true, message: 'Poll deleted successfully!' });
  });
});

app.get('/api/admin/polls/:pollId/votes', (req, res) => {
  const { pollId } = req.params;
  const query = `
      SELECT option_chosen, COUNT(*) AS votes
      FROM votes
      WHERE poll_id = ${pollId}
      GROUP BY option_chosen
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to fetch votes' });
      }
      res.json(results);
  });
});


app.get('/api/admin/polls', (req, res) => {
  const query = `SELECT id, question FROM polls`;
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to fetch polls' });
      }
      res.json(results);
  });
});


// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));
