import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import JoinRoom from "./components/JoinRoom";
import { isMobile } from "react-device-detect";

function App() {
  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen text-center px-4">
        <h1 className="text-2xl font-semibold text-red-600">
          🚫 This website is only accessible on laptops or desktops. <br />
          Please use a larger screen to continue.
        </h1>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomId" element={<JoinRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
