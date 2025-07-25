export interface UserRanking {
  id: string;
  name: string;
  xp: number;
  level: number;
  rank: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export interface XPGain {
  source: string;
  amount: number;
  description: string;
}

export interface RankingData {
  currentUser: UserRanking;
  topRankings: UserRanking[];
  nearbyRankings: UserRanking[];
  totalUsers: number;
}