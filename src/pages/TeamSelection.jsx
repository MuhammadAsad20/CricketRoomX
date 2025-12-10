import React, { useState, useEffect } from "react";
import { saveData, loadData } from "../utils/localStorage";
import TeamForm from "../components/TeamForm";
import TeamList from "../components/TeamList";
import { useNavigate } from "react-router-dom";

export default function TeamSelection() {
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState(1);
  const [overs, setOvers] = useState(20);
  const [maxWickets, setMaxWickets] = useState(10);

  const nav = useNavigate(); // <-- navigation hook

  // Load saved teams & format
  useEffect(() => {
    const saved = loadData("teams");
    if (saved) {
      if (Array.isArray(saved.teams)) setTeams(saved.teams);
      if (saved.format) {
        setRounds(saved.format.rounds || 1);
        setOvers(saved.format.overs || 20);
        setMaxWickets(saved.format.maxWickets || 10);
      }
    }
  }, []);

  const addTeam = (name) => {
    if (!name.trim()) return alert("Team name cannot be empty");

    const newTeam = {
      id: "team-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name: name.trim(),
    };

    setTeams((prev) => [...prev, newTeam]);
  };

  const next = () => {
    if (teams.length < 2) return alert("Add at least 2 teams");

    saveData("teams", {
      teams,
      format: { rounds: Number(rounds), overs: Number(overs), maxWickets: Number(maxWickets) },
    });

    // Navigate to Dashboard (or Matches) page
    nav("/dashboard"); // <-- change this path to wherever you want
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Team & Format Setup</h1>

      {/* Add Teams */}
      <div className="mb-4">
        <TeamForm addTeam={addTeam} />
        <TeamList teams={teams} />
      </div>

      {/* Format Selection */}
      <div className="mb-4 space-y-3 bg-gray-800 p-4 rounded">
        <div>
          <label className="block text-gray-300 mb-1">Rounds</label>
          <input
            type="number"
            min="1"
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
            className="w-full p-2 rounded bg-gray-900"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Overs per innings</label>
          <input
            type="number"
            min="1"
            value={overs}
            onChange={(e) => setOvers(e.target.value)}
            className="w-full p-2 rounded bg-gray-900"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Max Wickets</label>
          <input
            type="number"
            min="1"
            value={maxWickets}
            onChange={(e) => setMaxWickets(e.target.value)}
            className="w-full p-2 rounded bg-gray-900"
          />
        </div>
      </div>

      <button
        onClick={next}
        className="mt-4 bg-pink-600 px-6 py-3 rounded hover:bg-pink-700"
      >
        Save Teams & Format
      </button>
    </div>
  );
}
