// src/components/TeamList.jsx
import React from "react";

export default function TeamList({ teams }) {
  if (!teams || teams.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1">
      {teams.map((team) => (
        <li key={team.id} className="bg-gray-700 p-2 rounded">
          {team.name}  {/* <-- object ka name hi render karna hai */}
        </li>
      ))}
    </ul>
  );
}
