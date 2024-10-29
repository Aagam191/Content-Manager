// import React, { useState } from 'react';
// import axios from 'axios';

// function Youtubepost() {
//   const [file, setFile] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("22");
//   const [privacyStatus, setPrivacyStatus] = useState("public");

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleTitleChange = (e) => {
//     setTitle(e.target.value);
//   };

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleCategoryChange = (e) => {
//     setCategory(e.target.value);
//   };

//   const handlePrivacyStatusChange = (e) => {
//     setPrivacyStatus(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     if (!file) {
//       alert("Please select a video file");
//       return;
//     }
  
//     const formData = new FormData();
//     formData.append('video', file);
//     formData.append('title', title);
//     formData.append('description', description);
//     formData.append('category', category);
//     formData.append('privacy_status', privacyStatus);
  
//     // Debugging: Log formData content before sending
//     for (let pair of formData.entries()) {
//       console.log(pair[0] + ': ' + pair[1]);
//     }
  
//     try {
//       const response = await axios.post('http://localhost:8000/api/youtube/upload/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       console.log("Video uploaded successfully:", response.data);
//     } catch (error) {
//       console.error("Error uploading video:", error.response ? error.response.data : error.message);
//     }
//   };
  

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="file" onChange={handleFileChange} accept="video/*" />
//       <input 
//         type="text" 
//         value={title} 
//         onChange={handleTitleChange} 
//         placeholder="Enter video title" 
//       />
//       <textarea 
//         value={description} 
//         onChange={handleDescriptionChange} 
//         placeholder="Enter video description" 
//       />
//       <input 
//         type="text" 
//         value={category} 
//         onChange={handleCategoryChange} 
//         placeholder="Enter category ID" 
//       />
//       <select value={privacyStatus} onChange={handlePrivacyStatusChange}>
//         <option value="public">Public</option>
//         <option value="private">Private</option>
//         <option value="unlisted">Unlisted</option>
//       </select>
//       <button type="submit">Upload Video</button>
//     </form>
//   );
// }

// export default Youtubepost;

import React, { useState } from 'react';
import axios from 'axios';
import './YoutubePost.css'

function Testing() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("22"); // Default YouTube category for 'People & Blogs'
  const [privacyStatus, setPrivacyStatus] = useState("public");
  const [uploadStatus, setUploadStatus] = useState(""); // New state for upload status

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handlePrivacyStatusChange = (e) => {
    setPrivacyStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!file) {
      alert("Please select a video file");
      return;
    }
  
    const formData = new FormData();
    formData.append('video_file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', category);
    formData.append('privacy_status', privacyStatus);
  
    try {
      setUploadStatus("Uploading..."); // Set status to uploading
      const response = await axios.post('http://localhost:8000/api/youtube/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Video uploaded successfully:", response.data);
      setUploadStatus("Video uploaded successfully!"); // Set status to success
    } catch (error) {
      console.error("Error uploading video:", error.response ? error.response.data : error.message);
      setUploadStatus("Error uploading video. Please try again."); // Set status to error
    }
  };
  
  return (
    <div className="yt-post-container">
      <h1 className="yt-post-title">Upload YouTube Video</h1>
      <form onSubmit={handleSubmit} className="yt-post-form" encType="multipart/form-data">
        <div className="yt-post-input-group">
          <label htmlFor="file" className="yt-post-label">Video File</label>
          <input type="file" onChange={handleFileChange} accept="video/*" id="file" className="yt-post-file-input" />
        </div>

        <div className="yt-post-input-group">
          <label htmlFor="title" className="yt-post-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter video title"
            id="title"
            className="yt-post-text-input"
          />
        </div>

        <div className="yt-post-input-group">
          <label htmlFor="description" className="yt-post-label">Description</label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter video description"
            id="description"
            className="yt-post-textarea"
          />
        </div>

        <div className="yt-post-input-group">
          <label htmlFor="category" className="yt-post-label">Category ID</label>
          <input
            type="text"
            value={category}
            onChange={handleCategoryChange}
            placeholder="Enter category ID"
            id="category"
            className="yt-post-text-input"
          />
        </div>

        <div className="yt-post-input-group">
          <label htmlFor="privacy" className="yt-post-label">Privacy</label>
          <select value={privacyStatus} onChange={handlePrivacyStatusChange} id="privacy" className="yt-post-select">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>

        <button type="submit" className="yt-post-submit-btn">Upload Video</button>

        {uploadStatus && (
          <div className={`yt-post-status ${uploadStatus.includes("successfully") ? "yt-post-status-success" : "yt-post-status-error"}`}>
            {uploadStatus}
          </div>
        )}
      </form>
    </div>
  );
}

export default Testing;
