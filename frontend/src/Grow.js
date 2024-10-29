import { useEffect } from "react";
import React,{ useState} from "react";
import axios from "axios";
import './Comment.css'

const Comment = () => {
//   const [channelName, setChannelName] = useState(''); // Store the creator's name
  const [comments, setComments] = useState([]);
  const [creatorName, setCreatorName] = useState('');
  const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [positiveComments, setPositiveComments] = useState([]);
  const [negativeComments, setNegativeComments] = useState([]);


    // fetch profile
    useEffect(() => {
        fetchProfile();
      }, []);
    const fetchProfile = async () => {
        try {
          const response = await axios.get('http://localhost:8000/get-profile/');
          setCreatorName(response.data.name);
        //   setProfilePic(response.data.profile_pic ? `http://localhost:8000${response.data.profile_pic}` : 'default-profile-pic.png');
        } catch (error) {
          console.error('There was an error fetching the profile data!', error);
        }
      };

      useEffect(() => {
        if (creatorName) {
            fetchAndAnalyzeComments();
        }
    }, [creatorName]);  // This will trigger only when creatorName is set
    
    const fetchAndAnalyzeComments = async () => {
        try {
            // Fetch comments
            const fetchResponse = await axios.post("http://localhost:8000/comments/fetch_comments/", {
                channel_name: creatorName, // Ensure creatorName is not empty
            });
    
            setComments(fetchResponse.data.comments);
    
            // Analyze comments
            const analyzeResponse = await axios.post("http://localhost:8000/comments/analysis/", {
                comments: fetchResponse.data.comments,  // Send fetched comments, not {comments}
            });
    
            setResults(analyzeResponse.data);
    
            // Separate positive and negative comments
            const positive = analyzeResponse.data.filter(
                (result) => result.Sentiment_Label === "positive"
            );
            const negative = analyzeResponse.data.filter(
                (result) => result.Sentiment_Label === "negative"
            );
    
            setPositiveComments(positive);
            setNegativeComments(negative);
        } catch (err) {
            setError("Error fetching or analyzing comments");
        }
    };




  return (
 


    <div>
            {error && <p>{error}</p>}

            <h3>Comment Sentiment Analysis</h3>
            <div className="comment-container">
                <div className="comment-column">
                    <h4>Positive Comments</h4>
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
                    <h4>Negative Comments</h4>
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
