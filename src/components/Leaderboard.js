import { useState, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, ChevronUp, ChevronDown, Shield, Star, Crown, Medal, Flame, Users, Zap, Target, Award } from 'lucide-react';

const PremiumLeaderboard = () => {
  // Component state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [animationStage, setAnimationStage] = useState('loading');
  const [totalUsers] = useState(Math.floor(Math.random() * (125000 - 120000) + 120000));
  const [userRank] = useState(Math.floor(Math.random() * (115000 - 110000) + 110000));
  
  // Refs for scroll animations
  const leaderboardRef = useRef(null);

  // More realistic and organic usernames
  const generateOrganicUsername = () => {
    const firstNames = [
      'alexandra', 'benjamin', 'charlotte', 'dominic', 'elizabeth', 'francisco', 'gabriella', 'harrison',
      'isabella', 'jonathan', 'katherine', 'leonardo', 'margaret', 'nathaniel', 'olivia', 'patricia',
      'quinton', 'rebecca', 'sebastian', 'theodore', 'valentina', 'william', 'ximena', 'zachary',
      'adriana', 'brandon', 'camila', 'diego', 'elena', 'fernando', 'gloria', 'hector',
      'irene', 'julian', 'karla', 'lorenzo', 'miranda', 'nicolas', 'octavio', 'paloma'
    ];
    
    const lastNames = [
      'anderson', 'brown', 'garcia', 'johnson', 'miller', 'davis', 'rodriguez', 'wilson',
      'martinez', 'taylor', 'thomas', 'hernandez', 'moore', 'martin', 'jackson', 'thompson',
      'white', 'lopez', 'lee', 'gonzalez', 'harris', 'clark', 'lewis', 'robinson',
      'walker', 'perez', 'hall', 'young', 'allen', 'sanchez', 'wright', 'king'
    ];
    
    const techSuffixes = [
      '_dev', '_ai', '_tech', '_labs', '_code', '_data', '_ml', '_crypto', '_web3', '_nft',
      '_digital', '_cloud', '_byte', '_pixel', '_neural', '_quantum', '_cyber', '_matrix'
    ];
    
    const yearSuffixes = ['21', '22', '23', '24', '2k', '2024', '99', '01', '07', '13'];
    
    const rand = Math.random();
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    
    if (rand < 0.3) {
      // First name + last name
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return firstName + '.' + lastName;
    } else if (rand < 0.5) {
      // First name + tech suffix
      return firstName + techSuffixes[Math.floor(Math.random() * techSuffixes.length)];
    } else if (rand < 0.7) {
      // First name + year
      return firstName + yearSuffixes[Math.floor(Math.random() * yearSuffixes.length)];
    } else {
      // First name + random numbers
      return firstName + Math.floor(Math.random() * 999);
    }
  };

  // Enhanced tier system with more visual appeal
  const getTierInfo = (rank) => {
    if (rank <= 3) return { 
      tier: 'Legendary', 
      icon: Crown, 
      color: 'text-yellow-300',
      bgColor: 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30',
      borderColor: 'border-yellow-400/60',
      glowColor: 'shadow-yellow-400/50'
    };
    if (rank <= 10) return { 
      tier: 'Master', 
      icon: Medal, 
      color: 'text-purple-300',
      bgColor: 'bg-gradient-to-r from-purple-400/30 to-pink-400/30',
      borderColor: 'border-purple-400/60',
      glowColor: 'shadow-purple-400/50'
    };
    if (rank <= 25) return { 
      tier: 'Expert', 
      icon: Trophy, 
      color: 'text-blue-300',
      bgColor: 'bg-gradient-to-r from-blue-400/30 to-cyan-400/30',
      borderColor: 'border-blue-400/60',
      glowColor: 'shadow-blue-400/50'
    };
    return { 
      tier: 'Pro', 
      icon: Star, 
      color: 'text-emerald-300',
      bgColor: 'bg-gradient-to-r from-emerald-400/30 to-green-400/30',
      borderColor: 'border-emerald-400/60',
      glowColor: 'shadow-emerald-400/50'
    };
  };

  // Generate realistic leaderboard data
  const generateLeaderboardData = () => {
    const data = [];
    for (let i = 1; i <= 15; i++) {
      const basePoints = Math.max(25000 - (i * 1200) + Math.random() * 600, 2000);
      const accuracy = Math.max(88 + Math.random() * 10, 80);
      const labels = Math.floor(basePoints / 8) + Math.floor(Math.random() * 800);
      const streak = Math.floor(Math.random() * 45) + 1;
      const tierInfo = getTierInfo(i);
      
      data.push({
        id: i,
        rank: i,
        username: generateOrganicUsername(),
        points: Math.floor(basePoints),
        accuracy: parseFloat(accuracy.toFixed(1)),
        labelsCompleted: labels,
        currentStreak: streak,
        tier: tierInfo,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=c0392b,27ae60,2980b9,8e44ad,f39c12`,
        isOnline: Math.random() > 0.25,
        weeklyGrowth: Math.floor(Math.random() * 60) - 15,
        totalReviews: Math.floor(Math.random() * 500) + 100,
        level: Math.floor(i / 3) + Math.floor(Math.random() * 5) + 15
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
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  // Enhanced haptic feedback
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate([30, 20, 30]);
    }
  };

  const handlePeriodChange = (period) => {
    triggerHaptic();
    setSelectedPeriod(period);
    setAnimationStage('loading');
  };

  // Enhanced loading state with skeleton
  if (animationStage === 'loading') {
    return (
      <div className="w-full mx-auto space-y-6 min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-spin" />
              <div className="w-32 h-6 bg-gray-700 rounded-lg" />
            </div>
            <div className="w-16 h-4 bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Podium Skeleton */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 animate-pulse">
          <div className="flex items-end justify-center gap-4 mb-6">
            {[1,2,3].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full mb-2" />
                <div className="w-20 h-4 bg-gray-700 rounded mb-2" />
                <div className="w-16 h-16 bg-gray-700 rounded-t-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                <div className="w-12 h-12 bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
                <div className="text-right space-y-1">
                  <div className="w-16 h-4 bg-gray-700 rounded" />
                  <div className="w-10 h-3 bg-gray-700 rounded ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);

  return (
    <div 
      ref={leaderboardRef} 
      className="w-full mx-auto space-y-6 min-h-screen overflow-x-hidden pb-12"
    >
      {/* Enhanced Header */}
      <div className="glass rounded-3xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="text-[#FF7A1A]" size={28} />
                <div className="absolute -inset-1 bg-[#FF7A1A]/20 rounded-full blur" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Users size={14} />
                  {totalUsers.toLocaleString()} players
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-green-400/20 px-3 py-2 rounded-xl border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
          </div>

          {/* Enhanced Period Selector */}
          <div className="grid grid-cols-3 gap-3">
            {['daily', 'weekly', 'monthly'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`relative p-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform active:scale-95 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border-2 border-orange-400/60 text-white shadow-lg shadow-orange-400/25'
                    : 'bg-gray-800/60 border-2 border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/60 hover:border-gray-600/50'
                }`}
              >
                <span className="relative z-10">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
                {selectedPeriod === period && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Top 3 Podium */}
      <div className="glass bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 relative overflow-hidden">
        {/* Dynamic background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-purple-500/5 to-blue-500/5" />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-yellow-400/10 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10">
          <h3 className="text-center text-xl font-bold text-white mb-8 flex items-center justify-center gap-3">
            {/* <div className="relative">
              <Crown className="text-yellow-400" size={24} />
              <div className="absolute -inset-1 bg-yellow-400/30 rounded-full blur animate-pulse" />
            </div> */}
            Elite Champions
          </h3>

          {/* Enhanced Podium Display */}
          <div className="flex items-end justify-center gap-3 mb-8">
            {topThree.map((user, index) => {
              const IconComponent = user.tier.icon;
              const podiumHeights = ['h-28', 'h-24', 'h-20'];
              const podiumOrder = ['order-2', 'order-1', 'order-3'];
              
              return (
                <div
                  key={user.id}
                  className={`flex flex-col items-center ${podiumOrder[index]} transform transition-all duration-500 hover:scale-105 cursor-pointer`}
                  onClick={() => triggerHaptic()}
                >
                  {/* Crown animation for #1 */}
                  {user.rank === 1 && (
                    <div className="mb-3 relative">
                      <Crown className="text-[#FF7A1A]" size={32} />
                      <div className="absolute -inset-2 bg-[#FF7A1A]/20 rounded-full blur-xl animate-pulse" />
                    </div>
                  )}

                  {/* Enhanced User Avatar */}
                  <div className={`relative mb-3 ${user.rank === 1 ? 'w-20 h-20' : 'w-16 h-16'}`}>
                    <div className={`w-full h-full rounded-full ${user.tier.bgColor} p-1 border-2 border-[#FF7A1A] shadow-xl`}>
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=transparent`;
                        }}
                      />
                      {/* {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse">
                          <div className="w-full h-full bg-green-400 rounded-full animate-ping" />
                        </div>
                      )} */}
                    </div>
                    
                    {/* Enhanced Rank Badge */}
                    <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                      user.rank === 1 ? 'bg-[#FF7A1A] text-white shadow-yellow-400/50' :
                      user.rank === 2 ? 'bg-yellow-400 text-white shadow-gray-400/50' :
                      'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-orange-400/50'
                    }`}>
                      {user.rank}
                    </div>

                    {/* Level indicator */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 px-2 py-0.5 rounded-full text-xs text-white border border-gray-600">
                      Lv.{user.level}
                    </div>
                  </div>

                  {/* Enhanced Username */}
                  <p className={`font-bold text-center mb-2 max-w-20 truncate ${
                    user.rank === 1 ? 'text-[#FF7A1A] text-lg' : 'text-white text-sm'
                  }`}>
                    {user.username}
                  </p>

                  {/* Enhanced Points Display */}
                  <div className="text-center mb-3">
                    <p className={`font-bold ${user.rank === 1 ? 'text-lg text-[#FF7A1A]' : 'text-white'}`}>
                      {user.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">points</p>
                  </div>

                  {/* Enhanced Podium Base */}
                  <div className={`w-20 ${podiumHeights[index]} bg-[#FF7A1A]/30 rounded-t-2xl flex flex-col items-center justify-center transition-all duration-500 border-t-2 border-[#FF7A1A] relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <IconComponent className={`${user.tier.color} z-10`} size={20} />
                    <span className={`text-xs font-bold ${user.tier.color} mt-1 z-10`}>
                      {user.tier.tier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Quick Stats */}
          <div className="glass-light grid grid-cols-3 gap-4 bg-gray-900/50 rounded-2xl p-4">
            {topThree.map((user, index) => (
              <div key={user.id} className="text-center">
                <div className="text-white font-bold text-lg">{user.accuracy}%</div>
                <div className="text-gray-400 text-xs">Accuracy</div>
                <div className="text-gray-300 text-xs mt-1">{user.labelsCompleted} labels</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Rankings List */}
      <div className="space-y-3">
        {remaining.map((user) => {
          const IconComponent = user.tier.icon;
          return (
            <div
              key={user.id}
              className="bg-gray-800/40 glass-warm backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 relative overflow-hidden transition-all duration-300 hover:bg-gray-700/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              onClick={() => triggerHaptic()}
            >
              {/* Subtle background gradient */}
              <div className={`absolute inset-0 ${user.tier.bgColor} opacity-20`} />

              <div className="relative z-10 flex items-center gap-4">
                {/* Enhanced Rank Display */}
                {/* <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border ${user.tier.borderColor} ${user.tier.glowColor} shadow-lg`}>
                  <span className="font-bold text-white text-lg">{user.rank}</span>
                </div> */}

                {/* Enhanced Avatar */}
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full ${user.tier.bgColor} p-1 border-2 ${user.tier.borderColor}`}>
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=transparent`;
                      }}
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900">
                        <div className="w-full h-full bg-green-400 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                  
                  {/* Level badge */}
                  <div className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded-full border border-gray-600 font-medium">
                    {user.level}
                  </div>
                </div>

                {/* Enhanced User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate text-base">{user.username}</p>
                    <IconComponent className={user.tier.color} size={16} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.tier.bgColor} ${user.tier.color}`}>
                      {user.tier.tier}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Target size={12} />
                      <span>{user.labelsCompleted}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={12} />
                      <span>{user.accuracy}%</span>
                    </div>
                    {user.currentStreak > 7 && (
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame size={12} />
                        <span>{user.currentStreak}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Points & Growth */}
                <div className="text-right">
                  <div className="font-bold text-white text-lg">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">points</div>
                  <div className={`text-xs flex items-center gap-1 justify-end font-medium ${
                    user.weeklyGrowth > 0 ? 'text-green-400' : user.weeklyGrowth < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {user.weeklyGrowth > 0 ? <ChevronUp size={12} /> : user.weeklyGrowth < 0 ? <ChevronDown size={12} /> : null}
                    <span>{user.weeklyGrowth > 0 ? '+' : ''}{user.weeklyGrowth}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced User Position Card */}
      <div className="bg-gradient-to-r glass glass-dark from-orange-500/30 to-red-500/30 border-2 border-orange-400/60 rounded-3xl p-4 relative overflow-hidden backdrop-blur-xl">
        {/* Background effects */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-red-400/10 to-pink-400/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl" /> */}
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-20">
              <div className="relative">
                <div className="text-3xl font-black text-[#FF7A1A] flex items-center">
                  #{userRank.toLocaleString()}
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="text-[#FF7A1A]" size={20} />
                  Your Rank
                </p>
                <p className="text-xs text-gray-300">
                  Top {((userRank / totalUsers) * 100).toFixed(1)}% globally
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-800/50 glass-button rounded-2xl p-4 text-center">
              <div className="text-xl font-bold text-white mb-1">
                {(totalUsers - userRank).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Players behind you</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="pb-8" />
    </div>
  );
};

export default PremiumLeaderboard;