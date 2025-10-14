'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTwitter, FaWallet, FaSpinner, FaCheckCircle, 
  FaExternalLinkAlt, FaTelegram, FaRetweet, FaComment,
  FaCopy, FaEye, FaInfoCircle
} from 'react-icons/fa';
import { 
  GiNinjaStar, GiNinjaMask, GiTargetPrize, GiShuriken
} from 'react-icons/gi';

// Animation configurations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Storage utilities
const STORAGE_KEY = 'finja-app-data';

const getStorageData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to parse storage data:', error);
    return null;
  }
};

const initializeStorage = () => {
  const defaultData = {
    wallet: { isConnected: false, address: '', balance: '0', lastConnected: null },
    tasks: {
      followX: { completed: false, reward: 0, txHash: '', timestamp: null },
      commentX: { completed: false, reward: 0, txHash: '', timestamp: null },
      retweetX: { completed: false, reward: 0, txHash: '', timestamp: null },
      joinTelegram: { completed: false, reward: 0, txHash: '', timestamp: null }
    },
    stats: { totalEarned: 0, tasksCompleted: 0 }
  };

  const existing = getStorageData();
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  return existing;
};

const updateStorage = (updates) => {
  const current = getStorageData() || initializeStorage();
  const newData = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

// Wallet Hook - Fixed to prevent infinite re-renders
const useWallet = () => {
  const [wallet, setWallet] = useState({
    address: null,
    provider: null,
    signer: null,
    isConnecting: false,
    isConnected: false,
    balance: '0',
    error: null,
    isInitialized: false
  });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
        return;
      }
      alert('🥷 Please install MetaMask extension');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { ethers } = await import('ethers');
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to BSC
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-dataseed1.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      let balance = '0';
      try {
        const rawBalance = await provider.getBalance(accounts[0]);
        balance = ethers.utils.formatEther(rawBalance);
      } catch (balanceError) {
        console.warn('Balance fetch failed:', balanceError);
      }

      const newWalletState = {
        address: accounts[0],
        provider,
        signer,
        isConnecting: false,
        isConnected: true,
        balance,
        error: null,
        isInitialized: true
      };

      setWallet(newWalletState);

      // Update storage
      updateStorage({
        wallet: {
          isConnected: true,
          address: accounts[0],
          balance,
          lastConnected: Date.now()
        }
      });

    } catch (error) {
      console.error('Connection failed:', error);
      setWallet(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: error.message,
        isInitialized: true
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      provider: null,
      signer: null,
      isConnecting: false,
      isConnected: false,
      balance: '0',
      error: null,
      isInitialized: true
    });

    updateStorage({
      wallet: { isConnected: false, address: '', balance: '0' }
    });
  }, []);

  // Auto-reconnect effect - Fixed dependencies
  useEffect(() => {
    let isMounted = true;

    const reconnect = async () => {
      try {
        const savedData = getStorageData();
        
        if (savedData?.wallet?.isConnected && savedData.wallet.address && window.ethereum) {
          const isRecent = savedData.wallet.lastConnected && 
            (Date.now() - savedData.wallet.lastConnected) < 24 * 60 * 60 * 1000;

          if (isRecent) {
            const { ethers } = await import('ethers');
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            
            if (accounts.length > 0 && accounts[0].toLowerCase() === savedData.wallet.address.toLowerCase()) {
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              const signer = provider.getSigner();
              
              let balance = savedData.wallet.balance;
              try {
                const rawBalance = await provider.getBalance(accounts[0]);
                balance = ethers.utils.formatEther(rawBalance);
              } catch (error) {
                console.warn('Balance update failed:', error);
              }

              if (isMounted) {
                setWallet({
                  address: accounts[0],
                  provider,
                  signer,
                  isConnecting: false,
                  isConnected: true,
                  balance,
                  error: null,
                  isInitialized: true
                });
              }

              console.log('🔄 Auto-reconnected:', accounts[0]);
              return;
            }
          }
        }
        
        if (isMounted) {
          setWallet(prev => ({ ...prev, isInitialized: true }));
        }
      } catch (error) {
        console.error('Auto-reconnect failed:', error);
        if (isMounted) {
          setWallet(prev => ({ ...prev, isInitialized: true }));
        }
      }
    };

    reconnect();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  return { ...wallet, connectWallet, disconnect };
};

// Mobile MetaMask Notice
function MobileMetaMaskNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const hasMetaMask = window.ethereum?.isMetaMask;
    
    if (isMobile && !hasMetaMask) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      {...fadeIn}
    >
      <div className="glass glass-particles p-8 rounded-3xl max-w-sm w-full text-center border-2 border-orange-500/50">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <GiNinjaMask className="text-3xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white tektur mb-4">🥷 Mobile Setup</h2>
        <p className="text-gray-300 mb-6">Open in MetaMask app for best experience.</p>
        <button
          // onClick={() => window.location.href = `https://metamask.app.link/dapp/${window.location.host}`}
          onClick={() => window.location.href = `https://metamask.app.link/dapp/https://finja-chi.vercel.app/?tab=task`}
          className="w-full flex items-center justify-center gap-3 glass-blue py-4 px-6 rounded-lg font-bold text-white mb-4"
        >
          <FaWallet size={23}/>
          Open in MetaMask
        </button>
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          Continue anyway
        </button>
      </div>
    </motion.div>
  );
}

