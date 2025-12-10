import React, { useState } from "react";

export default function TeamForm({ addTeam }) {
  const [team, setTeam] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!team) return;
    addTeam(team);
    setTeam("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
        placeholder="Team Name"
      />
      <button className="bg-pink-600 px-4 py-2 rounded">Add</button>
    </form>
  );
}
