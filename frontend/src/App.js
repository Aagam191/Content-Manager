import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import YoutubePost from "./Youtubepost";
import Metrics from "./Metrics";
// import Create from "./Create";
import Chat from "./Chat";
import Calendar from './Calendar'; 
import Comment from "./Comment";
import './App.css';
// import Grow from "./Grow";

const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Dashboard pageTitle="Dashboard" page={<><Calendar /> </>} />} />
        <Route path="/youtube/*" element={<Dashboard pageTitle="YouTube" page={<YoutubePost />} />} />
        <Route path="/metrics/*" element={<Dashboard pageTitle="Metrics" page={<Metrics />} />} />
        <Route path="/chat/*" element={<Dashboard pageTitle="Chat" page={<Chat />} />} />
        <Route path="/grow/*" element={<Dashboard pageTitle="Grow" page={<Comment />} />} />
      </Routes>
    </Router>
  );
};

export default App;
