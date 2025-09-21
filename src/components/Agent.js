'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoHome, IoWallet, IoPerson, IoCheckmarkCircle, IoCloseCircle, IoFlag, IoPlay, IoGift, IoArrowBack, IoRefresh, IoSend, IoTime, IoFlash, IoStar, IoSparkles } from 'react-icons/io5';
import { TbBrain } from 'react-icons/tb';
import { LuBrainCircuit } from "react-icons/lu";


const OptimizedLabelXApp = () => {
  // Core App State
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wallet, setWallet] = useState(null);

  // Mission State
  const [currentMission, setCurrentMission] = useState(null);
  const [missionQuestions, setMissionQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // User Stats
  const [userStats, setUserStats] = useState({
    points: 2847,
    accuracy: 94.2,
    missionsCompleted: 47,
    reviewsCompleted: 23,
    currentStreak: 12,
    rank: 'Expert',
    seasonProgress: 67,
    claimableTokens: 284,
    totalEarned: 8420
  });

  // Review State
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);

  // Theme
  const theme = {
    primary: '#FF7A1A',
    secondary: '#FDD536',
    success: '#22C55E',
    error: '#EF4444',
    surface: 'rgba(255, 122, 26, 0.1)',
    text: '#F5F5F5'
  };

  // Enhanced Mission Data
  const sampleMissions = [
    {
      id: 1,
      title: "AI Content Moderation",
      description: "Help AI understand harmful vs safe content",
      category: "Content Safety",
      difficulty: "Medium",
      questions: [
        {
          id: 1,
          type: "content_safety",
          content: "Hey everyone! Check out my new workout routine - finally seeing some real progress after 3 months of consistency 💪",
          options: ["Safe Content", "Spam/Promotional", "Inappropriate", "Needs Review"],
          correctAnswer: "Safe Content"
        },
        {
          id: 2,
          type: "content_safety",
          content: "URGENT!!! Make $5000/day working from home!!! Click this link NOW before it expires!!!",
          options: ["Safe Content", "Spam/Promotional", "Inappropriate", "Needs Review"],
          correctAnswer: "Spam/Promotional"
        },
        {
          id: 3,
          type: "content_safety",
          content: "Does anyone have recommendations for good coffee shops in downtown? New to the area and looking for a good place to work.",
          options: ["Safe Content", "Spam/Promotional", "Inappropriate", "Needs Review"],
          correctAnswer: "Safe Content"
        }
      ],
      reward: 180,
      aiContext: "You're helping train an AI content moderation system to identify spam, inappropriate content, and safe user-generated content for social platforms."
    },
    {
      id: 2,
      title: "Medical AI Assistant",
      description: "Train AI to understand medical symptoms",
      category: "Healthcare",
      difficulty: "Hard",
      questions: [
        {
          id: 1,
          type: "medical_classification",
          content: "Patient reports: 'I've had a persistent headache for 3 days, mild fever, and feeling tired. No nausea or vision changes.'",
          options: ["Urgent - ER Visit", "Schedule Appointment", "Home Care Sufficient", "Needs More Info"],
          correctAnswer: "Schedule Appointment"
        },
        {
          id: 2,
          type: "medical_classification",
          content: "Patient reports: 'Severe chest pain radiating to left arm, shortness of breath, started 30 minutes ago.'",
          options: ["Urgent - ER Visit", "Schedule Appointment", "Home Care Sufficient", "Needs More Info"],
          correctAnswer: "Urgent - ER Visit"
        }
      ],
      reward: 250,
      aiContext: "You're training a medical AI to help triage patient symptoms and recommend appropriate care levels."
    }
  ];

  // Initialize App
  useEffect(() => {
    initializeTelegramApp();
    loadUserData();
    loadReviewQueue();
    
    // Initialize AI chat
    setChatMessages([{
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI labeling assistant. I can help explain missions, provide context about the data you\'re labeling, and answer any questions about AI training. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, []);

  const initializeTelegramApp = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      
      const telegramUser = webApp.initDataUnsafe?.user;
      if (telegramUser) {
        const userData = {
          id: telegramUser.id,
          username: telegramUser.username || `user_${telegramUser.id}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        saveToStorage('user_data', userData);
      } else {
        // Dev fallback
        const devUser = {
          id: 12345,
          username: 'dev_user',
          firstName: 'Alex',
          lastName: 'Developer'
        };
        setUser(devUser);
        setIsAuthenticated(true);
      }
    }
  };

  // Storage Management
  const saveToStorage = (key, data) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`labelx_${key}`, JSON.stringify(data));
        
        if (window.Telegram?.WebApp?.CloudStorage) {
          window.Telegram.WebApp.CloudStorage.setItem(`labelx_${key}`, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Storage error:', error);
      }
    }
  };

  const loadFromStorage = (key) => {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem(`labelx_${key}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const loadUserData = () => {
    const savedStats = loadFromStorage('user_stats');
    if (savedStats) {
      setUserStats(savedStats);
    }
  };

  // Haptic Feedback
  const triggerHaptic = (type = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      switch (type) {
        case 'success':
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          break;
        case 'error':
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
          break;
        default:
          window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  // AI Chat with LLM Integration
  const sendChatMessage = async () => {
    if (!userInput.trim() || isTyping) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant for LabelX, a data labeling platform. Help users understand:
              - How data labeling works and why it's important for AI training
              - Best practices for accurate labeling
              - Explanation of different mission types and categories
              - Tips for improving accuracy and earning more points
              - Context about AI training and machine learning
              
              Current user stats: ${userStats.points} points, ${userStats.accuracy.toFixed(1)}% accuracy, ${userStats.missionsCompleted} missions completed.
              
              Be helpful, concise, and encouraging. Focus on education and guidance.`
            },
            ...chatMessages.slice(-6).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: currentInput
            }
          ],
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        let responseContent = '';
        
        if (data.choices && data.choices[0]?.message?.content) {
          responseContent = data.choices[0].message.content;
        } else if (data.response) {
          responseContent = data.response;
        } else {
          responseContent = generateFallbackResponse(currentInput);
        }
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
        
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: generateFallbackResponse(currentInput),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateFallbackResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('mission') || lowerInput.includes('task')) {
      return `Great question about missions! Each mission helps train AI models for real-world applications. The "${sampleMissions[0].title}" mission, for example, teaches AI to identify safe vs harmful content. Higher accuracy means better AI training and more points for you!`;
    }
    
    if (lowerInput.includes('points') || lowerInput.includes('reward')) {
      return `You earn points based on accuracy and mission difficulty. Your current ${userStats.accuracy.toFixed(1)}% accuracy is excellent! Higher accuracy = more points. You can also earn bonus points through peer reviews and maintaining streaks.`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return `I'm here to help! You can ask me about:\n• How different mission types work\n• Tips to improve your accuracy\n• Why data labeling is important for AI\n• How the point system works\n• Best practices for peer reviews`;
    }
    
    return `That's an interesting question! Based on your ${userStats.missionsCompleted} completed missions and ${userStats.accuracy.toFixed(1)}% accuracy, you're doing great. Feel free to ask me about missions, accuracy tips, or how AI training works!`;
  };

  // Mission Functions
  const startMission = (mission) => {
    setCurrentMission(mission);
    setMissionQuestions(mission.questions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCurrentView('mission');
    triggerHaptic('medium');
  };

  const submitAnswer = async (selectedOption) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const currentQuestion = missionQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    const answer = {
      questionId: currentQuestion.id,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timestamp: Date.now()
    };

    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    triggerHaptic(isCorrect ? 'success' : 'error');

    // Brief delay for feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (currentQuestionIndex < missionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeMission(newAnswers);
    }
    
    setIsSubmitting(false);
  };

  const completeMission = (answers) => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / answers.length) * 100;
    const baseReward = currentMission.reward;
    const accuracyBonus = Math.floor(baseReward * (accuracy / 100) * 0.3);
    const streakBonus = userStats.currentStreak * 5;
    const totalReward = baseReward + accuracyBonus + streakBonus;

    const newStats = {
      ...userStats,
      points: userStats.points + totalReward,
      missionsCompleted: userStats.missionsCompleted + 1,
      accuracy: ((userStats.accuracy * userStats.missionsCompleted + accuracy) / (userStats.missionsCompleted + 1)),
      currentStreak: accuracy >= 80 ? userStats.currentStreak + 1 : 0,
      seasonProgress: Math.min(100, userStats.seasonProgress + (totalReward / 50)),
      claimableTokens: userStats.claimableTokens + Math.floor(totalReward / 15)
    };

    // Update rank
    if (newStats.points >= 10000) newStats.rank = 'Legend';
    else if (newStats.points >= 5000) newStats.rank = 'Expert';
    else if (newStats.points >= 2000) newStats.rank = 'Advanced';
    else if (newStats.points >= 500) newStats.rank = 'Intermediate';

    setUserStats(newStats);
    saveToStorage('user_stats', newStats);

    setCurrentView('mission-complete');
    triggerHaptic('success');
  };

  // Review Functions
  const loadReviewQueue = () => {
    const sampleReviews = [
      {
        id: 1,
        submitter: 'alex_dev',
        content: 'This new AI update is incredible! The accuracy improvements are game-changing for our workflow.',
        peerLabel: 'Positive',
        confidence: 0.89,
        category: 'Content Safety'
      },
      {
        id: 2,
        submitter: 'maria_design',
        content: 'Has anyone experienced issues with the latest update? My dashboard seems to be loading slowly.',
        peerLabel: 'Needs Review',
        confidence: 0.73,
        category: 'Content Safety'
      }
    ];
    
    setReviewQueue(sampleReviews);
  };

  const startReview = (reviewItem) => {
    setCurrentReview(reviewItem);
    setCurrentView('review');
    triggerHaptic('medium');
  };

  const submitReview = (action) => {
    const reviewPoints = action === 'confirm' ? 50 : action === 'correct' ? 75 : 30;
    
    const newStats = {
      ...userStats,
      points: userStats.points + reviewPoints,
      reviewsCompleted: userStats.reviewsCompleted + 1
    };

    setUserStats(newStats);
    saveToStorage('user_stats', newStats);

    setReviewQueue(prev => prev.filter(r => r.id !== currentReview.id));
    setCurrentView('reviews');
    triggerHaptic('success');
  };

  // Top Navigation Component
  const TopNavigation = () => (
    <div className="sticky -top-4 z-30 border-b border-gray-800/50">
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-xl p-1">
          {[
            { id: 'home', icon: IoHome, label: 'Home' },
            // { id: 'ai-chat', icon: TbBrain, label: 'AI Helper' },
            { id: 'rewards', icon: IoGift, label: 'Rewards' },
            { id: 'profile', icon: IoPerson, label: 'Profile' }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setCurrentView(tab.id);
                triggerHaptic('light');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === tab.id 
                  ? 'bg-orange-500 glass-dark text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Functions
  const renderHome = () => (
    <div className="space-y-6 py-4 pb-16">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-400 text-balance">Ready to help train the next generation of AI?</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="glass rounded-3xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{userStats.points.toLocaleString()}</h3>
            <p className="text-gray-400">Total Points</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-orange-400">{userStats.accuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{userStats.missionsCompleted}</div>
            <div className="text-xs text-gray-400">Missions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
              {userStats.currentStreak}
              {userStats.currentStreak > 0 && <IoFlash className="text-orange-400" size={16} />}
            </div>
            <div className="text-xs text-gray-400">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{userStats.claimableTokens}</div>
            <div className="text-xs text-gray-400">$LBLX</div>
          </div>
        </div>
      </motion.div>

      {/* Available Missions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Available Missions</h3>
        
        {sampleMissions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-light rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">{mission.title}</h4>
                <p className="text-sm text-gray-400 mb-2">{mission.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg">
                    {mission.category}
                  </span>
                  <span className="text-gray-500">{mission.difficulty}</span>
                  <span className="text-gray-500">{mission.questions.length} questions</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-green-400">+{mission.reward}</div>
                <div className="text-xs text-gray-400">points</div>
              </div>
            </div>
            
            <motion.button
              onClick={() => startMission(mission)}
              className="w-full mt-4 px-4 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: theme.primary }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Mission
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Quick Reviews */}
      {reviewQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Peer Reviews</h3>
            <button
              onClick={() => setCurrentView('reviews')}
              className="text-orange-400 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <motion.button
            onClick={() => setCurrentView('reviews')}
            className="w-full glass-light rounded-2xl p-4 text-left"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Review Peer Submissions</div>
                <div className="text-sm text-gray-400">{reviewQueue.length} pending reviews</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-medium">+50 pts</div>
                <div className="text-xs text-gray-400">each</div>
              </div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </div>
  );

  const renderMission = () => {
    const currentQuestion = missionQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / missionQuestions.length) * 100;
    
    return (
      <div className="space-y-6 p-4">
        {/* Mission Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('home')}
            className="p-2 rounded-xl glass-light"
          >
            <IoArrowBack size={20} className="text-gray-400" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-white text-lg">{currentMission.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Question {currentQuestionIndex + 1} of {missionQuestions.length}</span>
              <span className="flex items-center gap-1">
                <IoTime size={14} />
                Unlimited
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-orange-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-3xl p-6"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TbBrain className="text-orange-400" size={18} />
              <span className="text-sm text-orange-400 font-medium uppercase tracking-wide">
                {currentQuestion.type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-white text-lg leading-relaxed">
              {currentQuestion.content}
            </p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={option}
                onClick={() => submitAnswer(option)}
                disabled={isSubmitting}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  isSubmitting 
                    ? 'glass-light opacity-50 cursor-not-allowed' 
                    : 'glass-light hover:bg-white/10 active:bg-white/15'
                }`}
                whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                whileTap={!isSubmitting ? { scale: 0.99 } : {}}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <span className="text-orange-400 font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Mission Context */}
        <motion.div
          className="glass-light rounded-2xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <LuBrainCircuit className="text-blue-400 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">AI Training Context</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentMission.aiContext}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderMissionComplete = () => (
    <div className="space-y-8 p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
          <IoCheckmarkCircle size={48} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3">Mission Complete! 🎉</h2>
        <p className="text-gray-400 text-lg">You're helping make AI smarter and safer</p>
      </motion.div>

      <motion.div
        className="glass rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-3xl font-bold text-white mb-1">
              {userAnswers.filter(a => a.isCorrect).length}/{userAnswers.length}
            </div>
            <div className="text-gray-400">Correct Answers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              +{currentMission.reward}
            </div>
            <div className="text-gray-400">Points Earned</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Accuracy</span>
              <span className="text-white">
                {((userAnswers.filter(a => a.isCorrect).length / userAnswers.length) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div 
                className="h-2 rounded-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${(userAnswers.filter(a => a.isCorrect).length / userAnswers.length) * 100}%` }}
                transition={{ delay: 0.5, duration: 1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <motion.button
          onClick={() => {
            const nextMission = sampleMissions.find(m => m.id !== currentMission.id);
            if (nextMission) startMission(nextMission);
          }}
          className="w-full p-4 rounded-2xl font-semibold text-white"
          style={{ backgroundColor: theme.primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue Training AI
        </motion.button>
        
        <button
          onClick={() => setCurrentView('home')}
          className="w-full p-4 rounded-2xl glass-light text-white font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  const renderAIChat = () => (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        <div className="text-center mb-6">
          {/* <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
            <TbBrain className="text-orange-400" size={32} />
          </div> */}
          <h2 className="text-xl font-bold text-white">AI Helper</h2>
          <p className="text-gray-400 text-sm">Ask me anything about missions and AI training</p>
        </div>

        {chatMessages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              message.role === 'user'
                ? 'bg-orange-500 text-white'
                : 'glass-light text-gray-200'
            }`}>
              <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-light p-4 rounded-2xl">
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-orange-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-orange-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-orange-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Chat Input */}
      <div className="fixed bottom-50 left-0 right-0 glass border-t border-gray-800/50 p-4">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Ask about missions, accuracy tips..."
            className="flex-1 bg-gray-800/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50"
            disabled={isTyping}
          />
          <motion.button
            onClick={sendChatMessage}
            disabled={!userInput.trim() || isTyping}
            className="p-3 rounded-2xl bg-orange-500 text-white disabled:opacity-50"
            whileHover={!isTyping ? { scale: 1.05 } : {}}
            whileTap={!isTyping ? { scale: 0.95 } : {}}
          >
            <IoSend size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-6 py-4 pb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">💰 Rewards</h2>
        <p className="text-gray-400">Your earnings from helping train AI</p>
      </div>

      {/* Claimable Tokens */}
      <motion.div 
        className="glass rounded-3xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="mb-6">
          <div className="text-4xl font-bold text-orange-400 mb-2">
            {userStats.claimableTokens}
          </div>
          <div className="text-gray-400">$LBLX Ready to Claim</div>
        </div>

        <motion.button
          onClick={() => triggerHaptic('success')}
          className="w-full p-4 glass-button rounded-2xl font-bold text-white text-lg"
          style={{ backgroundColor: theme.primary }}
          disabled={userStats.claimableTokens === 0}
          whileHover={userStats.claimableTokens > 0 ? { scale: 1.02 } : {}}
          whileTap={userStats.claimableTokens > 0 ? { scale: 0.98 } : {}}
        >
          {userStats.claimableTokens > 0 ? 'Claim Tokens (Coming Soon)' : 'Complete missions to earn tokens'}
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="glass-light rounded-2xl p-6 text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl font-bold text-white mb-1">{userStats.points.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Points</div>
        </motion.div>
        
        <motion.div
          className="glass-light rounded-2xl p-6 text-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl font-bold text-white mb-1">{userStats.totalEarned.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Earned</div>
        </motion.div>
        
        <motion.div
          className="glass-light rounded-2xl p-6 text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-white mb-1">{userStats.seasonProgress}%</div>
          <div className="text-sm text-gray-400">Season Progress</div>
        </motion.div>
        
        <motion.div
          className="glass-light rounded-2xl p-6 text-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={ { delay: 0.4 }}
        >
          <div className="text-2xl font-bold text-white mb-1">{userStats.currentStreak}</div>
          <div className="text-sm text-gray-400">Current Streak</div>
        </motion.div>
      </div>

      {/* Season Progress */}
      <motion.div
        className="glass-light rounded-2xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <IoSparkles className="text-yellow-400" />
            Season Progress
          </h4>
          <span className="text-sm text-gray-400">{userStats.seasonProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${userStats.seasonProgress}%` }}
            transition={{ delay: 0.8, duration: 1.5 }}
          />
        </div>
        
        <p className="text-sm text-gray-400">
          Complete more missions to unlock seasonal rewards and bonuses
        </p>
      </motion.div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 py-4 pb-16">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">
            {user?.firstName?.charAt(0) || 'U'}
          </span>
        </div> */}
        <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
        <p className="text-gray-400">@{user?.username}</p>
        <div className="inline-block px-4 py-2 mt-3 rounded-xl bg-orange-500/20 text-orange-400 font-medium">
          {userStats.rank}
        </div>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        className="glass rounded-3xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-semibold text-white mb-6">Performance Overview</h3>
        
        <div className="space-y-4">
          {[
            { label: 'Overall Accuracy', value: `${userStats.accuracy.toFixed(1)}%`, color: 'text-green-400' },
            { label: 'Total Points', value: userStats.points.toLocaleString(), color: 'text-orange-400' },
            { label: 'Missions Completed', value: userStats.missionsCompleted.toString(), color: 'text-blue-400' },
            { label: 'Reviews Completed', value: userStats.reviewsCompleted.toString(), color: 'text-purple-400' },
            { label: 'Current Streak', value: `${userStats.currentStreak} days`, color: 'text-yellow-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex justify-between items-center py-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <span className="text-gray-400">{stat.label}</span>
              <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="glass-light rounded-2xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-medium text-white mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {[
            { action: 'Completed AI Content Moderation', reward: '+180 pts', time: '2 hours ago' },
            { action: 'Reviewed peer submission', reward: '+50 pts', time: '5 hours ago' },
            { action: 'Completed Medical AI Assistant', reward: '+250 pts', time: '1 day ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-white">{activity.action}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
              <span className="text-sm text-green-400 font-medium">{activity.reward}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="p-2 rounded-xl glass-light"
        >
          <IoArrowBack size={20} className="text-gray-400" />
        </button>
        <h2 className="font-bold text-white text-xl">Peer Reviews</h2>
      </div>

      {reviewQueue.length === 0 ? (
        <div className="text-center py-16">
          <IoCheckmarkCircle size={64} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">All caught up! 🎉</h3>
          <p className="text-gray-400">No pending reviews right now</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewQueue.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-orange-400 font-medium">{review.category}</div>
                  <div className="text-xs text-gray-500">by {review.submitter}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className="font-medium text-white">{(review.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-white mb-3 leading-relaxed">{review.content}</p>
                <div className="inline-block px-3 py-1 rounded-xl text-sm font-medium bg-blue-500/20 text-blue-400">
                  Labeled as: {review.peerLabel}
                </div>
              </div>

              <motion.button
                onClick={() => startReview(review)}
                className="w-full p-3 rounded-xl glass-light text-white font-medium hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Review This Submission
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView('reviews')}
          className="p-2 rounded-xl glass-light"
        >
          <IoArrowBack size={20} className="text-gray-400" />
        </button>
        <h2 className="font-bold text-white text-xl">Review Submission</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6"
      >
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">{currentReview.category}</div>
          <p className="text-white text-lg mb-4 leading-relaxed">{currentReview.content}</p>
          
          <div className="inline-block px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <span className="text-blue-400 font-medium">Peer labeled as: {currentReview.peerLabel}</span>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            onClick={() => submitReview('confirm')}
            className="w-full p-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 font-medium flex items-center gap-4 hover:bg-green-500/30 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <IoCheckmarkCircle size={24} />
            <div className="flex-1 text-left">
              <div className="font-semibold">Confirm Label</div>
              <div className="text-sm opacity-80">This labeling looks correct</div>
            </div>
            <div className="text-sm font-bold">+50 pts</div>
          </motion.button>

          <motion.button
            onClick={() => submitReview('correct')}
            className="w-full p-4 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 font-medium flex items-center gap-4 hover:bg-orange-500/30 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <IoRefresh size={24} />
            <div className="flex-1 text-left">
              <div className="font-semibold">Suggest Correction</div>
              <div className="text-sm opacity-80">Provide alternative label</div>
            </div>
            <div className="text-sm font-bold">+75 pts</div>
          </motion.button>

          <motion.button
            onClick={() => submitReview('flag')}
            className="w-full p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium flex items-center gap-4 hover:bg-red-500/30 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <IoFlag size={24} />
            <div className="flex-1 text-left">
              <div className="font-semibold">Flag Submission</div>
              <div className="text-sm opacity-80">Report quality issues</div>
            </div>
            <div className="text-sm font-bold">+30 pts</div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen text-white">
      <TopNavigation />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentView === 'home' && renderHome()}
          {currentView === 'mission' && renderMission()}
          {currentView === 'mission-complete' && renderMissionComplete()}
          {/* {currentView === 'ai-chat' && renderAIChat()} */}
          {currentView === 'reviews' && renderReviews()}
          {currentView === 'review' && renderReview()}
          {currentView === 'rewards' && renderRewards()}
          {currentView === 'profile' && renderProfile()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OptimizedLabelXApp;
