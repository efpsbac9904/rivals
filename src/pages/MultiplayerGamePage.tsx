import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import Timer from '../components/Timer';
import { Flag, CheckCircle, Users, Bot } from 'lucide-react';

const MultiplayerGamePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    problemCount,
    timePerProblem,
    elapsedTime,
    setElapsedTime,
    isGameActive,
    setIsGameActive,
    updatePlayerScore,
    updateBotScores,
    resetGame
  } = useMultiplayer();

  const [countdown, setCountdown] = useState(5);
  const [showCountdown, setShowCountdown] = useState(true);
  const [playerInputs, setPlayerInputs] = useState<{[key: string]: number | ''}>({});
  const [finishedPlayers, setFinishedPlayers] = useState<Set<string>>(new Set());
  const [botsFinished, setBotsFinished] = useState(false);

  useEffect(() => {
    if (players.length === 0 || !isGameActive) {
      navigate('/multiplayer-setup');
    }
  }, [players, isGameActive, navigate]);

  useEffect(() => {
    // Initialize player inputs for human players only
    const humanPlayers = players.filter(p => !p.isBot);
    const initialInputs: {[key: string]: number | ''} = {};
    humanPlayers.forEach(player => {
      initialInputs[player.id] = '';
    });
    setPlayerInputs(initialInputs);
  }, [players]);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      
      // Start bot timer - bots will finish after some time
      const botFinishTime = (problemCount * timePerProblem * 0.7) + Math.random() * (problemCount * timePerProblem * 0.4);
      setTimeout(() => {
        updateBotScores();
        setBotsFinished(true);
      }, botFinishTime * 1000);
    }
  }, [countdown, showCountdown]);

  const handlePlayerFinish = (playerId: string) => {
    const correctAnswers = playerInputs[playerId];
    if (typeof correctAnswers === 'number') {
      updatePlayerScore(playerId, correctAnswers);
      setFinishedPlayers(prev => new Set([...prev, playerId]));
      
      // Check if all human players finished
      const humanPlayers = players.filter(p => !p.isBot);
      if (finishedPlayers.size + 1 >= humanPlayers.length && botsFinished) {
        setTimeout(() => {
          navigate('/multiplayer-results');
        }, 1000);
      }
    }
  };

  useEffect(() => {
    // Check if game should end when bots finish
    const humanPlayers = players.filter(p => !p.isBot);
    if (botsFinished && finishedPlayers.size >= humanPlayers.length) {
      setTimeout(() => {
        navigate('/multiplayer-results');
      }, 1000);
    }
  }, [botsFinished, finishedPlayers.size, players, navigate]);

  const handleInputChange = (playerId: string, value: string) => {
    const numValue = parseInt(value);
    if (value === '') {
      setPlayerInputs(prev => ({ ...prev, [playerId]: '' }));
    } else if (!isNaN(numValue) && numValue >= 0 && numValue <= problemCount) {
      setPlayerInputs(prev => ({ ...prev, [playerId]: numValue }));
    }
  };

  const handleGiveUp = () => {
    setIsGameActive(false);
    resetGame();
    navigate('/multiplayer-setup');
  };

  const humanPlayers = players.filter(p => !p.isBot);
  const botPlayers = players.filter(p => p.isBot);

  if (showCountdown) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-12 text-center shadow-xl transform scale-150">
          <div className="text-6xl font-bold mb-4 text-blue-600">
            {countdown}
          </div>
          <p className="text-gray-600">Get ready to compete against {botPlayers.length} AI opponents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Local Competition</h1>
            <Timer 
              isRunning={isGameActive && !showCountdown} 
              elapsedTime={elapsedTime}
              onTimeUpdate={setElapsedTime}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {problemCount} problems • {timePerProblem}s per problem • 1 human vs {botPlayers.length} AI bots
          </div>
        </div>
        
        <div className="p-6">
          {/* Bot Status */}
          {botPlayers.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-100">
              <div className="flex items-center mb-2">
                <Bot className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-800">AI Opponents Status</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {botPlayers.map((bot) => (
                  <div key={bot.id} className="flex items-center bg-white rounded-lg p-2">
                    <img 
                      src={bot.character?.avatar}
                      alt={bot.name}
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{bot.name}</div>
                      <div className="text-xs text-gray-600">
                        {bot.isFinished ? `Score: ${bot.score}` : 'Competing...'}
                      </div>
                    </div>
                    {bot.isFinished && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Solving Problems...</h2>
            <p className="text-gray-600 mb-6">
              Work on your problems while the AI opponents compete automatically. When finished, enter your correct answers below and click "Finish".
            </p>
            
            <div className="flex justify-between mb-6">
              <button
                onClick={handleGiveUp}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium flex items-center"
              >
                <Flag className="w-4 h-4 mr-1" />
                End Game
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {humanPlayers.map((player) => (
                <div 
                  key={player.id}
                  className={`bg-white rounded-lg p-4 border-2 transition-all ${
                    finishedPlayers.has(player.id) 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{player.name}</h3>
                      {finishedPlayers.has(player.id) && (
                        <span className="text-sm text-green-600 font-medium">Finished!</span>
                      )}
                    </div>
                  </div>
                  
                  {!finishedPlayers.has(player.id) ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct answers (out of {problemCount})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={problemCount}
                          value={playerInputs[player.id]}
                          onChange={(e) => handleInputChange(player.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`0 - ${problemCount}`}
                        />
                      </div>
                      
                      <button
                        onClick={() => handlePlayerFinish(player.id)}
                        disabled={playerInputs[player.id] === ''}
                        className={`w-full py-2 rounded-md font-medium text-white flex items-center justify-center ${
                          playerInputs[player.id] !== '' 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finish
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">
                        Score: {player.score}
                      </p>
                      <p className="text-sm text-gray-600">
                        Correct: {player.correctAnswers}/{problemCount}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {botsFinished && humanPlayers.some(p => !finishedPlayers.has(p.id)) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-yellow-800">
                  All AI opponents have finished! Submit your results to see the final rankings.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Game Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Problems:</span> {problemCount}
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Time Elapsed:</span> {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Human Players:</span> {finishedPlayers.size}/{humanPlayers.length} finished
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">AI Bots:</span> {botsFinished ? 'All finished' : 'Competing...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGamePage;