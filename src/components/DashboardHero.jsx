import React from "react";

export default function DashboardHero({ name }) {
  return (
    <div classNzame="bg-gray-800 p-6 rounded text-center text-white">
      <h1 className="text-4xl font-bold">{name}</h1>
      <p className="text-gray-300 mt-2">Tournament Dashboard</p>
    </div>
  );
}
