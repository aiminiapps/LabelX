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

// FIXED: Wallet Hook with proper ethers v6 support
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
      // Dynamic import with proper handling for both v5 and v6
      const ethersModule = await import('ethers');
      const ethers = ethersModule.default || ethersModule;

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

      // Support both ethers v5 and v6
      let provider, signer, balance = '0';
      
      if (ethers.BrowserProvider) {
        // Ethers v6
        console.log('Using ethers v6');
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        try {
          const rawBalance = await provider.getBalance(accounts[0]);
          balance = ethers.formatEther(rawBalance);
        } catch (balanceError) {
          console.warn('Balance fetch failed:', balanceError);
        }
      } else if (ethers.providers && ethers.providers.Web3Provider) {
        // Ethers v5
        console.log('Using ethers v5');
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        try {
          const rawBalance = await provider.getBalance(accounts[0]);
          balance = ethers.utils.formatEther(rawBalance);
        } catch (balanceError) {
          console.warn('Balance fetch failed:', balanceError);
        }
      } else {
        throw new Error('Ethers library not properly loaded');
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

      console.log('✅ Wallet connected:', accounts[0]);

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

  // Auto-reconnect effect - Fixed with proper ethers handling
  useEffect(() => {
    let isMounted = true;

    const reconnect = async () => {
      try {
        const savedData = getStorageData();
        if (savedData?.wallet?.isConnected && savedData.wallet.address && window.ethereum) {
          const isRecent = savedData.wallet.lastConnected &&
            (Date.now() - savedData.wallet.lastConnected) < 24 * 60 * 60 * 1000;

          if (isRecent) {
            const ethersModule = await import('ethers');
            const ethers = ethersModule.default || ethersModule;

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });

            if (accounts.length > 0 && accounts[0].toLowerCase() === savedData.wallet.address.toLowerCase()) {
              let provider, signer, balance = savedData.wallet.balance;

              if (ethers.BrowserProvider) {
                // Ethers v6
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
                try {
                  const rawBalance = await provider.getBalance(accounts[0]);
                  balance = ethers.formatEther(rawBalance);
                } catch (error) {
                  console.warn('Balance update failed:', error);
                }
              } else if (ethers.providers && ethers.providers.Web3Provider) {
                // Ethers v5
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                try {
                  const rawBalance = await provider.getBalance(accounts[0]);
                  balance = ethers.utils.formatEther(rawBalance);
                } catch (error) {
                  console.warn('Balance update failed:', error);
                }
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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-purple-500 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-lg"
    >
      <div className="flex items-start space-x-3">
        <FaInfoCircle className="text-yellow-400 text-2xl flex-shrink-0 mt-1" />
        <div>
          <p className="text-white font-bold mb-1">🥷 Mobile Setup</p>
          <p className="text-gray-300 text-sm">
            Open in MetaMask app for best experience.
          </p>
          <button
            onClick={() => setShow(false)}
            className="mt-2 text-purple-300 text-xs underline hover:text-purple-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Main Component
export default function TaskCenter() {
  const wallet = useWallet();
  const [tasks, setTasks] = useState({});
  const [processingTask, setProcessingTask] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Task definitions
  const taskDefinitions = useMemo(() => ({
    followX: {
      id: 'followX',
      title: 'Follow on X',
      description: 'Follow @FinjaAI on X (Twitter)',
      reward: 100,
      icon: FaTwitter,
      action: 'https://twitter.com/intent/follow?screen_name=FinjaAI',
      type: 'social'
    },
    commentX: {
      id: 'commentX',
      title: 'Comment on X',
      description: 'Comment on our latest X post',
      reward: 75,
      icon: FaComment,
      action: 'https://twitter.com/FinjaAI',
      type: 'social'
    },
    retweetX: {
      id: 'retweetX',
      title: 'Retweet',
      description: 'Retweet our latest post',
      reward: 60,
      icon: FaRetweet,
      action: 'https://twitter.com/FinjaAI',
      type: 'social'
    },
    joinTelegram: {
      id: 'joinTelegram',
      title: 'Join Telegram',
      description: 'Join our Telegram community',
      reward: 80,
      icon: FaTelegram,
      action: 'https://t.me/FinjaAI',
      type: 'social'
    }
  }), []);

  // Initialize tasks from storage
  useEffect(() => {
    const savedData = getStorageData();
    if (savedData?.tasks) {
      setTasks(savedData.tasks);
    }
  }, []);

  // Task stats
  const stats = useMemo(() => {
    const completed = Object.values(tasks).filter(t => t.completed).length;
    const total = Object.keys(taskDefinitions).length;
    const earned = Object.values(tasks).reduce((sum, t) => sum + (t.reward || 0), 0);
    return { completed, total, earned, progress: total > 0 ? (completed / total) * 100 : 0 };
  }, [tasks, taskDefinitions]);

  // Complete task
  const completeTask = useCallback(async (taskId) => {
    if (!wallet.isConnected || !wallet.signer) {
      alert('Please connect your wallet first!');
      return;
    }

    const task = taskDefinitions[taskId];
    if (!task || tasks[taskId]?.completed) return;

    // Open external link
    if (task.action) {
      window.open(task.action, '_blank', 'noopener,noreferrer');
    }

    setProcessingTask(taskId);

    try {
      const nonce = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const message = `Complete task: ${taskId}\nAddress: ${wallet.address}\nReward: ${task.reward} FINJ\nNonce: ${nonce}\nExpiry: ${expiry}`;

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

      const data = await response.json();

      if (data.success) {
        const newTasks = {
          ...tasks,
          [taskId]: {
            completed: true,
            reward: task.reward,
            txHash: data.txHash,
            timestamp: Date.now()
          }
        };

        setTasks(newTasks);

        const savedData = getStorageData();
        updateStorage({
          tasks: newTasks,
          stats: {
            totalEarned: savedData.stats.totalEarned + task.reward,
            tasksCompleted: savedData.stats.tasksCompleted + 1
          }
        });

        setSuccessMessage({
          task: task.title,
          amount: task.reward,
          txHash: data.txHash
        });

        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(data.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Task error:', error);
      alert(`Task failed: ${error.message}`);
    } finally {
      setProcessingTask(null);
    }
  }, [wallet, tasks, taskDefinitions]);

  // Copy address
  const copyAddress = useCallback((text) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  }, []);

  if (!wallet.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      <MobileMetaMaskNotice />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <GiNinjaStar className="text-6xl text-yellow-400 animate-spin-slow" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
            Ninja Trading
          </h1>
          <p className="text-xl text-gray-300">
            Complete missions and earn FINJ tokens
          </p>
        </motion.div>

        {/* Wallet Connection */}
        {!wallet.isConnected ? (
          <motion.div
            {...fadeIn}
            className="max-w-md mx-auto bg-gradient-to-r from-purple-800/50 to-indigo-800/50 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-500 shadow-2xl"
          >
            <div className="text-center">
              <GiNinjaMask className="text-7xl text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Connect Your Ninja Wallet</h2>
              <p className="text-gray-300 mb-6">
                Connect MetaMask to start earning FINJ tokens.
              </p>
              {wallet.error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                  <p className="text-red-200 text-sm">{wallet.error}</p>
                </div>
              )}
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnecting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
              >
                {wallet.isConnecting ? (
                  <>
                    <FaSpinner className="animate-spin text-xl" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <FaWallet className="text-xl" />
                    <span>Connect MetaMask</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Wallet Info */}
            <motion.div
              {...fadeIn}
              className="max-w-2xl mx-auto bg-gradient-to-r from-purple-800/50 to-indigo-800/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500 shadow-2xl mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <FaWallet className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Connected Wallet</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-mono text-sm">
                        {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                      </p>
                      <button
                        onClick={() => copyAddress(wallet.address)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={wallet.disconnect}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">BNB Balance</p>
                  <p className="text-white font-bold">{parseFloat(wallet.balance).toFixed(4)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Network</p>
                  <p className="text-green-400 font-bold">BSC</p>
                </div>
              </div>
            </motion.div>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="max-w-2xl mx-auto bg-green-500/20 border-2 border-green-500 rounded-2xl p-6 mb-8"
                >
                  <div className="flex items-center space-x-4">
                    <FaCheckCircle className="text-green-400 text-4xl" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {successMessage.task} Complete!
                      </h3>
                      <p className="text-gray-300">
                        +{successMessage.amount} FINJ tokens earned!
                      </p>
                      {successMessage.txHash && (
                        <a
                          href={`https://bscscan.com/tx/${successMessage.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 mt-2"
                        >
                          <span>View Transaction</span>
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Dashboard */}
            <motion.div
              {...fadeIn}
              className="max-w-2xl mx-auto bg-gradient-to-r from-purple-800/50 to-indigo-800/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500 shadow-2xl mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <GiTargetPrize className="mr-3 text-yellow-400" />
                Progress Dashboard
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{stats.completed}/{stats.total}</p>
                  <p className="text-gray-400 text-sm">Tasks Done</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">{stats.earned}</p>
                  <p className="text-gray-400 text-sm">FINJ Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{Math.round(stats.progress)}%</p>
                  <p className="text-gray-400 text-sm">Complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                />
              </div>
            </motion.div>

            {/* Tasks Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {Object.values(taskDefinitions).map((task, index) => {
                const taskState = tasks[task.id];
                const isCompleted = taskState?.completed;
                const isProcessing = processingTask === task.id;
                const IconComponent = task.icon;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-gradient-to-br ${
                      isCompleted
                        ? 'from-green-800/50 to-emerald-800/50 border-green-500'
                        : 'from-purple-800/50 to-indigo-800/50 border-purple-500'
                    } backdrop-blur-lg rounded-2xl p-6 border-2 shadow-2xl transition-all duration-300 hover:scale-105`}
                  >
                    {isCompleted && (
                      <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-2 shadow-lg">
                        <FaCheckCircle className="text-white text-xl" />
                      </div>
                    )}

                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-4 rounded-xl ${
                        isCompleted ? 'bg-green-500/20' : 'bg-purple-500/20'
                      }`}>
                        {isProcessing ? (
                          <FaSpinner className="text-3xl text-white animate-spin" />
                        ) : (
                          <IconComponent className="text-3xl text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{task.title}</h3>
                        <p className="text-gray-300 text-sm mb-2">{task.description}</p>
                        <div className="flex items-center space-x-2">
                          <GiShuriken className="text-yellow-400" />
                          <span className="text-yellow-400 font-bold">+{task.reward} FINJ</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => completeTask(task.id)}
                      disabled={isCompleted || isProcessing}
                      className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500/50 text-white cursor-default'
                          : isProcessing
                          ? 'bg-yellow-500/50 text-white cursor-wait'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:scale-105'
                      } disabled:opacity-50`}
                    >
                      {isCompleted ? 'Completed ✓' : isProcessing ? 'Processing...' : 'Complete Task'}
                    </button>

                    {isCompleted && taskState?.txHash && (
                      <a
                        href={`https://bscscan.com/tx/${taskState.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-blue-400 hover:text-blue-300 text-sm mt-2 flex items-center justify-center space-x-1"
                      >
                        <FaExternalLinkAlt />
                        <span>View on BSCScan</span>
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Completion Message */}
            {stats.completed === stats.total && stats.total > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-800/50 to-orange-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500 shadow-2xl text-center"
              >
                <GiNinjaMask className="text-8xl text-yellow-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-white mb-4">🥷 Mission Complete!</h2>
                <p className="text-xl text-gray-300 mb-2">
                  You've completed all tasks!
                </p>
                <p className="text-3xl font-bold text-yellow-400">
                  Total Earned: {stats.earned} FINJ
                </p>
              </motion.div>
            )}

            {/* Token Info */}
            <motion.div
              {...fadeIn}
              className="max-w-2xl mx-auto bg-gradient-to-r from-purple-800/50 to-indigo-800/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500 shadow-2xl mt-8"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaInfoCircle className="mr-2" />
                How to See Your FINJ Tokens
              </h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-2">1.</span>
                  <span>Open MetaMask and switch to BNB Smart Chain</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-2">2.</span>
                  <span>Click "Import tokens" at the bottom</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-2">3.</span>
                  <div className="flex-1">
                    <span>Paste the token contract address:</span>
                    <div className="mt-2 bg-black/50 rounded-lg p-3 font-mono text-xs break-all flex items-center justify-between">
                      <span>{process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x...'}</span>
                      <button
                        onClick={() => copyAddress(process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS)}
                        className="ml-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-2">4.</span>
                  <span>Your FINJ balance will appear!</span>
                </li>
              </ol>
            </motion.div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
