'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoRefreshCircle, IoArrowUndo, IoArrowRedo, IoTrophy, IoStatsChart } from 'react-icons/io5';
import { BiText, BiImage, BiMicrophone, BiBrain, BiBarChart, BiShield, BiHeart } from 'react-icons/bi';
import { TbSparkles, TbTarget, TbCrown, TbMedal } from 'react-icons/tb';
import { HiOutlineEmojiSad, HiOutlineEmojiHappy, HiOutlineEmojiSad as HiNeutral } from 'react-icons/hi';
import { FaRobot, FaCar, FaLeaf, FaDollarSign, FaShoppingCart, FaUserMd, FaShieldAlt } from 'react-icons/fa';

const SmartDataPresentation = () => {
  // Core state management
  const [currentItem, setCurrentItem] = useState(null);
  const [labelHistory, setLabelHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    accuracy: 0,
    streak: 0,
    points: 0,
    timeSpent: 0
  });

  // Undo/Redo state
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Animation controls
  const cardControls = useAnimation();
  const progressControls = useAnimation();

  // Realistic AI Training Dataset Items [web:156][web:189][web:192]
  const realisticDataItems = [
    // Sentiment Analysis - Social Media Content [web:192][web:195]
    {
      id: 1,
      type: 'text',
      content: 'Just tried the new Tesla Model S Plaid - the acceleration is absolutely insane! 0-60 in under 2 seconds felt like a rocket ship 🚀',
      options: ['Positive', 'Negative', 'Neutral'],
      category: 'Sentiment Analysis',
      difficulty: 'Easy',
      domain: 'Social Media',
      icon: <HiOutlineEmojiHappy className="text-blue-400" size={18} />,
      context: 'Product review classification for automotive AI assistant'
    },
    
    // Medical Image Analysis [web:191][web:193]
    {
      id: 2,
      type: 'image',
      content: 'X-ray chest scan showing lung nodules',
      options: ['Normal', 'Abnormal - Nodules', 'Abnormal - Pneumonia', 'Requires Further Analysis'],
      category: 'Medical Imaging',
      difficulty: 'Hard',
      domain: 'Healthcare',
      icon: <FaUserMd className="text-red-400" size={18} />,
      context: 'Training diagnostic AI for early lung cancer detection'
    },

    // Fraud Detection - Financial Transactions [web:191][web:156]
    {
      id: 3,
      type: 'text',
      content: 'Transaction: $2,847.33 to "CRYPTO_EXCHANGE_XYZ" at 3:24 AM from IP: 203.45.67.89 (Location: Unknown VPN) - User typically spends $50-200, location: San Francisco',
      options: ['Legitimate', 'Suspicious - Unusual Amount', 'Suspicious - Location', 'High Risk Fraud'],
      category: 'Fraud Detection',
      difficulty: 'Medium',
      domain: 'Financial',
      icon: <FaShieldAlt className="text-[#FF7A1A]" size={18} />,
      context: 'Training ML model for real-time transaction monitoring'
    },

    // Autonomous Vehicle - Object Detection [web:172][web:195]
    {
      id: 4,
      type: 'image',
      content: 'Street scene with pedestrian crossing at intersection',
      options: ['Safe to Proceed', 'Yield to Pedestrian', 'Emergency Stop Required', 'Wait for Traffic Signal'],
      category: 'Autonomous Driving',
      difficulty: 'Hard',
      domain: 'Transportation',
      icon: <FaCar className="text-blue-400" size={18} />,
      context: 'Self-driving car decision making system training'
    },

    // Content Moderation - Social Platform [web:192][web:189]
    {
      id: 5,
      type: 'text',
      content: 'Hey everyone! Check out my new workout routine - finally seeing some real progress after 3 months of consistency. The key was finding exercises I actually enjoy! 💪',
      options: ['Appropriate Content', 'Spam/Promotional', 'Inappropriate Language', 'Misleading Health Claims'],
      category: 'Content Moderation',
      difficulty: 'Easy',
      domain: 'Social Media',
      icon: <BiShield className="text-green-400" size={18} />,
      context: 'Automated content filtering for fitness community platform'
    },

    // Audio Transcription - Voice Assistant [web:193][web:203]
    {
      id: 6,
      type: 'audio',
      content: 'Voice command: "Set a timer for twenty-five minutes and remind me to check the oven"',
      options: ['Set Timer: 25min + Reminder', 'Set Timer: 25min Only', 'Set Reminder Only', 'Unable to Process'],
      category: 'Voice Recognition',
      difficulty: 'Medium',
      domain: 'Smart Home',
      icon: <BiMicrophone className="text-purple-400" size={18} />,
      context: 'Training voice assistant for kitchen automation'
    },

    // E-commerce Product Classification [web:156][web:191]
    {
      id: 7,
      type: 'text',
      content: 'Organic bamboo fiber yoga mat - eco-friendly, non-slip surface, 6mm thick, includes carrying strap. Perfect for hot yoga and meditation practices.',
      options: ['Sports & Fitness', 'Home & Garden', 'Health & Wellness', 'Eco-Friendly Products'],
      category: 'Product Classification',
      difficulty: 'Medium',
      domain: 'E-commerce',
      icon: <FaShoppingCart className="text-orange-400" size={18} />,
      context: 'Automated product categorization for marketplace search'
    },

    // Climate Data Analysis [web:172][web:200]
    {
      id: 8,
      type: 'text',
      content: 'Satellite data shows CO2 levels: 421.3 ppm, temperature anomaly: +1.2°C above baseline, deforestation rate: 0.43% increase in Amazon region over past 6 months',
      options: ['Normal Variation', 'Concerning Trend', 'Critical Alert Required', 'Insufficient Data'],
      category: 'Climate Monitoring',
      difficulty: 'Hard',
      domain: 'Environmental',
      icon: <FaLeaf className="text-green-400" size={18} />,
      context: 'AI model for climate change pattern recognition'
    },

    // Mental Health Support - Text Analysis [web:192][web:189]
    {
      id: 9,
      type: 'text',
      content: 'I\'ve been feeling really overwhelmed lately with work and school. Some days are harder than others, but I\'m trying to stay positive and reach out when I need help.',
      options: ['Seeking Support', 'General Stress', 'Crisis Intervention Needed', 'Positive Coping'],
      category: 'Mental Health Analysis',
      difficulty: 'Hard',
      domain: 'Healthcare',
      icon: <BiHeart className="text-pink-400" size={18} />,
      context: 'AI chatbot for mental health screening and support'
    },

    // Manufacturing Quality Control [web:191][web:200]
    {
      id: 10,
      type: 'image',
      content: 'Circuit board assembly - component placement inspection',
      options: ['Pass - All Components Correct', 'Fail - Missing Component', 'Fail - Misaligned Parts', 'Requires Manual Inspection'],
      category: 'Quality Control',
      difficulty: 'Medium',
      domain: 'Manufacturing',
      icon: <FaRobot className="text-gray-400" size={18} />,
      context: 'Automated quality assurance for electronics production'
    }
  ];

  // Session timer
  const [startTime] = useState(Date.now());
  
  // Initialize component
  useEffect(() => {
    setCurrentItem(realisticDataItems[0]);
    loadSessionStats();
  }, []);

  // Load session stats from localStorage
  const loadSessionStats = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('labelx-session-stats');
      if (saved) {
        setSessionStats(JSON.parse(saved));
      }
    }
  };

  // Save session stats to localStorage
  const saveSessionStats = (stats) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('labelx-session-stats', JSON.stringify(stats));
    }
  };

  // Haptic feedback
  const triggerHaptic = (type = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'success') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  // Calculate session performance
  const getSessionGrade = () => {
    const accuracy = sessionStats.accuracy;
    if (accuracy >= 95) return { grade: 'S+', color: 'text-[#FF7A1A]', icon: <TbCrown /> };
    if (accuracy >= 90) return { grade: 'S', color: 'text-purple-400', icon: <TbMedal /> };
    if (accuracy >= 85) return { grade: 'A+', color: 'text-blue-400', icon: <IoTrophy /> };
    if (accuracy >= 80) return { grade: 'A', color: 'text-green-400', icon: <IoCheckmarkCircle /> };
    if (accuracy >= 75) return { grade: 'B+', color: 'text-orange-400', icon: <IoStatsChart /> };
    return { grade: 'B', color: 'text-gray-400', icon: <IoRefreshCircle /> };
  };

  // Handle label selection
  const handleLabelSelect = async (selectedLabel) => {
    triggerHaptic('medium');

    // Animate card selection
    await cardControls.start({
      scale: 0.98,
      transition: { duration: 0.1 }
    });

    // Create label entry with realistic accuracy based on difficulty
    const difficultyMultiplier = {
      'Easy': 0.95,
      'Medium': 0.85,
      'Hard': 0.75
    };
    const baseAccuracy = difficultyMultiplier[currentItem.difficulty] || 0.8;
    const isCorrect = Math.random() < baseAccuracy;

    const labelEntry = {
      itemId: currentItem.id,
      label: selectedLabel,
      timestamp: Date.now(),
      correct: isCorrect,
      difficulty: currentItem.difficulty,
      domain: currentItem.domain,
      category: currentItem.category
    };

    // Update history
    const newHistory = [...labelHistory.slice(0, historyIndex + 1), labelEntry];
    setLabelHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanUndo(true);
    setCanRedo(false);

    // Calculate points based on difficulty and streak
    const difficultyPoints = { 'Easy': 10, 'Medium': 15, 'Hard': 25 };
    const basePoints = difficultyPoints[currentItem.difficulty] || 10;
    const streakBonus = Math.min(sessionStats.streak * 2, 50);
    const earnedPoints = isCorrect ? basePoints + streakBonus : Math.floor(basePoints * 0.3);

    // Update session stats
    const newStats = {
      ...sessionStats,
      completed: sessionStats.completed + 1,
      streak: isCorrect ? sessionStats.streak + 1 : 0,
      accuracy: calculateAccuracy(newHistory),
      points: sessionStats.points + earnedPoints,
      timeSpent: Math.floor((Date.now() - startTime) / 1000)
    };
    setSessionStats(newStats);
    saveSessionStats(newStats);

    // Animate success/feedback
    if (isCorrect) {
      triggerHaptic('success');
      await progressControls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      });
    } else {
      triggerHaptic('error');
    }

    // Check if session complete
    if (currentIndex >= realisticDataItems.length - 1) {
      setTimeout(() => {
        setShowResults(true);
      }, 1000);
    } else {
      // Load next item with smooth transition
      setTimeout(() => {
        loadNextItem();
      }, 800);
    }
  };

  // Calculate session accuracy
  const calculateAccuracy = (history) => {
    if (history.length === 0) return 0;
    const correct = history.filter(entry => entry.correct).length;
    return Math.round((correct / history.length) * 100);
  };

  // Load next data item
  const loadNextItem = async () => {
    await cardControls.start({
      x: -300,
      opacity: 0,
      transition: { duration: 0.3 }
    });

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentItem(realisticDataItems[nextIndex]);

    cardControls.start({
      x: [300, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      transition: { duration: 0.4, type: "spring" }
    });
  };

  // Restart session
  const restartSession = () => {
    setShowResults(false);
    setCurrentIndex(0);
    setCurrentItem(realisticDataItems[0]);
    setLabelHistory([]);
    setHistoryIndex(-1);
    setCanUndo(false);
    setCanRedo(false);
    setSessionStats({
      completed: 0,
      accuracy: 0,
      streak: 0,
      points: 0,
      timeSpent: 0
    });
    saveSessionStats({
      completed: 0,
      accuracy: 0,
      streak: 0,
      points: 0,
      timeSpent: 0
    });
  };

  // Undo/Redo functions (same as before)
  const handleUndo = () => {
    if (canUndo && historyIndex >= 0) {
      triggerHaptic('light');
      setHistoryIndex(historyIndex - 1);
      setCanUndo(historyIndex > 0);
      setCanRedo(true);
      
      const undoneEntry = labelHistory[historyIndex];
      const newStats = {
        ...sessionStats,
        completed: Math.max(0, sessionStats.completed - 1),
        points: Math.max(0, sessionStats.points - 10)
      };
      setSessionStats(newStats);
      saveSessionStats(newStats);
    }
  };

  const handleRedo = () => {
    if (canRedo && historyIndex < labelHistory.length - 1) {
      triggerHaptic('light');
      setHistoryIndex(historyIndex + 1);
      setCanRedo(historyIndex < labelHistory.length - 2);
      setCanUndo(true);

      const redoneEntry = labelHistory[historyIndex + 1];
      const newStats = {
        ...sessionStats,
        completed: sessionStats.completed + 1,
        points: sessionStats.points + 10
      };
      setSessionStats(newStats);
      saveSessionStats(newStats);
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return <BiText className="text-blue-400" size={18} />;
      case 'image': return <BiImage className="text-green-400" size={18} />;
      case 'audio': return <BiMicrophone className="text-purple-400" size={18} />;
      default: return <BiBrain className="text-[#FF7A1A]" size={18} />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'Medium': return 'text-[#FF7A1A] bg-yellow-400/20 border-yellow-400/30';
      case 'Hard': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  // Results Screen Component
  if (showResults) {
    const grade = getSessionGrade();
    const timeMinutes = Math.floor(sessionStats.timeSpent / 60);
    const timeSeconds = sessionStats.timeSpent % 60;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto space-y-6"
      >
        {/* Results Header */}
        <div className="glass rounded-3xl p-6 text-center relative overflow-hidden">
          {/* Celebration background */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-purple-500/10 to-blue-500/10" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className={`inline-flex items-center gap-2 text-6xl ${grade.color} mb-4`}
          >
            {grade.icon}
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
          <p className="text-gray-400">Grade: <span className={`font-bold ${grade.color}`}>{grade.grade}</span></p>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-4">
          {/* Performance Overview */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <IoStatsChart className="text-blue-400" />
              Performance Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{sessionStats.completed}</div>
                <p className="text-sm text-gray-400">Items Labeled</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{sessionStats.accuracy}%</div>
                <p className="text-sm text-gray-400">Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF7A1A] mb-1">{sessionStats.points}</div>
                <p className="text-sm text-gray-400">Points Earned</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {timeMinutes}:{timeSeconds.toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-gray-400">Time Spent</p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BiBarChart className="text-green-400" />
              Category Breakdown
            </h3>
            
            <div className="space-y-3">
              {Object.entries(
                labelHistory.reduce((acc, entry) => {
                  acc[entry.domain] = acc[entry.domain] || { total: 0, correct: 0 };
                  acc[entry.domain].total++;
                  if (entry.correct) acc[entry.domain].correct++;
                  return acc;
                }, {})
              ).map(([domain, stats]) => (
                <div key={domain} className="flex items-center justify-between">
                  <span className="text-gray-300">{domain}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                        style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white min-w-12">
                      {Math.round((stats.correct / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={restartSession}
              className="w-full glass-button p-4 rounded-xl flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              <IoRefreshCircle size={20} />
              <span className="font-medium">Start New Session</span>
            </motion.button>
            
            <motion.button
              className="w-full glass-warm p-4 rounded-xl flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              <TbSparkles size={20} className="text-[#FF7A1A]" />
              <span className="font-medium">Claim {sessionStats.points} Points</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Session Progress Header */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TbTarget className="text-[#FF7A1A]" size={20} />
            <span className="text-white font-medium">AI Training Session</span>
          </div>
          <motion.div
            animate={progressControls}
            className="glass-warm px-3 py-1 rounded-full text-sm font-semibold"
          >
            {sessionStats.points} pts
          </motion.div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <motion.div
              key={sessionStats.completed}
              initial={{ scale: 1.2, color: "#3B82F6" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-xl font-bold"
            >
              {sessionStats.completed}
            </motion.div>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          
          <div className="text-center">
            <motion.div
              key={sessionStats.accuracy}
              initial={{ scale: 1.2, color: "#22C55E" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-xl font-bold"
            >
              {sessionStats.accuracy}%
            </motion.div>
            <p className="text-xs text-gray-400">Accuracy</p>
          </div>
          
          <div className="text-center">
            <motion.div
              key={sessionStats.streak}
              initial={{ scale: 1.2, color: "#F59E0B" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-xl font-bold flex items-center justify-center gap-1"
            >
              {sessionStats.streak}
              {sessionStats.streak > 0 && <TbSparkles size={16} className="text-[#FF7A1A]" />}
            </motion.div>
            <p className="text-xs text-gray-400">Streak</p>
          </div>
        </div>
      </div>

      {/* Main Data Presentation Card */}
      <motion.div
        animate={cardControls}
        className="glass rounded-3xl p-6 relative overflow-hidden"
      >
        {/* Enhanced Content Header */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {currentItem.icon}
              <span className="text-sm text-gray-300">{currentItem.category}</span>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(currentItem.difficulty)}`}>
              {currentItem.difficulty}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-1 mb-2">
            <motion.div 
              className="bg-[#FF7A1A] h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / realisticDataItems.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Context information */}
          <p className="text-xs text-gray-500 bg-gray-900/30 rounded-lg p-2">
            {currentItem.context}
          </p>
        </div>

        {/* Enhanced Data Content Display */}
        <div className="relative z-10 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentItem.type === 'image' ? (
                <div className="glass-light rounded-2xl p-4 mb-6">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex flex-col items-center justify-center gap-2">
                    <BiImage size={48} className="text-gray-500" />
                    <p className="text-gray-400 text-sm text-center px-4">{currentItem.content}</p>
                  </div>
                </div>
              ) : currentItem.type === 'audio' ? (
                <div className="glass-light rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <BiMicrophone size={24} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Audio Sample</p>
                      <p className="text-gray-400 text-sm">Tap to play transcription</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-300 font-mono text-sm">
                      "{currentItem.content}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="glass-light rounded-2xl p-6 mb-6">
                  <p className="text-white text-lg leading-relaxed font-medium">
                    {currentItem.content}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Label Options */}
        <div className="relative z-10 space-y-3">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <BiBrain size={18} className="text-blue-400" />
            Select the most appropriate label:
          </h3>
          
          <AnimatePresence>
            {currentItem.options.map((option, index) => (
              <motion.button
                key={`${currentItem.id}-${option}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleLabelSelect(option)}
                className="w-full glass-button text-left p-4 rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:scale-125 transition-transform" />
                  <span className="text-white font-medium">{option}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Undo/Redo Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`glass-button p-3 rounded-full ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          whileTap={canUndo ? { scale: 0.9 } : {}}
          transition={{ duration: 0.2 }}
        >
          <IoArrowUndo size={20} className={canUndo ? 'text-blue-400' : 'text-gray-500'} />
        </motion.button>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{currentIndex + 1} / {realisticDataItems.length}</span>
        </div>

        <motion.button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`glass-button p-3 rounded-full ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          whileTap={canRedo ? { scale: 0.9 } : {}}
          transition={{ duration: 0.2 }}
        >
          <IoArrowRedo size={20} className={canRedo ? 'text-green-400' : 'text-gray-500'} />
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <motion.button
          onClick={() => {
            triggerHaptic('light');
            loadNextItem();
          }}
          className="flex-1 bg-[#FF7A1A] p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <IoRefreshCircle size={18} className="text-white" />
          <span className="text-sm text-white">Skip Item</span>
        </motion.button>
        
        <motion.button
          className="flex-1 glass-warm p-3 rounded-xl flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <TbSparkles size={18} className="text-[#FF7A1A]" />
          <span className="text-sm text-white font-medium">Double Points</span>
        </motion.button>
      </div>
    </div>
  );
};

export default SmartDataPresentation;
