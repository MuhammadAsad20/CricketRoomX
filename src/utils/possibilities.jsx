// src/utils/possibilities.js
import { calculateNRR } from "./nrr";

/**
 * Simulate minimal batting runs required so that team's NRR >= targetNRR,
 * assuming battingBalls (integer total balls) will be faced by the team.
 * This is a numeric search (binary).
 *
 * teamStats: current totals for the team (runsFor, ballsFaced, runsAgainst, ballsBowled)
 * opponentAssumed: object representing opponent change to runsAgainst/ballsBowled (usually opponent innings)
 *
 * Returns minimal runs (integer) or null if not reachable within reasonable bounds.
 */
export function neededRunsToReachNRR(teamStats, targetNRR, battingBalls) {
  // quick check
  const currentNRR = calculateNRR(teamStats);
  if (currentNRR >= targetNRR) return 0;

  // We will search up to a high bound (e.g., +1000 runs)
  let lo = 0;
  let hi = 5000;
  let answer = null;

  for (let iter = 0; iter < 40; iter++) {
    const mid = Math.floor((lo + hi) / 2);
    const sim = {
      runsFor: (teamStats.runsFor || 0) + mid,
      ballsFaced: (teamStats.ballsFaced || 0) + battingBalls,
      runsAgainst: (teamStats.runsAgainst || 0),
      ballsBowled: (teamStats.ballsBowled || 0)
    };
    const nrr = calculateNRR(sim);
    if (nrr >= targetNRR) {
      answer = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  return answer;
}

/**
 * Needed opponent limitation (if bowling first) — minimal opponent runs to restrict to
 * so after match team's NRR >= targetNRR. We assume opponent faces oppBalls and team bowls oppBalls.
 */
export function neededOpponentLimitForNRR(teamStats, targetNRR, opponentBalls) {
  let lo = 0, hi = 5000;
  let answer = null;
  for (let iter = 0; iter < 40; iter++) {
    const mid = Math.floor((lo + hi) / 2);
    const sim = {
      runsFor: (teamStats.runsFor || 0),
      ballsFaced: (teamStats.ballsFaced || 0),
      runsAgainst: (teamStats.runsAgainst || 0) + mid,
      ballsBowled: (teamStats.ballsBowled || 0) + opponentBalls
    };
    const nrr = calculateNRR(sim);
    if (nrr >= targetNRR) {
      answer = mid;
      hi = mid - 1;
    } else lo = mid + 1;
  }
  return answer;
}
