import React, { useState } from "react";
import { saveTeams, getTeams } from "../utils/localStorage.jsx";

export default function TeamSetup({ onNext }) {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState(getTeams());
  const [error, setError] = useState("");

  const addTeam = () => {
    if (!teamName.trim()) {
      setError("Team name cannot be empty");
      return;
    }
    setError("");
    const newTeams = [
      ...teams,
      {
        name: teamName,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
        nrr: 0,
      },
    ];
    setTeams(newTeams);
    saveTeams(newTeams);
    setTeamName("");
  };

  const resetTournament = () => {
    localStorage.removeItem("teams");
    localStorage.removeItem("fixtures");
    setTeams([]);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
        Team Setup
      </h2>

      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter Team Name"
        />
        <button
          className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition"
          onClick={addTeam}
        >
          Add Team
        </button>
      </div>

      <ul className="mb-4">
        {teams.map((t, i) => (
          <li
            key={i}
            className="p-3 border rounded-lg mb-2 bg-gray-50 shadow hover:bg-gray-100 transition text-center"
          >
            {t.name}
          </li>
        ))}
      </ul>

      {teams.length > 0 && (
        <button
          className="w-full mb-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
          onClick={resetTournament}
        >
          Reset Tournament
        </button>
      )}

      {teams.length > 1 && (
        <button
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 transition"
          onClick={onNext}
        >
          Next: Generate Fixtures
        </button>
      )}
    </div>
  );
}
