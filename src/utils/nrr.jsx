// src/utils/nrr.js

// Convert "overs.balls" string or number to total balls.
// Accept inputs like "19.4" meaning 19 overs and 4 balls (so totalBalls = 19*6 + 4)
export function oversStringToBalls(oversInput) {
  if (oversInput == null) return 0;
  const s = String(oversInput).trim();
  if (s === "") return 0;
  if (!s.includes(".")) {
    const ov = parseInt(s || "0", 10);
    return isNaN(ov) ? 0 : ov * 6;
  }
  const parts = s.split(".");
  const overs = parseInt(parts[0] || "0", 10);
  const balls = parseInt(parts[1] || "0", 10);
  // clamp balls to 0..5
  const b = Math.max(0, Math.min(5, isNaN(balls) ? 0 : balls));
  return (isNaN(overs) ? 0 : overs * 6) + b;
}

export function ballsToOversString(balls) {
  const overs = Math.floor(balls / 6);
  const rem = balls % 6;
  return `${overs}.${rem}`;
}

/**
 * teamStats: {
 *   runsFor: number,
 *   ballsFaced: number,
 *   runsAgainst: number,
 *   ballsBowled: number
 * }
 */
export function calculateNRR(teamStats = {}) {
  const { runsFor = 0, ballsFaced = 0, runsAgainst = 0, ballsBowled = 0 } = teamStats;
  const oversFaced = ballsFaced / 6;
  const oversBowled = ballsBowled / 6;

  const runRateFor = oversFaced > 0 ? runsFor / oversFaced : 0;
  const runRateAgainst = oversBowled > 0 ? runsAgainst / oversBowled : 0;

  // NRR = runRateFor - runRateAgainst
  return runRateFor - runRateAgainst;
}
