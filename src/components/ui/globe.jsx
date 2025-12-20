"use client";

import createGlobe from "cobe";
import { useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { HiSparkles, HiGlobeAlt, HiUsers, HiLightningBolt } from "react-icons/hi";

const MOVEMENT_DAMPING = 1400;

// LabelX Yellow RGB for COBE (0-1 range)
const THEME_COLOR = [1, 0.75, 0.15]; 

// Key Tech Hubs
const NETWORK_MARKERS = [
  { location: [37.7749, -122.4194], size: 0.1 }, // SF
  { location: [40.7128, -74.006], size: 0.08 }, // NYC
  { location: [51.5074, -0.1278], size: 0.08 }, // London
  { location: [35.6762, 139.6503], size: 0.1 }, // Tokyo
  { location: [19.076, 72.8777], size: 0.09 }, // Mumbai
  { location: [1.3521, 103.8198], size: 0.08 }, // Singapore
  { location: [-33.8688, 151.2093], size: 0.08 }, // Sydney
  { location: [52.5200, 13.4050], size: 0.08 }, // Berlin
  { location: [25.2048, 55.2708], size: 0.09 }, // Dubai
];

export function UltraLabelXGlobe({ className }) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const r = useMotionValue(0);
  
  // Smoother spring physics
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  // Live Data Simulation
  const [stats, setStats] = useState({
    nodes: 842,
    throughput: 124,
    latency: 42
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        nodes: prev.nodes + (Math.random() > 0.7 ? 1 : 0),
        throughput: 120 + Math.floor(Math.random() * 15),
        latency: 40 + Math.floor(Math.random() * 5)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let phi = 0;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1, // Full Dark Mode
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 2,
      baseColor: [0.1, 0.1, 0.1],
      markerColor: THEME_COLOR,
      glowColor: [0.15, 0.15, 0.15],
      markers: NETWORK_MARKERS,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.003; // Auto-rotation speed
        }
        state.phi = phi + rs.get();
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    // Fade in effect
    setTimeout(() => {
        if(canvasRef.current) canvasRef.current.style.opacity = '1';
    }, 100);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [rs]);

  return (
    <div className="glass rounded-[32px] mb-6 relative overflow-hidden flex flex-col items-center border border-white/[0.08] bg-[#0A0A0A]">
      
      {/* --- Header Stats --- */}
      <div className="w-full relative z-10 ">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FBBF24]">Network Status</span>
            </div>
            <div className="text-[10px] font-mono text-neutral-500">
                LIVE_FEED_v2.0
            </div>
        </div>

        {/* Clean Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
            <StatItem 
                label="ACTIVE NODES" 
                value={stats.nodes} 
                icon={HiGlobeAlt}
            />
            <StatItem 
                label="THROUGHPUT" 
                value={`${stats.throughput} TPS`} 
                icon={HiLightningBolt}
            />
            <StatItem 
                label="LATENCY" 
                value={`${stats.latency}ms`} 
                icon={HiSparkles}
            />
        </div>
      </div>

      {/* --- Globe Container --- */}
      <div className={cn("relative w-full aspect-square max-w-[320px] my-4 cursor-grab active:cursor-grabbing", className)}>
        
        {/* Subtle Ambient Glow behind Globe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#FBBF24]/5 blur-[60px] rounded-full pointer-events-none" />

        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-0 transition-opacity duration-700"
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX;
            canvasRef.current.style.cursor = "grabbing";
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
            canvasRef.current.style.cursor = "grab";
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
            canvasRef.current.style.cursor = "grab";
          }}
          onMouseMove={(e) => {
            if (pointerInteracting.current !== null) {
              const delta = e.clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta;
              r.set(r.get() + delta / MOVEMENT_DAMPING);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches[0] && pointerInteracting.current !== null) {
              const delta = e.touches[0].clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta;
              r.set(r.get() + delta / MOVEMENT_DAMPING);
            }
          }}
        />
      </div>

      {/* --- Footer Status --- */}
      <div className="w-full px-6 pb-6 pt-2 border-t border-white/[0.05] mt-auto">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>REGION: GLOBAL_WEST</span>
            <span className="text-[#FBBF24]">OPERATIONAL</span>
        </div>
      </div>

    </div>
  );
}

// --- Sub-component: Stat Item ---
const StatItem = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
        <Icon className="text-neutral-600 w-4 h-4 mb-2" />
        <span className="text-lg font-bold text-white tabular-nums tracking-tight">
            {value}
        </span>
        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide">
            {label}
        </span>
    </div>
);

export default UltraLabelXGlobe;