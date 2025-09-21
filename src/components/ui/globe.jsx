"use client";

import createGlobe from "cobe";
import { useMotionValue, useSpring, motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { IoSparkles, IoGlobe, IoPeople, IoFlash } from "react-icons/io5";
import { BiData, BiBrain, BiNetworkChart } from "react-icons/bi";
import { TbWorldShare, TbBrain } from "react-icons/tb";
import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1200;

// Enhanced LabelX AI Network Locations with activity levels
const LABELX_NETWORK_MARKERS = [
  { location: [37.7749, -122.4194], size: 0.15, activity: 'ultra', city: 'San Francisco', labels: 3247, color: [1, 0.84, 0.21] }, // Silicon Valley - Ultra active
  { location: [40.7128, -74.006], size: 0.13, activity: 'high', city: 'New York', labels: 2856, color: [1, 0.6, 0.1] }, // NYC
  { location: [51.5074, -0.1278], size: 0.11, activity: 'high', city: 'London', labels: 2394, color: [0.8, 0.9, 0.3] }, // London
  { location: [35.6762, 139.6503], size: 0.12, activity: 'high', city: 'Tokyo', labels: 2654, color: [1, 0.5, 0.8] }, // Tokyo
  { location: [19.076, 72.8777], size: 0.14, activity: 'ultra', city: 'Mumbai', labels: 3134, color: [0.2, 0.8, 1] }, // Mumbai - Ultra active
  { location: [39.9042, 116.4074], size: 0.13, activity: 'high', city: 'Beijing', labels: 2898, color: [1, 0.3, 0.3] }, // Beijing
  { location: [-23.5505, -46.6333], size: 0.1, activity: 'medium', city: 'São Paulo', labels: 1867, color: [0.5, 1, 0.5] }, // São Paulo
  { location: [52.5200, 13.4050], size: 0.09, activity: 'medium', city: 'Berlin', labels: 1534, color: [0.8, 0.4, 1] }, // Berlin
  { location: [1.3521, 103.8198], size: 0.1, activity: 'medium', city: 'Singapore', labels: 1745, color: [1, 0.7, 0.2] }, // Singapore
  { location: [55.7558, 37.6176], size: 0.08, activity: 'low', city: 'Moscow', labels: 976, color: [0.6, 0.6, 1] }, // Moscow
  { location: [-33.8688, 151.2093], size: 0.09, activity: 'medium', city: 'Sydney', labels: 1323, color: [1, 0.8, 0.6] }, // Sydney
  { location: [43.6532, -79.3832], size: 0.1, activity: 'medium', city: 'Toronto', labels: 1656, color: [0.4, 1, 0.8] } // Toronto
];

// Optimized COBE configuration with proper world visibility
const ENHANCED_GLOBE_CONFIG = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0.4, // Balanced dark mode - not too black [web:122][web:136]
  diffuse: 2.2, // Enhanced diffuse lighting [web:122][web:136]
  mapSamples: 24000, // Higher quality world dots [web:120][web:122]
  mapBrightness:60.9, // Bright world map visibility [web:120][web:122]
  mapBaseBrightness: 0.05, // Subtle ocean visibility [web:120]
  baseColor: [0.15, 0.15, 0.25], // Subtle blue-gray base [web:122][web:136]
  markerColor: [1, 0.84, 0.21], // LabelX yellow default
  glowColor: [0.2, 0.2, 0.4], // Subtle purple glow [web:122]
  opacity: 0.9, // Slight transparency for premium look [web:120]
  scale: 1.1, // Slightly larger scale [web:120]
  markers: LABELX_NETWORK_MARKERS,
};

