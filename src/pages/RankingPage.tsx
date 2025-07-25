import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRanking, RankingData } from '../types/ranking';
import { generateMockRankings } from '../utils/mockRankings';
import { calculateLevel, getProgressToNextLevel } from '../utils/xpSystem';
import RankingDisplay from '../components/RankingDisplay';
import { ArrowLeft, TrendingUp, Users, Target } from 'lucide-react';

const RankingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAppContext();
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'nearby'>('global');

  useEffect(() => {
    // Generate mock rankings based on user's current XP
    const userXP = userProfile.competitions * 50 + userProfile.victories * 25 + userProfile.accuracy * 2;
    const allRankings = generateMockRankings(userXP, userProfile.name);
    
    const currentUser = allRankings.find(r => r.isCurrentUser)!;
    const userRank = currentUser.rank;
    
    // Top 20 rankings
    const topRankings = allRankings.slice(0, 20);
    
    // Nearby rankings (±5 positions around user)
    const nearbyStart = Math.max(0, userRank - 6);
    const nearbyEnd = Math.min(allRankings.length, userRank + 5);
    const nearbyRankings = allRankings.slice(nearbyStart, nearbyEnd);
    
    setRankingData({
      currentUser,
      topRankings,
      nearbyRankings,
      totalUsers: allRankings.length
    });
  }, [userProfile]);

  if (!rankingData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { currentUser } = rankingData;
  const levelProgress = getProgressToNextLevel(currentUser.xp);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        ホームに戻る
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ランキング</h1>
        <p className="text-gray-600">
          全体のランキングを確認して、さらなる高みを目指しましょう！
        </p>
      </div>

      {/* User Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{currentUser.name}</h2>
            <p className="text-blue-100">Level {currentUser.level}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">#{currentUser.rank}</div>
            <div className="text-blue-100">/ {rankingData.totalUsers}人中</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{currentUser.xp.toLocaleString()}</div>
            <div className="text-sm text-blue-100">総XP</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{levelProgress.current}</div>
            <div className="text-sm text-blue-100">次のレベルまで</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{Math.round(levelProgress.percentage)}%</div>
            <div className="text-sm text-blue-100">進捗</div>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${levelProgress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'global'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Trophy className="h-5 w-5 mr-2" />
          グローバルランキング
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'nearby'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="h-5 w-5 mr-2" />
          周辺ランキング
        </button>
      </div>

      {/* Rankings Display */}
      {activeTab === 'global' ? (
        <RankingDisplay
          rankings={rankingData.topRankings}
          title="トップランキング"
          showTop={20}
        />
      ) : (
        <RankingDisplay
          rankings={rankingData.nearbyRankings}
          title="あなたの周辺ランキング"
          showTop={15}
        />
      )}

      {/* Motivation Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
        <div className="flex items-center mb-4">
          <Target className="h-6 w-6 text-green-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-800">次の目標</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">レベルアップまで</h4>
            <p className="text-2xl font-bold text-green-600">
              {levelProgress.needed - levelProgress.current} XP
            </p>
            <p className="text-sm text-gray-600">
              あと{Math.ceil((levelProgress.needed - levelProgress.current) / 50)}回の競技でレベルアップ！
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">ランクアップまで</h4>
            {currentUser.rank > 1 ? (
              <>
                <p className="text-2xl font-bold text-blue-600">
                  {rankingData.topRankings[currentUser.rank - 2]?.xp - currentUser.xp} XP
                </p>
                <p className="text-sm text-gray-600">
                  #{currentUser.rank - 1}位まであと少し！
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-yellow-600">
                🎉 あなたが1位です！
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;