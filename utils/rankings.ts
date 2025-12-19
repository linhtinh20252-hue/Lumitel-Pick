
import { Match, Pair, Standing, MatchStage } from '../types';

export const calculateStandings = (pairs: Pair[], matches: Match[]): Standing[] => {
  const stats: Record<string, Omit<Standing, 'rank'>> = {};

  pairs.forEach(p => {
    stats[p.id] = {
      pairId: p.id,
      pairName: p.name,
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0
    };
  });

  matches.filter(m => m.isCompleted).forEach(m => {
    const sA = stats[m.pairAId];
    const sB = stats[m.pairBId];
    if (!sA || !sB) return;

    sA.played++;
    sB.played++;
    sA.pointsFor += m.scoreA || 0;
    sA.pointsAgainst += m.scoreB || 0;
    sB.pointsFor += m.scoreB || 0;
    sB.pointsAgainst += m.scoreA || 0;

    if ((m.scoreA || 0) > (m.scoreB || 0)) {
      sA.wins++;
      sB.losses++;
    } else {
      sB.wins++;
      sA.losses++;
    }
  });

  const standings = Object.values(stats).map(s => ({
    ...s,
    pointDiff: s.pointsFor - s.pointsAgainst,
    rank: 0
  }));

  // Ranking Logic:
  // 1. Wins
  // 2. Point Diff
  // 3. Points For
  // 4. Head-to-head (simplification: we sort by the first 3 primarily here)
  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    return b.pointsFor - a.pointsFor;
  });

  return standings.map((s, idx) => ({ ...s, rank: idx + 1 }));
};