export function UltraLabelXGlobe({ className, config = ENHANCED_GLOBE_CONFIG }) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const globeRef = useRef(null);

  // Enhanced live data states
  const [globalStats, setGlobalStats] = useState({
    activeLabelers: 1847,
    totalLabels: 67832,
    networksTraining: 12,
    accuracy: 96.4,
    dataFlowRate: 423
  });

  const [connectionPulses, setConnectionPulses] = useState([]);
  const [activeNode, setActiveNode] = useState(null);

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 25,
    stiffness: 120,
  });

  // Advanced live data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        activeLabelers: 1700 + Math.floor(Math.random() * 200),
        totalLabels: prev.totalLabels + Math.floor(Math.random() * 15) + 3,
        networksTraining: 8 + Math.floor(Math.random() * 8),
        accuracy: 95.5 + Math.random() * 2,
        dataFlowRate: 380 + Math.floor(Math.random() * 90)
      }));

      // Simulate network activity pulses
      const randomNode = LABELX_NETWORK_MARKERS[Math.floor(Math.random() * LABELX_NETWORK_MARKERS.length)];
      setActiveNode(randomNode);
      setTimeout(() => setActiveNode(null), 2000);
      
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Connection pulse animation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      const newPulse = {
        id: Date.now(),
        from: LABELX_NETWORK_MARKERS[Math.floor(Math.random() * LABELX_NETWORK_MARKERS.length)],
        to: LABELX_NETWORK_MARKERS[Math.floor(Math.random() * LABELX_NETWORK_MARKERS.length)]
      };
      
      setConnectionPulses(prev => [...prev.slice(-3), newPulse]);
      
      setTimeout(() => {
        setConnectionPulses(prev => prev.filter(p => p.id !== newPulse.id));
      }, 3000);
    }, 1500);

    return () => clearInterval(pulseInterval);
  }, []);

  // Enhanced haptic feedback
  const triggerHaptic = (intensity = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (intensity === 'medium') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } else {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      }
    }
  };

  const updatePointerInteraction = (value) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
    if (value !== null) triggerHaptic('medium');
  };

  const updateMovement = (clientX) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    let globe;
    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        ...config,
        width: width * 2,
        height: width * 2,
        onRender: (state) => {
          if (!pointerInteracting.current) phi += 0.004; // Smooth auto-rotation
          state.phi = phi + rs.get();
          state.width = width * 2;
          state.height = width * 2;
        },
      });
      globeRef.current = globe;
    }

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    }, 150);

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy();
      }
      window.removeEventListener("resize", onResize);
    };
  }, [rs, config]);

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
      {/* Dynamic header with real-time stats */}
      <div className="relative z-10 mb-5">
        <div className="flex items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">AI Labeling Network</h3>
            </div>
          </div>
          
          {/* Data flow indicator */}
          <div className="glass-light px-3 py-2 rounded-xl flex items-center gap-2">
            <BiNetworkChart className="text-blue-400" size={16} />
            <span className="text-sm text-white font-medium">
              {globalStats.dataFlowRate}/min
            </span>
          </div>
        </div>

        {/* Enhanced stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <motion.div 
            className="glass-light p-3 rounded-xl text-center group cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(34, 197, 94, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onTap={() => triggerHaptic()}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <motion.div 
                className="w-1.5 h-1.5 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <IoPeople size={14} className="text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <motion.div
              key={Math.floor(globalStats.activeLabelers / 10)}
              initial={{ scale: 1.2, color: "#22C55E" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-lg font-bold"
            >
              {globalStats.activeLabelers}
            </motion.div>
            <p className="text-xs text-gray-400">Active</p>
          </motion.div>

          <motion.div 
            className="glass-light p-3 rounded-xl text-center group cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onTap={() => triggerHaptic()}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <motion.div 
                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <BiData size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <motion.div
              key={Math.floor(globalStats.totalLabels / 1000)}
              initial={{ scale: 1.2, color: "#3B82F6" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-lg font-bold"
            >
              {(globalStats.totalLabels / 1000).toFixed(0)}k
            </motion.div>
            <p className="text-xs text-gray-400">Labels</p>
          </motion.div>

          <motion.div 
            className="glass-light p-3 rounded-xl text-center group cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(168, 85, 247, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onTap={() => triggerHaptic()}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <motion.div 
                className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <TbBrain size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <motion.div
              key={globalStats.networksTraining}
              initial={{ scale: 1.2, color: "#A855F7" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-lg font-bold"
            >
              {globalStats.networksTraining}
            </motion.div>
            <p className="text-xs text-gray-400">Training</p>
          </motion.div>

          <motion.div 
            className="glass-light p-3 rounded-xl text-center group cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 214, 10, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onTap={() => triggerHaptic()}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <motion.div 
                className="w-1.5 h-1.5 bg-[#FF7A1A] rounded-full"
                animate={{ 
                  boxShadow: ["0 0 0 0 rgba(255, 214, 10, 0.4)", "0 0 0 4px rgba(255, 214, 10, 0)"],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <IoSparkles size={14} className="text-[#FF7A1A] group-hover:scale-110 transition-transform" />
            </div>
            <motion.div
              key={Math.floor(globalStats.accuracy * 10)}
              initial={{ scale: 1.2, color: "#FFD60A" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-lg font-bold"
            >
              {globalStats.accuracy.toFixed(1)}%
            </motion.div>
            <p className="text-xs text-gray-400">Accuracy</p>
          </motion.div>

          {/* <motion.div 
            className="glass-light p-3 rounded-xl text-center group cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onTap={() => triggerHaptic()}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <motion.div 
                className="w-1.5 h-1.5 bg-red-400 rounded-full"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <IoFlash size={14} className="text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <motion.div
              key={Math.floor(globalStats.dataFlowRate / 50)}
              initial={{ scale: 1.2, color: "#EF4444" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-lg font-bold"
            >
              {Math.floor(globalStats.dataFlowRate / 50)}
            </motion.div>
            <p className="text-xs text-gray-400">Nodes</p>
          </motion.div> */}
        </div>
      </div>

      {/* Enhanced Globe Container */}
      <div
        className={cn(
          "relative mx-auto aspect-[1/1] w-full max-w-[340px] h-[340px]",
          className
        )}
      >
        {/* Multi-layer pulse effects */}
        <AnimatePresence>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute inset-0 rounded-full border border-[#FF7A1A]/20"
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1.3 + i * 0.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3 + i * 0.5, 
                repeat: Infinity, 
                ease: "easeOut",
                delay: i * 0.8
              }}
            />
          ))}
        </AnimatePresence>

        {/* Active node highlight */}
        {/* <AnimatePresence>
          {activeNode && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-yellow-400/50 bg-yellow-400/5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence> */}

        {/* Premium Globe Canvas */}
        <canvas
          className={cn(
            "size-full opacity-0 transition-opacity duration-1000 [contain:layout_paint_size] drop-shadow-2xl filter brightness-110 contrast-105"
          )}
          ref={canvasRef}
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX;
            updatePointerInteraction(e.clientX);
          }}
          onPointerUp={() => updatePointerInteraction(null)}
          onPointerOut={() => updatePointerInteraction(null)}
          onMouseMove={(e) => updateMovement(e.clientX)}
          onTouchMove={(e) =>
            e.touches[0] && updateMovement(e.touches[0].clientX)
          }
        />
        {/* Connection lines visualization */}
        <div className="absolute inset-0 hidden pointer-events-none">
          <AnimatePresence>
            {connectionPulses.map((pulse) => (
              <motion.div
                key={pulse.id}
                className="absolute w-px h-20 bg-gradient-to-b from-transparent via-blue-400/60 to-transparent origin-bottom"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 1 }}
                style={{
                  left: '50%',
                  top: '30%',
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Network Status Footer */}
      <div className="mt-5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-2">
            <span>Network Online</span>
          </div>
          <div className="w-px h-4 bg-gray-600" />
          <div className="flex items-center gap-2">
            <span>{LABELX_NETWORK_MARKERS.length} Global Nodes</span>
          </div>
        </div>
        
        <motion.div 
          className="glass-light px-3 py-1.5 rounded-lg text-xs text-[#FF7A1A] font-medium"
          animate={{ backgroundColor: activeNode ? "rgba(255, 214, 10, 0.1)" : "rgba(255, 255, 255, 0.05)" }}
          transition={{ duration: 0.3 }}
        >
          {activeNode ? `${activeNode.city}` : 'Monitoring...'}
        </motion.div>
      </div>

      {/* Ambient floating data streams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`stream-${i}`}
            className="absolute text-xs text-blue-400/40 font-mono"
            animate={{
              x: [-100, 450],
              y: [Math.random() * 300, Math.random() * 300],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
            style={{ left: -50, top: Math.random() * 300 }}
          >
            {`${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}`}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default UltraLabelXGlobe;