// Wallet Card Component
function NinjaWalletCard({ wallet }) {
  const { isConnected, address, balance, isConnecting, connectWallet, error, isInitialized } = wallet;
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isInitialized) {
    return (
      <motion.div className="glass glass-particles rounded-2xl mb-6" {...fadeIn}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-400 text-2xl mx-auto mb-3" />
          <p className="text-white"> Initializing...</p>
        </div>
      </motion.div>
    );
  }

  if (isConnected) {
    return (
      <motion.div 
        className="glass rounded-2xl mb-4 border-2 border-green-500/30"
        {...fadeIn}
        style={{padding:"5px"}}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tektur">🥷 Connected</h3>
              <p className="text-green-400 font-mono text-sm">
                {address.slice(0, 8)}...{address.slice(-6)}
              </p>
              <p className="text-gray-400 text-xs">
                ⚡ {parseFloat(balance).toFixed(4)} BNB
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={copyAddress}
              className="p-3 glass-particles bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            >
              {copied ? <FaCheckCircle className="text-green-400" /> : <FaCopy className="text-gray-300" />}
            </button>
            <a
              href={`https://bscscan.com/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 glass-particles bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            >
              <FaExternalLinkAlt className="text-gray-300" />
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass p-8 rounded-2xl mb-6 text-center border-2 border-orange-500/30"
      {...fadeIn}
    >
      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <GiNinjaMask className="text-3xl text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-white tektur mb-4">Connect Your Ninja Wallet</h2>
      <p className="text-gray-300 mb-6">Connect MetaMask to start earning FINJ tokens.</p>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="glass-blue w-full flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg text-white"
      >
        {isConnecting ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <FaWallet className="mr-2" />
            Connect MetaMask
          </>
        )}
      </button>
    </motion.div>
  );
}

// Task Card Component
function NinjaTaskCard({ task, onComplete, isProcessing, wallet }) {
  // Memoize storage data to prevent re-renders
  const taskData = useMemo(() => {
    const data = getStorageData();
    return data?.tasks?.[task.id] || { completed: false, reward: 0, txHash: '', timestamp: null };
  }, [task.id]);

  const isCompleted = taskData.completed;

  const handleTaskAction = useCallback(() => {
    if (isCompleted || !wallet.isConnected) return;

    const links = {
      followX: 'https://x.com/fhinjaai',
      commentX: 'https://x.com/fhinjaai/status/1972966938935693555',
      retweetX: 'https://x.com/fhinjaai/status/1972522641451028489',
      joinTelegram: 'https://t.me/FHINJA_Bot'
    };

    if (links[task.id]) {
      window.open(links[task.id], '_blank');
    }

    setTimeout(() => {
      onComplete(task.id);
    }, 3000);
  }, [isCompleted, wallet.isConnected, task.id, onComplete]);

  return (
    <motion.div
      className={`glass p-6 rounded-2xl mb-4 border-2 transition-all duration-300 ${
        isCompleted 
          ? 'border-green-500/50 bg-green-500/10' 
          : 'border-orange-500/30 hover:border-orange-400/60 cursor-pointer'
      }`}
      {...fadeIn}
      whileHover={!isCompleted ? { scale: 1.01 } : {}}
      onClick={handleTaskAction}
      style={{padding:"8px"}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center ${
            isCompleted ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-500'
          }`}>
            {isCompleted ? (
              <FaCheckCircle className="text-2xl text-white" />
            ) : (
              <task.icon className="text-2xl text-white" />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white tektur">{task.title}</h3>
            <p className="text-gray-300 text-sm">{task.description}</p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GiNinjaStar className="text-yellow-400" />
                <span className="text-orange-400 font-bold">{task.reward} FINJ</span>
              </div>
              <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">BSC</div>
              {isCompleted && taskData.txHash && (
                <a
                  href={`https://bscscan.com/tx/${taskData.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEye />
                  <span>View TX</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
        <div className="text-center">
          {isCompleted ? (
            <div className="flex flex-col items-center space-y-2 mt-3">
              <div className="w-full bg-green-500 rounded-lg  flex items-center gap-3 justify-center py-2">
                <FaCheckCircle className="text-xl text-white" />
              <span className="text-gray-200 text-sm font-bold">Completed!</span>
              </div>
            </div>
          ) : !wallet.isConnected ? (
            <div className="text-gray-400 text-sm">Connect wallet first</div>
          ) : (
            <button
              className="glass-blue w-full px-6 py-3 rounded-xl mt-3 font-bold text-white flex items-center justify-center space-x-2"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaExternalLinkAlt />
                  <span>Complete</span>
                </>
              )}
            </button>
          )}
        </div>
    </motion.div>
  );
}

// Progress Dashboard Component
function NinjaProgressDashboard({ wallet }) {
  const stats = useMemo(() => {
    const data = getStorageData();
    return data?.stats || { totalEarned: 0, tasksCompleted: 0 };
  }, []);
  
  return (
    <motion.div 
      className="glass rounded-2xl mb-6"
      {...fadeIn}
      transition={{ delay: 0.2 }}
      style={{padding:"8px"}}
    >
      <div className="flex items-center space-x-3 mb-6">
        <GiTargetPrize className="text-orange-400 text-2xl" />
        <h2 className="text-xl font-bold text-white tektur">Progress Dashboard</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-black/20 rounded-xl border border-orange-500/20">
          <div className="text-2xl font-bold text-orange-400 mb-1">{stats.tasksCompleted}</div>
          <div className="text-sm text-gray-400">Tasks Done</div>
        </div>
        <div className="text-center p-4 bg-black/20 rounded-xl border border-green-500/20">
          <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalEarned}</div>
          <div className="text-sm text-gray-400">FINJ Earned</div>
        </div>
        <div className="text-center p-4 bg-black/20 rounded-xl border border-blue-500/20">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {wallet.isConnected ? '✓' : '✗'}
          </div>
          <div className="text-sm text-gray-400">Connected</div>
        </div>
      </div>
    </motion.div>
  );
}

// Token Import Instructions
function TokenImportInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const tokenAddress = '0x90bdcDBd62e2de5a72AF8bFC21c71dF7577fc756';

  const copyTokenAddress = () => {
    navigator.clipboard.writeText(tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="glass p-6 rounded-2xl mb-6"
      {...fadeIn}
      transition={{ delay: 0.4 }}
      style={{padding:"8px"}}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 mt-3">
          <FaInfoCircle className="text-blue-400 text-xl" />
          <h2 className="text-xl font-bold text-white tektur ">How to See Your FINJ Tokens</h2>
        </div>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-gray-200 bg-black px-2 rounded-lg mt-3 transition-colors"
        >
          {showInstructions ? 'Hide' : 'Show'}
        </button>
      </div>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>Open MetaMask → Import Tokens → Custom Token</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div>Paste contract address:</div>
                    <div className="mt-2 p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                      <code className="text-orange-400 font-mono text-xs break-all">
                        {tokenAddress}
                      </code>
                      <button onClick={copyTokenAddress} className="ml-2 p-1 hover:bg-gray-700 rounded">
                        {copied ? <FaCheckCircle className="text-green-400" /> : <FaCopy className="text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <div className="text-green-400">Your FINJ tokens will appear!</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Success Modal
function SuccessModal({ show, onClose, txHash, amount }) {
  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="glass glass-particles p-8 rounded-3xl text-center max-w-sm w-full border-2 border-green-500/50"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-3xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white tektur mb-2">🥷 Mission Complete!</h2>
        <p className="text-green-400 font-bold mb-4">+{amount} FINJ tokens earned!</p>
        
        {txHash && (
          <a
            href={`https://bscscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm hover:text-blue-300 mb-4 flex items-center justify-center space-x-1"
          >
            <FaEye />
            <span>View Transaction</span>
          </a>
        )}
        
        <button
          onClick={onClose}
          className="glass-button px-6 py-3 rounded-xl font-bold text-white"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

// Main Component
export default function FINJATaskCenter() {
  const wallet = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ txHash: '', amount: 0 });

  const availableTasks = useMemo(() => [
    { id: 'followX', title: 'Follow FINJA on X', description: 'Follow @FhinjaAI on X (Twitter)', reward: 100, icon: FaTwitter },
    { id: 'commentX', title: 'Comment on X Post', description: 'Comment on our announcement', reward: 75, icon: FaComment },
    { id: 'retweetX', title: 'Retweet X Post', description: 'Retweet our pinned post', reward: 60, icon: FaRetweet },
    { id: 'joinTelegram', title: 'Join Telegram', description: 'Join our community', reward: 80, icon: FaTelegram }
  ], []);

  const handleTaskCompletion = useCallback(async (taskId) => {
    if (!wallet.isConnected || !wallet.signer) {
      alert('🥷 Please connect your wallet first!');
      return;
    }

    // Check if already completed
    const data = getStorageData();
    if (data?.tasks?.[taskId]?.completed) {
      alert('🥷 This task is already completed!');
      return;
    }

    setIsProcessing(true);

    try {
      const task = availableTasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const nonce = Date.now().toString();
      const expiry = Math.floor(Date.now() / 1000 + 60 * 10);
      const message = `FINJA Task Completion
Task: ${task.title}
Reward: ${task.reward} FINJ
Address: ${wallet.address}
Nonce: ${nonce}
Expiry: ${expiry}`;

      const signature = await wallet.signer.signMessage(message);

      const response = await fetch('/api/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          address: wallet.address,
          message,
          signature,
          nonce,
          expiry,
          reward: task.reward
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Transaction failed');
      }

      const result = await response.json();

      // Update storage
      const currentData = getStorageData() || {};
      const updatedTasks = {
        ...currentData.tasks,
        [taskId]: { completed: true, reward: task.reward, txHash: result.txHash, timestamp: Date.now() }
      };
      
      const completedCount = Object.values(updatedTasks).filter(t => t.completed).length;
      const totalEarned = Object.values(updatedTasks).reduce((sum, t) => sum + (t.reward || 0), 0);

      updateStorage({
        ...currentData,
        tasks: updatedTasks,
        stats: { tasksCompleted: completedCount, totalEarned }
      });

      setSuccessData({ txHash: result.txHash, amount: task.reward });
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Task completion failed:', error);
      alert(`🥷 Task completion failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [wallet.isConnected, wallet.signer, wallet.address, availableTasks]);

  // Initialize storage on mount
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <div className="min-h-screen text-white pb-24">
      <MobileMetaMaskNotice />
      
      <SuccessModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        txHash={successData.txHash}
        amount={successData.amount}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-8 mt-4" {...fadeIn}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <GiNinjaMask className="text-2xl text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white tektur">FINJA</h1>
              <p className="text-orange-400 text-sm">Ninja Trading</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white tektur mb-2">Task Center</h2>
          <p className="text-gray-300">Complete missions and earn FINJ tokens</p>
        </motion.div>

        {/* Components */}
        <NinjaWalletCard wallet={wallet} />
        {wallet.isConnected && <NinjaProgressDashboard wallet={wallet} />}
        {wallet.isConnected && <TokenImportInstructions />}

        {/* Tasks */}
        {wallet.isConnected && (
          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <div className="flex items-center space-x-2 mb-6">
              <GiShuriken className="text-orange-400 text-xl" />
              <h2 className="text-xl font-bold text-white tektur">Available Missions</h2>
            </div>
            <div className="space-y-4">
              {availableTasks.map((task) => (
                <NinjaTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleTaskCompletion}
                  isProcessing={isProcessing}
                  wallet={wallet}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
