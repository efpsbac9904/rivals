import { UserRanking } from '../types/ranking';
import { calculateLevel } from './xpSystem';

const mockNames = [
  '学習マスター', 'クイズキング', '知識の探求者', 'スピードラーナー', '集中力の達人',
  '問題解決のプロ', '記憶の魔術師', '論理思考の天才', '創造的思考家', '分析のエキスパート',
  '効率学習者', '継続の力', '挑戦者', '向上心の塊', '努力の結晶',
  '知恵の泉', '洞察力の持ち主', '理解の達人', '応用力の鬼', '基礎固めの王',
  '復習の鬼', '予習の達人', 'ノート魔人', '暗記のプロ', '理解重視派'
];

const generateMockUser = (id: string, baseXP: number): UserRanking => {
  const xp = baseXP + Math.floor(Math.random() * 200) - 100; // ±100のランダム性
  return {
    id,
    name: mockNames[Math.floor(Math.random() * mockNames.length)],
    xp: Math.max(0, xp),
    level: calculateLevel(Math.max(0, xp)),
    rank: 0, // Will be calculated later
    avatar: `https://images.pexels.com/photos/${1000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${1000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`
  };
};

export const generateMockRankings = (userXP: number, userName: string): UserRanking[] => {
  const rankings: UserRanking[] = [];
  
  // Add current user
  rankings.push({
    id: 'current-user',
    name: userName,
    xp: userXP,
    level: calculateLevel(userXP),
    rank: 0,
    isCurrentUser: true
  });
  
  // Generate users with higher XP (for top rankings)
  for (let i = 0; i < 15; i++) {
    const baseXP = userXP + 100 + (i * 50) + Math.floor(Math.random() * 300);
    rankings.push(generateMockUser(`top-${i}`, baseXP));
  }
  
  // Generate users with similar XP (for nearby rankings)
  for (let i = 0; i < 10; i++) {
    const baseXP = userXP + Math.floor(Math.random() * 200) - 100;
    rankings.push(generateMockUser(`nearby-${i}`, baseXP));
  }
  
  // Generate users with lower XP
  for (let i = 0; i < 20; i++) {
    const baseXP = Math.max(0, userXP - 50 - (i * 30) - Math.floor(Math.random() * 200));
    rankings.push(generateMockUser(`lower-${i}`, baseXP));
  }
  
  // Sort by XP (descending) and assign ranks
  rankings.sort((a, b) => b.xp - a.xp);
  rankings.forEach((user, index) => {
    user.rank = index + 1;
  });
  
  return rankings;
};