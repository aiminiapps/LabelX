'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTwitter, FaWallet, FaSpinner, FaCheckCircle, FaTelegram,
  FaExternalLinkAlt, FaRetweet, FaComment, FaThumbsUp,
  FaCopy, FaInfoCircle, FaGift, FaCoins, FaShieldAlt,
  FaChartLine, FaTrophy, FaFire, FaUserCircle, FaBell,
  FaShare, FaUsers, FaMobileAlt, FaCheckDouble, FaEye
} from 'react-icons/fa';
import Link from 'next/link';

// Storage Configuration
const STORAGE_KEY = 'somnus-task-center';
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x...';

// Animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const slideIn = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.5 }
};

// Storage Utilities
const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const initStorage = () => {
  const defaults = {
    wallet: {
      address: '',
      isConnected: false,
      balance: '0',
      receivedWelcomeBonus: false,
      lastConnected: null
    },
    tasks: {},
    stats: {
      totalEarned: 0,
      tasksCompleted: 0,
      currentStreak: 0,
      lastCompletedDate: null
    },
    achievements: [],
    notifications: []
  };

  const existing = getStorage();
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return existing;
};

const updateStorage = (updates) => {
  const current = getStorage() || initStorage();
  const newData = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

// Wallet Hook with Enhanced Features
const useWallet = () => {
  const [wallet, setWallet] = useState({
    address: null,
    provider: null,
    signer: null,
    isConnecting: false,
    isConnected: false,
    balance: '0',
    tokenBalance: '0',
    error: null,
    isInitialized: false
  });

  const [welcomeBonusStatus, setWelcomeBonusStatus] = useState({
    sending: false,
    sent: false,
    txHash: null
  });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
        return;
      }
      alert('💤 Please install MetaMask extension');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
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

      let provider, signer, balance = '0';

      if (ethers.BrowserProvider) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        try {
          const rawBalance = await provider.getBalance(accounts[0]);
          balance = ethers.formatEther(rawBalance);
        } catch (err) {
          console.warn('Balance fetch failed:', err);
        }
      } else if (ethers.providers) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        try {
          const rawBalance = await provider.getBalance(accounts[0]);
          balance = ethers.utils.formatEther(rawBalance);
        } catch (err) {
          console.warn('Balance fetch failed:', err);
        }
      } else {
        throw new Error('Ethers library not properly loaded');
      }

      setWallet({
        address: accounts[0],
        provider,
        signer,
        isConnecting: false,
        isConnected: true,
        balance,
        tokenBalance: '0',
        error: null,
        isInitialized: true
      });

      // Check welcome bonus
      const savedData = getStorage();
      const receivedBonus = savedData?.wallet?.receivedWelcomeBonus || false;

      updateStorage({
        wallet: {
          address: accounts[0],
          isConnected: true,
          balance,
          receivedWelcomeBonus: receivedBonus,
          lastConnected: Date.now()
        }
      });

      // Send welcome bonus if first time
      if (!receivedBonus) {
        await sendWelcomeBonus(accounts[0], signer);
      }

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

  const sendWelcomeBonus = async (address, signer) => {
    setWelcomeBonusStatus({ sending: true, sent: false, txHash: null });

    try {
      const nonce = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const message = `Welcome to Somnus!\nAddress: ${address}\nNonce: ${nonce}\nExpiry: ${expiry}`;

      const signature = await signer.signMessage(message);

      const response = await fetch('/api/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          message,
          signature,
          nonce,
          expiry,
          reward: 10,
          isWelcomeBonus: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setWelcomeBonusStatus({
          sending: false,
          sent: true,
          txHash: data.txHash
        });

        updateStorage({
          wallet: {
            ...getStorage().wallet,
            receivedWelcomeBonus: true
          },
          stats: {
            totalEarned: 10,
            tasksCompleted: 0,
            currentStreak: 0,
            lastCompletedDate: null
          }
        });

        console.log('🎉 Welcome bonus sent!', data.txHash);
      }
    } catch (error) {
      console.error('Welcome bonus error:', error);
      setWelcomeBonusStatus({ sending: false, sent: false, txHash: null });
    }
  };

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      provider: null,
      signer: null,
      isConnecting: false,
      isConnected: false,
      balance: '0',
      tokenBalance: '0',
      error: null,
      isInitialized: true
    });

    const current = getStorage();
    updateStorage({
      wallet: {
        ...current.wallet,
        isConnected: false,
        address: ''
      }
    });
  }, []);

  // Auto-reconnect
  useEffect(() => {
    let isMounted = true;

    const reconnect = async () => {
      try {
        const saved = getStorage();
        if (saved?.wallet?.isConnected && saved.wallet.address && window.ethereum) {
          const isRecent = saved.wallet.lastConnected &&
            (Date.now() - saved.wallet.lastConnected) < 24 * 60 * 60 * 1000;

          if (isRecent) {
            const ethersModule = await import('ethers');
            const ethers = ethersModule.default || ethersModule;

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });

            if (accounts.length > 0 && accounts[0].toLowerCase() === saved.wallet.address.toLowerCase()) {
              let provider, signer, balance = saved.wallet.balance;

              if (ethers.BrowserProvider) {
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
                try {
                  const rawBalance = await provider.getBalance(accounts[0]);
                  balance = ethers.formatEther(rawBalance);
                } catch (err) {
                  console.warn('Balance update failed');
                }
              } else if (ethers.providers) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                try {
                  const rawBalance = await provider.getBalance(accounts[0]);
                  balance = ethers.utils.formatEther(rawBalance);
                } catch (err) {
                  console.warn('Balance update failed');
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
                  tokenBalance: '0',
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
        if (isMounted) {
          setWallet(prev => ({ ...prev, isInitialized: true }));
        }
      }
    };

    reconnect();

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...wallet, connectWallet, disconnect, welcomeBonusStatus };
};

// Main Component
export default function TaskCenter() {
  const wallet = useWallet();
  const [tasks, setTasks] = useState({});
  const [processingTask, setProcessingTask] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  // Task Definitions with better descriptions
  const taskDefinitions = useMemo(() => ({
    followX: {
      id: 'followX',
      title: 'Follow on X',
      description: 'Follow @Somnus_Ai on X (Twitter) for sleep tips and updates',
      reward: 100,
      icon: FaTwitter,
      action: 'https://twitter.com/intent/follow?screen_name=Somnus_Ai',
      type: 'social',
      difficulty: 'easy'
    },
    likeX: {
      id: 'likeX',
      title: 'Like Post on X',
      description: 'Like our latest post to show your support',
      reward: 50,
      icon: FaThumbsUp,
      action: 'https://x.com/Somnus_Ai',
      type: 'social',
      difficulty: 'easy'
    },
    commentX: {
      id: 'commentX',
      title: 'Comment on X',
      description: 'Share your thoughts on our latest post',
      reward: 75,
      icon: FaComment,
      action: 'https://x.com/Somnus_Ai/status/1961485632565325878',
      type: 'social',
      difficulty: 'medium'
    },
    retweetX: {
      id: 'retweetX',
      title: 'Retweet',
      description: 'Help us spread the word about better sleep',
      reward: 60,
      icon: FaRetweet,
      action: 'https://x.com/Somnus_Ai/status/1961485632565325878',
      type: 'social',
      difficulty: 'easy'
    },
    joinTelegram: {
      id: 'joinTelegram',
      title: 'Join Telegram',
      description: 'Join our exclusive community on Telegram',
      reward: 80,
      icon: FaTelegram,
      action: 'https://t.me/somnus_ai',
      type: 'social',
      difficulty: 'easy'
    },
    openMiniApp: {
      id: 'openMiniApp',
      title: 'Open Mini App',
      description: 'Explore our Telegram mini app',
      reward: 80,
      icon: FaMobileAlt,
      action: 'https://t.me/somnusaibot',
      type: 'app',
      difficulty: 'easy'
    },
    shareX: {
      id: 'shareX',
      title: 'Share with Friends',
      description: 'Share Somnus AI with your network',
      reward: 90,
      icon: FaShare,
      action: 'https://twitter.com/intent/tweet?text=Check%20out%20Somnus%20AI%20for%20better%20sleep!',
      type: 'social',
      difficulty: 'medium'
    },
    joinCommunity: {
      id: 'joinCommunity',
      title: 'Join Community',
      description: 'Connect with other sleep enthusiasts',
      reward: 70,
      icon: FaUsers,
      action: 'https://x.com/Somnus_Ai',
      type: 'social',
      difficulty: 'easy'
    }
  }), []);

  // Initialize tasks
  useEffect(() => {
    const saved = getStorage();
    if (saved?.tasks) {
      setTasks(saved.tasks);
    }
  }, []);

  // Stats calculations
  const stats = useMemo(() => {
    const saved = getStorage();
    const completed = Object.values(tasks).filter(t => t.completed).length;
    const total = Object.keys(taskDefinitions).length;
    const earned = saved?.stats?.totalEarned || 0;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, earned, progress };
  }, [tasks, taskDefinitions]);

  // Complete Task Handler
  const completeTask = useCallback(async (taskId) => {
    if (!wallet.isConnected || !wallet.signer) {
      setNotification({
        type: 'error',
        message: 'Please connect your wallet first!'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const task = taskDefinitions[taskId];
    if (!task || tasks[taskId]?.completed) return;

    // Open link
    if (task.action) {
      window.open(task.action, '_blank', 'noopener,noreferrer');
    }

    setProcessingTask(taskId);

    try {
      const nonce = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const message = `Complete task: ${taskId}\nAddress: ${wallet.address}\nReward: ${task.reward} SOMNUS\nNonce: ${nonce}\nExpiry: ${expiry}`;

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

        const saved = getStorage();
        updateStorage({
          tasks: newTasks,
          stats: {
            totalEarned: saved.stats.totalEarned + task.reward,
            tasksCompleted: saved.stats.tasksCompleted + 1,
            currentStreak: saved.stats.currentStreak + 1,
            lastCompletedDate: Date.now()
          }
        });

        setNotification({
          type: 'success',
          message: `🎉 +${task.reward} SOMNUS earned!`,
          txHash: data.txHash
        });

        setTimeout(() => setNotification(null), 5000);
      } else {
        throw new Error(data.error || 'Transaction failed');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed: ${error.message}`
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setProcessingTask(null);
    }
  }, [wallet, tasks, taskDefinitions]);

  // Add Token to MetaMask
  const addTokenToMetaMask = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TOKEN_CONTRACT,
            symbol: 'SOMNUS',
            decimals: 18,
            image: 'https://www.somnusai.xyz/logo.png'
          }
        }
      });

      setNotification({
        type: 'success',
        message: 'SOMNUS token added to MetaMask!'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to add token:', error);
    }
  }, []);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification({
      type: 'success',
      message: 'Copied to clipboard!'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  if (!wallet.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading Task Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 max-w-md mx-4"
          >
            <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-lg border-2 ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border-green-400' 
                : 'bg-red-500/20 border-red-400'
            }`}>
              <div className="flex items-center space-x-3">
                {notification.type === 'success' ? (
                  <FaCheckCircle className="text-green-400 text-2xl" />
                ) : (
                  <FaBell className="text-red-400 text-2xl" />
                )}
                <div className="flex-1">
                  <p className="text-white font-bold">{notification.message}</p>
                  {notification.txHash && (
                    <a
                      href={`https://bscscan.com/tx/${notification.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 text-sm flex items-center space-x-1 mt-1"
                    >
                      <FaExternalLinkAlt />
                      <span>View Transaction</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Bonus Notification */}
      <AnimatePresence>
        {wallet.welcomeBonusStatus.sending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 mx-3"
          >
            <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-3xl p-8 max-w-md shadow-2xl border-2 border-purple-400">
              <div className="text-center">
                <FaGift className="text-6xl text-yellow-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-3xl font-bold text-white mb-2">Welcome Bonus!</h3>
                <p className="text-gray-200 mb-4">Sending 10 SOMNUS tokens to your wallet...</p>
                <FaSpinner className="text-4xl text-white animate-spin mx-auto" />
              </div>
            </div>
          </motion.div>
        )}

        {wallet.welcomeBonusStatus.sent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => wallet.welcomeBonusStatus.sent = false}
          >
            <div className="bg-gradient-to-br from-green-800 to-emerald-800 rounded-3xl p-8 max-w-md shadow-2xl border-2 border-green-400">
              <div className="text-center">
                <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">Welcome Bonus Received!</h3>
                <p className="text-gray-200 mb-4">🎉 +10 SOMNUS tokens added to your wallet!</p>
                {wallet.welcomeBonusStatus.txHash && (
                  <a
                    href={`https://bscscan.com/tx/${wallet.welcomeBonusStatus.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 flex items-center justify-center space-x-2 mb-4"
                  >
                    <FaExternalLinkAlt />
                    <span>View Transaction</span>
                  </a>
                )}
                <button
                  onClick={() => {}}
                  className="bg-white text-green-800 px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Start Earning More!
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto py-8 max-w-7xl">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
            Task Center
          </h1>
          <p className="text-xl text-gray-300">
            Complete tasks and earn real SOMNUS tokens on BSC
          </p>
        </motion.div>

        {/* Wallet Section */}
        {!wallet.isConnected ? (
          <motion.div {...fadeIn} className="max-w-md mx-auto mb-12">
            <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-400 shadow-2xl">
              <div className="text-center">
                <FaWallet className="text-7xl text-purple-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-6">
                  Connect MetaMask to start earning SOMNUS tokens. New users receive 10 tokens instantly!
                </p>
                {wallet.error && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                    <p className="text-red-200 text-sm">{wallet.error}</p>
                  </div>
                )}
                <button
                  onClick={wallet.connectWallet}
                  disabled={wallet.isConnecting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
                >
                  {wallet.isConnecting ? (
                    <>
                      <FaSpinner className="animate-spin text-xl" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <FaWallet className="text-xl" />
                      <span>Connect Wallet & Get 10 SOMNUS</span>
                    </>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <FaShieldAlt />
                  <span>Secure connection via MetaMask</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Wallet Info Card */}
            <motion.div {...slideIn} className="max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-400 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Connected Wallet</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-mono">
                          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                        </p>
                        <button
                          onClick={() => copyToClipboard(wallet.address)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">BNB Balance</p>
                      <p className="text-white font-bold">{parseFloat(wallet.balance).toFixed(4)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Network</p>
                      <p className="text-green-400 font-bold text-sm">BSC</p>
                    </div>
                    <button
                      onClick={wallet.disconnect}
                      className="text-gray-400 hover:text-white transition-colors text-sm px-4 py-2 border border-gray-600 rounded-lg hover:border-white"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Add Token Button */}
                <div className="mt-4 pt-4 border-t border-purple-400/30">
                  <button
                    onClick={addTokenToMetaMask}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaWallet />
                    <span>Add SOMNUS Token to MetaMask</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Stats Dashboard */}
            <motion.div {...fadeIn} className="max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-400 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <FaChartLine className="mr-2" />
                  Your Progress
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-black/30 rounded-xl">
                    <FaTrophy className="text-3xl text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stats.completed}/{stats.total}</p>
                    <p className="text-gray-400 text-sm">Tasks Done</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-xl">
                    <FaCoins className="text-3xl text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stats.earned}</p>
                    <p className="text-gray-400 text-sm">SOMNUS Earned</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-xl">
                    <FaFire className="text-3xl text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{Math.round(stats.progress)}%</p>
                    <p className="text-gray-400 text-sm">Complete</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-xl">
                    <FaCheckDouble className="text-3xl text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{getStorage()?.stats?.currentStreak || 0}</p>
                    <p className="text-gray-400 text-sm">Streak</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Tasks Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                      className={`relative bg-gradient-to-br backdrop-blur-lg rounded-2xl p-6 border-2 shadow-2xl transition-all duration-300 hover:scale-105 ${
                        isCompleted
                          ? 'from-green-800/30 to-emerald-800/30 border-green-400'
                          : 'from-purple-800/30 to-pink-800/30 border-purple-400 hover:border-pink-400'
                      }`}
                    >
                      {isCompleted && (
                        <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-2 shadow-lg">
                          <FaCheckCircle className="text-white text-xl" />
                        </div>
                      )}

                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`p-4 rounded-xl shadow-lg ${
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
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <FaCoins className="text-yellow-400" />
                              <span className="text-yellow-400 font-bold">+{task.reward}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.difficulty === 'easy' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {task.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => completeTask(task.id)}
                        disabled={isCompleted || isProcessing}
                        className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                          isCompleted
                            ? 'bg-green-500/30 text-white cursor-default'
                            : isProcessing
                            ? 'bg-yellow-500/30 text-white cursor-wait'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg'
                        } disabled:opacity-50`}
                      >
                        {isCompleted ? (
                          <>
                            <FaCheckCircle />
                            <span>Completed</span>
                          </>
                        ) : isProcessing ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FaExternalLinkAlt />
                            <span>Complete Task</span>
                          </>
                        )}
                      </button>

                      {isCompleted && taskState?.txHash && (
                        <a
                          href={`https://bscscan.com/tx/${taskState.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-blue-400 hover:text-blue-300 text-sm mt-2 flex items-center justify-center space-x-1"
                        >
                          <FaEye />
                          <span>View on BSCScan</span>
                        </a>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Completion Celebration */}
              {stats.completed === stats.total && stats.total > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-yellow-800/30 to-orange-800/30 backdrop-blur-lg rounded-3xl p-8 border-2 border-yellow-400 shadow-2xl text-center mb-8"
                >
                  <FaTrophy className="text-8xl text-yellow-400 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-4xl font-bold text-white mb-4">🎉 All Tasks Complete!</h2>
                  <p className="text-xl text-gray-300 mb-2">
                    Congratulations! You've completed all available tasks!
                  </p>
                  <p className="text-3xl font-bold text-yellow-400 mb-4">
                    Total Earned: {stats.earned} SOMNUS
                  </p>
                  <button
                    onClick={() => setShowTokenInfo(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    View My Tokens
                  </button>
                </motion.div>
              )}

              {/* Token Info Section */}
              <motion.div {...fadeIn} className="bg-gradient-to-br from-purple-800/30 to-pink-800/30 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-400 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <FaInfoCircle className="mr-2" />
                  How to View Your SOMNUS Tokens
                </h3>
                <ol className="space-y-4 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">1</span>
                    <div className="flex-1">
                      <p className="font-bold text-white mb-1">Open MetaMask</p>
                      <p>Make sure you're on the BNB Smart Chain network</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">2</span>
                    <div className="flex-1">
                      <p className="font-bold text-white mb-1">Click "Import tokens"</p>
                      <p>Find this option at the bottom of the assets list</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">3</span>
                    <div className="flex-1">
                      <p className="font-bold text-white mb-1">Paste token address</p>
                      <div className="mt-2 bg-black/50 rounded-lg p-3 font-mono text-xs break-all flex items-center justify-between">
                        <span className="text-purple-300">{TOKEN_CONTRACT}</span>
                        <button
                          onClick={() => copyToClipboard(TOKEN_CONTRACT)}
                          className="ml-2 text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">4</span>
                    <div className="flex-1">
                      <p className="font-bold text-white mb-1">Confirm</p>
                      <p>Your SOMNUS balance will appear in your wallet!</p>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400 rounded-xl">
                  <p className="text-blue-200 text-sm flex items-start space-x-2">
                    <FaInfoCircle className="flex-shrink-0 mt-1" />
                    <span>Or simply click the "Add SOMNUS Token to MetaMask" button above for instant import!</span>
                  </p>
                </div>
              </motion.div>
            </div>
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
      `}</style>
    </div>
  );
}
