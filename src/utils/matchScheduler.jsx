// src/utils/matchScheduler.js

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * teams: array of team objects { id, name, logo }
 * rounds: integer >= 1
 *
 * This generates each pair R times. Each repeating pairing is treated as separate match.
 */
export const generateSchedule = (teams = [], rounds = 1) => {
  const matches = [];
  if (!teams || teams.length < 2) return matches;

  for (let r = 1; r <= rounds; r++) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Only store team IDs, never full object
        const teamA = (r % 2 === 1) ? teams[i].id : teams[j].id;
        const teamB = (r % 2 === 1) ? teams[j].id : teams[i].id;

        matches.push({
          id: uuid(),
          teamA,
          teamB,
          round: r,
          status: "upcoming", // upcoming | completed | final
          isFinal: false,
          toss: null,
          innings: [],
          result: null,
          createdAt: Date.now()
        });
      }
    }
  }

  return matches;
};

/**
 * generateFinalMatch: create a final between two team ids
 */
export const generateFinalMatch = (team1Id, team2Id) => {
  return {
    id: uuid(),
    teamA: team1Id,
    teamB: team2Id,
    round: "final",
    status: "upcoming",
    isFinal: true,
    toss: null,
    innings: [],
    result: null,
    createdAt: Date.now()
  };
};
