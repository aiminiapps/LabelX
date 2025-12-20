'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { 
  IoCheckmarkCircle, IoCloseCircle, IoRefresh, IoArrowUndo, IoArrowRedo, 
  IoStatsChart, IoWarning 
} from 'react-icons/io5';
import { 
  BiText, BiImage, BiMicrophone, BiBrain, BiShield, BiChip, BiData 
} from 'react-icons/bi';
import { 
  TbSparkles, TbTarget, TbCpu, TbActivity 
} from 'react-icons/tb';
import { 
  FaRobot, FaCar, FaLeaf, FaShoppingCart, FaUserMd, FaShieldAlt 
} from 'react-icons/fa';
import { HiLightningBolt } from 'react-icons/hi';

const SmartDataPresentation = () => {
  // --- Core State ---
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

  // --- Animation Controls ---
  const cardControls = useAnimation();
  const progressControls = useAnimation();

  // --- Theme Constants ---
  const BRAND_YELLOW = '#FBBF24';

  // --- Realistic AI Data (LabelX Context) ---
  const realisticDataItems = [
    {
      id: 1,
      type: 'text',
      content: 'System Alert: Unknown device attempted root access via port 8080. IP: 192.168.1.105. Timestamp: 23:45:12 UTC.',
      options: ['Routine Scan', 'Malicious Intrusion', 'False Positive', 'System Update'],
      category: 'Security Log Analysis',
      difficulty: 'Medium',
      icon: <FaShieldAlt className="text-[#FBBF24]" size={18} />,
      context: 'Training Intrusion Detection System (IDS) v4.2'
    },
    {
      id: 2,
      type: 'image',
      content: 'Satellite imagery: Crop field sector 7G. NDVI index shows 0.45 variance.',
      options: ['Healthy Vegetation', 'Drought Stress', 'Pest Infestation', 'Harvest Ready'],
      category: 'Agri-Tech Vision',
      difficulty: 'Hard',
      icon: <FaLeaf className="text-green-400" size={18} />,
      context: 'Calibrating yield prediction models for Q3 harvest'
    },
    {
      id: 3,
      type: 'audio',
      content: 'Voice Command: "Initialize sequence alpha-nine, authorization code zero-zero-seven."',
      options: ['Authorize Access', 'Deny - Invalid Code', 'Request Voice ID', 'Flag for Review'],
      category: 'Voice Biometrics',
      difficulty: 'Hard',
      icon: <BiMicrophone className="text-purple-400" size={18} />,
      context: 'High-security voice authentication training'
    },
    {
      id: 4,
      type: 'text',
      content: 'Transaction: 4500 LBLX transferred to 0x...dead. Gas fee: 0.005 ETH. Contract interaction detected.',
      options: ['Legitimate Transfer', 'Phishing Attempt', 'Burn Mechanism', 'Smart Contract Hack'],
      category: 'Blockchain Forensics',
      difficulty: 'Medium',
      icon: <BiChip className="text-blue-400" size={18} />,
      context: 'On-chain anomaly detection protocol'
    },
    {
      id: 5,
      type: 'image',
      content: 'LiDAR Scan: Object detected at 45m. Velocity: 0. Static geometry.',
      options: ['Pedestrian', 'Static Obstacle', 'Vehicle', 'Sensor Noise'],
      category: 'Autonomous Nav',
      difficulty: 'Easy',
      icon: <FaCar className="text-red-400" size={18} />,
      context: 'L4 Autonomous Driving obstacle classification'
    }
  ];

  useEffect(() => {
    setCurrentItem(realisticDataItems[0]);
  }, []);

  // --- Logic Handlers ---

  const handleLabelSelect = async (selectedLabel) => {
    // 1. Animate Selection
    await cardControls.start({ scale: 0.98, transition: { duration: 0.1 } });

    // 2. Logic (Simplified for Demo)
    const isCorrect = Math.random() > 0.3; // Random "correctness" for demo
    const pointsEarned = isCorrect ? 50 + (sessionStats.streak * 5) : 10;

    // 3. Update Stats
    const newStats = {
      ...sessionStats,
      completed: sessionStats.completed + 1,
      streak: isCorrect ? sessionStats.streak + 1 : 0,
      accuracy: Math.min(100, Math.round(((sessionStats.completed * sessionStats.accuracy) + (isCorrect ? 100 : 0)) / (sessionStats.completed + 1))),
      points: sessionStats.points + pointsEarned
    };
    setSessionStats(newStats);

    // 4. Next Item Logic
    if (currentIndex >= realisticDataItems.length - 1) {
      setShowResults(true);
    } else {
      await cardControls.start({ x: -50, opacity: 0, transition: { duration: 0.2 } });
      setCurrentIndex(prev => prev + 1);
      setCurrentItem(realisticDataItems[currentIndex + 1]);
      await cardControls.start({ x: 0, opacity: 1, scale: 1, transition: { duration: 0.3 } });
    }
  };

  const restartSession = () => {
    setShowResults(false);
    setCurrentIndex(0);
    setCurrentItem(realisticDataItems[0]);
    setSessionStats({ completed: 0, accuracy: 0, streak: 0, points: 0, timeSpent: 0 });
  };

  // --- Sub-Components ---

  const StatBadge = ({ icon: Icon, label, value, color = "text-white" }) => (
    <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
    </div>
  );

  // --- Render: Results Screen ---
  if (showResults) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="glass rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_70%)] pointer-events-none" />
            
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 mb-6">
                    <TbTarget className="text-[#FBBF24] w-10 h-10" />
                </div>
                
                <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-2">
                    Session Complete
                </h2>
                <p className="text-neutral-400 font-mono text-sm uppercase tracking-widest mb-10">
                    Protocol Execution Verified
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
                    <StatBadge icon={IoCheckmarkCircle} label="Processed" value={sessionStats.completed} color="text-white" />
                    <StatBadge icon={TbActivity} label="Accuracy" value={`${sessionStats.accuracy}%`} color={sessionStats.accuracy > 80 ? "text-green-400" : "text-[#FBBF24]"} />
                    <StatBadge icon={HiLightningBolt} label="Streak" value={sessionStats.streak} color="text-[#FBBF24]" />
                    <StatBadge icon={TbSparkles} label="Earned" value={`${sessionStats.points} LBLX`} color="text-[#FBBF24]" />
                </div>

                <motion.button
                    onClick={restartSession}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-button w-full max-w-xs mx-auto"
                >
                    Initialize New Batch
                </motion.button>
            </motion.div>
        </div>
      </div>
    );
  }

  // --- Render: Main Interface ---
  if (!currentItem) return null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. System Header (Stats Bar) */}
      <div className="glass rounded-2xl flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#FBBF24]">Live Training Protocol</span>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-neutral-500 font-mono uppercase">Batch Progress</span>
                <span className="text-sm font-bold font-mono text-white">{currentIndex + 1} / {realisticDataItems.length}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-neutral-500 font-mono uppercase">Current Earnings</span>
                <span className="text-sm font-bold font-mono text-[#FBBF24]">{sessionStats.points} LBLX</span>
            </div>
         </div>
      </div>

      {/* 2. Main Work Area */}
      <motion.div 
        animate={cardControls}
        className="glass rounded-[32px] relative overflow-hidden group"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FBBF24]/50 to-transparent" />
        
        <div className="md:p-8 relative z-10 h-full ">
            
            {/* Context Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.05]">
                        {currentItem.icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wide">{currentItem.category}</h3>
                        <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">{currentItem.context}</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.02] text-[10px] font-mono text-neutral-400 uppercase">
                    Difficulty: {currentItem.difficulty}
                </div>
            </div>

            {/* Data Display Content */}
            <div className="mb-8 min-h-[160px] flex items-center justify-center bg-[#050505] rounded-2xl border border-white/[0.05] p-6 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentItem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative z-10 w-full"
                    >
                        {currentItem.type === 'image' ? (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <BiImage className="w-12 h-12 text-neutral-600" />
                                <p className="text-neutral-300 font-mono text-sm max-w-md bg-black/50 p-2 rounded border border-white/5">
                                    [IMG_DATA_PLACEHOLDER]: {currentItem.content}
                                </p>
                            </div>
                        ) : currentItem.type === 'audio' ? (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <div className="w-full h-12 flex items-center justify-center gap-1">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div 
                                            key={i}
                                            className="w-1 bg-[#FBBF24]"
                                            animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                                        />
                                    ))}
                                </div>
                                <p className="text-neutral-400 font-mono text-xs">"{currentItem.content}"</p>
                            </div>
                        ) : (
                            <p className="text-base md:text-xl font-medium text-white leading-relaxed text-center font-mono">
                                {currentItem.content}
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Interaction Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentItem.options.map((option, index) => (
                    <motion.button
                        key={`${currentItem.id}-${index}`}
                        onClick={() => handleLabelSelect(option)}
                        className="group relative flex items-center justify-between p-4 rounded-xl text-neutral-300 hover:text-black bg-white/[0.02] border border-white/[0.08] hover:bg-[#FBBF24] hover:border-[#FBBF24] transition-all duration-300 overflow-hidden"
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="relative z-10 text-sm font-bold  font-mono transition-colors">
                            {option}
                        </span>
                        
                        {/* Hover Arrow */}
                        <div className="relative z-10 w-6 h-6 rounded-full border border-white/20 group-hover:border-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-1.5 h-1.5 bg-black rounded-full" />
                        </div>
                    </motion.button>
                ))}
            </div>

        </div>
      </motion.div>

      {/* 3. Controls Footer */}
      <div className="flex justify-between items-center px-4">
          <button className="flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-white transition-colors">
              <IoArrowUndo className="w-4 h-4" />
              UNDO_ACTION
          </button>
          
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
             <TbCpu className="w-4 h-4" />
             <span>AI_MODEL_CONFIDENCE: 88.4%</span>
          </div>

          <button 
             onClick={() => handleLabelSelect('SKIP')}
             className="flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-[#FBBF24] transition-colors"
          >
              SKIP_ENTRY
              <IoArrowRedo className="w-4 h-4" />
          </button>
      </div>

    </div>
  );
};

export default SmartDataPresentation;