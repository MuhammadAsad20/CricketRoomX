// src/components/MatchCard.jsx
import React from "react";
import { getTeamById } from "../utils/localStorage";

export default function MatchCard({ match, onPlay }) {
  const teamAName = getTeamById(match.teamA)?.name || match.teamA;
  const teamBName = getTeamById(match.teamB)?.name || match.teamB;

  return (
    <div className="bg-gray-800 text-white rounded p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-lg font-bold">{teamAName} vs {teamBName}</div>
          <div className="text-sm text-gray-300">Round {match.round}</div>
        </div>

        <div className="text-right">
          <div className={`px-3 py-1 rounded ${match.status === "completed" ? "bg-green-600" : "bg-pink-600"}`}>
            {match.status === "completed" ? "Completed" : "Upcoming"}
          </div>
          <button
            onClick={() => onPlay(match.id)}
            className="mt-2 block bg-white text-gray-900 px-3 py-1 rounded hover:opacity-90"
          >
            Play / View
          </button>
        </div>
      </div>

      {match.result && (
        <div className="mt-3 text-sm text-gray-200">
          Result: <span className="font-semibold">{match.result.winnerName}</span> — {match.result.margin}
        </div>
      )}
    </div>
  );
}
