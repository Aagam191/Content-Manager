import React from 'react';
import Discordlogo from './images/Discord1.jpg'; // Adjust the path as per your structure
import './Box.css';

const DiscordBox = () => {
  const handleClick = () => {
    // Navigate to a different URL
    window.location.href = '/discord'; // Change this to your URL or path
  };

  return (
    <div className="discord-box" onClick={handleClick}>
      <img src={Discordlogo} alt="Discord Logo" className='logo' />
    </div>
  );
};

export default DiscordBox;
