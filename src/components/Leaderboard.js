import { useState, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, ChevronUp, ChevronDown, Shield, Star, Crown, Medal, Flame } from 'lucide-react';

const PremiumLeaderboard = () => {
  // Component state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [animationStage, setAnimationStage] = useState('loading');
  const [userRank] = useState(8);
  
  // Refs for scroll animations
  const leaderboardRef = useRef(null);

  // Realistic Telegram usernames generator
  const generateRealisticUsername = () => {
    const prefixes = ['alex', 'maria', 'john', 'anna', 'david', 'sarah', 'mike', 'lisa', 'chen', 'kate', 
                     'ryan', 'maya', 'tom', 'sara', 'max', 'luna', 'jake', 'zoe', 'nick', 'emma',
                     'leo', 'iris', 'sam', 'nova', 'ray', 'ivy', 'kai', 'ava', 'eli', 'mia'];
    const suffixes = ['_dev', '_ai', '_labs', '_tech', '_pro', '_x', '_21', '_99', '_zero', '_one',
                     '_sage', '_mind', '_flow', '_wave', '_sky', '_neo', '_arc', '_hub', '_bin', '_kit'];
    const numbers = ['7', '9', '12', '23', '42', '88', '101', '777', '2024', '369'];
    
    const base = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    const rand = Math.random();
    if (rand < 0.4) {
      return base + suffixes[Math.floor(Math.random() * suffixes.length)];
    } else if (rand < 0.7) {
      return base + numbers[Math.floor(Math.random() * numbers.length)];
    } else {
      return base + Math.floor(Math.random() * 99);
    }
  };

  // Generate tier system with realistic progression
  const getTierInfo = (rank) => {
    if (rank <= 3) return { 
      tier: 'Legendary', 
      icon: Crown, 
      color: 'text-yellow-400',
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-400/50'
    };
    if (rank <= 10) return { 
      tier: 'Master', 
      icon: Medal, 
      color: 'text-purple-400',
      bgColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/50'
    };
    if (rank <= 25) return { 
      tier: 'Expert', 
      icon: Trophy, 
      color: 'text-blue-400',
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-400/50'
    };
    if (rank <= 50) return { 
      tier: 'Advanced', 
      icon: Shield, 
      color: 'text-green-400',
      bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-400/50'
    };
    return { 
      tier: 'Rising', 
      icon: Star, 
      color: 'text-gray-400',
      bgColor: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20',
      borderColor: 'border-gray-400/50'
    };
  };

  // Generate realistic leaderboard data
  const generateLeaderboardData = () => {
    const data = [];
    for (let i = 1; i <= 15; i++) {
      const basePoints = Math.max(15000 - (i * 800) + Math.random() * 400, 1000);
      const accuracy = Math.max(85 + Math.random() * 12, 75);
      const labels = Math.floor(basePoints / 10) + Math.floor(Math.random() * 500);
      const streak = Math.floor(Math.random() * 25) + 1;
      const tierInfo = getTierInfo(i);
      
      data.push({
        id: i,
        rank: i,
        username: generateRealisticUsername(),
        points: Math.floor(basePoints),
        accuracy: parseFloat(accuracy.toFixed(1)),
        labelsCompleted: labels,
        currentStreak: streak,
        tier: tierInfo,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=transparent`,
        isOnline: Math.random() > 0.3,
        weeklyGrowth: Math.floor(Math.random() * 40) - 10,
        totalReviews: Math.floor(Math.random() * 200) + 50
      });
    }
    return data;
  };

  // Initialize data
  useEffect(() => {
    setAnimationStage('loading');
    const timer = setTimeout(() => {
      setLeaderboardData(generateLeaderboardData());
      setAnimationStage('loaded');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  // Haptic feedback simulation
  const triggerHaptic = () => {
    // Simplified haptic feedback - can be enhanced for Telegram WebApp
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handlePeriodChange = (period) => {
    triggerHaptic();
    setSelectedPeriod(period);
    setAnimationStage('loading');
  };

  // Get podium styling
  const getPodiumHeight = (rank) => {
    switch(rank) {
      case 1: return 'h-24';
      case 2: return 'h-20';
      case 3: return 'h-16';
      default: return 'h-16';
    }
  };

  const getPodiumOrder = (rank) => {
    switch(rank) {
      case 1: return 'order-2';
      case 2: return 'order-1';
      case 3: return 'order-3';
      default: return 'order-4';
    }
  };

  // Loading state
  if (animationStage === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6 bg-gray-900 min-h-screen">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
              <div className="w-16 h-8 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);
  const currentUser = leaderboardData.find(user => user.rank === userRank);

  return (
    <div ref={leaderboardRef} className="w-full max-w-md mx-auto p-4 space-y-6 bg-gray-900 min-h-screen">
      {/* Header with Period Selector */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin-slow">
              <Trophy className="text-yellow-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Leaderboard</h2>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="text-green-400" size={16} />
            <span className="text-green-400">Live</span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="grid grid-cols-3 gap-2">
          {['daily', 'weekly', 'monthly'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`p-2 rounded-lg text-sm font-medium transition-all transform hover:scale-95 ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/50 text-white'
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Top 3 Podium */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-purple-500/5 to-blue-500/5" />

        <div className="relative z-10">
          <h3 className="text-center text-lg font-semibold text-white mb-6 flex items-center justify-center gap-2">
            <Crown className="text-yellow-400" />
            Top Performers
          </h3>

          {/* Podium Display */}
          <div className="flex items-end justify-center gap-4 mb-6">
            {topThree.map((user) => {
              const IconComponent = user.tier.icon;
              return (
                <div
                  key={user.id}
                  className={`flex flex-col items-center ${getPodiumOrder(user.rank)} transform transition-transform hover:scale-105`}
                  onClick={() => triggerHaptic()}
                >
                  {/* Crown for #1 */}
                  {user.rank === 1 && (
                    <div className="mb-2 animate-bounce">
                      <Crown className="text-yellow-400" size={32} />
                    </div>
                  )}

                  {/* User Avatar */}
                  <div className={`relative mb-2 ${user.rank === 1 ? 'w-20 h-20' : 'w-16 h-16'}`}>
                    <div className={`w-full h-full rounded-full ${user.tier.bgColor} p-1 ${
                      user.rank === 1 ? 'shadow-lg shadow-yellow-400/50' : ''
                    }`}>
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-full h-full rounded-full bg-gray-800"
                      />
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900" />
                      )}
                    </div>
                    
                    {/* Rank Badge */}
                    <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.rank === 1 ? 'bg-yellow-400 text-black' :
                      user.rank === 2 ? 'bg-gray-300 text-black' :
                      'bg-orange-400 text-white'
                    }`}>
                      {user.rank}
                    </div>
                  </div>

                  {/* Username */}
                  <p className={`font-semibold text-center mb-1 ${
                    user.rank === 1 ? 'text-yellow-400 text-lg' : 'text-white'
                  }`}>
                    {user.username}
                  </p>

                  {/* Points */}
                  <p className="text-sm text-gray-300 mb-2">
                    {user.points.toLocaleString()} pts
                  </p>

                  {/* Podium Base */}
                  <div className={`w-20 ${getPodiumHeight(user.rank)} ${user.tier.bgColor} rounded-t-lg flex items-center justify-center transition-all duration-500`}>
                    <IconComponent className={user.tier.color} size={20} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats for Top 3 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {topThree.map((user) => (
              <div key={user.id} className="text-center">
                <div className="text-white font-semibold">{user.accuracy}%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remaining Rankings List */}
      <div className="space-y-3">
        {remaining.map((user) => {
          const IconComponent = user.tier.icon;
          return (
            <div
              key={user.id}
              className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 relative overflow-hidden transition-all hover:bg-gray-700/50 hover:scale-102 ${
                user.rank === userRank ? 'ring-2 ring-yellow-400/50' : ''
              }`}
              onClick={() => triggerHaptic()}
            >
              {/* User indicator */}
              {user.rank === userRank && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400/20 rounded-lg text-xs text-yellow-400 font-medium animate-pulse">
                  You
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <span className="font-bold text-white">{user.rank}</span>
                </div>

                {/* Avatar */}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full ${user.tier.bgColor} p-0.5`}>
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full rounded-full bg-gray-800"
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-gray-900" />
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white truncate">{user.username}</p>
                    <IconComponent className={user.tier.color} size={16} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{user.labelsCompleted} labels</span>
                    <span>{user.accuracy}% acc</span>
                    {user.currentStreak > 5 && (
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame size={12} />
                        <span>{user.currentStreak}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Points & Growth */}
                <div className="text-right">
                  <div className="font-bold text-white">
                    {user.points.toLocaleString()}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    user.weeklyGrowth > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {user.weeklyGrowth > 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    <span>{Math.abs(user.weeklyGrowth)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current User Position (if not in top 15) */}
      {userRank > 15 && currentUser && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-yellow-400">#{userRank}</div>
              <div>
                <p className="font-semibold text-white">Your Position</p>
                <p className="text-sm text-gray-300">{currentUser.points.toLocaleString()} points</p>
              </div>
            </div>
            <button className="bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-lg text-sm text-white hover:bg-gray-700/50 transition-colors">
              View More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumLeaderboard;