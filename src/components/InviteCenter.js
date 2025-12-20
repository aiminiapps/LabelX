'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { IoShareSocial, IoCopy, IoCheckmark, IoQrCode, IoStatsChart } from 'react-icons/io5';
import { BiNetworkChart, BiCoinStack } from 'react-icons/bi';
import { TbUsers, TbGift, TbRocket, TbShare } from 'react-icons/tb';
import { HiSparkles } from 'react-icons/hi2';
import Image from 'next/image';

const InviteFriendsPage = ({ onClose }) => {
  // --- Core State ---
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendsInvited, setFriendsInvited] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  
  // --- Animation Controls ---
  const buttonControls = useAnimation();
  
  // --- Load Stats ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stats = localStorage.getItem('labelx-invite-stats');
      if (stats) {
        const parsed = JSON.parse(stats);
        setFriendsInvited(parsed.invited || 0);
        setEarnedRewards(parsed.rewards || 0);
      }
    }
  }, []);

  const saveInviteStats = (invited, rewards) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('labelx-invite-stats', JSON.stringify({ invited, rewards, lastUpdated: Date.now() }));
    }
  };

  // --- Haptic Feedback Logic ---
  const triggerHaptic = (type = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        if (type === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        else if (type === 'error') window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        else window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  };

  // --- Logic Handlers ---
  const generateReferralLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const userId = Math.random().toString(36).substr(2, 9);
    return `${baseUrl}?ref=${userId}`;
  };

  const handleTelegramShare = async () => {
    triggerHaptic('medium');
    setIsSharing(true);
    await buttonControls.start({ scale: 0.95, transition: { duration: 0.1 } });

    const referralLink = generateReferralLink();
    const shareText = `🚀 Join me on LabelX and earn $LBLX tokens! \n\nHelp train AI models while earning crypto rewards 💰\n\nUse my invite link for a sign-up bonus! 🎁`;

    setTimeout(() => {
        // Simulate Logic
        const newInvited = friendsInvited + 1;
        const newRewards = earnedRewards + 50;
        setFriendsInvited(newInvited);
        setEarnedRewards(newRewards);
        saveInviteStats(newInvited, newRewards);
        triggerHaptic('success');
        setIsSharing(false);
        buttonControls.start({ scale: 1 });
        
        // Actual Share
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        if (typeof window !== 'undefined') {
            if (window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
            } else {
                window.open(telegramShareUrl, '_blank');
            }
        }
    }, 1500);
  };

  const handleCopyLink = async () => {
    triggerHaptic('light');
    const referralLink = generateReferralLink();
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      triggerHaptic('success');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
       // Fallback logic omitted for brevity
       setCopySuccess(true);
       setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // --- Render ---
  return (
    <div className="flex items-center justify-center pb-20 pt-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl relative"
      >
        {/* Main Glass Card */}
        <div className="glass overflow-hidden relative group">
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            
            <div className="relative z-10 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                {/* LEFT: Visuals & Stats */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 mb-6">
                        <TbGift className="text-[#FBBF24]" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FBBF24]">Referral Program v2.0</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-4">
                        Grow the <br/><span className="text-[#FBBF24]">Network.</span>
                    </h2>
                    <p className="text-neutral-400 text-sm  md:text-base leading-relaxed max-w-md mb-8">
                        Invite friends to the LabelX protocol. Both parties receive <span className="text-white font-bold">50 LBLX</span> verification bonuses upon their first task completion.
                    </p>

                    {/* Dashboard Stats */}
                    <div className="w-full grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-2xl border border-white/[0.05]">
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.03]">
                            <motion.div 
                                key={friendsInvited}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-2xl font-bold text-white font-mono mb-1"
                            >
                                {friendsInvited}
                            </motion.div>
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono uppercase tracking-wide">
                                <TbUsers size={12} /> Nodes Referred
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/10">
                            <motion.div 
                                key={earnedRewards}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-2xl font-bold text-[#FBBF24] font-mono mb-1"
                            >
                                {earnedRewards}
                            </motion.div>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#FBBF24]/70 font-mono uppercase tracking-wide">
                                <BiCoinStack size={12} /> Total Earned
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Visual & Actions */}
                <div className="relative flex flex-col items-center justify-center">
                    
                    {/* Placeholder 3D Visual - Replace src with your 'invite.png' if preferred, or keep this tech graphic */}
                    <div className="relative w-full aspect-square max-w-[300px] mb-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[#FBBF24]/20 blur-[80px] rounded-full opacity-40 pointer-events-none" />
                        <motion.div
                             animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                             className="relative z-10 w-full h-full"
                        >
                             <Image 
                                src='/invite.png' 
                                alt='Invite Friends' 
                                width={300} 
                                height={300} 
                                className="object-contain drop-shadow-2xl"
                             />
                        </motion.div>
                    </div>

                    {/* Action Stack */}
                    <div className="w-full space-y-3">
                        {/* Primary Share */}
                        <motion.button
                            onClick={handleTelegramShare}
                            disabled={isSharing}
                            animate={buttonControls}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 rounded-xl bg-[#FBBF24] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_-5px_rgba(251,191,36,0.5)] transition-all overflow-hidden relative"
                        >
                            {isSharing ? (
                                <>
                                    <BiNetworkChart className="animate-spin text-black/50" size={20} />
                                    <span className="font-mono text-sm uppercase">Broadcasting...</span>
                                </>
                            ) : (
                                <>
                                    <TbShare className="text-black" size={20} />
                                    <span>Invite Contacts</span>
                                </>
                            )}
                        </motion.button>

                        {/* Secondary Actions Row */}
                        <div className="flex gap-3">
                            <motion.button
                                onClick={handleCopyLink}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 glass-button-secondary py-3 flex items-center justify-center gap-2 text-sm text-neutral-300 hover:text-white"
                            >
                                <AnimatePresence mode="wait">
                                    {copySuccess ? (
                                        <motion.div 
                                            key="check" 
                                            initial={{ scale: 0 }} 
                                            animate={{ scale: 1 }}
                                            className="flex items-center gap-2 text-[#FBBF24]"
                                        >
                                            <IoCheckmark size={16} />
                                            <span className="font-mono">COPIED</span>
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <IoCopy size={16} />
                                            <span>Copy Link</span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="glass-button-secondary py-3 px-4 flex items-center justify-center text-neutral-300 hover:text-white"
                                title="Show QR Code"
                            >
                                <IoQrCode size={18} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteFriendsPage;