'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FaWallet, FaCheckCircle, FaCoins, FaArrowRight, 
  FaTasks, FaGift, FaStar, FaFire 
} from 'react-icons/fa';
import { TbBrain, TbTarget, TbRocket, TbSparkles } from 'react-icons/tb';
import { BiCoin, BiShield } from 'react-icons/bi';

const EarnRewardsBanner = () => {
  const [isHovered, setIsHovered] = useState(false);

  // LabelX Theme
  const theme = {
    primary: '#FF7A1A',
    secondary: '#FDD536',
    success: '#22C55E',
    surface: 'rgba(255, 122, 26, 0.1)'
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-4xl mx-auto p-4 space-y-6"
    >
      {/* Main Hero Banner */}
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${theme.primary}, transparent 70%)`
          }}
        />

        <div className="relative z-10">
          {/* Header Section */}
          <motion.div 
            variants={itemVariants}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaGift className="text-orange-400" size={40} />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Earn Real Rewards!
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              Complete AI labeling tasks and get <span className="text-orange-400 font-bold">LBLX tokens</span> sent directly to your wallet
            </p>
          </motion.div>

          {/* How It Works - 3 Steps */}
          <motion.div 
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            {/* Step 1 */}
            <div className="glass-light rounded-2xl p-6 text-center">
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: theme.surface }}
              >
                <FaTasks className="text-orange-400" size={28} />
              </div>
              <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
                <span className="text-orange-400 text-xl">1.</span>
                Go to Tasks
              </h3>
              <p className="text-gray-400 text-sm">
                Browse available labeling missions and choose what interests you
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-light rounded-2xl p-6 text-center">
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: theme.surface }}
              >
                <TbBrain className="text-orange-400" size={28} />
              </div>
              <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
                <span className="text-orange-400 text-xl">2.</span>
                Complete Tasks
              </h3>
              <p className="text-gray-400 text-sm">
                Label data, review submissions, and help train AI models
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-light rounded-2xl p-6 text-center">
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: theme.surface }}
              >
                <FaWallet className="text-green-400" size={28} />
              </div>
              <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
                <span className="text-orange-400 text-xl">3.</span>
                Get Rewards
              </h3>
              <p className="text-gray-400 text-sm">
                Earn LBLX tokens sent directly to your connected wallet
              </p>
            </div>
          </motion.div>

          {/* Stats Preview */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="text-center p-4 glass-light rounded-xl">
              <BiCoin className="text-orange-400 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-white mb-1">50-250</div>
              <div className="text-xs text-gray-400">LBLX per task</div>
            </div>

            <div className="text-center p-4 glass-light rounded-xl">
              <FaFire className="text-red-400 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-white mb-1">8+</div>
              <div className="text-xs text-gray-400">Active tasks</div>
            </div>

            <div className="text-center p-4 glass-light rounded-xl">
              <BiShield className="text-green-400 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-white mb-1">BSC</div>
              <div className="text-xs text-gray-400">Real tokens</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary CTA */}
            <Link href="/?tab=task2" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 shadow-lg"
                style={{ backgroundColor: theme.primary }}
                whileHover={{ scale: 1.05, backgroundColor: '#FF8533' }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <TbRocket size={24} />
                Start Earning Now
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaArrowRight />
                </motion.div>
              </motion.button>
            </Link>

            {/* Secondary CTA */}
            <Link href="/?tab=agents" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-white glass-light flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <TbSparkles size={20} />
                Explore AI Agents
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400"
          >
            <FaCheckCircle className="text-green-400" size={16} />
            <span>Verified smart contract on BSC</span>
            <span className="mx-2">•</span>
            <FaStar className="text-yellow-400" size={16} />
            <span>Real blockchain rewards</span>
          </motion.div>
        </div>
      </div>

      {/* Additional Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-light rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-xl flex-shrink-0"
            style={{ backgroundColor: theme.surface }}
          >
            <TbTarget className="text-orange-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-2">Why Complete Tasks?</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Every task you complete helps train better AI models while earning you real cryptocurrency rewards. 
              Your contributions make AI smarter and you get paid for it!
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
                ✓ No minimum payout
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">
                ✓ Instant transfers
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium">
                ✓ Verified rewards
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EarnRewardsBanner;
