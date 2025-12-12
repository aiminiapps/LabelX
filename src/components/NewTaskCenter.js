'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTwitter, FaWallet, FaSpinner, FaCheckCircle, FaTelegram, 
  FaExternalLinkAlt, FaRetweet, FaComment, FaThumbsUp, FaCopy, 
  FaInfoCircle, FaGift, FaCoins,  FaChartLine, 
  FaTrophy, FaFire,  FaShare, FaUsers, 
  FaMobileAlt, FaCheckDouble, FaEye
} from 'react-icons/fa';
import {  TbTarget } from 'react-icons/tb';
import { BiCoin, BiData, BiShield } from 'react-icons/bi';

// Storage Configuration - Updated for LabelX
const STORAGE_KEY = 'labelx-task-center';
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x...';

// LabelX Theme Colors
const theme = {
  primary: '#FF7A1A',
  secondary: '#FDD536',
  success: '#22C55E',
  error: '#EF4444',
  surface: 'rgba(255, 122, 26, 0.1)',
  text: '#F5F5F5'
};

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

// Wallet Hook
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
      alert('🔥 Please install MetaMask extension to start earning LBLX tokens!');
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
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
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
      const message = `Welcome to LabelX!\nAddress: ${address}\nNonce: ${nonce}\nExpiry: ${expiry}`;

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

            if (accounts.length > 0 && 
                accounts[0].toLowerCase() === saved.wallet.address.toLowerCase()) {
              
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
export default function LabelXTaskCenter() {
  const wallet = useWallet();
  const [tasks, setTasks] = useState({});
  const [processingTask, setProcessingTask] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  // Task Definitions - Updated for LabelX
  const taskDefinitions = useMemo(() => ({
    followX: {
      id: 'followX',
      title: 'Follow on X',
      description: 'Follow @LabelX_AI on X (Twitter) for AI training updates',
      reward: 100,
      icon: FaTwitter,
      action: 'https://twitter.com/intent/follow?screen_name=labelxofficial',
      type: 'social',
      difficulty: 'easy'
    },
    likeX: {
      id: 'likeX',
      title: 'Like Post on X',
      description: 'Like our latest post about AI data labeling',
      reward: 50,
      icon: FaThumbsUp,
      action: 'https://x.com/labelxofficial',
      type: 'social',
      difficulty: 'easy'
    },
    commentX: {
      id: 'commentX',
      title: 'Comment on X',
      description: 'Share your thoughts on AI training and data labeling',
      reward: 75,
      icon: FaComment,
      action: 'https://x.com/labelxofficial',
      type: 'social',
      difficulty: 'medium'
    },
    retweetX: {
      id: 'retweetX',
      title: 'Retweet',
      description: 'Help us spread the word about decentralized AI training',
      reward: 60,
      icon: FaRetweet,
      action: 'https://x.com/labelxofficial',
      type: 'social',
      difficulty: 'easy'
    },
    joinTelegram: {
      id: 'joinTelegram',
      title: 'Join Telegram',
      description: 'Join our AI training community on Telegram',
      reward: 80,
      icon: FaTelegram,
      action: 'https://t.me/LabelXAI_Bot',
      type: 'social',
      difficulty: 'easy'
    },
    openMiniApp: {
      id: 'openMiniApp',
      title: 'Open Mini App',
      description: 'Explore our Telegram labeling mini app',
      reward: 80,
      icon: FaMobileAlt,
      action: 'https://t.me/LabelXAI_Bot',
      type: 'app',
      difficulty: 'easy'
    },
    shareX: {
      id: 'shareX',
      title: 'Share with Friends',
      description: 'Share LabelX with your network and earn together',
      reward: 90,
      icon: FaShare,
      action: 'https://twitter.com/intent/tweet?text=Join%20me%20on%20LabelX%20-%20Train%20AI%20and%20earn%20LBLX%20tokens!',
      type: 'social',
      difficulty: 'medium'
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
        message: 'Please connect your wallet first to earn LBLX!'
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
      const message = `Complete task: ${taskId}\nAddress: ${wallet.address}\nReward: ${task.reward} LBLX\nNonce: ${nonce}\nExpiry: ${expiry}`;

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
          message: `🎉 +${task.reward} LBLX earned!`,
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

  // FIXED: Add Token to MetaMask
  const addTokenToMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      setNotification({
        type: 'error',
        message: 'MetaMask not detected. Please install MetaMask extension.'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TOKEN_CONTRACT,
            symbol: 'LBLX',
            decimals: 18,
            image: 'https://label-x.vercel.app/agent/agentlogo.png'
          }
        }
      });

      if (wasAdded) {
        setNotification({
          type: 'success',
          message: '🎉 LBLX token added to MetaMask successfully!'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Failed to add token:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add token. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  }, []);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification({
      type: 'success',
      message: '📋 Copied to clipboard!'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  if (!wallet.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FaSpinner className="animate-spin text-orange-400 mx-auto mb-4" size={48} />
          <p className="text-white text-lg font-medium">Loading Task Center...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing your AI training dashboard</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 backdrop-blur-sm left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div
              className={`glass-light rounded-2xl p-4 shadow-2xl border ${
                notification.type === 'success'
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-red-500/30 bg-red-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                {notification.type === 'success' ? (
                  <FaCheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <FaInfoCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{notification.message}</p>
                  {notification.txHash && (
                    <a
                      href={`https://bscscan.com/tx/${notification.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 text-xs hover:underline flex items-center gap-1 mt-1"
                    >
                      View on BscScan <FaExternalLinkAlt size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Bonus Status */}
      <AnimatePresence>
        {wallet.welcomeBonusStatus.sending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="glass rounded-3xl p-8 max-w-sm w-full text-center">
              <FaSpinner className="animate-spin text-orange-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Welcome Bonus Processing</h3>
              <p className="text-gray-400 text-sm">
                Sending 10 LBLX tokens to your wallet...
              </p>
            </div>
          </motion.div>
        )}

        {wallet.welcomeBonusStatus.sent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="glass rounded-3xl p-8 max-w-sm w-full text-center">
              <FaGift className="text-orange-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">🎉 Welcome to LabelX!</h3>
              <p className="text-green-400 font-medium mb-4">
                +10 LBLX tokens added to your wallet!
              </p>
              {wallet.welcomeBonusStatus.txHash && (
                <a
                  href={`https://bscscan.com/tx/${wallet.welcomeBonusStatus.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 text-sm hover:underline flex items-center justify-center gap-2 mb-4"
                >
                  View Transaction <FaExternalLinkAlt size={12} />
                </a>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-2xl font-semibold text-white w-full"
                style={{ backgroundColor: theme.primary }}
              >
                Start Earning More
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto pb-16 space-y-6">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-white">LabelX Tasks</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Complete tasks and earn real LBLX tokens on BSC
          </p>
        </motion.div>

        {/* Wallet Connection */}
        {!wallet.isConnected ? (
          <motion.div {...fadeIn} className="glass rounded-3xl p-8 text-center">
            <FaWallet className="text-orange-400 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect MetaMask to start earning LBLX tokens. New users receive 10 tokens instantly!
            </p>
            <motion.button
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              className="px-8 py-4 rounded-2xl font-semibold text-white flex items-center gap-3 mx-auto"
              style={{ backgroundColor: theme.primary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {wallet.isConnecting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <FaWallet />
                  Connect MetaMask
                </>
              )}
            </motion.button>
            {wallet.error && (
              <p className="text-red-400 mt-4 text-sm">{wallet.error}</p>
            )}
          </motion.div>
        ) : (
          <>
            {/* Wallet Info */}
            <motion.div {...slideIn} className="glass rounded-3xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-light rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaWallet className="text-orange-400" />
                    <span className="text-gray-400 text-sm">Connected Wallet</span>
                  </div>
                  <p className="text-white font-medium text-sm">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </p>
                  <button
                    onClick={() => copyToClipboard(wallet.address)}
                    className="text-orange-400 text-xs mt-1 hover:underline flex items-center gap-1"
                  >
                    <FaCopy size={10} /> Copy
                  </button>
                </div>

                <div className="glass-light rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BiCoin className="text-yellow-400" />
                    <span className="text-gray-400 text-sm">BNB Balance</span>
                  </div>
                  <p className="text-white font-bold">
                    {parseFloat(wallet.balance).toFixed(4)}
                  </p>
                </div>

                <div className="glass-light rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BiShield className="text-green-400" />
                    <span className="text-gray-400 text-sm">Network</span>
                  </div>
                  <p className="text-white font-medium">BSC</p>
                </div>

                <div className="glass-light rounded-2xl p-4">
                  <button
                    onClick={wallet.disconnect}
                    className="w-full py-2 rounded-xl glass-light text-red-400 font-medium text-sm hover:bg-red-500/10"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div {...fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass rounded-2xl p-6 text-center">
                <FaCheckCircle className="text-green-400 mx-auto mb-3" size={32} />
                <p className="text-2xl font-bold text-white mb-1">
                  {stats.completed}/{stats.total}
                </p>
                <p className="text-gray-400 text-sm">Tasks Done</p>
              </div>

              <div className="glass rounded-2xl p-6 text-center">
                <FaCoins className="text-orange-400 mx-auto mb-3" size={32} />
                <p className="text-2xl font-bold text-white mb-1">{stats.earned}</p>
                <p className="text-gray-400 text-sm">LBLX Earned</p>
              </div>

              <div className="glass rounded-2xl p-6 text-center sm:mt-0 -mt-6">
                <FaChartLine className="text-blue-400 mx-auto mb-3" size={32} />
                <p className="text-2xl font-bold text-white mb-1">
                  {Math.round(stats.progress)}%
                </p>
                <p className="text-gray-400 text-sm">Complete</p>
              </div>

              <div className="glass rounded-2xl p-6 text-center sm:mt-0 -mt-6">
                <FaFire className="text-red-400 mx-auto mb-3" size={32} />
                <p className="text-2xl font-bold text-white mb-1">
                  {getStorage()?.stats?.currentStreak || 0}
                </p>
                <p className="text-gray-400 text-sm">Streak</p>
              </div>
            </motion.div>

            {/* Tasks Grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {/* <TbTarget className="text-orange-400" /> */}
                Available Tasks
              </h2>

              {Object.values(taskDefinitions).map((task, index) => {
                const isCompleted = tasks[task.id]?.completed;
                const isProcessing = processingTask === task.id;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass rounded-3xl p-6 ${
                      isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* <div
                          className="p-3 rounded-2xl flex-shrink-0"
                          style={{ backgroundColor: theme.surface }}
                        >
                          <task.icon className="text-orange-400" size={24} />
                        </div> */}

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {task.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">
                            {task.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <BiData size={14} />
                              {task.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <TbTarget size={14} />
                              {task.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          +{task.reward}
                        </div>
                        <div className="text-xs text-gray-400 mb-3">LBLX</div>

                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <FaCheckDouble />
                            Completed
                          </div>
                        ) : (
                          <motion.button
                            onClick={() => completeTask(task.id)}
                            disabled={isProcessing}
                            className="px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: theme.primary }}
                            whileHover={!isProcessing ? { scale: 1.05 } : {}}
                            whileTap={!isProcessing ? { scale: 0.95 } : {}}
                          >
                            {isProcessing ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              'Complete'
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {tasks[task.id]?.txHash && (
                      <div className="mt-4 pt-4 border-t border-gray-700/30">
                        <a
                          href={`https://bscscan.com/tx/${tasks[task.id].txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 text-xs hover:underline flex items-center gap-2"
                        >
                          <FaEye size={12} />
                          View Transaction
                          <FaExternalLinkAlt size={10} />
                        </a>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Completion Message */}
            {stats.completed === stats.total && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-8 text-center"
              >
                <FaTrophy className="text-orange-400 mx-auto mb-4" size={64} />
                <h2 className="text-2xl font-bold text-white mb-3">
                  🎉 All Tasks Completed!
                </h2>
                <p className="text-gray-400 mb-6">
                  Congratulations! You've completed all available tasks!
                </p>
                <div className="glass-light rounded-2xl p-6 inline-block">
                  <p className="text-gray-400 text-sm mb-1">Total Earned</p>
                  <p className="text-4xl font-bold text-orange-400">{stats.earned} LBLX</p>
                </div>
              </motion.div>
            )}

            {/* Import Token Section - FIXED */}
            <motion.div {...fadeIn} className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <BiCoin className="text-orange-400" />
                    Add LBLX to MetaMask
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Import the LBLX token to your MetaMask wallet to see your balance
                  </p>
                  
                  <div className="glass-light rounded-xl p-4 mb-4">
                    <div className="text-xs text-gray-400 mb-1">Token Contract</div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono text-sm flex-1">
                        {/* {TOKEN_CONTRACT} */}
                        {TOKEN_CONTRACT?.slice(0, 15)}...{TOKEN_CONTRACT?.slice(-4)}
                      </p>
                      <button
                        onClick={() => copyToClipboard(TOKEN_CONTRACT)}
                        className="text-orange-400 hover:text-orange-300 flex-shrink-0"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>

                  <motion.button
                    onClick={addTokenToMetaMask}
                    className="w-full px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-3"
                    style={{ backgroundColor: theme.primary }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaWallet />
                    Add LBLX to MetaMask
                  </motion.button>
                </div>

                <button
                  onClick={() => setShowTokenInfo(!showTokenInfo)}
                  className="p-2 rounded-xl glass-light text-gray-400 hover:text-white"
                >
                  <FaInfoCircle size={20} />
                </button>
              </div>

              <AnimatePresence>
                {showTokenInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-700/30"
                  >
                    <h4 className="font-semibold text-white mb-4">How to import LBLX token:</h4>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: 'Open MetaMask', desc: "Make sure you're on the BNB Smart Chain network" },
                        { step: 2, title: 'Click "Import tokens"', desc: 'Find this option at the bottom of the assets list' },
                        { step: 3, title: 'Paste token address', desc: 'Use the contract address shown above' },
                        { step: 4, title: 'Confirm', desc: 'Your LBLX balance will appear in your wallet!' }
                      ].map((item) => (
                        <div key={item.step} className="flex gap-4">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{ backgroundColor: theme.surface, color: theme.primary }}
                          >
                            {item.step}
                          </div>
                          <div>
                            <h5 className="font-medium text-white text-sm">{item.title}</h5>
                            <p className="text-gray-400 text-xs">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
