import React, { useState } from "react";
import { saveData } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const [name, setName] = useState("");
  const nav = useNavigate();

  const start = () => {
    if (!name) return alert("Enter tournament name");
    saveData("tournamentName", name);
    nav("/teams");
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Start Tournament</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-3 rounded bg-gray-800 outline-none w-80"
        placeholder="Tournament Name"
      />

      <button
        onClick={start}
        className="mt-4 bg-pink-600 px-6 py-3 rounded-lg hover:bg-pink-700"
      >
        Start
      </button>
    </div>
  );
}
