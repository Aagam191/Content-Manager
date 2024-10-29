import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Assuming you're still using the same CSS file
import { Link } from 'react-router-dom';
// import Carousel from './Carousel';
const Dashboard = ({ pageTitle, page }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [creatorName, setCreatorName] = useState('Creator');
  const [profilePic, setProfilePic] = useState('default-profile-pic.png');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [newCreatorName, setNewCreatorName] = useState(''); // State for the new name to be updated

  // Fetch profile data from Django backend
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/get-profile/');
      setCreatorName(response.data.name);
      setProfilePic(response.data.profile_pic ? `http://localhost:8000${response.data.profile_pic}` : 'default-profile-pic.png');
    } catch (error) {
      console.error('There was an error fetching the profile data!', error);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setNewCreatorName(creatorName); // Initialize newCreatorName with the current creatorName when starting to edit
    }
  };

  const handleNameChange = (e) => {
    setNewCreatorName(e.target.value);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePicFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData();
    formData.append('name', newCreatorName); // Use newCreatorName for submission
    if (profilePicFile) {
      formData.append('profile_pic', profilePicFile);
    }

    try {
      await axios.post('http://localhost:8000/update-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile updated successfully');
      fetchProfile(); // Refresh the profile data to reflect changes
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Define SubscriberCount component to fetch subscriber count using channel ID
  const SubscriberCount = ({ creatorName }) => {
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (creatorName) {
        fetchSubscriberCount(creatorName);
      }
    }, [creatorName]);

    const fetchSubscriberCount = async (creatorName) => {
      try {
        const response = await axios.get(`http://localhost:8000/api/youtube/subscribers/${creatorName}/`);
        if (response.data && response.data.subscriber_count) {
          setSubscriberCount(response.data.subscriber_count);
        } else {
          setError("Subscribers not found.");
        }
      } catch (error) {
        // setError("Error fetching subscriber count: " + error.message);
      }
    };

    return (
      <div className="subscriber-count-section">
        <div className="subscriber-count-box">
          <h3>Subscribers</h3>
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <p className="subscriber-count">{subscriberCount.toLocaleString()}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="layout">
      <aside className="sidebar">
      <Link to='/' style={{textDecoration:"none"}}><div style={{color:"white"}}  className="sidebar-title" > CONTENTFLOW</div></Link> 
        <ul className="nav-links">
          <li><a href="/youtube">YOUTUBE</a></li>
          <li><a href="/metrics">METRICS</a></li>
          <li><a href="/chat">CREATE</a></li>
          <li><a href="/grow">GROW</a></li>
        </ul>
      </aside>

      <main className="content">
        {/* <header className="top-navbar">
          <h1 className="page-title">{pageTitle}</h1>
          <div className="profile-section">
            <img
              src={profilePic}
              alt="Profile"
              className="profile-pic"
            />
           {isEditing ? (
  <form
    onSubmit={handleSave}
    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
  >
    <input
      type="text"
      value={newCreatorName}
      onChange={handleNameChange}
      style={{ width: '150px' }} // Adjust the width of the text box
    />
    <label
      htmlFor="profile-pic-input"
      style={{ marginRight: '10px' }} // Small margin for spacing
    >
      Choose File
    </label>
    <input
      type="file"
      id="profile-pic-input"
      onChange={handleProfilePicChange}
      accept="image/*"
    />
    <button type="submit" style={{ padding: '5px 10px' }}>Save</button>
  </form>
) : (
  <>
    <span>Hello, {creatorName}</span>
    <button onClick={toggleEditMode} className="edit-icon">Edit</button>
  </>
)}

          </div>
        </header> */}

        <div className="page-content">
          <div className='final-content'>
          {/* <h1 className="page-title">{pageTitle}</h1> */}
          <div className="profile-section">
            <img
              src={profilePic}
              alt="Profile"
              className="profile-pic"
            />
           {isEditing ? (
  <form
    onSubmit={handleSave}
    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
  >
    <input
      type="text"
      value={newCreatorName}
      onChange={handleNameChange}
      style={{ width: '150px' }} // Adjust the width of the text box
    />
    <label
      htmlFor="profile-pic-input"
      style={{ marginRight: '10px' }} // Small margin for spacing
    >
      Choose File
    </label>
    <input
      type="file"
      id="profile-pic-input"
      onChange={handleProfilePicChange}
      accept="image/*"
    />
    <button type="submit" style={{ padding: '5px 10px' }}>Save</button>
  </form>
) : (
  <>
    <span style={{color:"white"}}>Hello, {creatorName}</span>
    <button onClick={toggleEditMode} className="edit-icon" >Edit</button>
  </>
)}

          </div>
          {page}
          {/* <Carousel/> */}
          {/* {pageTitle === 'Dashboard' && <SubscriberCount creatorName={creatorName} />}  */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
