import React, { useState } from "react";

export default function Leaderboard({ table }) {
  return (
    <div className="mt-6">
      <h2 className="text-2xl mb-3 font-bold">Leaderboard</h2>

      <div className="bg-gray-800 p-4 rounded">
        {table.map((t) => (
          <div key={t.name} className="flex justify-between text-white py-2 border-b border-gray-700">
            <span>{t.name}</span>
            <span>Pts: {t.points}</span>
            <span>NRR: {t.nrr.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
