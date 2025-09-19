'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
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

  // Enhanced workflow animation
  useEffect(() => {
    const animateWorkflow = async () => {
      while (true) {
        // Trigger haptic feedback
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }

        // Animate connection lines with stagger
        await controls.start({
          pathLength: [0, 1],
          transition: { duration: 2.5, ease: "easeOut", staggerChildren: 0.2 }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    };

    animateWorkflow();
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

      {/* Enhanced SVG Workflow - Mobile Optimized */}
      <div className="relative h-48 md:h-40 mb-6">
        <svg
          width="100%"
          height="180"
          viewBox="0 0 300 180"
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection Lines with Enhanced Styling */}
          <motion.path
            d="M40 40 L110 40"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            strokeDasharray="0"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
          />
          
          <motion.path
            d="M110 40 L110 70"
            stroke="#10B981"
            strokeWidth="2"
            fill="none"
            strokeDasharray="0"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1, repeat: Infinity, repeatDelay: 3 }}
          />

          <motion.path
            d="M110 70 L180 70"
            stroke="#A855F7"
            strokeWidth="2"
            fill="none"
            strokeDasharray="0"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
          />

          <motion.path
            d="M180 70 L180 100"
            stroke="#F59E0B"
            strokeWidth="2"
            fill="none"
            strokeDasharray="0"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 2, repeat: Infinity, repeatDelay: 3 }}
          />

          <motion.path
            d="M180 100 L250 100"
            stroke="#EC4899"
            strokeWidth="2"
            fill="none"
            strokeDasharray="0"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 2.5, repeat: Infinity, repeatDelay: 3 }}
          />

          {/* Workflow Nodes with n8n Style */}
          
          {/* Input Node */}
          <motion.g
            animate={{ 
              y: [0, -2, 0],
              filter: ["drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))", "drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4))", "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <rect
              x="20"
              y="30"
              width="40"
              height="40"
              rx="8"
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#3B82F6"
              strokeWidth="2"
            />
            <BiData x="32" y="42" size={16} color="#3B82F6" />
            <circle cx="15" cy="25" r="3" fill="#3B82F6" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
          </motion.g>

          {/* Processing Node */}
          <motion.g
            animate={{ 
              y: [0, -3, 0],
              filter: ["drop-shadow(0 2px 4px rgba(168, 85, 247, 0.3))", "drop-shadow(0 4px 6px rgba(168, 85, 247, 0.4))", "drop-shadow(0 2px 4px rgba(168, 85, 247, 0.3))"]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <rect
              x="160"
              y="50"
              width="40"
              height="40"
              rx="8"
              fill="rgba(168, 85, 247, 0.15)"
              stroke="#A855F7"
              strokeWidth="2"
            />
            <BiBrain x="172" y="62" size={16} color="#A855F7" />
            <circle cx="155" cy="45" r="3" fill="#A855F7" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </motion.g>

          {/* Quality Check Node */}
          <motion.g
            animate={{ 
              y: [0, -2, 0],
              filter: ["drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))", "drop-shadow(0 4px 6px rgba(16, 185, 129, 0.4))", "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))"]
            }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
          >
            <rect
              x="90"
              y="60"
              width="40"
              height="40"
              rx="8"
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#10B981"
              strokeWidth="2"
            />
            <BiCheckCircle x="102" y="72" size={16} color="#10B981" />
            <circle cx="85" cy="55" r="3" fill="#10B981" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.2s" repeatCount="indefinite" />
            </circle>
          </motion.g>

          {/* Output Node */}
          <motion.g
            animate={{ 
              y: [0, -2.5, 0],
              filter: ["drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))", "drop-shadow(0 4px 6px rgba(245, 158, 11, 0.4))", "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))"]
            }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 1.5 }}
          >
            <rect
              x="230"
              y="90"
              width="40"
              height="40"
              rx="8"
              fill="rgba(245, 158, 11, 0.15)"
              stroke="#F59E0B"
              strokeWidth="2"
            />
            <IoSparkles x="242" y="102" size={16} color="#F59E0B" />
            <circle cx="225" cy="85" r="3" fill="#F59E0B" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </motion.g>

          {/* Data Flow Particles */}
          <motion.circle
            r="2.5"
            fill="#3B82F6"
            animate={{
              offsetDistance: ["0%", "100%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
            style={{ offsetPath: "path('M40 40 L110 40')" }}
          />

          <motion.circle
            r="2"
            fill="#10B981"
            animate={{
              offsetDistance: ["0%", "100%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 0.3
            }}
            style={{ offsetPath: "path('M110 40 L110 70')" }}
          />

          <motion.circle
            r="2"
            fill="#A855F7"
            animate={{
              offsetDistance: ["0%", "100%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 0.6
            }}
            style={{ offsetPath: "path('M110 70 L180 70')" }}
          />

          <motion.circle
            r="2.5"
            fill="#F59E0B"
            animate={{
              offsetDistance: ["0%", "100%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 0.9
            }}
            style={{ offsetPath: "path('M180 70 L180 100')" }}
          />

          <motion.circle
            r="2.5"
            fill="#EC4899"
            animate={{
              offsetDistance: ["0%", "100%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 1.2
            }}
            style={{ offsetPath: "path('M180 100 L250 100')" }}
          />
        </svg>

        {/* Mobile-Optimized Labels with Better Positioning */}
        <div className="absolute left-2 top-2">
          <motion.div 
            className="glass-light px-2 py-1 rounded-lg text-xs text-blue-400 flex items-center gap-1 shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BiData size={10} />
            <span className="font-medium">Input</span>
          </motion.div>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 top-12">
          <motion.div 
            className="glass-light px-2 py-1 rounded-lg text-xs text-green-400 flex items-center gap-1 shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
          >
            <BiCheckCircle size={10} />
            <span className="font-medium">Validate</span>
          </motion.div>
        </div>
        
        <div className="absolute left-1/3 top-24">
          <motion.div 
            className="glass-light px-2 py-1 rounded-lg text-xs text-purple-400 flex items-center gap-1 shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -1.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <BiBrain size={10} />
            <span className="font-medium">Process</span>
          </motion.div>
        </div>
        
        <div className="absolute right-2 bottom-2">
          <motion.div 
            className="glass-light px-2 py-1 rounded-lg text-xs text-orange-400 flex items-center gap-1 shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -1.2, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 1.5 }}
          >
            <IoSparkles size={10} />
            <span className="font-medium">Deploy</span>
          </motion.div>
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