// src/components/FinalPopup.jsx
import React from "react";

export default function FinalPopup({ champion, runnerUp, onReset }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-3 text-pink-600">🏆 Tournament Finished</h2>
        <div className="mb-4">
          <div className="text-lg text-gray-600">Champion</div>
          <div className="text-pink-600 font-semibold text-xl">{champion}</div>
        </div>
        <div className="mb-6">
          <div className="text-sm text-gray-600">Runner Up</div>
          <div className="font-semibold text-pink-600">{runnerUp}</div>
        </div>

        <button onClick={onReset} className="bg-pink-600 text-white px-4 py-2 rounded">Reset Tournament</button>
      </div>
    </div>
  );
}
