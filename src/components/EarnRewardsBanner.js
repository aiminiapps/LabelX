'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FaCoins, FaArrowRight, FaChevronDown, FaCheckCircle, 
  FaTasks, FaWallet, FaFire 
} from 'react-icons/fa';
import { TbBrain, TbRocket } from 'react-icons/tb';

const CompactEarnBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const theme = {
    primary: '#FF7A1A',
    surface: 'rgba(255, 122, 26, 0.1)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto py-4"
    >
      <div className="glass rounded-3xl p-6 relative overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${theme.primary}, transparent 70%)`
          }}
        />

        <div className="relative z-10">
          {/* Compact Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaCoins className="text-orange-400" size={32} />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Earn Real LBLX Tokens
              </h2>
            </div>
            <p className="text-gray-300">
              Complete tasks → Get paid in crypto to your wallet
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass-light rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-orange-400">50-250</div>
              <div className="text-xs text-gray-400">LBLX/task</div>
            </div>
            <div className="glass-light rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white">8+</div>
              <div className="text-xs text-gray-400">Tasks</div>
            </div>
            <div className="glass-light rounded-xl p-3 text-center">
              <FaFire className="text-red-400 mx-auto mb-1" size={18} />
              <div className="text-xs text-gray-400">Live Now</div>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/?tab=task2">
            <motion.button
              className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 mb-4 shadow-lg"
              style={{ backgroundColor: theme.primary }}
              whileHover={{ scale: 1.02, backgroundColor: '#FF8533' }}
              whileTap={{ scale: 0.98 }}
            >
              <TbRocket size={24} />
              Start Earning Now
              <FaArrowRight />
            </motion.button>
          </Link>

          {/* Learn More Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <span>{isExpanded ? 'Show Less' : 'Learn More'}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown size={14} />
            </motion.div>
          </button>

          {/* Expandable Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-gray-700/30 space-y-4">
                  {/* How It Works */}
                  <h3 className="text-white font-bold mb-4">How It Works:</h3>
                  
                  <div className="space-y-3">
                    {[
                      {
                        icon: FaTasks,
                        title: 'Browse Tasks',
                        desc: 'Choose from AI labeling missions'
                      },
                      {
                        icon: TbBrain,
                        title: 'Complete Work',
                        desc: 'Label data and help train AI'
                      },
                      {
                        icon: FaWallet,
                        title: 'Get Paid',
                        desc: 'Receive LBLX tokens instantly'
                      }
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 glass-light rounded-xl p-3"
                      >
                        <div 
                          className="p-2 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: theme.surface }}
                        >
                          <step.icon className="text-orange-400" size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm mb-1">
                            {i + 1}. {step.title}
                          </h4>
                          <p className="text-gray-400 text-xs">{step.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Benefits */}
                  <div className="mt-4 pt-4 border-t border-gray-700/30">
                    <div className="flex flex-wrap gap-2">
                      {[
                        '✓ Real BSC tokens',
                        '✓ Instant payouts',
                        '✓ No minimum',
                        '✓ Verified contract'
                      ].map((benefit, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <Link href="/?tab=agents">
                    <motion.button
                      className="w-full py-3 rounded-xl font-semibold text-white glass-light flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Explore AI Agents
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CompactEarnBanner;
