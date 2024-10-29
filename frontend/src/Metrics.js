import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Carousel from './Carousel'; // Import the Carousel component
import './Metrics.css'; // Make sure to style this properly
// import './Testing2.css'

const Metrics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    last_month_views: 0,
    last_month_watch_time: 0,
    last_month_subscribers_gained: 0,
    total_subscribers: 0,
    average_view_duration: 0
  });


  const [channelName] = useState('MrBeast');  // You can set your default channel name
  const [creatorName, setCreatorName] = useState('Creator');


    
  
  // const fetchProfile = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:8000/get-profile/');
  //     setCreatorName(response.data.name);
  //     // setProfilePic(response.data.profile_pic ? http://localhost:8000${response.data.profile_pic} : 'default-profile-pic.png');
  //   } catch (error) {
  //     console.error('There was an error fetching the profile data!', error);
  //   }
  // };
  

  // // subs calculate
  // const SubscriberCount = ({ creatorName }) => {
  //   const [subscriberCount, setSubscriberCount] = useState(0);
  //   const [error, setError] = useState(null);


  //   useEffect(() => {
  //     if (creatorName) {
  //       fetchSubscriberCount(creatorName);
  //     }
  //   }, [creatorName]);



  //   const fetchSubscriberCount = async (creatorName) => {
  //     try {
  //       const response = await axios.get(http://localhost:8000/api/youtube/subscribers/${creatorName}/);
  //       if (response.data && response.data.subscriber_count) {
  //         setSubscriberCount(response.data.subscriber_count);
  //       } else {
  //         setError("Subscribers not found.");
  //       }
  //     } catch (error) {
  //       // setError("Error fetching subscriber count: " + error.message);
  //     }
  //   };


    useEffect(() => {
      axios.get('http://localhost:8000/fetch/metrics/')
        .then(response => setAnalyticsData(response.data))
        .catch(error => console.error('Error fetching analytics data:', error));
    }, []);
    // useEffect(()=>{
    //   axios.get('http://localhost:8000/')

    // },[])

    return (
      <div className="metrics-container">
        <div className="metrics-grid">
          <div className="card">
            <h3>Total Views (Last Month)</h3>
            <p>{analyticsData.last_month_views}</p>
          </div>
          <div className="card">
            <h3>Watch Time (Last Month)</h3>
            <p>{analyticsData.last_month_watch_time} minutes</p>
          </div>
          <div className="card">
            <h3>Subscribers Gained (Last Month)</h3>
            <p>{analyticsData.last_month_subscribers_gained}</p>
          </div>
          <div className="card">
            <h3>Total Subscribers / Average View Duration(sec)</h3>
            <p>{analyticsData.total_subscribers} / {analyticsData.average_view_duration}</p>
          </div>
        </div>

        <div className="graph-section">
          <h2>Subscriber Growth and Views Graph</h2>
          <div className='graph-container'>
          <img src="http://localhost:8000/fetch/combined-growth/" alt="Subscriber Growth Graph" className="subscriber-growth" />
          </div>
        </div>

        <div className="graph-section">
          <h2>Age Demographics and Views Over Time Graph</h2>
          <div className='graph-container'>
          <img src="http://localhost:8000/get/combined/" alt="New Combined Chart" className="new-combined-chart" />
          </div>
        </div>



        {/* {<div className="carousel-section">
          <h2>Top Performing Videos</h2>
          <Carousel channelName={channelName} />
        </div>} */}
      </div>
    );
  };

  export default Metrics;
