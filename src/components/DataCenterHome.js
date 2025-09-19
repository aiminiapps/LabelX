'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { BiData, BiCheckCircle, BiBrain } from 'react-icons/bi';
import { IoSparkles } from 'react-icons/io5';
import LabelXNetworkGlobe, { Globe } from './ui/globe';

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
      <div className='h-52 mt-14'>
      <LabelXNetworkGlobe/>
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