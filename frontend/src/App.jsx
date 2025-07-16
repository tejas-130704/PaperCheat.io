import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import JoinRoom from "./components/JoinRoom";
import PlayGround from "./components/PlayGround";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomId" element={<JoinRoom />} />
        {/* <Route path="/:roomId" element={<JoinRoom />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
