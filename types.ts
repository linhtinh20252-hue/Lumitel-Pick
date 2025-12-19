
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

export interface SetScore {
  a: number;
  b: number;
}

export interface Match {
  id: string;
  stage: MatchStage;
  pairAId: string;
  pairBId: string;
  scoreA: number | null; // Số set thắng của đội A
  scoreB: number | null; // Số set thắng của đội B
  sets?: SetScore[];     // Điểm số chi tiết từng hiệp (set)
  winnerId: string | null;
  isCompleted: boolean;
  label?: string;
  targetScore: number;   // Điểm chạm: 11, 15, v.v.
  matchFormat: 1 | 3;    // Số trận: 1 hoặc 3 (Best of 3)
  winByTwo: boolean;     // Thắng cách biệt 2 điểm
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

export interface StageConfig {
  matchFormat: 1 | 3;
  targetScore: number;
  winByTwo: boolean;
}

export interface TournamentData {
  players: Player[];
  pairs: Pair[];
  matches: Match[];
  config: {
    group: StageConfig;
    knockout: StageConfig;
    isLocked: boolean; // Chốt thể lệ
  };
}
