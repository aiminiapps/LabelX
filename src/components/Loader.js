import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import TrueFocus from './ui/TrueFocus';
import { HiSparkles } from 'react-icons/hi2';

const LabelXLoader = () => {
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random increment for realistic feel
        const increment = Math.floor(Math.random() * 5) + 2; 
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className='fixed inset-0 w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden z-[9999]'>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* Noise Texture */}
         <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
         
         {/* Central Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[#FBBF24]/10 blur-[120px] rounded-full opacity-40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        
        {/* Animated Brand Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <TrueFocus 
            sentence="Label X"
            manualMode={false}
            blurAmount={8}
            borderColor="#FBBF24" // LabelX Yellow
            animationDuration={0.8}
            pauseBetweenAnimations={0.2}
          />
        </motion.div>

      </div>

      {/* Bottom Loading Bar (System Boot Style) */}
      <div className="absolute bottom-12 w-full max-w-sm px-6">
        <div className="flex justify-between items-end mb-2">
           <span className="text-[10px] text-neutral-500 font-mono uppercase">Initializing Protocol...</span>
           <span className="text-xs font-bold text-[#FBBF24] font-mono">{progress}%</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
           <motion.div 
             className="h-full bg-[#FBBF24]"
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.1 }}
           />
        </div>
        
        <div className="mt-2 text-[10px] text-neutral-700 text-center font-mono">
            SECURE CONNECTION ESTABLISHED
        </div>
      </div>

    </div>
  );
};

export default LabelXLoader;