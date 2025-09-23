'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { IoShareSocial, IoCopy, IoGift, IoSparkles, IoCheckmark } from 'react-icons/io5';
import { BiCoin } from 'react-icons/bi';
import { TbUsers, TbGift } from 'react-icons/tb';
import Image from 'next/image';

const InviteFriendsPage = ({ onClose }) => {
  // Component state
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendsInvited, setFriendsInvited] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  
  // Animation controls
  const floatingControls = useAnimation();
  const rewardControls = useAnimation();
  const buttonControls = useAnimation();
  
  // Refs for haptic feedback
  const shareButtonRef = useRef(null);
  const copyButtonRef = useRef(null);

  // Start floating animations on mount
  useEffect(() => {
    startFloatingAnimations();
    loadInviteStats();
  }, []);

  // Floating 3D-style animations
  const startFloatingAnimations = () => {
    floatingControls.start({
      y: [0, -10, 0],
      rotateX: [0, 5, 0],
      rotateY: [0, -5, 5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  };

  // Load invite statistics from localStorage
  const loadInviteStats = () => {
    if (typeof window !== 'undefined') {
      const stats = localStorage.getItem('labelx-invite-stats');
      if (stats) {
        const parsed = JSON.parse(stats);
        setFriendsInvited(parsed.invited || 0);
        setEarnedRewards(parsed.rewards || 0);
      }
    }
  };

  // Save invite statistics
  const saveInviteStats = (invited, rewards) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('labelx-invite-stats', JSON.stringify({
        invited,
        rewards,
        lastUpdated: Date.now()
      }));
    }
  };

  // Haptic feedback [web:8][web:40]
  const triggerHaptic = (type = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'success') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  // Generate referral link
  const generateReferralLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const userId = Math.random().toString(36).substr(2, 9); // Simulate user ID
    return `${baseUrl}?ref=${userId}`;
  };

  // Handle Telegram share [web:40][web:266]
  const handleTelegramShare = async () => {
    triggerHaptic('medium');
    setIsSharing(true);
    
    // Animate button
    await buttonControls.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.4 }
    });

    const referralLink = generateReferralLink();
    const shareText = `🚀 Join me on LabelX and earn $LBLX tokens! 

Help train AI models while earning crypto rewards 💰

Complete micro-labeling tasks, review peer work, and climb the leaderboards! 

Use my invite link and we both get bonus tokens! 🎁`;

    try {
      if (typeof window !== 'undefined') {
        // Use Telegram's share functionality [web:40][web:8]
        if (window.Telegram?.WebApp?.openTelegramLink) {
          const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
          window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
          
          // Simulate successful share
          setTimeout(() => {
            const newInvited = friendsInvited + 1;
            const newRewards = earnedRewards + 50;
            setFriendsInvited(newInvited);
            setEarnedRewards(newRewards);
            saveInviteStats(newInvited, newRewards);
            
            // Celebration animation
            rewardControls.start({
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
              transition: { duration: 0.6 }
            });
            
            triggerHaptic('success');
          }, 2000);
        } else {
          // Fallback for non-Telegram environments
          const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
          window.open(shareUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      triggerHaptic('error');
    }

    setIsSharing(false);
  };

  // Handle copy link [web:265][web:40]
  const handleCopyLink = async () => {
    triggerHaptic('light');
    
    const referralLink = generateReferralLink();
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      triggerHaptic('success');
      
      // Reset success state after animation
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopySuccess(true);
      triggerHaptic('success');
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className=" flex items-center justify-center pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        className="glass rounded-3xl w-full max-w-md relative overflow-hidden"
      >

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Invite Friends</h2>
          </div>

          {/* 3D Illustration Area */}
          <Image src='/invite.png' alt='Invite Image' width={400} height={400} quality={100} className='mx-auto scale-110'/>

          {/* Reward Information */}
          <div className="text-center mb-8">
            <motion.h3
              className="text-2xl font-bold text-white mb-2"
              animate={rewardControls}
            >
              Invite friends, earn $LBLX!
            </motion.h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              Invite your friends to join LabelX and earn AI training rewards together. 
              Both you and your friend get bonus tokens when they complete their first mission!
            </p>
          </div>

          {/* Reward Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div 
              className="glass-light rounded-2xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                key={friendsInvited}
                initial={{ scale: 1.2, color: "#3B82F6" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                className="text-2xl font-bold mb-1"
              >
                {friendsInvited}
              </motion.div>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <TbUsers size={14} />
                Friends Invited
              </p>
            </motion.div>
            
            <motion.div 
              className="glass-light rounded-2xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                key={earnedRewards}
                initial={{ scale: 1.2, color: "#10B981" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                className="text-2xl font-bold mb-1 flex items-center justify-center gap-1"
              >
                {earnedRewards}
                <BiCoin className="text-yellow-400" size={20} />
              </motion.div>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <TbGift size={14} />
                Tokens Earned
              </p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary Share Button */}
            <motion.button
              ref={shareButtonRef}
              onClick={handleTelegramShare}
              disabled={isSharing}
              className="w-full bg-[#FF7A1A] hover:bg-[#FF7A1A]/80 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              animate={buttonControls}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {isSharing ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <IoSparkles size={20} />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    <IoShareSocial size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
              {isSharing ? 'Sharing...' : 'Invite Contacts'}
            </motion.button>

            {/* Copy Link Button */}
            <motion.button
              ref={copyButtonRef}
              onClick={handleCopyLink}
              className="w-full glass-button py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {copySuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="flex items-center gap-2 text-green-400"
                  >
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      <IoCheckmark size={20} />
                    </motion.div>
                    <span className="font-medium">Link Copied!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-white"
                  >
                    <IoCopy size={20} />
                    <span className="font-medium">Share Link</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Bonus Info */}
          <motion.div 
            className="mt-6 p-4 glass-warm rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 text-[#FF7A1A] mb-2">
              <IoGift size={20} />
              <span className="font-semibold">Bonus Rewards</span>
            </div>
            <p className="text-sm text-gray-300">
              <strong className="text-white">50 $LBLX</strong> for each friend who completes their first mission
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteFriendsPage;
