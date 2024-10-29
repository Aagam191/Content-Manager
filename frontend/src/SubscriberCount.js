import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriberCount = () => {
  const [creatorName, setCreatorName] = useState(''); // State for creatorName
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [channelId, setChannelId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (creatorName) {
      fetchChannelId(creatorName);
    }
  }, [creatorName]);

  useEffect(() => {
    if (channelId) {
      fetchSubscriberCount(channelId);
    }
  }, [channelId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/get-profile/');
      setCreatorName(response.data.name); // Update state with fetched creatorName
    } catch (error) {
      console.error('There was an error fetching the profile data!', error);
      setError('Error fetching profile data');
    }
  };

  const fetchChannelId = async (creatorName) => {
    const apiKey = 'AIzaSyBbBaF1vrvhv7ipwBQ1FiPAa_oNfxrtnxw';

    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${creatorName}&key=${apiKey}`);
      if (response.data.items.length > 0) {
        const fetchedChannelId = response.data.items[0].id;
        setChannelId(fetchedChannelId);
      } else {
        setError("Channel not found.");
      }
    } catch (error) {
      setError("Error fetching channel ID: " + error.message);
    }
  };

  const fetchSubscriberCount = async (channelId) => {
    const apiKey = 'AIzaSyBbBaF1vrvhv7ipwBQ1FiPAa_oNfxrtnxw';

    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`);
      if (response.data.items.length > 0) {
        const channelData = response.data.items[0];
        setSubscriberCount(channelData.statistics.subscriberCount);
      } else {
        setError("Channel not found.");
      }
    } catch (error) {
      setError("Error fetching subscriber count: " + error.message);
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

export default SubscriberCount;
