'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/storage';
import { useTelegram } from '@/lib/useTelegram';
import CustomLoader from '@/components/Loader';
import BottomNav from '@/components/BottomNav';
import CoinAgent from '@/components/CoinAgent';
import Agent from '@/components/Agent';
import AiNews from '@/components/AiNews';
import TaskCenter from '@/components/TaskCenter';
import InviteCenter from '@/components/InviteCenter';
import DataCenterHome from '@/components/DataCenterHome';
import { SquareCheckBig, UserPlus, History, Check, CheckCircle } from 'lucide-react';

// Earning Timer Component
const EarningTimer = () => {
  const { earningTimer, startEarningTimer, formatTime } = useStore();

  // Synchronize timer state on mount
  useEffect(() => {
    if (earningTimer.isActive && earningTimer.startTimestamp) {
      const duration = 6 * 60 * 60; // 6 hours in seconds
      const elapsedSeconds = Math.floor((Date.now() - earningTimer.startTimestamp) / 1000);
      const newTimeRemaining = Math.max(duration - elapsedSeconds, 0);

      if (newTimeRemaining === 0 && !earningTimer.hasAwardedPoints) {
        // Timer should have completed; updateEarningTimer will handle points
        useStore.getState().updateEarningTimer();
      }
    }
  }, [earningTimer.isActive, earningTimer.startTimestamp, earningTimer.hasAwardedPoints]);

  // Calculate progress percentage
  const totalDuration = 6 * 60 * 60; // 6 hours
  const progress = earningTimer.isActive 
    ? ((totalDuration - earningTimer.timeRemaining) / totalDuration) * 100
    : 0;

  // Calculate stroke-dasharray for circular progress
  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass glass-dark rounded-3xl  relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
    {/* Background effects */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/20 via-blue-300/20 to-purple-300/20 rounded-3xl"></div>
    
    {/* Main circular progress container */}
    <div className="relative flex items-center justify-center mb-8">
      {/*  Circular progress background  */}
        <svg width="300" height="300" className="transform rotate-90">
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#62FF00" />
          <stop offset="100%" stopColor="#62FF00" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content with 3D AN logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
            <Image src='/counter.png' alt='agent logo' width={1000} height={1000} quality={100} className='scale-[114%] mt-7.5 ml-1.5'/>
        </div>
      </div>

      {/* Right side circular element */}
      <div className="absolute right-1/2 -bottom-8 transform translate-x-1/2 -translate-y-1/2">
        <div className="size-10 rounded-full border-lime-400 flex items-center justify-center shadow-lg">
            <Image src='/agent/agentlogo.png' alt='agent logo' width={70} height={70}/>
        </div>
      </div>
    </div>

    {/* Bottom content */}
    <div className="text-center space-y-4 relative z-10">
      <div className='flex items-center gap-16'>
        {/* Earn text */}
      <div className="text-black text-xl font-medium tracking-wider">
        Earn 3,000 DNAU
      </div>

      {/* Timer display */}
      <div className="text-white/80 text-2xl">
        {earningTimer.isActive ? formatTime(earningTimer.timeRemaining) : '00:00:00'}
      </div>

      </div>
      {/* Start button */}
      {!earningTimer.isActive && (
        <button
          onClick={() => startEarningTimer(6 * 60 * 60)}
          className="mt-6 w-full px-8 py-3 glass-light glass-blue text-black font-semibold rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Start Earning
        </button>
      )}
    </div>
  </div>
  );
};

// User Balance Component
const UserBalance = () => {
  const { spaiPoints, agentTickets } = useStore();
  return (
    <div className="flex gap-3 mb-1">
      <div className="flex-1 glass glass-blue rounded-xl p-2 text-center">
        <div className="text-stone-800 font-medium text-[15px]">DNAU <span className='text-3xl'>{spaiPoints.toLocaleString()}</span></div>
      </div>
      <div className="flex-1 glass glass-pruple rounded-xl p-4 text-center">
        <div className="text-stone-800 font-medium text-[15px]">AI LICENCE <span className='text-3xl'>{agentTickets.toLocaleString()}</span></div>
      </div>
    </div>
  );
};

