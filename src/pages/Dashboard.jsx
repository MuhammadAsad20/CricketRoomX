// src/pages/Dashboard.jsx
import React from "react";
import { loadData } from "../utils/localStorage";
import DashboardHero from "../components/DashboardHero";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const name = loadData("tournamentName") || "My Tournament";

  // teams is now array of objects [{id, name}]
  const teams = loadData("teams")?.teams || [];
  const stats = loadData("teamStats") || {};

  // Prepare leaderboard table
  const table = teams
    .map((t) => {
      const s = stats[t.id] || { points: 0, nrr: 0, played: 0, wins: 0 };
      return {
        name: t.name,
        points: s.points || 0,
        nrr: s.nrr || 0,
        played: s.played || 0,
        wins: s.wins || 0,
      };
    })
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr);

  const matches = loadData("matches") || [];

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <DashboardHero name={name} />

        <div className="flex gap-4 items-center">
          <button
            onClick={() => nav("/matches")}
            className="bg-pink-600 px-4 py-2 rounded"
          >
            Go to Match Center
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("teamStats");
              localStorage.removeItem("matches");
              nav("/matches");
            }}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            Reset Matches
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-2xl font-semibold mb-3">Leaderboard</h2>
          <div className="space-y-2">
            {table.length === 0 && (
              <div className="text-gray-400">No teams yet</div>
            )}
            {table.map((t) => (
              <div
                key={t.name}
                className="flex justify-between p-2 bg-gray-900 rounded"
              >
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-400">
                    Played: {t.played} | Wins: {t.wins}
                  </div>
                </div>
                <div className="text-right">
                  <div>Pts: {t.points}</div>
                  <div>NRR: {(t.nrr || 0).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold">Quick Info</h3>
          <p className="text-gray-300 mt-2">
            Matches scheduled: {matches.length}
          </p>
        </div>
      </div>
    </div>
  );
}
