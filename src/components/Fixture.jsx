import React, { useEffect, useState } from "react";
import { getTeams, saveFixtures, getFixtures } from "../utils/localStorage.jsx";

export default function Fixture({ onNext }) {
  const [fixtures, setFixtures] = useState(getFixtures());

  useEffect(() => {
    if (fixtures.length === 0) {
      const teams = getTeams();
      let newFixtures = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          newFixtures.push({ teamA: teams[i].name, teamB: teams[j].name, played: false });
        }
      }
      setFixtures(newFixtures);
      saveFixtures(newFixtures);
    }
  }, [fixtures]);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Fixtures</h2>
      <ul className="mb-4">
        {fixtures.map((f, i) => (
          <li key={i} className="p-2 border rounded-lg mb-2 bg-gray-50 shadow">
            {f.teamA} vs {f.teamB} {f.played && "(Played)"}
          </li>
        ))}
      </ul>
      {fixtures.length > 0 && (
        <button
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500"
          onClick={onNext}
        >
          Next: Enter Match Results
        </button>
      )}
    </div>
  );
}
