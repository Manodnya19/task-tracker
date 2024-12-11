import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from './Firebase'; // Correct import
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './login-style.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate to redirect

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setError('Please fill out both fields.');
    } else {
      try {
        setError('');
        await signInWithEmailAndPassword(auth, username, password); // Authentication
        console.log('Logged in:', { username, password });
        navigate('/tasktracker'); // Redirect to task tracker page
      } catch (error) {
        setError('Login failed. Please check your credentials.');
        console.error(error.message);
      }
    }
  };

  const handleLogout = () => {
    auth.signOut(); // Log the user out
    navigate('/'); // Redirect to the home or login page
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider); // Sign in with Google
      console.log('Logged in with Google');
      navigate('/tasktracker'); // Redirect to task tracker page
    } catch (error) {
      setError('Google login failed.');
      console.error(error.message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="heading">Task Tracker</h1>
      <div className="login-page">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Login</button>
        </form>

        {/* Google Login Button */}
        <button className="google-login-button" onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
      </div>
    </div>
  );
};

export default Login;
