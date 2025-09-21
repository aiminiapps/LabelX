import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TrueFocus from './ui/TrueFocus';

const LabelXLoader = () => {
  const imageRef = useRef(null);

  return (
    <div className='min-h-screen max-w-md w-full relative flex items-center justify-center mx-auto overflow-hidden'>
      {/* Background decorations - Updated for LabelX orange theme */}
      <div className="fixed top-0 inset-0 -z-10">
        <div className="min-h-screen w-full relative bg-black">
          {/* LabelX Orange Glow Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 122, 26, 0.25), transparent 70%), #000000",
            }}
          />
        </div>
      </div>

      {/* Logo with advanced canvas shine effect */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Hidden image for canvas reference - Updated for LabelX */}
          {/* <Image 
            src='/labelx-logo.png' 
            alt='LabelX Logo' 
            width={270} 
            height={80}
            quality={100}
            className="opacity-0 absolute"
            crossOrigin="anonymous"
          /> */}
          <TrueFocus 
            sentence="LabelX"
            manualMode={false}
            blurAmount={7}
            borderColor="#FF7A1A"
            animationDuration={1}
            pauseBetweenAnimations={0}
          />
        </motion.div>
        
        {/* LabelX tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-gray-400 text-sm font-medium">
            Train AI • Earn Tokens
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LabelXLoader;
