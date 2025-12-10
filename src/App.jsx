import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import TeamSelection from "./pages/TeamSelection";
import Dashboard from "./pages/Dashboard";
import MatchCenter from "./pages/MatchCenter";
import Final from "./pages/Final";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/teams" element={<TeamSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/matches" element={<MatchCenter />} />
        <Route path="/final" element={<Final />} />
      </Routes>
    </Router>
  );
}

export default App;
