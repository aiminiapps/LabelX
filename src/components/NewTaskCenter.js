'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  FaMoon, FaSun, FaCoins, FaTasks, FaChartLine, FaWallet, 
  FaPaperPlane, FaMicrophone, FaVolumeUp, FaHistory, FaBook, 
  FaBed, FaMedal, FaHeart, FaSmile, FaRegMoon, FaPlus, 
  FaTrash, FaEdit, FaSave, FaTimes, FaUserCircle, FaBars,
  FaTwitter, FaTelegram, FaThumbsUp, FaComment, FaRetweet,
  FaExternalLinkAlt, FaMobileAlt, FaShare, FaUsers, FaCheck,
  FaSpinner, FaCheckCircle, FaCopy, FaInfoCircle
} from 'react-icons/fa'
import { BiSleepy, BiMoon } from 'react-icons/bi'
import Image from 'next/image'
import Link from 'next/link'

// Storage Configuration
const STORAGE_KEY = 'somnus-app-data'

// Storage utilities
const getStorageData = () => {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Failed to parse storage data:', error)
    return null
  }
}

const initializeStorage = () => {
  const defaultData = {
    wallet: { 
      isConnected: false, 
      address: '', 
      balance: '0', 
      lastConnected: null,
      receivedWelcomeBonus: false 
    },
    tasks: {
      followX: { completed: false, reward: 0, txHash: '', timestamp: null },
      commentX: { completed: false, reward: 0, txHash: '', timestamp: null },
      retweetX: { completed: false, reward: 0, txHash: '', timestamp: null },
      likeX: { completed: false, reward: 0, txHash: '', timestamp: null },
      joinTelegram: { completed: false, reward: 0, txHash: '', timestamp: null },
      openMiniApp: { completed: false, reward: 0, txHash: '', timestamp: null },
      shareX: { completed: false, reward: 0, txHash: '', timestamp: null },
      joinCommunity: { completed: false, reward: 0, txHash: '', timestamp: null }
    },
    stats: { totalEarned: 0, tasksCompleted: 0 },
    conversation: [],
    onboardingComplete: false,
    userName: '',
    userAge: '',
    userGender: ''
  }

  const existing = getStorageData()
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
    return defaultData
  }

  return existing
}

