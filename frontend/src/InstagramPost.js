import React, { useState } from 'react';
import axios from 'axios';

// React Component for Instagram Post (assume images)
function InstagramPost() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    // Change 'file' to 'video' if required by backend
    formData.append('file', file); // For image files
    formData.append('caption', caption);

    try {
      const response = await axios.post('http://localhost:8000/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("File uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading file:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <input 
        type="text" 
        value={caption} 
        onChange={handleCaptionChange} 
        placeholder="Enter caption here" 
      />
      <button type="submit">Upload</button>
    </form>
  );
}

export default InstagramPost;
