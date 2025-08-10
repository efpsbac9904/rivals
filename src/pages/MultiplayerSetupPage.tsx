import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import { characterData } from '../data/characters';
import { Character } from '../types/characters';
import { ArrowLeft, Play, Users, Clock, ListChecks, Edit2, Check, X, Bot, Plus, Minus } from 'lucide-react';

const MultiplayerSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    setPlayers,
    botCount,
    setBotCount,
    selectedBots,
    setSelectedBots,
    problemCount,
    setProblemCount,
    timePerProblem,
    setTimePerProblem,
    setIsGameActive,
    resetGame
  } = useMultiplayer();

  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(timePerProblem.toString());

  const handleStartGame = () => {
    // Create final player list with human player and selected bots
    const humanPlayer = players.find(p => !p.isBot) || players[0];
    const botPlayers = selectedBots.map((bot, index) => ({
      id: `bot-${index}`,
      name: bot.name,
      isBot: true,
      score: 0,
      progress: 0,
      correctAnswers: 0,
      isFinished: false,
      character: {
        id: bot.id,
        name: bot.name,
        avatar: bot.avatar,
        color: bot.color,
        stats: bot.stats
      }
    }));
    
    setPlayers([humanPlayer, ...botPlayers]);
    resetGame();
    setIsGameActive(true);
    navigate('/multiplayer-game');
  };

  const handleEditPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player && !player.isBot) {
      setEditingPlayer(playerId);
      setEditName(player.name);
    }
  };

  const handleSavePlayerName = () => {
    if (editName.trim() && editingPlayer) {
      setPlayers(prev => prev.map(player => 
        player.id === editingPlayer 
          ? { ...player, name: editName.trim() }
          : player
      ));
      setEditingPlayer(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setEditName('');
  };

  const handleBotCountChange = (newCount: number) => {
    setBotCount(newCount);
    if (selectedBots.length > newCount) {
      setSelectedBots(selectedBots.slice(0, newCount));
    }
  };

  const handleBotToggle = (bot: Character) => {
    const isSelected = selectedBots.some(b => b.id === bot.id);
    
    if (isSelected) {
      setSelectedBots(selectedBots.filter(b => b.id !== bot.id));
    } else if (selectedBots.length < botCount) {
      setSelectedBots([...selectedBots, bot]);
    }
  };

  const handleRandomBots = () => {
    const shuffled = [...characterData].sort(() => Math.random() - 0.5);
    setSelectedBots(shuffled.slice(0, botCount));
  };

  const handleProblemCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 50) {
      setProblemCount(value);
    }
  };

  const handleTimePresetClick = (seconds: number) => {
    setTimePerProblem(seconds);
    setIsCustomTime(false);
  };

  const handleCustomTimeClick = () => {
    setIsCustomTime(true);
    setCustomTime(timePerProblem.toString());
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomTime(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setTimePerProblem(numValue);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to home
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Local Multiplayer Setup</h1>
        <p className="text-gray-600">
          Set up a competition between two players on the same device
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Users className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Human Player</h2>
        </div>

        <div className="mb-8">
          {players.filter(p => !p.isBot).map((player) => (
            <div key={player.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  {editingPlayer === player.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleSavePlayerName()}
                    />
                  ) : (
                    <h3 className="font-medium text-gray-800">{player.name}</h3>
                  )}
                </div>
                <div className="flex space-x-2">
                  {editingPlayer === player.id ? (
                    <>
                      <button
                        onClick={handleSavePlayerName}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditPlayer(player.id)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bot Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bot className="h-6 w-6 text-purple-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">AI Opponents</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Bot count:</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleBotCountChange(Math.max(0, botCount - 1))}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={botCount <= 0}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{botCount}</span>
                <button
                  onClick={() => handleBotCountChange(Math.min(4, botCount + 1))}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={botCount >= 4}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {botCount > 0 && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  Selected: {selectedBots.length} / {botCount}
                </p>
                <button
                  onClick={handleRandomBots}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Random Selection
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                {characterData.map((bot) => {
                  const isSelected = selectedBots.some(b => b.id === bot.id);
                  const canSelect = selectedBots.length < botCount || isSelected;
                  
                  return (
                    <div
                      key={bot.id}
                      className={`relative rounded-lg overflow-hidden shadow-sm transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'ring-2 ring-offset-1 scale-105' 
                          : canSelect 
                            ? 'hover:shadow-md hover:scale-[1.02]' 
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{ 
                        ringColor: isSelected ? bot.color : 'transparent'
                      }}
                      onClick={() => canSelect && handleBotToggle(bot)}
                    >
                      <div className="relative h-20 overflow-hidden">
                        <img 
                          src={bot.avatar} 
                          alt={bot.name} 
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <h3 className="absolute bottom-1 left-2 text-white font-bold text-xs">
                          {bot.name}
                        </h3>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-md">
                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedBots.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-800 mb-2 text-sm">Selected Bots:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBots.map((bot) => (
                      <div 
                        key={bot.id}
                        className="flex items-center px-2 py-1 bg-white rounded-full shadow-sm border text-sm"
                      >
                        <img 
                          src={bot.avatar} 
                          alt={bot.name}
                          className="w-4 h-4 rounded-full mr-1 object-cover"
                        />
                        <span className="font-medium">{bot.name}</span>
                        <button
                          onClick={() => handleBotToggle(bot)}
                          className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-4">
              <ListChecks className="w-5 h-5 mr-2 text-gray-700" />
              <h3 className="text-lg font-medium text-gray-900">Number of Problems</h3>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={problemCount}
                onChange={handleProblemCountChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="number"
                min="1"
                max="50"
                value={problemCount}
                onChange={handleProblemCountChange}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-center"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>1</span>
              <span>problems</span>
              <span>50</span>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-gray-700" />
              <h3 className="text-lg font-medium text-gray-900">Time per Problem</h3>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[30, 60, 90, 120].map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => handleTimePresetClick(seconds)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    timePerProblem === seconds && !isCustomTime
                      ? 'bg-blue-100 text-blue-700 border-blue-300 border'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {seconds} sec
                </button>
              ))}
            </div>
            
            <button
              onClick={handleCustomTimeClick}
              className={`flex items-center mb-4 text-sm ${
                isCustomTime ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {isCustomTime ? (
                <div className="flex items-center w-full">
                  <span className="mr-2">Custom:</span>
                  <input
                    type="number"
                    min="5"
                    value={customTime}
                    onChange={handleCustomTimeChange}
                    className="w-20 px-2 py-1 border border-blue-300 rounded-md text-sm"
                    autoFocus
                  />
                  <span className="ml-2">seconds</span>
                </div>
              ) : (
                <span>Use custom time</span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">Game Summary</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• {problemCount} problems to solve</li>
            <li>• {timePerProblem} seconds per problem</li>
            <li>• Total time: {Math.floor((problemCount * timePerProblem) / 60)} min {(problemCount * timePerProblem) % 60} sec</li>
            <li>• Participants: 1 human player + {selectedBots.length} AI bots</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleStartGame}
            className="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Local Competition
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerSetupPage;