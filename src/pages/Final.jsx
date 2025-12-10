// src/pages/Final.jsx
import React, { useEffect, useState } from "react";
import FinalPopup from "../components/FinalPopup";
import { loadData, saveData, clearData } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";

export default function Final() {
  const nav = useNavigate();
  const finalists = loadData("finalists") || [];
  const [showPopup, setShowPopup] = useState(true);

  const champion = finalists[0]?.name || "—";
  const runnerUp = finalists[1]?.name || "—";

  function reset() {
    // clearing keys we used
    clearData("matches");
    clearData("teamStats");
    clearData("finalists");
    clearData("teams");
    clearData("tournamentName");
    clearData("rounds");
    clearData("overs");
    // redirect to start
    nav("/");
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white flex items-center justify-center">
      {showPopup && <FinalPopup champion={champion} runnerUp={runnerUp} onReset={reset} />}
      {!showPopup && (
        <div className="text-center">
          <h1 className="text-3xl font-bold">Tournament Finished</h1>
          <p className="mt-4">Champion: <span className="font-semibold text-pink-500">{champion}</span></p>
          <button className="mt-6 bg-pink-600 px-4 py-2 rounded" onClick={reset}>Reset Tournament</button>
        </div>
      )}
    </div>
  );
}
