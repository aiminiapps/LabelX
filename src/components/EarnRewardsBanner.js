'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { 
  FaArrowRight, 
  FaChevronDown, 
  FaCheckCircle, 
  FaWallet,
  FaBolt
} from 'react-icons/fa';
import { TbBrain, TbTargetArrow } from 'react-icons/tb';
import { HiSparkles } from 'react-icons/hi2';

const CompactEarnBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-7xl mx-auto py-8"
    >
      <div className="relative glass rounded-[32px] bg-[#0A0A0A] border border-white/[0.08] overflow-hidden group">
        
        {/* --- Background Texture & Glow --- */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FBBF24]/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 ">
          
          {/* --- 1. Header Section --- */}
          <div className="flex flex-col items-center text-center mb-2">
            <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-3">
              Train AI, <span className="text-[#FBBF24]">Earn Crypto.</span>
            </h2>
            {/* <p className="text-neutral-400 text-sm md:text-base font-light max-w-lg">
              Complete simple verification tasks and receive LBLX tokens directly to your wallet instantly.
            </p> */}
          </div>

          {/* --- 2. "Data Cell" Stats Grid --- */}
          <div className="grid grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.05] rounded-xl overflow-hidden mb-4 max-w-2xl mx-auto">
            <StatCell label="PAYOUT / TASK" value="50 - 250" unit="LBLX" />
            {/* <StatCell label="AVAILABLE" value="8" unit="POOLS" /> */}
            <StatCell label="STATUS" value="LIVE" unit="NOW" highlight />
          </div>

          {/* --- 3. Primary CTA --- */}
          <div className="flex flex-col items-center gap-4">
            <Link href="/?tab=task2" className="w-full max-w-sm">
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-[#FBBF24] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_-5px_rgba(251,191,36,0.5)] transition-shadow"
                >
                <TbTargetArrow className="w-5 h-5" />
                Start Earning Now
                <FaArrowRight className="w-4 h-4" />
                </motion.button>
            </Link>

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-white transition-colors py-2"
            >
                <span>{isExpanded ? 'Collapse Details' : 'How it works'}</span>
                <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                >
                <FaChevronDown className="w-3 h-3" />
                </motion.div>
            </button>
          </div>

          {/* --- 4. Expandable Details --- */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-8 pt-8 border-t border-white/[0.08]">
                  
                  {/* Steps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StepItem 
                        num="01" 
                        title="Browse Tasks" 
                        desc="Select from image, text, or audio labeling pools."
                        icon={FaBolt}
                    />
                    <StepItem 
                        num="02" 
                        title="Complete Work" 
                        desc="Submit high-quality data to train the AI models."
                        icon={TbBrain}
                    />
                    <StepItem 
                        num="03" 
                        title="Get Paid" 
                        desc="Instant smart contract payout to your wallet."
                        icon={FaWallet}
                    />
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {[
                      'Verified Contract',
                      'No Minimum Withdraw',
                      'Instant Settlement',
                      'Gas-Optimized'
                    ].map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FBBF24]/5 border border-[#FBBF24]/20"
                      >
                        <FaCheckCircle className="text-[#FBBF24] w-3 h-3" />
                        <span className="text-[10px] font-mono uppercase tracking-wide text-[#FBBF24]/80">
                            {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// --- Sub-Components for Clean Code ---

const StatCell = ({ label, value, unit, highlight = false }) => (
    <div className="bg-[#0A0A0A] p-4 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{label}</span>
        <div className={`text-xl md:text-2xl font-bold ${highlight ? 'text-[#FBBF24]' : 'text-white'}`}>
            {value} <span className="text-xs font-normal text-neutral-600 ml-0.5">{unit}</span>
        </div>
    </div>
);

const StepItem = ({ num, title, desc, icon: Icon }) => (
    <div className="flex flex-col p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center text-[#FBBF24]">
                <Icon size={16} />
            </div>
            <span className="text-xs font-mono text-neutral-600">{num}</span>
        </div>
        <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
        <p className="text-neutral-400 text-xs leading-relaxed">{desc}</p>
    </div>
);

export default CompactEarnBanner;