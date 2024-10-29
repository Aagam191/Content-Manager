import React from 'react';
import instagramLogo from './images/instagram1.jpg'; // Adjust the path as per your structure
import './Box.css';

const InstagramBox = () => {
  const handleClick = () => {
    // Navigate to a different URL
    window.location.href = '/instagram'; // Change this to your URL or path
  };

  return (
    <div className="instagram-box" onClick={handleClick}>
      <img src={instagramLogo} alt="Instagram Logo" className='logo' />
    </div>
  );
};

export default InstagramBox;
