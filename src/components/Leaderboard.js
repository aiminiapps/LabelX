'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Trophy, ChevronUp, ChevronDown, Star, Crown, Medal, Flame, Users, Zap, Target, Award 
} from 'lucide-react';
import { HiSparkles } from 'react-icons/hi2';

const PremiumLeaderboard = () => {
  // --- Core State (LOGIC PRESERVED) ---
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [animationStage, setAnimationStage] = useState('loading');
  const [totalUsers] = useState(Math.floor(Math.random() * (125000 - 120000) + 120000));
  const [userRank] = useState(Math.floor(Math.random() * (115000 - 110000) + 110000));
  
  const leaderboardRef = useRef(null);

  // --- Logic Helpers (PRESERVED) ---
  const generateOrganicUsername = () => {
    // ... (Your existing username logic)
    const firstNames = ['alexandra', 'benjamin', 'charlotte', 'dominic', 'elizabeth', 'francisco', 'gabriella', 'harrison', 'isabella', 'jonathan'];
    const lastNames = ['anderson', 'brown', 'garcia', 'johnson', 'miller'];
    const techSuffixes = ['_dev', '_ai', '_tech', '_labs', '_code', '_data', '_ml', '_crypto'];
    const rand = Math.random();
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    if (rand < 0.3) return firstName + '.' + lastNames[Math.floor(Math.random() * lastNames.length)];
    else if (rand < 0.5) return firstName + techSuffixes[Math.floor(Math.random() * techSuffixes.length)];
    return firstName + Math.floor(Math.random() * 999);
  };

  const getTierInfo = (rank) => {
    if (rank <= 3) return { 
      tier: 'Legendary', 
      icon: Crown, 
      color: 'text-[#FBBF24]',
      bgColor: 'bg-[#FBBF24]/10',
      borderColor: 'border-[#FBBF24]/40',
      glowColor: 'shadow-[#FBBF24]/30'
    };
    if (rank <= 10) return { 
      tier: 'Master', 
      icon: Medal, 
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/30'
    };
    if (rank <= 25) return { 
      tier: 'Expert', 
      icon: Trophy, 
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/30'
    };
    return { 
      tier: 'Pro', 
      icon: Star, 
      color: 'text-neutral-300',
      bgColor: 'bg-neutral-500/10',
      borderColor: 'border-neutral-500/30',
      glowColor: 'shadow-neutral-500/30'
    };
  };

  const generateLeaderboardData = () => {
    const data = [];
    for (let i = 1; i <= 15; i++) {
      const basePoints = Math.max(25000 - (i * 1200) + Math.random() * 600, 2000);
      const accuracy = Math.max(88 + Math.random() * 10, 80);
      const labels = Math.floor(basePoints / 8) + Math.floor(Math.random() * 800);
      const streak = Math.floor(Math.random() * 45) + 1;
      const tierInfo = getTierInfo(i);
      data.push({
        id: i, rank: i, username: generateOrganicUsername(), points: Math.floor(basePoints),
        accuracy: parseFloat(accuracy.toFixed(1)), labelsCompleted: labels, currentStreak: streak,
        tier: tierInfo, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${i}`,
        isOnline: Math.random() > 0.25, weeklyGrowth: Math.floor(Math.random() * 60) - 15,
        totalReviews: Math.floor(Math.random() * 500) + 100, level: Math.floor(i / 3) + Math.floor(Math.random() * 5) + 15
      });
    }
    return data;
  };

  useEffect(() => {
    setAnimationStage('loading');
    const timer = setTimeout(() => {
      setLeaderboardData(generateLeaderboardData());
      setAnimationStage('loaded');
    }, 1200);
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate([20]);
    }
  };

  const handlePeriodChange = (period) => {
    triggerHaptic();
    setSelectedPeriod(period);
    setAnimationStage('loading');
  };

  // --- Render: Loading Skeleton ---
  if (animationStage === 'loading') {
    return (
      <div className="w-full mx-auto space-y-6 min-h-screen p-4">
        {/* Loading Header */}
        <div className="glass rounded-[32px] p-8 animate-pulse">
            <div className="h-8 w-48 bg-white/5 rounded-lg mb-4" />
            <div className="h-12 w-full bg-white/5 rounded-2xl" />
        </div>
        {/* List Loading */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 h-20 animate-pulse bg-white/[0.02]" />
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
      className="w-full mx-auto space-y-6 min-h-screen pb-12 max-w-[1600px]"
    >
      {/* --- 1. LabelX Header --- */}
      <div className="glass rounded-[32px] p-8 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/20">
                <Trophy className="text-[#FBBF24]" size={28} />
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">Global Leaderboard</h2>
                <div className="flex items-center gap-2 mt-1">
                    <Users size={14} className="text-neutral-500" />
                    <span className="text-sm font-mono text-neutral-400">{totalUsers.toLocaleString()} active nodes</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-mono font-bold text-green-500 uppercase tracking-wide">Live Data</span>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 w-full md:w-auto self-start">
            {['daily', 'weekly', 'monthly'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-[#FBBF24] text-black shadow-[0_0_20px_-5px_rgba(251,191,36,0.4)]'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- 2. The Podium (Top 3) --- */}
      <div className="glass p-8 relative overflow-hidden rounded-[32px]">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FBBF24]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-10">
                <span className="text-[10px] font-mono text-[#FBBF24] uppercase tracking-widest">Elite Performers</span>
            </div>

            <div className="flex items-end justify-center gap-4 md:gap-12 w-full max-w-3xl">
                {topThree.map((user, index) => {
                    const isFirst = user.rank === 1;
                    const orderClasses = ['order-2', 'order-1', 'order-3']; // 2nd, 1st, 3rd visually
                    const heightClasses = ['h-32', 'h-40', 'h-24'];
                    
                    return (
                        <div 
                            key={user.id} 
                            className={`flex flex-col items-center ${orderClasses[index]} group cursor-pointer transition-transform hover:-translate-y-1`}
                            onClick={triggerHaptic}
                        >
                            {/* Crown for #1 */}
                            {isFirst && (
                                <div className="mb-4 text-[#FBBF24] animate-bounce">
                                    <Crown size={32} />
                                </div>
                            )}

                            {/* Avatar */}
                            <div className="relative mb-4">
                                <div className={`relative rounded-2xl overflow-hidden border-2 ${isFirst ? 'w-24 h-24 border-[#FBBF24]' : 'w-16 h-16 border-white/20'}`}>
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                </div>
                                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[10px] font-mono font-semibold border bg-black ${
                                    isFirst ? 'text-[#FBBF24] border-[#FBBF24]' : 'text-white border-white/20'
                                }`}>
                                    Rank {user.rank}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-center mb-4">
                                <p className={`font-bold text-sm md:text-base ${isFirst ? 'text-white' : 'text-neutral-400'}`}>
                                    {user.username}
                                </p>
                                <p className={`font-mono font-bold ${isFirst ? 'text-[#FBBF24] text-lg' : 'text-white text-sm'}`}>
                                    {user.points.toLocaleString()}
                                </p>
                            </div>

                            {/* Podium Base */}
                            <div className={`w-20 md:w-32 ${heightClasses[index]} rounded-t-2xl relative overflow-hidden border-t border-x ${
                                isFirst ? 'bg-[#FBBF24]/10 border-[#FBBF24]/30' : 'bg-white/[0.02] border-white/[0.05]'
                            }`}>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <user.tier.icon className={`${isFirst ? 'text-[#FBBF24]' : 'text-neutral-600'}`} size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* --- 3. The List (Remaining) --- */}
      <div className="space-y-3">
        {remaining.map((user) => (
          <div
            key={user.id}
            onClick={triggerHaptic}
            className="group relative bg-[#0A0A0A] hover:bg-[#111] border border-white/[0.08] hover:border-[#FBBF24]/30 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Rank Number */}
            <div className="w-10 text-center font-mono font-bold text-neutral-500 text-lg">
                {user.rank}
            </div>

            {/* User Details */}
            <div className="flex items-center gap-4 flex-1">
                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-lg bg-white/5" />
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{user.username}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${user.tier.borderColor} ${user.tier.color} bg-black uppercase font-mono`}>
                            {user.tier.tier}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                         <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                            <Target size={10} /> {user.labelsCompleted}
                         </div>
                         <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                            <Zap size={10} /> {user.accuracy}%
                         </div>
                    </div>
                </div>
            </div>

            {/* Points */}
            <div className="text-right">
                <div className="text-[#FBBF24] font-bold font-mono text-base">
                    {user.points.toLocaleString()}
                </div>
                <div className={`text-[10px] font-mono flex items-center justify-end gap-0.5 ${user.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {user.weeklyGrowth >= 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    {Math.abs(user.weeklyGrowth)}%
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- 4. User Rank Floating Bar --- */}
      <div className="sticky bottom-6 z-20 mb-10">
        <div className="glass-brand bg-[#FBBF24] text-white rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_40px_-10px_rgba(251,191,36,0.5)]">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center px-4 border-r border-black/10">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-60">Your Rank</span>
                    <span className="text-2xl font-black">#{userRank.toLocaleString()}</span>
                </div>
                <div className="hidden md:block text-sm font-medium opacity-80">
                    You're in the top {((userRank / totalUsers) * 100).toFixed(1)}% of labelers
                </div>
            </div>
            
            <button className="bg-black text-[#FBBF24] px-6 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider hover:bg-neutral-900 transition-colors">
                View Stats
            </button>
        </div>
      </div>

    </div>
  );
};

export default PremiumLeaderboard;