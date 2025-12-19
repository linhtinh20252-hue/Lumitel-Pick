
export interface Player {
  id: string;
  name: string;
}

export interface Pair {
  id: string;
  name: string;
  playerIds: string[]; // Store IDs of the 2 players
  groupId: 'A' | 'B' | null;
}

export enum MatchStage {
  GROUP_A = 'GROUP_A',
  GROUP_B = 'GROUP_B',
  SEMI_FINAL = 'SEMI_FINAL',
  THIRD_PLACE = 'THIRD_PLACE',
  FINAL = 'FINAL'
}

export interface Match {
  id: string;
  stage: MatchStage;
  pairAId: string;
  pairBId: string;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  isCompleted: boolean;
  label?: string;
  targetScore: number; // 11 or 15
}

export interface Standing {
  pairId: string;
  pairName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  rank: number;
}

export interface TournamentData {
  players: Player[];
  pairs: Pair[];
  matches: Match[];
  config: {
    pointsToWinGroup: number;
    pointsToWinKnockout: number;
    winByTwo: boolean;
  };
}