// Social Task Component
const SocialTask = () => {
  const { addSpaiPoints, setTwitterFollowCompleted, tasks } = useStore();
  const [completed, setCompleted] = useState(tasks.followX.completed);
  const { hapticFeedback } = useTelegram();

  const handleJoinX = () => {
    if (!completed) {
      setCompleted(true);
      addSpaiPoints(1000);
      setTwitterFollowCompleted(true);
      hapticFeedback('success');
      window.open('https://x.com/AIDatanaut', '_blank');
    }
  };

  return (
    <div className="backdrop-blur-lg glass rounded-xl p-4 border border-green-400/20 mb-6 border-l-2 border-l-green-500/30 border-r-2 border-r-green-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <div>
            <h3 className="text-black font-semibold">Join DNAU official X</h3>
            <p className="text-gray-700 text-sm">Follow on X for 1,000 DNAU Points</p>
          </div>
        </div>
        <button
          onClick={handleJoinX}
          className={cn(
            'p-2 rounded-lg transition-colors',
            completed ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
          )}
          disabled={completed}
        >
          {completed ? (
              <CheckCircle/>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// Navigation Buttons Component
const NavigationButtons = ({ setActiveTab, earningTimer, startEarningTimer }) => {
  const { hapticFeedback } = useTelegram();

  const handleNavClick = (tab) => {
    hapticFeedback('light');
    setActiveTab(tab);
  };

  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      <button onClick={() => handleNavClick('task')}>
      <div className="glass rounded-xl py-3 flex items-center justify-center border border-green-400/20 border-l-2 border-l-green-500/30 border-r-2 border-r-green-500/30 transition-colors">
          <Image src="/task.svg" alt="SPAI" width={45} height={45} />
        </div>
        <p className="text-gray-700">Task</p>
      </button>
      <button onClick={() => handleNavClick('SPAI')}>
        <div className="glass rounded-xl py-3 flex items-center justify-center border border-green-400/20 border-l-2 border-l-green-500/30 border-r-2 border-r-green-500/30 transition-colors">
          <Image src="/agent/agentlogo.png" alt="DNAU" width={45} height={45} />
        </div>
        <p className="text-gray-700">DNAU AI</p>
      </button>
      <button onClick={() => handleNavClick('invite')}>
      <div className="glass rounded-xl py-3 flex items-center justify-center border border-green-400/20 border-l-2 border-l-green-500/30 border-r-2 border-r-green-500/30 transition-colors">
          <Image src="/invite.svg" alt="SPAI" width={45} height={45} />
        </div>
        <p className="text-gray-700">Invite</p>
      </button>
      <button
        onClick={() => {
          hapticFeedback('medium');
          startEarningTimer(6 * 60 * 60);
        }}
        disabled={earningTimer.isActive}
        className={cn(
          'text-white font-medium rounded-lg text-sm transition-opacity',
          earningTimer.isActive ? 'opacity-40' : 'opacity-100'
        )}
      >
        <div className="glass rounded-xl flex items-center justify-center border border-green-400/20 border-l-2 border-l-green-500/30 border-r-2 border-r-green-500/30 transition-colors">
          <Image src="/earn.png" alt="SPAI" width={45} height={45} />
        </div>
        <p className="text-gray-700">Start</p>
      </button>
    </div>
  );
};

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

  const TopNav = () => (
    <div>
      <div className="w-full flex justify-between items-center pb-3 px-1">
        <Image src="/logo.png" alt="Logo" width={250} height={70} priority />
        <div className="text-right">
          <p className="text-gray-800 text-sm">Welcome</p>
          <p className="text-gray-900 text-lg font-semibold">
            {user?.first_name || 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderHomeContent = () => (
    <div className="space-y-6">
      <EarningTimer />
      <UserBalance />
      <SocialTask />
      <NavigationButtons
        setActiveTab={handleTabNavigation}
        earningTimer={earningTimer}
        startEarningTimer={startEarningTimer}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-black text-xl font-semibold">DNAU Trading Suggestion</h2>
        <button
          onClick={() => handleTabNavigation('dataCenter')}
          className="text-gray-700 text-sm hover:text-white transition-colors"
        >
          More
        </button>
      </div>
      <DataCenterHome />
      <div className="h-10" />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'dataCenter':
        return <CoinAgent />;
      case 'SPAI':
        return <Agent />;
      case 'task':
        return <TaskCenter user={user} />;
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
      <div className="min-h-screen bg-[#021941] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-red-400 mb-4">
            <h2 className="text-xl font-bold mb-2">Connection Issue</h2>
            <p className="text-sm">{telegramError}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={retryTelegram}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg block w-full transition-colors"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={loadFallbackUser}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg block w-full transition-colors"
            >
              🧪 Continue with Test User
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg block w-full transition-colors"
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
      <div className="min-h-screen max-w-md w-full tektur mx-auto  text-white flex flex-col items-center p-4 relative overflow-hidden">
          <DebugPanel user={user} error={telegramError} webApp={webApp} />
          
          {/* Background decorations */}
          <div className="fixed top-0 inset-0 -z-10">
          <div className="min-h-screen w-full relative">
 {/* Dark Dot Matrix */}
 <div
   className="absolute inset-0 z-0"
   style={{
     backgroundColor: '#0a0a0a',
     backgroundImage: `
       radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
       radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
     `,
     backgroundSize: '10px 10px',
     imageRendering: 'pixelated',
   }}
 />
 {/* Your Content Here */}
</div>
          </div>
          
          <div className="w-full">
            <TopNav />
            <SearchParamsWrapper setActiveTab={setActiveTab} renderContent={renderContent} />
          </div>
          
          {/* Bottom Navigation */}
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