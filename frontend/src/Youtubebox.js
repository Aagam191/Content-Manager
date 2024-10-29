import React from 'react';
import youtubelogo from './images/Youtube1.jpg'; // Adjust the path as per your structure
import './Box.css';

const YoutubeBox = () => {
  const handleClick = () => {
    // Navigate to a different URL
    window.location.href = '/youtube'; // Change this to your URL or path
  };

  return (
    <div className="youtube-box" onClick={handleClick}>
      <img src={youtubelogo} alt="YOutube Logo" className='logo' />
    </div>
  );
};

export default YoutubeBox;
