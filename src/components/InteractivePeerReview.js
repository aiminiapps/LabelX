'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoFlag, IoEye, IoTime, IoTrendingUp } from 'react-icons/io5';
import { BiShield, BiCrown, BiTrophy, BiBrain, BiData } from 'react-icons/bi';
import { TbSparkles, TbScale, TbUsers } from 'react-icons/tb';
import { MdOutlineWaves } from "react-icons/md";
import Image from 'next/image';

const InteractivePeerReview = () => {
  // Core state management
  const [currentReview, setCurrentReview] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [consensusBuilding, setConsensusBuilding] = useState(false);
  const [reviewerStats, setReviewerStats] = useState({
    accuracy: 92.4,
    weight: 1.8,
    reputation: 847,
    reviewsCompleted: 156
  });

  // Animation controls
  const consensusControls = useAnimation();
  const bubbleControls = useAnimation();
  const waveControls = useAnimation();
  
  // Motion values for fluid animations
  const bubbleY = useMotionValue(0);
  const waveOffset = useMotionValue(0);
  const consensusProgress = useMotionValue(0);

  // Transform values for dynamic effects
  const bubbleOpacity = useTransform(bubbleY, [-100, 0, 100], [0.3, 1, 0.3]);
  const waveHeight = useTransform(waveOffset, [0, 1], [20, 60]);

  // Sample peer review data with realistic consensus scenarios
  const sampleReviews = [
    {
      id: 1,
      originalItem: 'Tesla Model S delivery delayed due to semiconductor shortage - customers frustrated with 3-month wait times.',
      peerLabel: 'Negative',
      peerAccuracy: 78.5,
      peerWeight: 1.2,
      consensus: {
        total: 8,
        confirmed: 6,
        corrected: 1,
        flagged: 1,
        weightedScore: 0.82
      },
      category: 'Sentiment Analysis',
      difficulty: 'Medium',
      timeLeft: 45,
      disputed: false
    },
    {
      id: 2,
      originalItem: 'New AI breakthrough in medical imaging - 99.2% accuracy in detecting early-stage cancer.',
      peerLabel: 'Positive',
      peerAccuracy: 94.8,
      peerWeight: 2.1,
      consensus: {
        total: 12,
        confirmed: 4,
        corrected: 6,
        flagged: 2,
        weightedScore: 0.31
      },
      category: 'Sentiment Analysis',
      difficulty: 'Hard',
      timeLeft: 28,
      disputed: true
    },
    {
      id: 3,
      originalItem: 'Cryptocurrency market shows stability after regulatory clarity from major economies.',
      peerLabel: 'Neutral',
      peerAccuracy: 89.2,
      peerWeight: 1.6,
      consensus: {
        total: 15,
        confirmed: 12,
        corrected: 2,
        flagged: 1,
        weightedScore: 0.89
      },
      category: 'Financial Analysis',
      difficulty: 'Easy',
      timeLeft: 67,
      disputed: false
    }
  ];

  // Initialize component
  useEffect(() => {
    setCurrentReview(sampleReviews[0]);
    startAmbientAnimations();
  }, []);

  // Start ambient wave and bubble animations
  const startAmbientAnimations = () => {
    // Continuous wave animation
    waveControls.start({
      x: [0, 100, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });

    // Floating bubble animation
    bubbleControls.start({
      y: [-20, 20, -20],
      rotate: [0, 360, 720],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "linear"
      }
    });
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

  // Handle review action with consensus building animation
  const handleReviewAction = async (action) => {
    triggerHaptic('medium');
    setConsensusBuilding(true);

    // Animate consensus building process
    await consensusControls.start({
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.8 }
    });

    // Simulate consensus calculation with visual feedback
    const consensusSteps = [0.2, 0.4, 0.6, 0.8, 1.0];
    
    for (let step of consensusSteps) {
      consensusProgress.set(step);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Update reviewer stats based on action
    const newStats = {
      ...reviewerStats,
      reviewsCompleted: reviewerStats.reviewsCompleted + 1,
      accuracy: action === 'confirm' ? 
        Math.min(100, reviewerStats.accuracy + 0.2) : 
        Math.max(80, reviewerStats.accuracy - 0.1),
      weight: Math.min(3.0, reviewerStats.weight + 0.05),
      reputation: reviewerStats.reputation + (action === 'flag' ? 5 : 10)
    };
    
    setReviewerStats(newStats);

    // Add to history
    setReviewHistory(prev => [...prev, {
      reviewId: currentReview.id,
      action: action,
      timestamp: Date.now(),
      consensusImpact: action === 'confirm' ? 0.1 : action === 'correct' ? -0.05 : -0.15
    }]);

    // Animate success and load next review
    if (action === 'confirm') {
      triggerHaptic('success');
      await bubbleControls.start({
        scale: [1, 1.5, 1],
        backgroundColor: ['#10B981', '#22C55E', '#10B981'],
        transition: { duration: 0.6 }
      });
    }

    setConsensusBuilding(false);
    
    // Load next review after animation
    setTimeout(() => {
      const nextIndex = Math.floor(Math.random() * sampleReviews.length);
      setCurrentReview(sampleReviews[nextIndex]);
    }, 1000);
  };

  // Calculate consensus visual indicators
  const getConsensusColor = (score) => {
    if (score >= 0.8) return 'from-green-400 to-emerald-500';
    if (score >= 0.6) return 'from-yellow-400 to-orange-500';
    if (score >= 0.4) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
  };

  const getWeightIndicator = (weight) => {
    if (weight >= 2.0) return { icon: <BiCrown />, color: 'text-[#FF7A1A]', label: 'Expert' };
    if (weight >= 1.5) return { icon: <BiTrophy />, color: 'text-blue-400', label: 'Advanced' };
    return { icon: <BiShield />, color: 'text-green-400', label: 'Regular' };
  };

  if (!currentReview) return null;

  const weightIndicator = getWeightIndicator(reviewerStats.weight);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Reviewer Status Header with Dynamic Animations */}
      <motion.div 
        className="glass-light rounded-2xl p-4 relative overflow-hidden"
        animate={consensusControls}
      >
        {/* Animated background waves */}
        <motion.div
          animate={waveControls}
          className="absolute inset-0 opacity-20"
        >
          <svg className="w-full h-full" viewBox="0 0 400 100">
            <motion.path
              d="M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z"
              fill="url(#waveGradient)"
              animate={{
                d: [
                  "M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z",
                  "M0,40 Q100,30 200,40 T400,40 L400,100 L0,100 Z",
                  "M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Peer Review
                  <motion.div>
                    <TbUsers className="text-blue-400" size={16} />
                  </motion.div>
                </h3>
                <p className="text-sm text-gray-400">{weightIndicator.label} Reviewer</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-white">{reviewerStats.reputation}</div>
              <p className="text-xs text-gray-400">Reputation</p>
            </div>
          </div>

          {/* Dynamic Weight Visualization */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <motion.div
                key={reviewerStats.accuracy}
                initial={{ scale: 1.2, color: "#22C55E" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                className="text-xl font-bold"
              >
                {reviewerStats.accuracy.toFixed(1)}%
              </motion.div>
              <p className="text-xs text-gray-400">Accuracy</p>
            </div>
            
            <div className="text-center">
              <motion.div
                key={reviewerStats.weight}
                initial={{ scale: 1.2, color: "#3B82F6" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                className="text-xl font-bold flex items-center justify-center gap-1"
              >
                {reviewerStats.weight.toFixed(1)}x
                <TbScale className="text-blue-400" size={16} />
              </motion.div>
              <p className="text-xs text-gray-400">Weight</p>
            </div>
            
            <div className="text-center">
              <motion.div
                key={reviewerStats.reviewsCompleted}
                initial={{ scale: 1.2, color: "#8B5CF6" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                className="text-xl font-bold"
              >
                {reviewerStats.reviewsCompleted}
              </motion.div>
              <p className="text-xs text-gray-400">Reviews</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Review Interface with Consensus Visualization */}
      <motion.div 
        className="glass rounded-3xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Review Header with Consensus Status */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* <BiBrain className="text-purple-400" size={20} /> */}
              <span className="text-white font-medium">{currentReview.category}</span>
              {currentReview.disputed && (
                <motion.div
                  className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-lg text-xs text-red-400"
                >
                  Disputed
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <IoTime size={16} />
              <motion.span
                key={currentReview.timeLeft}
                initial={{ color: "#9CA3AF" }}
                animate={{ 
                  color: currentReview.timeLeft < 30 ? "#EF4444" : "#9CA3AF"
                }}
              >
                {currentReview.timeLeft}s
              </motion.span>
            </div>
          </div>

          {/* Consensus Progress Visualization */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MdOutlineWaves className="text-blue-400" size={16} />
              <span className="text-sm text-gray-300">Consensus Building</span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-gray-500"
              >
                ({currentReview.consensus.total} reviews)
              </motion.div>
            </div>
            
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 bg-[#FF7A1A] rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${currentReview.consensus.weightedScore * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              
              {/* Floating particles along progress bar */}
              <motion.div
                className="absolute top-0 w-1 h-full bg-white/80 rounded-full"
                animate={{ 
                  left: [`0%`, `${currentReview.consensus.weightedScore * 100}%`] 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Original Content Display */}
        <div className="relative z-10 mb-6">
          <div className="glass-light rounded-2xl p-4 mb-4">
            <p className="text-white leading-relaxed">{currentReview.originalItem}</p>
          </div>
          
          {/* Peer's Label with Weight Visualization */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Peer labeled as:</span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 rounded-lg font-medium ${
                  currentReview.peerLabel === 'Positive' ? 'bg-green-500/20 text-green-400' :
                  currentReview.peerLabel === 'Negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-300'
                }`}
              >
                {currentReview.peerLabel}
              </motion.div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">
                Weight: {currentReview.peerWeight}x
              </div>
              <div className="text-xs text-gray-500">
                Acc: {currentReview.peerAccuracy}%
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Action Buttons with Micro-Animations */}
        <div className="relative z-10 space-y-3">
          <AnimatePresence>
            {!consensusBuilding ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {/* Confirm Button */}
                <motion.button
                  onClick={() => handleReviewAction('confirm')}
                  className="w-full glass-button p-4 rounded-xl flex items-center gap-3 hover:bg-green-500/10 transition-colors"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div>
                    <IoCheckmarkCircle className="text-green-400" size={24} />
                  </motion.div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium">Confirm Label</div>
                    <div className="text-sm text-gray-400">Agree with peer's assessment</div>
                  </div>
                  <div className="text-sm text-green-400">+{Math.floor(10 * reviewerStats.weight)}pts</div>
                </motion.button>

                {/* Correct Button */}
                <motion.button
                  onClick={() => handleReviewAction('correct')}
                  className="w-full glass-button p-4 rounded-xl flex items-center gap-3 hover:bg-blue-500/10 transition-colors"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div>
                    <BiBrain className="text-blue-400" size={24} />
                  </motion.div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium">Suggest Correction</div>
                    <div className="text-sm text-gray-400">Provide alternative label</div>
                  </div>
                  <div className="text-sm text-blue-400">+{Math.floor(15 * reviewerStats.weight)}pts</div>
                </motion.button>

                {/* Flag Button */}
                <motion.button
                  onClick={() => handleReviewAction('flag')}
                  className="w-full glass-button p-4 rounded-xl flex items-center gap-3 hover:bg-red-500/10 transition-colors"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div>
                    <IoFlag className="text-red-400" size={24} />
                  </motion.div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium">Flag for Review</div>
                    <div className="text-sm text-gray-400">Report quality issues</div>
                  </div>
                  <div className="text-sm text-red-400">+{Math.floor(5 * reviewerStats.weight)}pts</div>
                </motion.button>
              </motion.div>
            ) : (
              /* Consensus Building Animation */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 space-y-4"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                  className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                >
                  <Image />
                </motion.div>
                
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-1">Building Consensus</h4>
                  <p className="text-sm text-gray-400">Calculating weighted review impact...</p>
                </div>
                
                <motion.div 
                  className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Consensus Stats with Bubble Visualization */}
      <motion.div className="glass-light rounded-2xl p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <IoTrendingUp className="text-green-400" />
          Live Consensus Data
        </h4>
        
        <div className="space-y-3">
          {/* Visual Consensus Breakdown */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-green-400">Confirmed</span>
                <span className="text-sm text-white">{currentReview.consensus.confirmed}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-[#FF7A1A] h-2 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentReview.consensus.confirmed / currentReview.consensus.total) * 100}%` }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Flowing particles */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-blue-400">Corrected</span>
                <span className="text-sm text-white">{currentReview.consensus.corrected}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentReview.consensus.corrected / currentReview.consensus.total) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-red-400">Flagged</span>
                <span className="text-sm text-white">{currentReview.consensus.flagged}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-red-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentReview.consensus.flagged / currentReview.consensus.total) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall Consensus Score */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Weighted Consensus</span>
            <motion.span
              key={currentReview.consensus.weightedScore}
              initial={{ scale: 1.2, color: "#FFD60A" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="font-bold text-lg"
            >
              {Math.round(currentReview.consensus.weightedScore * 100)}%
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractivePeerReview;
