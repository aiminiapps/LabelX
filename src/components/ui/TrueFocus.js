import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const TrueFocus = ({
  sentence = 'True Focus',
  manualMode = false,
  blurAmount = 5,
  borderColor = '#FBBF24', // LabelX Yellow
  glowColor = 'rgba(251, 191, 36, 0.5)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 0.5
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(
        () => {
          setCurrentIndex(prev => (prev + 1) % words.length);
        },
        (animationDuration + pauseBetweenAnimations) * 1000
      );

      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    });
  }, [currentIndex, words.length]);

  const handleMouseEnter = index => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex);
    }
  };

  return (
    <div className="relative flex gap-2 justify-center items-center flex-wrap" ref={containerRef}>
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={el => (wordRefs.current[index] = el)}
            className="relative text-[3.5rem] md:text-[5rem] font-black cursor-default tracking-tighter leading-none transition-all duration-500"
            style={{
              filter: isActive ? `blur(0px)` : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.3,
              color: isActive ? '#FFFFFF' : '#666666', // Dim inactive words
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="absolute top-0 left-0 pointer-events-none box-border z-10"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0
        }}
        transition={{
          duration: animationDuration,
          ease: "circOut"
        }}
      >
        {/* Top Left Corner */}
        <span
          className="absolute w-6 h-6 border-[3px] rounded-tl-lg top-[-12px] left-[-12px] border-r-0 border-b-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 8px ${borderColor})`
          }}
        ></span>
        
        {/* Top Right Corner */}
        <span
          className="absolute w-6 h-6 border-[3px] rounded-tr-lg top-[-12px] right-[-12px] border-l-0 border-b-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 8px ${borderColor})`
          }}
        ></span>

        {/* Bottom Left Corner */}
        <span
          className="absolute w-6 h-6 border-[3px] rounded-bl-lg bottom-[-12px] left-[-12px] border-r-0 border-t-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 8px ${borderColor})`
          }}
        ></span>

        {/* Bottom Right Corner */}
        <span
          className="absolute w-6 h-6 border-[3px] rounded-br-lg bottom-[-12px] right-[-12px] border-l-0 border-t-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 8px ${borderColor})`
          }}
        ></span>
      </motion.div>
    </div>
  );
};

export default TrueFocus;