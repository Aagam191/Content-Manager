import React, { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ channelName }) => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const autoRotateTime = 5000; // Time in milliseconds for auto-rotation (5 seconds)

    useEffect(() => {
        // Fetching the videos
        fetch('http://127.0.0.1:8000/api/youtube/videos/')
            .then((response) => response.json())
            .then((data) => {
                console.log("Frontend Received:", data);
                setVideos(data.videos || []);  // Set videos if available
            })
            .catch((error) => {
                console.error("Error fetching videos:", error);
            });
    }, [channelName]);

    useEffect(() => {
        // Auto-rotate the slides
        const autoSlide = setInterval(() => {
            nextSlide();
        }, autoRotateTime);

        // Cleanup the interval on component unmount
        return () => clearInterval(autoSlide);
    }, [currentIndex, videos.length]);

    const prevSlide = () => {
        setCurrentIndex((currentIndex - 1 + videos.length) % videos.length);
    };

    const nextSlide = () => {
        setCurrentIndex((currentIndex + 1) % videos.length);
    };

    return (
        
                <>
            {videos.length > 0 ? (

<div className="carousel">
<button className="carousel-control prev" onClick={prevSlide}>
    &lt;
</button>
<div className="carousel-inner">
    {videos.map((video, index) => (
        <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
        >
            <div className="video-card">
                <div className="thumbnail-container">
                    <img 
                        src={`https://img.youtube.com/vi/${video.video_url.split('v=')[1]}/hqdefault.jpg`} 
                        alt={video.title} 
                        className="video-thumbnail" 
                    />
                    <div className="video-info">
                        <h3>{video.title}</h3>
                        {/* <p>Views: {video.views}</p>    */}
                        {/* <p>Likes: {video.likes}</p>    */}
                        {/* <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                            Watch on YouTube
                        </a> */}
                    </div>
                    <div className='views'>
                        <p>Views: {video.views}</p>   
                            </div>
                            <div className='likes'>
                        <p>Likes: {video.likes}</p>   
                            </div>
                </div>
            </div>
        </div>
    ))}
</div>
<button className="carousel-control next" onClick={nextSlide}>
    &gt;
</button>
</div>
                    ) : (
                        <p>Loading videos...</p>
                    )}
                </>
            
        
    );
};

export default Carousel;
