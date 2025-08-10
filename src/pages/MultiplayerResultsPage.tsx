import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useAppContext } from '../context/AppContext';
import { calculateXPGain, calculateLevel } from '../utils/xpSystem';
import { ArrowLeft, Trophy, Medal, RefreshCw, Users, Clock, Target, Bot, Crown } from 'lucide-react';

const MultiplayerResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useAppContext();
  const {
    players,
    elapsedTime,
    problemCount,
    timePerProblem,
    resetGame
  } = useMultiplayer();

  useEffect(() => {
    if (players.length === 0 || !players.some(p => p.isFinished)) {
      navigate('/multiplayer-setup');
      return;
    }

    // Update user profile based on human player performance
    const mainPlayer = players.find(p => !p.isBot && p.isFinished);
    if (mainPlayer && mainPlayer.isFinished) {
      const playerWon = players.every(p => p.id === mainPlayer.id || mainPlayer.score >= p.score);
      
      // Calculate XP gains for multiplayer competition
      const gains = calculateXPGain(
        mainPlayer.score,
        mainPlayer.completionTime || elapsedTime,
        problemCount * timePerProblem,
        playerWon,
        players.length
      );
      
      const totalXPGain = gains.reduce((sum, gain) => sum + gain.amount, 0);
      
      setUserProfile(prev => ({
        ...prev,
        competitions: prev.competitions + 1,
        victories: playerWon ? prev.victories + 1 : prev.victories,
        accuracy: Math.round((prev.accuracy + (mainPlayer.correctAnswers / problemCount * 100)) / 2),
        streak: playerWon ? prev.streak + 1 : 0,
        xp: prev.xp + totalXPGain,
        level: calculateLevel(prev.xp + totalXPGain)
      }));
    }
  }, [players, setUserProfile, navigate]);

  if (players.length === 0) return null;

  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const humanPlayer = players.find(p => !p.isBot);
  const humanRank = sortedPlayers.findIndex(p => !p.isBot) + 1;

  const handleRematch = () => {
    resetGame();
    navigate('/multiplayer-setup');
  };

  const handleBackToHome = () => {
    resetGame();
    navigate('/');
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Trophy className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Medal className="h-8 w-8 text-amber-600" />;
      default:
        return <div className="h-8 w-8 flex items-center justify-center text-gray-500 font-bold text-xl">#{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-gray-100 to-gray-300';
    }
  };

  const getPlayerIcon = (player: any) => {
    if (player.isBot && player.character) {
      return (
        <img 
          src={player.character.avatar}
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="h-6 w-6 text-blue-600" />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={handleBackToHome}
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to home
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className={`p-8 text-center bg-gradient-to-r ${
          winner.isBot ? 'from-purple-500 to-purple-700' : getRankColor(1)
        }`}>
          <div className="flex justify-center mb-4">
            {winner.isBot ? (
              <Bot className="h-16 w-16 text-white" />
            ) : (
              <Crown className="h-16 w-16 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {winner.isBot ? `${winner.name} (AI) Wins!` : `${winner.name} Wins!`}
          </h1>
          <p className="text-xl text-white">
            Final Score: {winner.score} points
          </p>
          {humanPlayer && (
            <p className="text-lg text-white mt-2 opacity-90">
              You finished #{humanRank} out of {players.length} participants
            </p>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Final Results</h2>
          
          <div className="space-y-4 mb-8">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center p-6 rounded-lg border-2 transition-all ${
                  !player.isBot
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : index === 0 
                      ? 'bg-yellow-50 border-yellow-200 shadow-md' 
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center mr-6">
                  {getRankIcon(index + 1)}
                </div>
                
                <div className="flex items-center flex-1">
                  <div className="mr-4">
                    {getPlayerIcon(player)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      {player.name} {player.isBot ? '(AI)' : '(You)'}
                    </h3>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mt-2">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        <span>Score: {player.score}</span>
                      </div>
                      <div className="flex items-center">
                        <Medal className="w-4 h-4 mr-1" />
                        <span>Correct: {player.correctAnswers}/{problemCount}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          Time: {player.completionTime ? 
                            `${Math.floor(player.completionTime / 60)}:${(player.completionTime % 60).toString().padStart(2, '0')}` :
                            'Not finished'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-lg font-bold ${
                  !player.isBot
                    ? 'bg-blue-100 text-blue-800'
                    : index === 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Game Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{problemCount}</div>
                <div className="text-sm text-blue-700">Total Problems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-blue-700">Game Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(players.reduce((sum, p) => sum + p.score, 0) / players.length)}
                </div>
                <div className="text-sm text-blue-700">Average Score</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-gray-700 text-center">
                {humanRank === 1
                  ? `Congratulations! You defeated all ${players.filter(p => p.isBot).length} AI opponents!`
                  : humanRank <= 3
                    ? `Great performance! You finished in the top 3 against tough AI competition.`
                    : `Good effort! Keep practicing to improve your ranking against the AI opponents.`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleRematch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Play Again
            </button>
            
            <button
              onClick={handleBackToHome}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerResultsPage;