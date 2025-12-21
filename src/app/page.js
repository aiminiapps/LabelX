'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/storage';
import { useTelegram } from '@/lib/useTelegram';
import CustomLoader from '@/components/Loader';
import BottomNav from '@/components/BottomNav';
import Agent from '@/components/Agent';
import InviteCenter from '@/components/InviteCenter';
import DataCenterHome from '@/components/DataCenterHome';
import { CheckCircle } from 'lucide-react';
import { CiMenuKebab } from "react-icons/ci";
import { motion, AnimatePresence } from 'framer-motion';
import { IoShareSocial, IoLink } from 'react-icons/io5';
import LabelXNetworkGlobe from '@/components/ui/globe';
import PremiumLeaderboard from '@/components/Leaderboard';
import Link from 'next/link';
import { LiaUserFriendsSolid } from "react-icons/lia";
import MultiAgentChatHub from '@/components/MultiAgentChatHub';
import { GoTasklist } from "react-icons/go";
import NewTaskCenter from '@/components/NewTaskCenter';
import { TbWallet, TbWalletOff } from "react-icons/tb";
import EarnRewardsBanner from '@/components/EarnRewardsBanner';

// Debug Panel Component (for development)
const DebugPanel = ({ user, error, webApp }) => {
  const [showDebug, setShowDebug] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 z-50 hidden">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-red-600 text-white p-2 rounded text-xs"
      >
        Debug
      </button>
      {showDebug && (
        <div className="absolute top-10 right-0 bg-black text-white p-4 rounded text-xs max-w-xs overflow-auto max-h-96">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p><strong>User:</strong> {user ? '✅' : '❌'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>WebApp:</strong> {webApp ? '✅' : '❌'}</p>
          <p><strong>Platform:</strong> {webApp?.platform || 'Unknown'}</p>
          <p><strong>Version:</strong> {webApp?.version || 'Unknown'}</p>
          {user && (
            <div className="mt-2">
              <p><strong>User Data:</strong></p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
function TelegramMiniApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showLoader, setShowLoader] = useState(true);
  
  // Use the custom Telegram hook
  const { 
    user, 
    loading: telegramLoading, 
    error: telegramError, 
    webApp,
    showAlert,
    hapticFeedback,
    retry: retryTelegram,
    loadFallbackUser
  } = useTelegram();
  
  const { 
    agentTickets, 
    useAgentTicket, 
    setUser, 
    earningTimer, 
    startEarningTimer 
  } = useStore();
  
  const router = useRouter();

  // Show loader for 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Update store when user changes
  useEffect(() => {
    if (user) {
      console.log('✅ Setting user in store:', user);
      setUser(user);
    }
  }, [user, setUser]);

  const handleAgentAccess = useCallback(() => {
    if (agentTickets > 0) {
      useAgentTicket();
      setActiveTab('SPAI');
      hapticFeedback('success');
    } else {
      showAlert('You need at least 1 Agent Ticket to access the AI Agent.');
      hapticFeedback('error');
    }
  }, [agentTickets, useAgentTicket, showAlert, hapticFeedback]);

  const handleTabNavigation = useCallback((tab) => {
    console.log('Navigating to tab:', tab);
    setActiveTab(tab);
    hapticFeedback('light');
    router.push(`/?tab=${tab}`, { scroll: false });
  }, [router, hapticFeedback]);

  const TopNav = ({ user }) => { 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [walletStatus, setWalletStatus] = useState({
      isConnected: false,
      address: null
    });
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
  
    // Load wallet status from localStorage
    useEffect(() => {
      const loadWalletStatus = () => {
        try {
          const data = localStorage.getItem('labelx-task-center');
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed?.wallet) {
              setWalletStatus({
                isConnected: parsed.wallet.isConnected || false,
                address: parsed.wallet.address || null
              });
            }
          }
        } catch (error) {
          // Silent fail
        }
      };
  
      // Initial load
      loadWalletStatus();
  
      // Listen for storage changes
      const handleStorageChange = () => {
        loadWalletStatus();
      };
  
      window.addEventListener('storage', handleStorageChange);
      
      // Also check periodically for same-tab updates
      const interval = setInterval(loadWalletStatus, 1000);
  
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }, []);
  
    // Optimized haptic feedback function with proper error handling
    const triggerHaptic = useCallback((type = 'light') => {
      try {
        const telegram = window?.Telegram?.WebApp;
        if (!telegram?.HapticFeedback) return;
  
        switch (type) {
          case 'light':
            telegram.HapticFeedback.impactOccurred('light');
            break;
          case 'medium':
            telegram.HapticFeedback.impactOccurred('medium');
            break;
          case 'heavy':
            telegram.HapticFeedback.impactOccurred('heavy');
            break;
          case 'selection':
            telegram.HapticFeedback.selectionChanged();
            break;
          default:
            telegram.HapticFeedback.impactOccurred('light');
        }
      } catch (error) {
        // Silently handle haptic errors - no console.error to avoid spam
      }
    }, []);
  
    // Optimized click outside handler with single event listener
    useEffect(() => {
      if (!isMenuOpen) return;
  
      const handleClickOutside = (event) => {
        const menu = menuRef.current;
        const button = buttonRef.current;
        
        if (menu && button && 
            !menu.contains(event.target) && 
            !button.contains(event.target)) {
          setIsMenuOpen(false);
          triggerHaptic('selection');
        }
      };
  
      // Use passive listeners for better performance
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, [isMenuOpen, triggerHaptic]);
  
    // Optimized menu toggle with immediate state update
    const toggleMenu = useCallback(() => {
      triggerHaptic('light');
      setIsMenuOpen(prev => !prev);
    }, [triggerHaptic]);
  
    // Enhanced share functionality with better error handling
    const handleShare = useCallback(() => {
      triggerHaptic('medium');
      setIsMenuOpen(false);
      
      try {
        const shareUrl = window.location.href;
        const shareText = '🚀 Join me on LabelX - Earn $LBLX tokens by completing AI labeling missions! 🎯';
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        
        const telegram = window?.Telegram?.WebApp;
        
        if (telegram?.openTelegramLink) {
          telegram.openTelegramLink(telegramShareUrl);
        } else if (telegram?.openLink) {
          telegram.openLink(telegramShareUrl);
        } else {
          window.open(telegramShareUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        // Fallback to basic share
        try {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`, '_blank');
        } catch {
          // Silent fail - don't show alerts
        }
      }
    }, [triggerHaptic]);
  
    // Optimized copy link with modern async clipboard API
    const handleCopyLink = useCallback(async () => {
      triggerHaptic('selection');
      setIsMenuOpen(false);
      
      try {
        const url = window.location.href;
        
        // Try modern clipboard API first
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          triggerHaptic('medium');
          
          // Show success feedback via Telegram if available
          const telegram = window?.Telegram?.WebApp;
          if (telegram?.showPopup) {
            telegram.showPopup({
              title: '✅ Link Copied!',
              message: 'Share this link with friends to invite them to LabelX',
              buttons: [{ type: 'ok' }]
            });
          }
          return;
        }
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        if (document.execCommand('copy')) {
          triggerHaptic('medium');
        }
        
        document.body.removeChild(textArea);
      } catch (error) {
        // Silent fail - no alerts or console errors
      }
    }, [triggerHaptic]);
  
    // Format wallet address for display
    const formatWalletAddress = useCallback((address) => {
      if (!address) return null;
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }, []);
  
    // Get wallet status display
    const getWalletStatusDisplay = useCallback(() => {
      if (walletStatus.isConnected && walletStatus.address) {
        return {
          text: formatWalletAddress(walletStatus.address),
          color: 'text-green-400',
          icon: <TbWallet className='size-4 text-green-400'/>
        };
      }
      return {
        text: 'Not connected',
        color: 'text-neutral-500', // Updated to neutral for cleaner look
        icon: <TbWalletOff className='size-4 text-neutral-600'/>
      };
    }, [walletStatus, formatWalletAddress]);
  
    const statusDisplay = getWalletStatusDisplay();
  
    return (
      <div className="relative">
        <div className="w-full flex justify-between items-center pb-3 px-1">
          <div className='flex items-center gap-3'>
            <Image 
              src="/agent/agentlogo.png" 
              alt="Logo" 
              width={40} 
              height={40} 
              priority
              className="rounded-lg border border-white/10"
            />
            <div className="text-left">
              <p className="text-[#FBBF24] text-[10px] font-mono uppercase tracking-wider">System Status</p>
              <div className="flex items-center gap-2">
                {statusDisplay.icon}
                <p className={`${statusDisplay.color} text-xs font-mono`}>
                  {statusDisplay.text}
                </p>
              </div>
            </div>
          </div>
          
          {/* Menu Button */}
          <div className="relative flex items-center gap-3">
            {/* Updated Tasks Button Style */}
            <Link 
              href='/?tab=tasks' 
              className='flex items-center gap-2 bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24] px-4 py-2 rounded-xl backdrop-blur-md transition-all duration-200 active:scale-95 hover:bg-[#FBBF24]/20'
            >
              <GoTasklist size={18}/> 
              <span className="text-xs font-bold font-mono uppercase tracking-wide">Tasks</span>
            </Link>

            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className='p-2 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-md transition-all duration-200 active:scale-95 hover:bg-white/10'
              type="button"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <CiMenuKebab size={20} />
              </motion.div>
            </button>
            
            {/* Popup Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 z-50 min-w-[180px]"
                >
                  <div className="bg-[#0A0A0A]/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10">
                    
                    {/* Invite Friends Option */}
                    <Link
                      href="/?tab=invite"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                    >
                      <div className="p-2 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24]">
                        <LiaUserFriendsSolid size={18} />
                      </div>
                      <span className="text-gray-200 text-sm font-medium">Invite Friends</span>
                    </Link>
                    
                    <div className="h-px bg-white/5 mx-2 my-1"/>
                    
                    {/* Share Option */}
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                      type="button"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <IoShareSocial size={18} />
                      </div>
                      <span className="text-gray-200 text-sm font-medium">Share App</span>
                    </button>
                    
                    <div className="h-px bg-white/5 mx-2 my-1"/>
                    
                    {/* Copy Link Option */}
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                      type="button"
                    >
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                        <IoLink size={18} />
                      </div>
                      <span className="text-gray-200 text-sm font-medium">Copy Link</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };
  
  
  const renderHomeContent = () => (
    <div className="">
      <EarnRewardsBanner/>
      <DataCenterHome />
      <LabelXNetworkGlobe/>
      <div className="h-20" />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'dataCenter':
        return <PremiumLeaderboard/>;
      case 'agents':
        return <Agent />;
      case 'task':
        return <MultiAgentChatHub/>;
      case 'tasks':
        return <NewTaskCenter/>
      case 'invite':
        return <InviteCenter user={user} />;
      default:
        return renderHomeContent();
    }
  };

  // Show loader while initializing
  if (showLoader || telegramLoading) {
    return <CustomLoader />;
  }

  // Show error state with retry options
  if (telegramError && !user) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-red-400 mb-4">
            <h2 className="text-xl font-bold mb-2">Connection Issue</h2>
            <p className="text-sm">{telegramError}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={retryTelegram}
              className="bg-[#FBBF24] hover:bg-[#FCD34D] text-black font-bold px-6 py-3 rounded-xl block w-full transition-colors"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={loadFallbackUser}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl block w-full transition-colors"
            >
              🧪 Continue with Test User
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/5 hover:bg-white/10 text-gray-400 px-6 py-3 rounded-xl block w-full transition-colors"
            >
              🔃 Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<CustomLoader />}>
      <div className="min-h-screen max-w-7xl w-full tektur mx-auto text-white flex flex-col items-center p-4 relative overflow-hidden">
          <DebugPanel user={user} error={telegramError} webApp={webApp} />
          
          {/* Enhanced Background with Yellow Dots */}
          <div className="fixed top-0 inset-0 -z-10 bg-black">
            <div
                className="absolute inset-0 z-0"
                style={{
                backgroundColor: '#000000',
                backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.15) 1px, transparent 1px),
                    radial-gradient(circle at 50% 50%, #151515 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px, 12px 12px',
                backgroundPosition: '0 0, 0 0'
                }}
            />
            {/* Central Glow for depth */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-[#FBBF24]/5 blur-[120px] rounded-full pointer-events-none" />
          </div>
          
          <div className="w-full">
            <TopNav />
            <SearchParamsWrapper setActiveTab={setActiveTab} renderContent={renderContent} />
          </div>
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
          <BottomNav
            activeTab={activeTab}
            setActiveTab={handleTabNavigation}
            handleAgentAccess={handleAgentAccess}
          />
        </div>
      </div>
    </Suspense>
  );
}

// Component to handle useSearchParams
const SearchParamsWrapper = ({ setActiveTab, renderContent }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'home';
    setActiveTab(tab);
  }, [searchParams, setActiveTab]);

  return renderContent();
};

export default TelegramMiniApp;