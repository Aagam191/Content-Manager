import { useEffect, useState } from "react";
import axios from "axios";
import './Comment.css';

const Comment = () => {
    const [videoTitle, setVideoTitle] = useState(''); // State for video title input
    const [creatorName, setCreatorName] = useState('');
    const [positiveComments, setPositiveComments] = useState([]);
    const [negativeComments, setNegativeComments] = useState([]);
    const [error, setError] = useState(null);
    const [currentVideoTitle, setCurrentVideoTitle] = useState(''); // State for current video title

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        fetchAndAnalyzeComments(); // Fetch latest comments on component mount
    }, [creatorName]);

    const fetchProfile = async () => {
        try {   
            const response = await axios.get('http://localhost:8000/get-profile/');
            setCreatorName(response.data.name);
        } catch (error) {
            console.error('There was an error fetching the profile data!', error);
        }
    };

    const fetchAndAnalyzeComments = async () => {
        try {
            // Fetch comments based on video title or latest video if no title is provided
            const response = await axios.post("http://localhost:8000/comments/fetch_comments/", {
                channel_name: creatorName,
                video_title: videoTitle, // Send video title if provided
            });

            const { comments, video_title } = response.data;
            setCurrentVideoTitle(video_title);

            // Separate positive and negative comments
            const positive = comments.filter(
                (result) => result.Sentiment_Label === "positive"
            );
            const negative = comments.filter(
                (result) => result.Sentiment_Label === "negative"
            );

            setPositiveComments(positive);
            setNegativeComments(negative);
        } catch (err) {
            // setError("Error fetching or analyzing comments");
        }
    };

    const handleFetchAndAnalyze = () => {
        if (videoTitle.trim()) {
            fetchAndAnalyzeComments();
        } else {
            setError("Please enter a video title.");
        }
    };

    return (
        <div>
            {error && <p>{error}</p>}

            <h3>Feedback From Comments</h3>

            <div className="input-container">
                <input
                    type="text"
                    placeholder="Enter video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                />
                <button onClick={handleFetchAndAnalyze}>Fetch and Analyze</button>
            </div>

            {currentVideoTitle && <h4 style={{color:"Black"}}>Video: {currentVideoTitle}</h4>} {/* Display current video title */}

            <div className="comment-container">
                <div className="comment-column">
                    <h4 style={{color:'green'}}>Positive Comments</h4>
                    {positiveComments.length > 0 ? (
                        <ul>
                            {positiveComments.map((comment, index) => (
                                <li key={index}>{comment.Comment}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No positive comments available.</p>
                    )}
                </div>

                <div className="comment-column">
                    <h4 style={{color:'red'}}>Negative Comments</h4>
                    {negativeComments.length > 0 ? (
                        <ul>
                            {negativeComments.map((comment, index) => (
                                <li key={index}>{comment.Comment}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No negative comments available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comment;
