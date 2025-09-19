'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import { BiData, BiCheckCircle, BiBrain } from 'react-icons/bi';
import { IoSparkles } from 'react-icons/io5';

const LiveDataFlow = () => {
  const [activeNodes, setActiveNodes] = useState([]);
  const [liveStats, setLiveStats] = useState({
    totalProcessed: 12847,
    activeLabelers: 28,
    accuracy: 94.2,
    modelsTraining: 3
  });

  const pathRef = useRef(null);
  const controls = useAnimation();
  const pathLength = useMotionValue(0);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        totalProcessed: prev.totalProcessed + Math.floor(Math.random() * 5) + 1,
        activeLabelers: 25 + Math.floor(Math.random() * 8),
        accuracy: 94 + Math.random() * 2,
        modelsTraining: Math.floor(Math.random() * 5) + 1
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Animate data flow continuously
  useEffect(() => {
    const animateFlow = async () => {
      while (true) {
        // Trigger haptic feedback
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }

        await controls.start({
          pathLength: [0, 1],
          transition: { duration: 3, ease: "easeInOut" }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    animateFlow();
  }, [controls]);

  return (
    <div className="glass-dark rounded-3xl p-6 mb-6 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 opacity-50" />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Live Data Pipeline</h3>
          <p className="text-gray-400 text-sm">Real-time AI training flow</p>
        </div>
      </div>

      {/* SVG Data Flow Animation */}
      <div className="relative h-32 mb-6">
        <svg
          width="100%"
          height="128"
          viewBox="0 0 400 128"
          className="absolute inset-0"
        >
          {/* Background path */}
          <path
            d="M20 64 Q100 20, 180 64 T340 64"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
          />
          
          {/* Animated flow path */}
          <motion.path
            ref={pathRef}
            d="M20 64 Q100 20, 180 64 T340 64"
            stroke="url(#flowGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            animate={controls}
            style={{ pathLength }}
          />

          {/* Processing Nodes */}
          {/* Input Node */}
          <motion.circle
            cx="40"
            cy="64"
            r="12"
            fill="rgba(59, 130, 246, 0.3)"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Processing Node */}
          <motion.circle
            cx="200"
            cy="64"
            r="12"
            fill="rgba(168, 85, 247, 0.3)"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Output Node */}
          <motion.circle
            cx="360"
            cy="64"
            r="12"
            fill="rgba(34, 197, 94, 0.3)"
            stroke="rgba(34, 197, 94, 0.6)"
            strokeWidth="2"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* Data Packets */}
          <motion.circle
            cx="0"
            cy="0"
            r="4"
            fill="#FFD60A"
            animate={{
              offsetDistance: ["0%", "100%"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0 
            }}
            style={{ offsetPath: "path('M20 64 Q100 20, 180 64 T340 64')" }}
          />
          
          <motion.circle
            cx="0"
            cy="0"
            r="3"
            fill="#FF9500"
            animate={{
              offsetDistance: ["0%", "100%"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1 
            }}
            style={{ offsetPath: "path('M20 64 Q100 20, 180 64 T340 64')" }}
          />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Node Labels */}
        <div className="absolute left-2 top-20">
          <div className="glass-light px-2 py-1 rounded-lg text-xs text-blue-400 flex items-center gap-1">
            <BiData size={12} />
            Input
          </div>
        </div>
        
        <div className="absolute left-1/2 top-20 transform -translate-x-1/2">
          <div className="glass-light px-2 py-1 rounded-lg text-xs text-purple-400 flex items-center gap-1">
            <BiCheckCircle size={12} />
            Label
          </div>
        </div>
        
        <div className="absolute right-2 top-20">
          <div className="glass-light px-2 py-1 rounded-lg text-xs text-green-400 flex items-center gap-1">
            <BiBrain size={12} />
            Model
          </div>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          className="glass-light p-4 rounded-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Processed</span>
          </div>
          <motion.div
            key={liveStats.totalProcessed}
            initial={{ scale: 1.1, color: "#FFD60A" }}
            animate={{ scale: 1, color: "#FFFFFF" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold"
          >
            {liveStats.totalProcessed.toLocaleString()}
          </motion.div>
        </motion.div>

        <motion.div 
          className="glass-light p-4 rounded-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Active Users</span>
          </div>
          <motion.div
            key={liveStats.activeLabelers}
            initial={{ scale: 1.1, color: "#3B82F6" }}
            animate={{ scale: 1, color: "#FFFFFF" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold"
          >
            {liveStats.activeLabelers}
          </motion.div>
        </motion.div>

        <motion.div 
          className="glass-light p-4 rounded-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Accuracy</span>
          </div>
          <motion.div
            key={Math.floor(liveStats.accuracy * 10)}
            initial={{ scale: 1.1, color: "#A855F7" }}
            animate={{ scale: 1, color: "#FFFFFF" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold"
          >
            {liveStats.accuracy.toFixed(1)}%
          </motion.div>
        </motion.div>

        <motion.div 
          className="glass-light p-4 rounded-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Training</span>
          </div>
          <motion.div
            key={liveStats.modelsTraining}
            initial={{ scale: 1.1, color: "#FF9500" }}
            animate={{ scale: 1, color: "#FFFFFF" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold flex items-center gap-1"
          >
            {liveStats.modelsTraining}
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-sm text-orange-400"
            >
              models
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveDataFlow;
