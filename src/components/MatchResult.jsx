import React, { useState } from "react";
import { getFixtures, saveFixtures, getTeams, saveTeams } from "../utils/localStorage.jsx";

export default function MatchResult({ onNext }) {
  const [fixtures, setFixtures] = useState(getFixtures());
  const [index, setIndex] = useState(0);
  const [scoreA, setScoreA] = useState("");
  const [oversA, setOversA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [oversB, setOversB] = useState("");

  const submitMatch = () => {
    let teams = getTeams();
    const match = fixtures[index];
    const teamA = teams.find(t => t.name === match.teamA);
    const teamB = teams.find(t => t.name === match.teamB);

    // Update runs and overs
    teamA.runsScored += Number(scoreA);
    teamA.oversFaced += Number(oversA);
    teamA.runsConceded += Number(scoreB);
    teamA.oversBowled += Number(oversB);

    teamB.runsScored += Number(scoreB);
    teamB.oversFaced += Number(oversB);
    teamB.runsConceded += Number(scoreA);
    teamB.oversBowled += Number(oversA);

    // Update NRR
    teamA.nrr = (teamA.runsScored / teamA.oversFaced) - (teamA.runsConceded / teamA.oversBowled);
    teamB.nrr = (teamB.runsScored / teamB.oversFaced) - (teamB.runsConceded / teamB.oversBowled);

    // Update wins/losses/points
    if (scoreA > scoreB) { 
      teamA.won++; teamA.points += 2; 
      teamB.lost++; 
    } else if (scoreB > scoreA) { 
      teamB.won++; teamB.points += 2; 
      teamA.lost++; 
    } else { 
      teamA.points++; 
      teamB.points++; 
    }

    // Update played
    teamA.played += 1;
    teamB.played += 1;

    fixtures[index].played = true;

    saveTeams(teams);
    saveFixtures(fixtures);

    setIndex(index + 1);
    setScoreA(""); setOversA(""); setScoreB(""); setOversB("");
  };

  if (index >= fixtures.length) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">All matches played!</h2>
        <button
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500"
          onClick={onNext}
        >
          View Leaderboard
        </button>
      </div>
    );
  }

  const match = fixtures[index];

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
        Enter Result: {match.teamA} vs {match.teamB}
      </h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input className="flex-1 p-2 border rounded-lg" type="number" value={scoreA} onChange={e=>setScoreA(e.target.value)} placeholder={`${match.teamA} Runs`} />
        <input className="flex-1 p-2 border rounded-lg" type="number" value={oversA} onChange={e=>setOversA(e.target.value)} placeholder={`${match.teamA} Overs`} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input className="flex-1 p-2 border rounded-lg" type="number" value={scoreB} onChange={e=>setScoreB(e.target.value)} placeholder={`${match.teamB} Runs`} />
        <input className="flex-1 p-2 border rounded-lg" type="number" value={oversB} onChange={e=>setOversB(e.target.value)} placeholder={`${match.teamB} Overs`} />
      </div>

      <button
        className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-500"
        onClick={submitMatch}
      >
        Submit Match
      </button>
    </div>
  );
}