const updateStorage = (updates) => {
  const current = getStorageData() || initializeStorage()
  const newData = { ...current, ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  return newData
}

const SomnusAgent = () => {
  // Core State Management
  const [state, setState] = useState({
    conversation: [],
    input: '',
    loading: false,
    isTyping: false,
    somTokens: 0,
    sleepStreak: 0,
    activeTab: 'chat',
    showOnboardingModal: false,
    showMobileSidebar: false,
    onboardingComplete: false,
    userName: '',
    userAge: '',
    userGender: ''
  })

  // Wallet State
  const [wallet, setWallet] = useState({
    address: null,
    provider: null,
    signer: null,
    isConnecting: false,
    isConnected: false,
    balance: '0',
    error: null,
    isInitialized: false
  })

  // Task State
  const [tasks, setTasks] = useState({})
  const [processingTask, setProcessingTask] = useState(null)
  const [taskSuccess, setTaskSuccess] = useState(null)
  const [chatHistory, setChatHistory] = useState([])

  // Refs
  const chatEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)
  const scrollTimeoutRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Token Contract Address (BSC)
  const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0xYourTokenAddressHere'

  // Task Definitions
  const taskDefinitions = useMemo(() => ({
    followX: {
      id: 'followX',
      title: 'Follow us on X',
      reward: 100,
      icon: FaTwitter,
      type: 'social',
      action: 'https://twitter.com/intent/follow?screen_name=Somnus_Ai',
      description: 'Follow @SomnusAI for sleep tips'
    },
    likeX: {
      id: 'likeX',
      title: 'Like our post',
      reward: 50,
      icon: FaThumbsUp,
      type: 'social',
      action: 'https://x.com/Somnus_Ai',
      description: 'Show love to our content'
    },
    commentX: {
      id: 'commentX',
      title: 'Comment on post',
      reward: 75,
      icon: FaComment,
      type: 'social',
      action: 'https://x.com/Somnus_Ai/status/1961485632565325878',
      description: 'Share your thoughts'
    },
    retweetX: {
      id: 'retweetX',
      title: 'Retweet our post',
      reward: 60,
      icon: FaRetweet,
      type: 'social',
      action: 'https://x.com/Somnus_Ai/status/1961485632565325878',
      description: 'Spread the word'
    },
    joinTelegram: {
      id: 'joinTelegram',
      title: 'Join Telegram',
      reward: 80,
      icon: FaTelegram,
      type: 'social',
      action: 'https://t.me/somnus_ai',
      description: 'Join our community'
    },
    openMiniApp: {
      id: 'openMiniApp',
      title: 'Open mini app',
      reward: 80,
      icon: FaMobileAlt,
      type: 'app',
      action: 'https://t.me/somnusaibot',
      description: 'Explore our app'
    },
    shareX: {
      id: 'shareX',
      title: 'Share with friends',
      reward: 90,
      icon: FaShare,
      type: 'social',
      action: 'https://twitter.com/intent/tweet?text=Check%20out%20Somnus%20AI%20for%20better%20sleep!',
      description: 'Share with friends'
    },
    joinCommunity: {
      id: 'joinCommunity',
      title: 'Join community',
      reward: 70,
      icon: FaUsers,
      type: 'social',
      action: 'https://x.com/Somnus_Ai',
      description: 'Connect with others'
    }
  }), [])

  // Memoized values
  const completedTasksCount = useMemo(() => 
    Object.values(tasks).filter(task => task.completed).length, [tasks]
  )

  const taskProgress = useMemo(() => {
    const total = Object.keys(taskDefinitions).length
    return total > 0 ? (completedTasksCount / total) * 100 : 0
  }, [completedTasksCount, taskDefinitions])

  const getUserAvatar = useCallback((seed) => 
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed || 'default'}`, []
  )

  // FIXED: Wallet Connection with proper ethers loading
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
      if (isMobile) {
        // window.location.href = `https://metamask.app.link/dapp/${window.location.host}`
        window.location.href = `https://metamask.app.link/dapp/https://www.somnusai.xyz/ai`
        return
      }
      alert('💤 Please install MetaMask extension')
      return
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Dynamic import with proper handling
      const ethersModule = await import('ethers')
      const ethers = ethersModule.default || ethersModule
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Switch to BSC
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }],
        })
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
          })
        }
      }

      // Support both ethers v5 and v6
      let provider, signer, balance = '0'
      
      if (ethers.BrowserProvider) {
        // Ethers v6
        provider = new ethers.BrowserProvider(window.ethereum)
        signer = await provider.getSigner()
        try {
          const rawBalance = await provider.getBalance(accounts[0])
          balance = ethers.formatEther(rawBalance)
        } catch (balanceError) {
          console.warn('Balance fetch failed:', balanceError)
        }
      } else if (ethers.providers) {
        // Ethers v5
        provider = new ethers.providers.Web3Provider(window.ethereum)
        signer = provider.getSigner()
        try {
          const rawBalance = await provider.getBalance(accounts[0])
          balance = ethers.utils.formatEther(rawBalance)
        } catch (balanceError) {
          console.warn('Balance fetch failed:', balanceError)
        }
      } else {
        throw new Error('Ethers library not properly loaded')
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
      }

      setWallet(newWalletState)

      // Check if user should receive welcome bonus
      const savedData = getStorageData()
      const receivedWelcomeBonus = savedData?.wallet?.receivedWelcomeBonus || false

      // Update storage
      updateStorage({
        wallet: {
          isConnected: true,
          address: accounts[0],
          balance,
          lastConnected: Date.now(),
          receivedWelcomeBonus
        }
      })

      console.log('✅ Wallet connected:', accounts[0])

      // Send welcome bonus if first time
      if (!receivedWelcomeBonus) {
        await sendWelcomeBonus(accounts[0], signer)
      }

    } catch (error) {
      console.error('Connection failed:', error)
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message,
        isInitialized: true
      }))
      alert(`Failed to connect: ${error.message}`)
    }
  }, [])

  // Send Welcome Bonus
  const sendWelcomeBonus = async (address, signer) => {
    try {
      console.log('🎁 Sending welcome bonus to', address)

      const nonce = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const expiry = Math.floor(Date.now() / 1000) + 3600
      const message = `Welcome to Somnus!\nAddress: ${address}\nNonce: ${nonce}\nExpiry: ${expiry}`

      const signature = await signer.signMessage(message)

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
      })

      const data = await response.json()

      if (data.success) {
        console.log('🎉 Welcome bonus sent!', data.txHash)
        
        // Update storage to mark welcome bonus received
        updateStorage({
          wallet: {
            ...getStorageData().wallet,
            receivedWelcomeBonus: true
          },
          stats: {
            totalEarned: 10,
            tasksCompleted: 0
          }
        })

        setState(prev => ({
          ...prev,
          somTokens: prev.somTokens + 10
        }))

        // Show success message
        setTaskSuccess({
          amount: 10,
          txHash: data.txHash,
          message: 'Welcome bonus received! 🎉'
        })

        setTimeout(() => setTaskSuccess(null), 5000)
      } else {
        console.error('Welcome bonus failed:', data.error)
      }
    } catch (error) {
      console.error('Welcome bonus error:', error)
    }
  }

  // Disconnect Wallet
  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      provider: null,
      signer: null,
      isConnecting: false,
      isConnected: false,
      balance: '0',
      error: null,
      isInitialized: true
    })

    const currentData = getStorageData()
    updateStorage({
      wallet: { 
        isConnected: false, 
        address: '', 
        balance: '0',
        receivedWelcomeBonus: currentData?.wallet?.receivedWelcomeBonus || false
      }
    })
  }, [])

  // Complete Task with Real Transaction
  const completeTask = useCallback(async (taskId) => {
    if (!wallet.isConnected || !wallet.signer) {
      alert('💤 Please connect your wallet first!')
      return
    }

    const task = taskDefinitions[taskId]
    if (!task || tasks[taskId]?.completed) return

    // Open external link
    if (task.action && task.type === 'social') {
      try {
        window.open(task.action, '_blank', 'noopener,noreferrer')
      } catch (error) {
        console.error('Failed to open link:', error)
      }
    } else if (task.action && task.type === 'app') {
      try {
        window.location.href = task.action
      } catch (error) {
        console.error('Failed to navigate:', error)
      }
    }

    setProcessingTask(taskId)

    try {
      // Create signature
      const nonce = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hour
      const message = `Complete task: ${taskId}\nAddress: ${wallet.address}\nReward: ${task.reward} SOMNUS\nNonce: ${nonce}\nExpiry: ${expiry}`

      const signature = await wallet.signer.signMessage(message)

      // Send transaction request
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
      })

      const data = await response.json()

      if (data.success) {
        // Update task as completed
        const newTasks = {
          ...tasks,
          [taskId]: {
            completed: true,
            reward: task.reward,
            txHash: data.txHash,
            timestamp: Date.now()
          }
        }

        setTasks(newTasks)

        // Update SOM tokens
        setState(prev => ({
          ...prev,
          somTokens: prev.somTokens + task.reward
        }))

        // Update storage
        const savedData = getStorageData()
        updateStorage({
          tasks: newTasks,
          stats: {
            totalEarned: savedData.stats.totalEarned + task.reward,
            tasksCompleted: savedData.stats.tasksCompleted + 1
          }
        })

        // Show success message
        setTaskSuccess({
          task: task.title,
          amount: task.reward,
          txHash: data.txHash
        })

        setTimeout(() => setTaskSuccess(null), 5000)

      } else {
        throw new Error(data.error || 'Transaction failed')
      }

    } catch (error) {
      console.error('Task completion failed:', error)
      alert(`❌ Task failed: ${error.message}`)
    } finally {
      setProcessingTask(null)
    }
  }, [wallet, tasks, taskDefinitions])

  // Initialize from storage
  useEffect(() => {
    try {
      const savedData = initializeStorage()
      
      setState(prev => ({
        ...prev,
        conversation: Array.isArray(savedData.conversation) ? savedData.conversation : [],
        somTokens: savedData.stats?.totalEarned || 0,
        userName: savedData.userName || '',
        userAge: savedData.userAge || '',
        userGender: savedData.userGender || '',
        onboardingComplete: Boolean(savedData.onboardingComplete)
      }))

      setTasks(savedData.tasks || {})

      // Auto-reconnect wallet
      if (savedData.wallet?.isConnected && savedData.wallet.address && window.ethereum) {
        const reconnect = async () => {
          try {
            const ethersModule = await import('ethers')
            const ethers = ethersModule.default || ethersModule
            
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })
            
            if (accounts.length > 0 && accounts[0].toLowerCase() === savedData.wallet.address.toLowerCase()) {
              let provider, signer, balance = savedData.wallet.balance
              
              if (ethers.BrowserProvider) {
                // Ethers v6
                provider = new ethers.BrowserProvider(window.ethereum)
                signer = await provider.getSigner()
                try {
                  const rawBalance = await provider.getBalance(accounts[0])
                  balance = ethers.formatEther(rawBalance)
                } catch (error) {
                  console.warn('Balance update failed:', error)
                }
              } else if (ethers.providers) {
                // Ethers v5
                provider = new ethers.providers.Web3Provider(window.ethereum)
                signer = provider.getSigner()
                try {
                  const rawBalance = await provider.getBalance(accounts[0])
                  balance = ethers.utils.formatEther(rawBalance)
                } catch (error) {
                  console.warn('Balance update failed:', error)
                }
              }

              setWallet({
                address: accounts[0],
                provider,
                signer,
                isConnecting: false,
                isConnected: true,
                balance,
                error: null,
                isInitialized: true
              })

              console.log('🔄 Auto-reconnected:', accounts[0])
            } else {
              setWallet(prev => ({ ...prev, isInitialized: true }))
            }
          } catch (error) {
            console.error('Auto-reconnect failed:', error)
            setWallet(prev => ({ ...prev, isInitialized: true }))
          }
        }

        reconnect()
      } else {
        setWallet(prev => ({ ...prev, isInitialized: true }))
      }

      // Handle onboarding
      if (!savedData.onboardingComplete) {
        setState(prev => ({ ...prev, showOnboardingModal: true }))
      } else if (!Array.isArray(savedData.conversation) || savedData.conversation.length === 0) {
        const welcomeMsg = {
          role: 'assistant',
          content: `Welcome back, ${savedData.userName || 'Sleep Seeker'}! I'm Somnus, your AI sleep companion. Connect your wallet to earn SOMNUS tokens by completing tasks. How can I help you achieve better sleep today?`,
          timestamp: new Date().toLocaleTimeString({ hour: '2-digit', minute: '2-digit' })
        }
        setState(prev => ({ ...prev, conversation: [welcomeMsg] }))
      }

    } catch (error) {
      console.error('Storage load error:', error)
      setState(prev => ({ ...prev, showOnboardingModal: true }))
    }
  }, [])

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.onboardingComplete) {
        updateStorage({
          conversation: state.conversation,
          userName: state.userName,
          userAge: state.userAge,
          userGender: state.userGender,
          onboardingComplete: state.onboardingComplete
        })
      }
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [state.conversation, state.userName, state.userAge, state.userGender, state.onboardingComplete])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end'
        })
      }
    }, 50)
  }, [])

  useEffect(() => {
    if (state.activeTab === 'chat') {
      scrollToBottom()
    }
  }, [state.conversation, state.isTyping, state.activeTab, scrollToBottom])

  // Hide default header/footer
  useEffect(() => {
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')
    
    if (header) header.style.display = 'none'
    if (footer) footer.style.display = 'none'

    return () => {
      if (header) header.style.display = 'block'
      if (footer) footer.style.display = 'block'
    }
  }, [])

  // Handle message sending
  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault()
    const trimmedInput = state.input.trim()
    if (!trimmedInput || state.loading) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const userMessage = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString({ hour: '2-digit', minute: '2-digit' })
    }

    setState(prev => ({
      ...prev,
      conversation: [...prev.conversation, userMessage],
      input: '',
      loading: true,
      isTyping: true
    }))

    setChatHistory(prev => [trimmedInput, ...prev.slice(0, 9)])

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are Somnus, an AI sleep companion. Be helpful, friendly, and focus on sleep wellness. User: ${state.userName || 'Sleep Seeker'}, Age: ${state.userAge || 'Not provided'}, Gender: ${state.userGender || 'Not provided'}. Provide personalized sleep advice and be conversational.`
            },
            ...state.conversation.slice(-8),
            userMessage
          ],
          userName: state.userName,
          userAge: state.userAge,
          userGender: state.userGender,
          temperature: 0.7,
          max_tokens: 500
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.reply) {
        setState(prev => ({
          ...prev,
          conversation: [...prev.conversation, {
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString({ hour: '2-digit', minute: '2-digit' })
          }]
        }))
      } else {
        throw new Error('No reply from AI')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error)
        const errorMessage = error.message.includes('fetch') 
          ? "I'm having trouble connecting to the server. Please check your internet connection and try again."
          : "I'm experiencing some technical difficulties. Please try again in a moment."
        
        setState(prev => ({
          ...prev,
          conversation: [...prev.conversation, {
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date().toLocaleTimeString({ hour: '2-digit', minute: '2-digit' })
          }]
        }))
      }
    } finally {
      setState(prev => ({ ...prev, isTyping: false, loading: false }))
    }
  }, [state.input, state.loading, state.conversation, state.userName, state.userAge, state.userGender])

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    if (value.length <= 1000) {
      setState(prev => ({ ...prev, input: value }))
    }
  }, [])

  // Handle onboarding
  const handleOnboardingSubmit = useCallback(() => {
    const name = state.userName.trim()
    const age = parseInt(state.userAge)
    
    if (name && age >= 1 && age <= 120 && state.userGender) {
      const welcomeMsg = {
        role: 'assistant',
        content: `Welcome to Somnus, ${name}! I'm your AI sleep companion. Connect your wallet to start earning SOMNUS tokens by completing tasks. What would you like to know about sleep today?`,
        timestamp: new Date().toLocaleTimeString({ hour: '2-digit', minute: '2-digit' })
      }

      setState(prev => ({
        ...prev,
        onboardingComplete: true,
        showOnboardingModal: false,
        conversation: [welcomeMsg],
        userName: name,
        userAge: age.toString()
      }))

      updateStorage({
        onboardingComplete: true,
        userName: name,
        userAge: age.toString(),
        userGender: state.userGender
      })
    }
  }, [state.userName, state.userAge, state.userGender])

  // Tab change handler
  const handleTabChange = useCallback((tab) => {
    if (['chat', 'tasks', 'journal'].includes(tab)) {
      setState(prev => ({ ...prev, activeTab: tab }))
    }
  }, [])

  // Modal handlers
  const modalHandlers = useMemo(() => ({
    toggleMobileSidebar: () => setState(prev => ({ ...prev, showMobileSidebar: !prev.showMobileSidebar }))
  }), [])

  // Copy address helper
  const copyAddress = useCallback((address) => {
    navigator.clipboard.writeText(address)
    alert('Address copied!')
  }, [])

  // Add token to MetaMask
  const addTokenToWallet = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TOKEN_CONTRACT_ADDRESS,
            symbol: 'SOMNUS',
            decimals: 18,
            image: 'https://www.somnusai.xyz/logo.png'
          }
        }
      })
    } catch (error) {
      console.error('Failed to add token:', error)
    }
  }, [TOKEN_CONTRACT_ADDRESS])

  // Chat Tab Component
  const ChatTab = useMemo(() => (
    <div className="flex flex-col h-[80vh] max-h-[85vh] overflow-hidden">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 custom-scrollbar"
        style={{ 
          scrollBehavior: 'smooth',
          height: 'calc(85vh - 120px)'
        }}
      >
        {Array.isArray(state.conversation) && state.conversation.map((message, index) => (
          <div key={`msg-${index}-${message.timestamp}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white to-gray-300 mb-2 flex items-center justify-center shadow-lg">
                  <FaMoon className="text-black text-sm" />
                </div>
              )}
              <div className={`relative p-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 ${
                message.role === 'user' 
                  ? 'bg-white text-black rounded-br-md' 
                  : 'bg-black/80 border border-white/20 text-white rounded-bl-md'
              }`}>
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className="text-xs opacity-70 mt-2 text-gray-400">{message.timestamp}</p>
              </div>
              {message.role === 'user' && (
                <Image 
                  src={getUserAvatar(state.userName)} 
                  alt="User Avatar" 
                  width={32} 
                  height={32} 
                  className="rounded-full mt-2 border-2 border-white shadow-lg" 
                  unoptimized 
                />
              )}
            </div>
          </div>
        ))}
        
        {state.isTyping && (
          <div className="flex justify-start mb-3">
            <div className="flex flex-col items-start max-w-[85%] sm:max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white to-gray-300 mb-2 flex items-center justify-center shadow-lg">
                <FaMoon className="text-black text-sm" />
              </div>
              <div className="bg-black/80 backdrop-blur-sm border border-white/20 text-white p-4 rounded-2xl rounded-bl-md shadow-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Somnus is thinking</span>
                  <div className="flex space-x-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div 
                        key={i} 
                        className="w-2 h-2 bg-white rounded-full animate-bounce" 
                        style={{ animationDelay: `${delay}s` }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-2" />
      </div>
      
      <div className="border-t border-white/20 bg-black/95 backdrop-blur-md p-4 sm:p-6 h-auto">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3 sm:space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={state.input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask Somnus about sleep, wellness, or anything else..."
              className="w-full px-3 pt-1.5 bg-black/70 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30 text-sm sm:text-base resize-none min-h-[50px] max-h-28 custom-scrollbar"
              disabled={state.loading}
              rows={1}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {state.input.length}/1000
            </div> 
          </div>
          <button
            type="submit"
            disabled={state.loading || !state.input.trim()}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-white to-gray-300 text-black rounded-xl font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex-shrink-0"
            aria-label="Send Message"
          >
            {state.loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaPaperPlane className="text-lg" />
            )}
          </button>
        </form>
      </div>
    </div>
  ), [state.conversation, state.isTyping, state.input, state.loading, state.userName, getUserAvatar, handleSendMessage, handleInputChange])

  // Tasks Tab Component
  const TasksTab = useMemo(() => (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full custom-scrollbar pb-20 sm:pb-0">
      {/* Wallet Connection Card */}
      {!wallet.isConnected && wallet.isInitialized && (
        <div className="bg-gradient-to-r from-white/10 to-gray-300/10 rounded-2xl p-6 border-2 border-white/30 text-center">
          <FaWallet className="text-5xl text-white mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-4">Connect your wallet to start earning real SOMNUS tokens on BSC</p>
          <button
            onClick={connectWallet}
            disabled={wallet.isConnecting}
            className="px-8 py-3 bg-gradient-to-r from-white to-gray-300 text-black rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {wallet.isConnecting ? (
              <><FaSpinner className="inline animate-spin mr-2" /> Connecting...</>
            ) : (
              <><FaWallet className="inline mr-2" /> Connect Wallet</>
            )}
          </button>
        </div>
      )}

      {/* Wallet Info */}
      {wallet.isConnected && (
        <div className="bg-gradient-to-r from-black/40 to-black/60 rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <FaWallet className="text-green-400" />
              <span>Wallet Connected</span>
            </h3>
            <button
              onClick={disconnectWallet}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Disconnect
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </span>
                <button
                  onClick={() => copyAddress(wallet.address)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-white font-bold">BNB Smart Chain</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">BNB Balance:</span>
              <span className="text-white font-bold">
                {parseFloat(wallet.balance).toFixed(4)} BNB
              </span>
            </div>
            <button
              onClick={addTokenToWallet}
              className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <FaInfoCircle />
              <span>Add SOMNUS to MetaMask</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-3">Daily Social Tasks</h2>
        <p className="text-gray-400 text-lg">Complete tasks to earn real SOMNUS tokens on BSC!</p>
        
        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{completedTasksCount}/{Object.keys(taskDefinitions).length} completed</span>
            <span className="text-white font-bold text-sm">{Math.round(taskProgress)}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-white to-gray-300 h-3 rounded-full transition-all duration-700 shadow-lg"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {taskSuccess && (
        <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-6 text-center">
          <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">
            {taskSuccess.message || `${taskSuccess.task} Completed!`}
          </h3>
          <p className="text-gray-300 mb-2">+{taskSuccess.amount} SOMNUS tokens earned!</p>
          {taskSuccess.txHash && (
            <a
              href={`https://bscscan.com/tx/${taskSuccess.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center space-x-1"
            >
              <span>View Transaction</span>
              <FaExternalLinkAlt />
            </a>
          )}
        </div>
      )}

      {/* Task Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6">
        {Object.values(taskDefinitions).map((task) => {
          const IconComponent = task.icon
          const isCompleted = tasks[task.id]?.completed
          const isProcessing = processingTask === task.id

          return (
            <div 
              key={task.id} 
              className={`relative  p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                isCompleted 
                  ? 'bg-gradient-to-br from-white/20 to-gray-300/20 border-white/50 shadow-xl' 
                  : 'bg-gradient-to-br from-black/40 to-black/60 border-white/20 hover:border-white/40 shadow-lg hover:shadow-2xl cursor-pointer'
              }`}
              onClick={() => !isCompleted && !isProcessing && wallet.isConnected && completeTask(task.id)}
            >
              {isCompleted && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                  <FaCheck className="text-white text-sm" />
                </div>
              )}

              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className={`p-4 rounded-2xl text-3xl sm:text-4xl shadow-lg ${
                  isCompleted 
                    ? 'bg-white text-black' 
                    : 'bg-gradient-to-r from-white to-gray-300 text-black'
                }`}>
                  {isProcessing ? <FaSpinner className="animate-spin" /> : <IconComponent />}
                </div>

                <h3 className={`font-bold text-sm sm:text-base line-clamp-2 ${
                  isCompleted ? 'text-white/90' : 'text-white'
                }`}>
                  {task.title}
                </h3>

                <div className={`text-xs sm:text-sm ${
                  isCompleted ? 'text-gray-400' : 'text-gray-300'
                }`}>
                  <span className="font-bold text-white">+{task.reward}</span> SOMNUS
                </div>

                <button
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-white/30 text-white cursor-default' 
                      : isProcessing
                      ? 'bg-yellow-500/50 text-white cursor-wait'
                      : !wallet.isConnected
                      ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-white to-gray-300 text-black hover:shadow-md active:scale-95'
                  }`}
                  disabled={isCompleted || isProcessing || !wallet.isConnected}
                >
                  {isCompleted ? 'Completed' : isProcessing ? 'Processing...' : !wallet.isConnected ? 'Connect Wallet' : 'Complete'}
                </button>

                {task.action && task.type === 'social' && !isCompleted && (
                  <div className="flex items-center text-xs text-gray-400">
                    <FaExternalLinkAlt className="mr-1" />
                    <span>Opens link</span>
                  </div>
                )}

                {isCompleted && tasks[task.id]?.txHash && (
                  <a
                    href={`https://bscscan.com/tx/${tasks[task.id].txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaExternalLinkAlt />
                    <span>View TX</span>
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion Celebration */}
      {completedTasksCount === Object.keys(taskDefinitions).length && Object.keys(taskDefinitions).length > 0 && (
        <div className="text-center py-8 mt-8">
          <div className="bg-gradient-to-r from-white/10 to-gray-300/10 rounded-2xl p-8 border-2 border-white/30 shadow-2xl max-w-md mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-3">Congratulations!</h3>
            <p className="text-gray-400 text-lg">
              You've completed all tasks for today!<br/>
              <span className="text-white font-bold">
                +{Object.values(taskDefinitions).reduce((sum, task) => sum + task.reward, 0)} SOMNUS earned
              </span>
            </p>
          </div>
        </div>
      )}

      {/* How to view tokens guide */}
      <div className="bg-black/40 rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <FaInfoCircle />
          <span>How to See Your SOMNUS Tokens</span>
        </h3>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start space-x-2">
            <span className="font-bold text-white">1.</span>
            <span>Open MetaMask and switch to BNB Smart Chain network</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-white">2.</span>
            <span>Click "Import tokens" at the bottom</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-white">3.</span>
            <div className="flex-1">
              <span>Paste the SOMNUS token contract address:</span>
              <div className="mt-2 p-3 bg-black/60 rounded-lg font-mono text-xs break-all flex items-center justify-between">
                <span>{TOKEN_CONTRACT_ADDRESS}</span>
                <button
                  onClick={() => copyAddress(TOKEN_CONTRACT_ADDRESS)}
                  className="ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-white">4.</span>
            <span>Click "Add Custom Token" and your SOMNUS balance will appear!</span>
          </li>
        </ol>
      </div>
    </div>
  ), [
    wallet, 
    tasks, 
    taskDefinitions, 
    completedTasksCount, 
    taskProgress, 
    processingTask, 
    taskSuccess,
    connectWallet,
    disconnectWallet,
    completeTask,
    copyAddress,
    addTokenToWallet,
    TOKEN_CONTRACT_ADDRESS
  ])

  // Journal Tab
  const JournalTab = useMemo(() => (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full custom-scrollbar pb-20 sm:pb-0">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3">Sleep Journey</h2>
        <p className="text-gray-400 text-lg">Track your progress and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-black/40 to-black/60 rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <FaCoins className="text-yellow-400 text-3xl" />
            <h3 className="text-white font-bold text-xl">SOMNUS Tokens</h3>
          </div>
          <p className="text-4xl font-bold text-white">{state.somTokens}</p>
          <p className="text-gray-400 text-sm mt-1">Total earned on BSC</p>
        </div>

        <div className="bg-gradient-to-br from-black/40 to-black/60 rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <FaTasks className="text-white text-3xl" />
            <h3 className="text-white font-bold text-xl">Tasks Done</h3>
          </div>
          <p className="text-4xl font-bold text-white">{completedTasksCount}</p>
          <p className="text-gray-400 text-sm mt-1">Today's progress</p>
        </div>

        <div className="bg-gradient-to-br from-black/40 to-black/60 rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <FaHeart className="text-red-400 text-3xl" />
            <h3 className="text-white font-bold text-xl">Sleep Streak</h3>
          </div>
          <p className="text-4xl font-bold text-white">{state.sleepStreak}</p>
          <p className="text-gray-400 text-sm mt-1">Days active</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-black/40 to-black/60 rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-white font-bold text-xl mb-4">Your Profile</h3>
        <div className="flex items-center space-x-4">
          <Image 
            src={getUserAvatar(state.userName)} 
            alt="User Avatar" 
            width={60} 
            height={60} 
            className="rounded-full ring-2 ring-white" 
            unoptimized 
          />
          <div>
            <p className="text-white font-bold text-lg">{state.userName || 'Sleep Seeker'}</p>
            <p className="text-gray-400">Age: {state.userAge || 'Not set'}</p>
            <p className="text-gray-400">Gender: {state.userGender || 'Not set'}</p>
          </div>
        </div>
      </div>

      {wallet.isConnected && (
        <div className="bg-gradient-to-br from-black/40 to-black/60 rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-white font-bold text-xl mb-4">Wallet Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connected Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono">
                  {wallet.address?.slice(0, 10)}...{wallet.address?.slice(-8)}
                </span>
                <button
                  onClick={() => copyAddress(wallet.address)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-white font-bold">BNB Smart Chain (BSC)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">BNB Balance:</span>
              <span className="text-white font-bold">{parseFloat(wallet.balance).toFixed(4)} BNB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  ), [state.somTokens, state.sleepStreak, state.userName, state.userAge, state.userGender, completedTasksCount, wallet, getUserAvatar, copyAddress])

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  if (!wallet.isInitialized) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <FaSpinner className="text-5xl animate-spin mx-auto mb-4" />
          <p>Loading Somnus...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans antialiased">
      {/* Header */}
      <header className="w-full border-b border-white/30 bg-black/90 backdrop-blur-md sticky top-0 z-50 py-3 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="flex items-center justify-between mx-auto ">
          <div className="flex items-center space-x-4">
            <Link href="/">
            <Image src='/logo.png' alt='logo' width={110} height={30} className='scale-150'/>
              {/* <div className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">💤 Somnus</div> */}
            </Link>
            
          </div>
            <nav className="hidden md:flex items-center space-x-6">
              {[
                { tab: 'chat', label: 'Chat', icon: FaPaperPlane },
                { tab: 'tasks', label: 'Tasks', icon: FaTasks },
                { tab: 'journal', label: 'Stats', icon: FaChartLine }
              ].map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    state.activeTab === tab 
                      ? 'bg-white text-black shadow-md transform scale-105' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="inline mr-2" />
                  {label}
                </button>
              ))}
            </nav>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/30 shadow-sm backdrop-blur-sm">
              <FaCoins className="text-yellow-400 text-lg" />
              <span className="text-white font-bold text-sm sm:text-base">{state.somTokens}</span>
              <span className="text-gray-400 text-xs sm:text-sm">SOMNUS</span>
            </div>

            {!wallet.isConnected ? (
              <button
                onClick={connectWallet}
                disabled={wallet.isConnecting}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-white to-gray-300 text-black px-4 py-2 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {wallet.isConnecting ? (
                  <><FaSpinner className="animate-spin" /> <span>Connecting...</span></>
                ) : (
                  <><FaWallet /> <span>Connect</span></>
                )}
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 bg-black/50 px-3 py-2 rounded-full border border-green-400/50 backdrop-blur-sm">
                <FaWallet className="text-green-400" />
                <span className="text-white font-medium text-sm">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </span>
              </div>
            )}

            <button
              onClick={modalHandlers.toggleMobileSidebar}
              className="lg:hidden p-2 rounded-full text-white hover:bg-white/20 transition-colors duration-300"
              aria-label="Menu"
            >
              <FaBars className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full flex min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-y-scroll pb-10">
        {/* Simplified Sidebar */}
        <aside className="w-80 h-screen bg-black/60 backdrop-blur-md border-r border-white/20 p-6 hidden lg:block overflow-y-auto custom-scrollbar">
          <div className="space-y-6 py-4">
            {/* User Profile */}
            {state.onboardingComplete && (
              <div className="bg-gradient-to-br from-white/10 to-gray-500/10 rounded-xl p-6 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <Image 
                    src={getUserAvatar(state.userName)} 
                    alt="User Avatar" 
                    width={60} 
                    height={60} 
                    className="rounded-full ring-2 ring-white" 
                    unoptimized 
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{state.userName}</h3>
                    <p className="text-gray-400 text-sm">Sleep Enthusiast</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age:</span>
                    <span className="text-white">{state.userAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gender:</span>
                    <span className="text-white">{state.userGender}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Card */}
            {wallet.isConnected && (
              <div className="bg-black/40 rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <FaWallet className="text-green-400" />
                    <span>Wallet</span>
                  </h3>
                  <button
                    onClick={disconnectWallet}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Address:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-xs">
                        {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyAddress(wallet.address)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <FaCopy className="text-xs" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-green-400 text-xs">BSC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">BNB:</span>
                    <span className="text-white">{parseFloat(wallet.balance).toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}

            {!wallet.isConnected && (
              <button
                onClick={connectWallet}
                disabled={wallet.isConnecting}
                className="w-full px-6 py-3 bg-gradient-to-r from-white to-gray-300 text-black rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {wallet.isConnecting ? (
                  <><FaSpinner className="inline animate-spin mr-2" /> Connecting...</>
                ) : (
                  <><FaWallet className="inline mr-2" /> Connect Wallet</>
                )}
              </button>
            )}

            {/* Quick Stats */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Today's Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">SOMNUS Earned</span>
                  <span className="text-white font-bold text-lg">{state.somTokens}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Tasks Done</span>
                  <span className="text-white font-bold text-lg">{completedTasksCount}/{Object.keys(taskDefinitions).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Sleep Streak</span>
                  <span className="text-white font-bold text-lg">{state.sleepStreak} days</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col max-w-full h-full">
          {!state.onboardingComplete ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="space-y-8 max-w-2xl bg-black/70 p-10 rounded-2xl shadow-2xl border border-white/30">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                  💤 Welcome to Somnus
                </h1>
                <p className="text-gray-400 text-xl leading-relaxed">
                  Your AI sleep companion. Connect your wallet, complete tasks, and earn real SOMNUS tokens on BSC!
                </p>
                <button
                  onClick={() => setState(prev => ({ ...prev, showOnboardingModal: true }))}
                  className="px-10 py-4 bg-gradient-to-r from-white to-gray-300 text-black rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden h-full">
              {state.activeTab === 'chat' && ChatTab}
              {state.activeTab === 'tasks' && TasksTab}
              {state.activeTab === 'journal' && JournalTab}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/20 px-2 py-2 shadow-lg z-40">
        <div className="flex items-center justify-around">
          {[
            { tab: 'chat', label: 'Chat', icon: FaPaperPlane },
            { tab: 'tasks', label: 'Tasks', icon: FaTasks },
            { tab: 'journal', label: 'Stats', icon: FaChartLine }
          ].map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 text-sm ${
                state.activeTab === tab 
                  ? 'text-white bg-white/10 transform scale-105' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="text-xl mb-1" />
              <span>{label}</span>
            </button>
          ))}
          
          <button
            onClick={modalHandlers.toggleMobileSidebar}
            className="flex flex-col items-center p-3 rounded-lg transition-all duration-300 text-sm text-gray-400 hover:text-white"
          >
            <FaUserCircle className="text-xl mb-1" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {state.showMobileSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-90 lg:hidden"
            onClick={modalHandlers.toggleMobileSidebar}
          />
          <div className="fixed inset-y-0 right-0 w-80 bg-black border-l border-white/20 shadow-2xl z-95 lg:hidden p-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-end mb-6">
              <button
                onClick={modalHandlers.toggleMobileSidebar}
                className="text-white p-2 rounded-full hover:bg-white/20 transition-colors duration-300"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Mobile User Profile */}
              {state.onboardingComplete && (
                <div className="bg-gradient-to-br from-white/10 to-gray-500/10 rounded-xl p-6 border border-white/30 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <Image 
                      src={getUserAvatar(state.userName)} 
                      alt="User Avatar" 
                      width={60} 
                      height={60} 
                      className="rounded-full ring-2 ring-white" 
                      unoptimized 
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">{state.userName}</h3>
                      <p className="text-gray-400 text-sm">Sleep Enthusiast</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age:</span>
                      <span className="text-white">{state.userAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gender:</span>
                      <span className="text-white">{state.userGender}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Wallet */}
              {!wallet.isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={wallet.isConnecting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-white to-gray-300 text-black rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  {wallet.isConnecting ? (
                    <><FaSpinner className="inline animate-spin mr-2" /> Connecting...</>
                  ) : (
                    <><FaWallet className="inline mr-2" /> Connect Wallet</>
                  )}
                </button>
              ) : (
                <div className="bg-black/40 rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <FaWallet className="text-green-400" />
                      <span>Wallet Connected</span>
                    </h3>
                    <button
                      onClick={disconnectWallet}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Address:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-xs">
                          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyAddress(wallet.address)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FaCopy className="text-xs" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-green-400 text-xs">BSC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">BNB Balance:</span>
                      <span className="text-white">{parseFloat(wallet.balance).toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Quick Stats */}
              <div className="bg-black/40 rounded-xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">SOMNUS Earned</span>
                    <span className="text-white font-bold text-lg">{state.somTokens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Tasks Done</span>
                    <span className="text-white font-bold text-lg">{completedTasksCount}/{Object.keys(taskDefinitions).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Sleep Streak</span>
                    <span className="text-white font-bold text-lg">{state.sleepStreak} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Onboarding Modal */}
      {state.showOnboardingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-100 p-4">
          <div className="bg-black rounded-2xl border border-white/30 p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">Welcome to Somnus!</h3>
            <p className="text-gray-400 text-center mb-6">
              Tell us about yourself to get personalized sleep advice and start earning SOMNUS tokens on BSC.
            </p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={state.userName}
                  onChange={(e) => setState(prev => ({ ...prev, userName: e.target.value }))}
                  className="w-full px-5 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Your Age</label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={state.userAge}
                  onChange={(e) => setState(prev => ({ ...prev, userAge: e.target.value }))}
                  className="w-full px-5 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30"
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Gender</label>
                <select
                  value={state.userGender}
                  onChange={(e) => setState(prev => ({ ...prev, userGender: e.target.value }))}
                  className="w-full px-5 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30 appearance-none custom-select"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleOnboardingSubmit}
              className="w-full px-6 py-4 mt-6 bg-gradient-to-r from-white to-gray-300 text-black rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              disabled={!state.userName.trim() || !state.userAge || !state.userGender}
            >
              Start My Sleep Journey
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .custom-select {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default SomnusAgent
