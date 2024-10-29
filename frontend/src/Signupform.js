// SignUpForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signupform() {
  const [channelName, setChannelName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      channelName,  // Only the YouTube channel name
    };

    // Send data to backend (optional)
    fetch('/api/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Navigate to the dashboard page with the channel name as a URL parameter
      navigate(`/dashboard/${channelName}`);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="YouTube Channel Name"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default Signupform;
