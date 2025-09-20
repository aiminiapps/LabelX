'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { IoTrophy, IoTrendingUp, IoChevronUp, IoChevronDown } from 'react-icons/io5';
import { BiShield, BiDiamond, BiStar } from 'react-icons/bi';
import { TbMedal, TbCrown } from 'react-icons/tb';
import { LuCrown } from "react-icons/lu";
import { MdOutlineLocalFireDepartment } from "react-icons/md";


const PremiumLeaderboard = () => {
  // Component state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [animationStage, setAnimationStage] = useState('loading');
  const [userRank, setUserRank] = useState(8);
  
  // Animation controls
  const podiumControls = useAnimation();
  const listControls = useAnimation();
  const headerControls = useAnimation();
  
  // Refs for scroll animations
  const leaderboardRef = useRef(null);
  const isInView = useInView(leaderboardRef, { once: false });

  // Realistic Telegram usernames based on research [web:244][web:240]
  const generateRealisticUsername = () => {
    const prefixes = ['alex', 'maria', 'john', 'anna', 'david', 'sarah', 'mike', 'lisa', 'chen', 'kate', 
                     'ryan', 'maya', 'tom', 'sara', 'max', 'luna', 'jake', 'zoe', 'nick', 'emma',
                     'leo', 'iris', 'sam', 'nova', 'ray', 'ivy', 'kai', 'ava', 'eli', 'mia'];
    const suffixes = ['_dev', '_ai', '_labs', '_tech', '_pro', '_x', '_21', '_99', '_zero', '_one',
                     '_sage', '_mind', '_flow', '_wave', '_sky', '_neo', '_arc', '_hub', '_bin', '_kit'];
    const numbers = ['7', '9', '12', '23', '42', '88', '101', '777', '2024', '369'];
    
    const base = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // 40% chance for suffix, 30% for number, 30% for clean
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
  const getTierInfo = (rank, points) => {
    if (rank <= 3) return { 
      tier: 'Legendary', 
      icon: <LuCrown className="text-yellow-400" size={20} />, 
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-400/50'
    };
    if (rank <= 10) return { 
      tier: 'Master', 
      icon: <BiDiamond className="text-purple-400" size={20} />, 
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/50'
    };
    if (rank <= 25) return { 
      tier: 'Expert', 
      icon: <IoTrophy className="text-blue-400" size={20} />, 
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-400/50'
    };
    if (rank <= 50) return { 
      tier: 'Advanced', 
      icon: <BiShield className="text-green-400" size={20} />, 
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-400/50'
    };
    return { 
      tier: 'Rising', 
      icon: <BiStar className="text-gray-400" size={20} />, 
      color: 'from-gray-400 to-slate-500',
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
      
      data.push({
        id: i,
        rank: i,
        username: generateRealisticUsername(),
        points: Math.floor(basePoints),
        accuracy: parseFloat(accuracy.toFixed(1)),
        labelsCompleted: labels,
        currentStreak: streak,
        tier: getTierInfo(i, basePoints),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=transparent`,
        isOnline: Math.random() > 0.3,
        weeklyGrowth: Math.floor(Math.random() * 40) - 10, // -10 to +30
        totalReviews: Math.floor(Math.random() * 200) + 50
      });
    }
    return data;
  };

  // Initialize data
  useEffect(() => {
    setAnimationStage('loading');
    setTimeout(() => {
      setLeaderboardData(generateLeaderboardData());
      setAnimationStage('loaded');
    }, 1000);
  }, [selectedPeriod]);

  // Animate components when in view
  useEffect(() => {
    if (isInView && animationStage === 'loaded') {
      // Stagger animations for premium feel
      headerControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      });

      setTimeout(() => {
        podiumControls.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.8, ease: "backOut" }
        });
      }, 200);

      setTimeout(() => {
        listControls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" }
        });
      }, 600);
    }
  }, [isInView, animationStage, headerControls, podiumControls, listControls]);

  // Haptic feedback
  const triggerHaptic = (type = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'success') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  const handlePeriodChange = (period) => {
    triggerHaptic('light');
    setSelectedPeriod(period);
    setAnimationStage('loading');
  };

  // Get podium position styling
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

  if (animationStage === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6">
        <div className="glass rounded-3xl p-6 space-y-4">
          {/* Loading skeleton with shimmer effect */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
              <div className="w-16 h-8 bg-gray-700 rounded" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);
  const currentUser = leaderboardData.find(user => user.rank === userRank);

  return (
    <div ref={leaderboardRef} className="w-full max-w-md mx-auto p-4 space-y-6">
      {/* Header with Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={headerControls}
        className="glass-light rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <IoTrophy className="text-yellow-400" size={24} />
            </motion.div>
            <h2 className="text-xl font-bold text-white">Leaderboard</h2>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <IoTrendingUp className="text-green-400" size={16} />
            <span className="text-green-400">Live</span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="grid grid-cols-3 gap-2">
          {['daily', 'weekly', 'monthly'].map((period) => (
            <motion.button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`p-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'glass-warm text-white'
                  : 'glass-light text-gray-400 hover:text-white'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Interactive Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={podiumControls}
        className="glass rounded-3xl p-6 relative overflow-hidden"
      >
        {/* Ambient background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0"
          />
        </div>

        <div className="relative z-10">
          <h3 className="text-center text-lg font-semibold text-white mb-6 flex items-center justify-center gap-2">
            <TbCrown className="text-yellow-400" />
            Top Performers
          </h3>

          {/* Podium Display */}
          <div className="flex items-end justify-center gap-4 mb-6">
            {topThree.map((user) => (
              <motion.div
                key={user.id}
                className={`flex flex-col items-center ${getPodiumOrder(user.rank)}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: user.rank * 0.2, duration: 0.6, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => triggerHaptic('light')}
              >
                {/* Crown for #1 */}
                {user.rank === 1 && (
                  <motion.div
                    animate={{ 
                      rotate: [-5, 5, -5],
                      y: [-2, 2, -2]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-2"
                  >
                    <LuCrown className="text-yellow-400" size={32} />
                  </motion.div>
                )}

                {/* User Avatar */}
                <div className={`relative mb-2 ${user.rank === 1 ? 'w-20 h-20' : 'w-16 h-16'}`}>
                  <motion.div
                    className={`w-full h-full rounded-full ${user.tier.bgColor} p-1`}
                    animate={user.rank === 1 ? {
                      boxShadow: [
                        '0 0 20px rgba(255, 215, 0, 0.5)',
                        '0 0 30px rgba(255, 215, 0, 0.3)',
                        '0 0 20px rgba(255, 215, 0, 0.5)'
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full rounded-full bg-gray-800"
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900" />
                    )}
                  </motion.div>
                  
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
                <motion.p 
                  className="text-sm text-gray-300 mb-2"
                  key={user.points}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {user.points.toLocaleString()} pts
                </motion.p>

                {/* Podium Base */}
                <motion.div
                  className={`w-20 ${getPodiumHeight(user.rank)} ${user.tier.bgColor} rounded-t-lg flex items-center justify-center`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: user.rank * 0.3 + 0.5, duration: 0.4, ease: "easeOut" }}
                >
                  {user.tier.icon}
                </motion.div>
              </motion.div>
            ))}
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
      </motion.div>

      {/* Remaining Rankings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={listControls}
        className="space-y-3"
      >
        {remaining.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className={`glass-light rounded-2xl p-4 relative overflow-hidden ${
              user.rank === userRank ? 'ring-2 ring-yellow-400/50' : ''
            }`}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            onHoverStart={() => triggerHaptic('light')}
          >
            {/* User is current user indicator */}
            {user.rank === userRank && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 px-2 py-1 bg-yellow-400/20 rounded-lg text-xs text-yellow-400 font-medium"
              >
                You
              </motion.div>
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
                  {user.tier.icon}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{user.labelsCompleted} labels</span>
                  <span>{user.accuracy}% acc</span>
                  {user.currentStreak > 5 && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <MdOutlineLocalFireDepartment size={12} />
                      <span>{user.currentStreak}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Points & Growth */}
              <div className="text-right">
                <motion.div 
                  className="font-bold text-white"
                  key={user.points}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {user.points.toLocaleString()}
                </motion.div>
                <div className={`text-xs flex items-center gap-1 ${
                  user.weeklyGrowth > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {user.weeklyGrowth > 0 ? <IoChevronUp size={12} /> : <IoChevronDown size={12} />}
                  <span>{Math.abs(user.weeklyGrowth)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Current User Position (if not in top 15) */}
      {userRank > 15 && currentUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-warm rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-yellow-400">#{userRank}</div>
              <div>
                <p className="font-semibold text-white">Your Position</p>
                <p className="text-sm text-gray-300">{currentUser.points.toLocaleString()} points</p>
              </div>
            </div>
            <motion.button
              className="glass-button px-4 py-2 rounded-lg text-sm"
              whileTap={{ scale: 0.95 }}
            >
              View More
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PremiumLeaderboard;
