
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

    // Tính điểm số dựa trên sets nếu có, nếu không dùng scoreA/scoreB cũ
    if (m.sets && m.sets.length > 0) {
      m.sets.forEach(set => {
        if (set.a === 0 && set.b === 0) return;
        sA.pointsFor += set.a;
        sA.pointsAgainst += set.b;
        sB.pointsFor += set.b;
        sB.pointsAgainst += set.a;
      });
    } else {
      sA.pointsFor += m.scoreA || 0;
      sA.pointsAgainst += m.scoreB || 0;
      sB.pointsFor += m.scoreB || 0;
      sB.pointsAgainst += m.scoreA || 0;
    }

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

  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    return b.pointsFor - a.pointsFor;
  });

  return standings.map((s, idx) => ({ ...s, rank: idx + 1 }));
};
