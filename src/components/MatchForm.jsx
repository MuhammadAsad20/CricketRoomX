// src/components/MatchForm.jsx
import React, { useState, useEffect } from "react";
import { oversStringToBalls } from "../utils/nrr";
import { getTeamById } from "../utils/localStorage";
import { neededRunsToReachNRR, neededOpponentLimitForNRR } from "../utils/possibilities";

export default function MatchForm({ match, onSave, teamStatsGlobal, oversPerInnings = 20, maxWickets = 10 }) {
  const teamAObj = getTeamById(match.teamA);
  const teamBObj = getTeamById(match.teamB);
  const teamAName = teamAObj?.name || match.teamA;
  const teamBName = teamBObj?.name || match.teamB;

  // toss / choice
  const [tossWinner, setTossWinner] = useState(match.toss?.winner || "");
  const [tossChoice, setTossChoice] = useState(match.toss?.choice || "bat");

  // innings fields
  const [batFirstRuns, setBatFirstRuns] = useState("");
  const [batFirstWk, setBatFirstWk] = useState("");
  const [batFirstOvers, setBatFirstOvers] = useState("");
  const [batSecondRuns, setBatSecondRuns] = useState("");
  const [batSecondWk, setBatSecondWk] = useState("");
  const [batSecondOvers, setBatSecondOvers] = useState("");

  const [showPoss, setShowPoss] = useState(false);
  const [possResult, setPossResult] = useState(null);

  useEffect(() => {
    if (match.innings && match.innings.length === 2) {
      const i1 = match.innings[0];
      const i2 = match.innings[1];
      setBatFirstRuns(i1.runs ?? "");
      setBatFirstWk(i1.wickets ?? "");
      setBatFirstOvers(i1.balls ? `${Math.floor(i1.balls/6)}.${i1.balls%6}` : "");
      setBatSecondRuns(i2.runs ?? "");
      setBatSecondWk(i2.wickets ?? "");
      setBatSecondOvers(i2.balls ? `${Math.floor(i2.balls/6)}.${i2.balls%6}` : "");
    }
    setTossWinner(match.toss?.winner || "");
    setTossChoice(match.toss?.choice || "bat");
  }, [match]);

  // batting order based on toss
  function resolveBattingOrder(tossWinnerId, tossChoiceValue) {
    if (!tossWinnerId) return { first: match.teamA, second: match.teamB };
    if (tossChoiceValue === "bat") {
      return { first: tossWinnerId, second: tossWinnerId === match.teamA ? match.teamB : match.teamA };
    } else {
      return { first: tossWinnerId === match.teamA ? match.teamB : match.teamA, second: tossWinnerId };
    }
  }

  function validateInningsInput(runsStr, wkStr, oversStr) {
    const runs = Number(runsStr || 0);
    const wk = Number(wkStr || 0);
    const balls = oversStringToBalls(oversStr);
    if (isNaN(runs) || runs < 0) return "Runs invalid";
    if (isNaN(wk) || wk < 0 || wk > maxWickets) return `Wickets must be 0 - ${maxWickets}`;
    if (balls > oversPerInnings * 6) return `Overs cannot exceed ${oversPerInnings}`;
    return null;
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (!tossWinner) return alert("Select toss winner");

    const { first, second } = resolveBattingOrder(tossWinner, tossChoice);

    const v1 = validateInningsInput(batFirstRuns, batFirstWk, batFirstOvers);
    const v2 = validateInningsInput(batSecondRuns, batSecondWk, batSecondOvers);
    if (v1) return alert("First innings: " + v1);
    if (v2) return alert("Second innings: " + v2);

    const inn1 = { battingTeam: first, runs: Number(batFirstRuns), wickets: Number(batFirstWk), balls: oversStringToBalls(batFirstOvers) };
    const inn2 = { battingTeam: second, runs: Number(batSecondRuns), wickets: Number(batSecondWk), balls: oversStringToBalls(batSecondOvers) };

    // determine winner
    let winnerId = null;
    let winnerName = null;
    let margin = "";
    if (inn1.runs > inn2.runs) {
      winnerId = inn1.battingTeam;
      winnerName = getTeamByIdSafe(winnerId).name;
      margin = `${inn1.runs - inn2.runs} runs`;
    } else if (inn2.runs > inn1.runs) {
      winnerId = inn2.battingTeam;
      winnerName = getTeamByIdSafe(winnerId).name;
      const wicketsRemaining = Math.max(0, maxWickets - inn2.wickets);
      margin = `${wicketsRemaining} wickets`;
    } else {
      winnerId = null;
      winnerName = "Tie";
      margin = "Tie";
    }

    onSave({
      ...match,
      toss: { winner: tossWinner, choice: tossChoice },
      innings: [inn1, inn2],
      status: "completed",
      result: { winner: winnerId, winnerName, margin }
    });
  };

  function getTeamByIdSafe(id) {
    return getTeamById(id) || { id, name: id };
  }

  // Possibilities
  function showPossibilities() {
    setShowPoss(true);
    const stats = teamStatsGlobal || {};
    const { first, second } = resolveBattingOrder(tossWinner || match.teamA, tossChoice);

    const firstStats = stats[first] || { runsFor: 0, ballsFaced: 0, runsAgainst: 0, ballsBowled: 0 };
    const secondStats = stats[second] || { runsFor: 0, ballsFaced: 0, runsAgainst: 0, ballsBowled: 0 };

    const currFirstNRR = firstStats.nrr || 0;
    const targetNRR1 = +(currFirstNRR + 0.25).toFixed(2);
    const battingBalls = oversPerInnings * 6;

    const needRuns = neededRunsToReachNRR(firstStats, targetNRR1, battingBalls);
    const needOppLimit = neededOpponentLimitForNRR(firstStats, targetNRR1, battingBalls);

    setPossResult({
      firstTeam: getTeamByIdSafe(first).name,
      currNRR: currFirstNRR,
      targetNRR: targetNRR1,
      needRuns,
      needOppLimit
    });
  }

  // safe labels
  const resolved = resolveBattingOrder(tossWinner || match.teamA, tossChoice);
  const leftTeamObj = typeof resolved.first === "object" ? resolved.first : getTeamById(resolved.first);
  const rightTeamObj = typeof resolved.second === "object" ? resolved.second : getTeamById(resolved.second);
  const leftLabel = leftTeamObj?.name || resolved.first;
  const rightLabel = rightTeamObj?.name || resolved.second;

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-3 bg-gray-900 p-4 rounded">
        <div className="flex gap-4">
          <div>
            <div className="text-sm text-gray-300 mb-1">Toss Winner</div>
            <select value={tossWinner} onChange={(e) => setTossWinner(e.target.value)} className="bg-gray-800 p-2 rounded text-white">
              <option value="">Select</option>
              <option value={match.teamA}>{teamAName}</option>
              <option value={match.teamB}>{teamBName}</option>
            </select>
          </div>
          <div>
            <div className="text-sm text-gray-300 mb-1">Choice</div>
            <select value={tossChoice} onChange={(e) => setTossChoice(e.target.value)} className="bg-gray-800 p-2 rounded text-white">
              <option value="bat">Bat</option>
              <option value="bowl">Bowl</option>
            </select>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-gray-400">Overs per innings</div>
            <div className="font-semibold">{oversPerInnings}</div>
            <div className="text-sm text-gray-400">Max wickets</div>
            <div className="font-semibold">{maxWickets}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-3 rounded">
            <div className="font-semibold mb-2">{leftLabel} Innings</div>
            <input value={batFirstRuns} onChange={(e)=>setBatFirstRuns(e.target.value)} placeholder="Runs" className="w-full mb-2 p-2 bg-gray-900 rounded"/>
            <input value={batFirstWk} onChange={(e)=>setBatFirstWk(e.target.value)} placeholder={`Wickets (0-${maxWickets})`} className="w-full mb-2 p-2 bg-gray-900 rounded"/>
            <input value={batFirstOvers} onChange={(e)=>setBatFirstOvers(e.target.value)} placeholder={`Overs (e.g. ${oversPerInnings-1}.5 or ${oversPerInnings}.0 max)`} className="w-full p-2 bg-gray-900 rounded"/>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <div className="font-semibold mb-2">{rightLabel} Innings</div>
            <input value={batSecondRuns} onChange={(e)=>setBatSecondRuns(e.target.value)} placeholder="Runs" className="w-full mb-2 p-2 bg-gray-900 rounded"/>
            <input value={batSecondWk} onChange={(e)=>setBatSecondWk(e.target.value)} placeholder={`Wickets (0-${maxWickets})`} className="w-full mb-2 p-2 bg-gray-900 rounded"/>
            <input value={batSecondOvers} onChange={(e)=>setBatSecondOvers(e.target.value)} placeholder={`Overs (e.g. ${oversPerInnings-1}.5 or ${oversPerInnings}.0 max)`} className="w-full p-2 bg-gray-900 rounded"/>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-pink-600 px-4 py-2 rounded">Submit Result</button>
          <button type="button" onClick={showPossibilities} className="bg-indigo-600 px-4 py-2 rounded">Show Possibilities</button>
        </div>
      </form>

      {showPoss && possResult && (
        <div className="mt-4 bg-gray-800 p-3 rounded">
          <div className="font-semibold">Possibilities for {possResult.firstTeam}</div>
          <div className="text-sm text-gray-300">Current NRR: {possResult.currNRR?.toFixed(3)}</div>
          <div className="mt-2">To reach NRR {possResult.targetNRR} (approx):</div>
          <ul className="list-disc pl-6 mt-2">
            <li>Batting full {oversPerInnings} overs: score at least <b>{possResult.needRuns ?? "—"}</b> runs.</li>
            <li>If bowling first, restrict opponent to <b>{possResult.needOppLimit ?? "—"}</b> (in {oversPerInnings} overs).</li>
          </ul>
          <div className="mt-3">
            <button onClick={()=>setShowPoss(false)} className="bg-gray-700 px-3 py-1 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
