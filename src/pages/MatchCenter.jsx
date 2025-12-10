// src/pages/MatchCenter.jsx
import React, { useEffect, useState } from "react";
import { loadData, saveData, getTeamById } from "../utils/localStorage";
import { generateSchedule, generateFinalMatch } from "../utils/matchScheduler";
import MatchCard from "../components/MatchCard";
import MatchForm from "../components/MatchForm";
import { calculateNRR } from "../utils/nrr";
import { useNavigate } from "react-router-dom";

export default function MatchCenter() {
  const nav = useNavigate();
  const savedTeams = loadData("teams")?.teams || [];
  const [teams] = useState(savedTeams);
  const [matches, setMatches] = useState(loadData("matches") || []);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [teamStats, setTeamStats] = useState(loadData("teamStats") || {});

  const rounds = loadData("teams")?.format?.rounds || 1;
  const oversPerInnings = loadData("teams")?.format?.overs || 20;
  const maxWickets = loadData("teams")?.format?.maxWickets || 10;

  // Generate schedule and initialize stats if empty
  useEffect(() => {
    if (!matches || matches.length === 0) {
      const sched = generateSchedule(teams, rounds);
      setMatches(sched);
      saveData("matches", sched);
    }

    const stats = { ...(loadData("teamStats") || {}) };
    teams.forEach((t) => {
      if (!stats[t.id]) {
        initializeTeamStat(stats, t.id);
      }
    });
    setTeamStats(stats);
    saveData("teamStats", stats);
  }, []);

  // Persist teamStats when it changes
  useEffect(() => {
    saveData("teamStats", teamStats);
  }, [teamStats]);

  // Persist matches when changed
  useEffect(() => {
    saveData("matches", matches);
  }, [matches]);

  function onPlay(matchId) {
    setSelectedMatchId(matchId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onNextMatch() {
    const next = matches.find((m) => m.status === "upcoming");
    if (next) setSelectedMatchId(next.id);
    else alert("No more upcoming matches");
  }

  function onSaveMatch(updatedMatch) {
    const existing = matches.find((m) => m.id === updatedMatch.id);
    const statsCopy = JSON.parse(JSON.stringify(teamStats || {}));

    if (existing && existing.status === "completed" && existing.innings?.length === 2) {
      const p1 = existing.innings[0];
      const p2 = existing.innings[1];
      subtractInningsFromStats(statsCopy, p1, p2);
    }

    if (updatedMatch.innings && updatedMatch.innings.length === 2) {
      applyInningsToStats(statsCopy, updatedMatch.innings[0], updatedMatch.innings[1]);
    }

    const newMatches = matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    );

    const recomputed = recomputeAllFromMatches(newMatches, teams, statsCopy);

    // Compute NRR
    Object.keys(recomputed).forEach((id) => {
      recomputed[id].nrr = calculateNRR(recomputed[id]);
    });

    setTeamStats(recomputed);
    setMatches(newMatches);
    saveData("teamStats", recomputed);
    saveData("matches", newMatches);
    setSelectedMatchId(null);

    // Generate final if round-robin complete
    const nonFinalIncomplete = newMatches.some(
      (m) => !m.isFinal && m.status !== "completed"
    );

    if (!nonFinalIncomplete) {
      const finalExists = newMatches.some((m) => m.isFinal);
      if (!finalExists) {
        const sorted = Object.keys(recomputed)
          .map((id) => ({
            id,
            points: recomputed[id].points || 0,
            nrr: recomputed[id].nrr || 0,
            wins: recomputed[id].wins || 0,
          }))
          .sort((a, b) => b.points - a.points || b.nrr - a.nrr || b.wins - a.wins);

        const team1 = sorted[0]?.id;
        const team2 = sorted[1]?.id;

        if (team1 && team2) {
          const finalMatch = generateFinalMatch(team1, team2);
          const appended = [...newMatches, finalMatch];
          setMatches(appended);
          saveData("matches", appended);
          alert(
            "Round-robin complete. Final scheduled between " +
              (getTeamById(team1)?.name || team1) +
              " and " +
              (getTeamById(team2)?.name || team2)
          );
        }
      }
    }

    const finalNowCompleted = newMatches.some(
      (m) => m.isFinal && m.status === "completed"
    );
    if (finalNowCompleted) {
      const finalM = newMatches.find((m) => m.isFinal);
      if (finalM?.result?.winnerName) {
        const finalists = [
          { name: finalM.result.winnerName },
          {
            name:
              getTeamById(finalM.teamA)?.name === finalM.result.winnerName
                ? getTeamById(finalM.teamB)?.name
                : getTeamById(finalM.teamA)?.name,
          },
        ];
        saveData("finalists", finalists);
      }
      nav("/final");
    }
  }

  // Helpers
  function subtractInningsFromStats(stats, inn1, inn2) {
    const t1 = inn1.battingTeam;
    const t2 = inn2.battingTeam;
    if (!stats[t1]) initializeTeamStat(stats, t1);
    if (!stats[t2]) initializeTeamStat(stats, t2);

    stats[t1].runsFor -= inn1.runs;
    stats[t1].ballsFaced -= inn1.balls || 0;
    stats[t1].runsAgainst -= inn2.runs;
    stats[t1].ballsBowled -= inn2.balls || 0;

    stats[t2].runsFor -= inn2.runs;
    stats[t2].ballsFaced -= inn2.balls || 0;
    stats[t2].runsAgainst -= inn1.runs;
    stats[t2].ballsBowled -= inn1.balls || 0;
  }

  function applyInningsToStats(stats, inn1, inn2) {
    if (!stats[inn1.battingTeam]) initializeTeamStat(stats, inn1.battingTeam);
    if (!stats[inn2.battingTeam]) initializeTeamStat(stats, inn2.battingTeam);

    stats[inn1.battingTeam].runsFor += inn1.runs;
    stats[inn1.battingTeam].ballsFaced += inn1.balls || 0;
    stats[inn1.battingTeam].runsAgainst += inn2.runs;
    stats[inn1.battingTeam].ballsBowled += inn2.balls || 0;

    stats[inn2.battingTeam].runsFor += inn2.runs;
    stats[inn2.battingTeam].ballsFaced += inn2.balls || 0;
    stats[inn2.battingTeam].runsAgainst += inn1.runs;
    stats[inn2.battingTeam].ballsBowled += inn1.balls || 0;
  }

  function recomputeAllFromMatches(allMatches, teamsList, statsBase) {
    const stats = JSON.parse(JSON.stringify(statsBase));
    teamsList.forEach((t) => {
      if (!stats[t.id]) initializeTeamStat(stats, t.id);
      stats[t.id].played = 0;
      stats[t.id].wins = 0;
      stats[t.id].losses = 0;
      stats[t.id].ties = 0;
      stats[t.id].points = 0;
    });

    allMatches.forEach((m) => {
      if (m.status !== "completed") return;
      const [inn1, inn2] = m.innings || [];
      if (!inn1 || !inn2) return;

      if (!stats[inn1.battingTeam]) initializeTeamStat(stats, inn1.battingTeam);
      if (!stats[inn2.battingTeam]) initializeTeamStat(stats, inn2.battingTeam);

      stats[inn1.battingTeam].runsFor += inn1.runs;
      stats[inn1.battingTeam].ballsFaced += inn1.balls || 0;
      stats[inn1.battingTeam].runsAgainst += inn2.runs;
      stats[inn1.battingTeam].ballsBowled += inn2.balls || 0;

      stats[inn2.battingTeam].runsFor += inn2.runs;
      stats[inn2.battingTeam].ballsFaced += inn2.balls || 0;
      stats[inn2.battingTeam].runsAgainst += inn1.runs;
      stats[inn2.battingTeam].ballsBowled += inn1.balls || 0;

      stats[inn1.battingTeam].played += 1;
      stats[inn2.battingTeam].played += 1;

      if (m.result?.winner && m.result.winner !== "Tie") {
        stats[m.result.winner].wins += 1;
        stats[m.result.winner].points += 2;
        const loser =
          m.result.winner === inn1.battingTeam ? inn2.battingTeam : inn1.battingTeam;
        stats[loser].losses += 1;
      } else {
        stats[inn1.battingTeam].ties += 1;
        stats[inn2.battingTeam].ties += 1;
        stats[inn1.battingTeam].points += 1;
        stats[inn2.battingTeam].points += 1;
      }
    });

    return stats;
  }

  function initializeTeamStat(stats, id) {
    stats[id] = {
      runsFor: 0,
      ballsFaced: 0,
      runsAgainst: 0,
      ballsBowled: 0,
      played: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      points: 0,
      nrr: 0,
    };
  }

  const leaderboard = Object.keys(teamStats)
    .map((id) => {
      const teamObj = getTeamById(id) || { name: id };
      const s = teamStats[id] || {};
      return {
        id,
        name: teamObj.name,
        played: s.played || 0,
        wins: s.wins || 0,
        losses: s.losses || 0,
        ties: s.ties || 0,
        points: s.points || 0,
        nrr: s.nrr || 0,
      };
    })
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr || b.wins - a.wins);

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Match Center</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const sched = generateSchedule(teams, rounds);
                setMatches(sched);
                saveData("matches", sched);

                const s = {};
                teams.forEach((t) => initializeTeamStat(s, t.id));
                setTeamStats(s);
                saveData("teamStats", s);
              }}
              className="bg-pink-600 px-3 py-2 rounded"
            >
              Regenerate
            </button>

            <button
              onClick={() => nav("/dashboard")}
              className="bg-gray-700 px-3 py-2 rounded"
            >
              Back
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onNextMatch}
            className="bg-indigo-600 px-3 py-2 rounded"
          >
            Play Next Match
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Matches</h2>
            <div className="space-y-3">
              {matches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={{ ...m, result: m.result ? { ...m.result, winnerName: m.result.winnerName } : null }}
                  onPlay={onPlay}
                />
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center text-white/90 p-2 bg-gray-900 rounded"
                >
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-400">
                      P: {t.played} W: {t.wins} L: {t.losses} T: {t.ties}
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
        </div>

        {selectedMatchId && (
          <div className="mt-6 bg-gray-800 p-4 rounded">
            <h3 className="text-xl font-semibold mb-3">Play Match</h3>
            <MatchForm
              match={matches.find((m) => m.id === selectedMatchId)}
              onSave={onSaveMatch}
              teamStatsGlobal={teamStats}
              oversPerInnings={oversPerInnings}
              maxWickets={maxWickets}
            />
          </div>
        )}
      </div>
    </div>
  );
}
