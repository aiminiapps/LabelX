'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { IoClose, IoSparkles, IoTrendingUp, IoFlash, IoAnalytics, IoCheckmarkCircle, IoWarningOutline, IoRefresh } from 'react-icons/io5';
import { BiShield, BiBot, BiChart, BiStar, BiTime, BiCoin } from 'react-icons/bi';
import { TbRobot, TbChartLine, TbBulb, TbEye, TbMagic } from 'react-icons/tb';
import { LuBrainCircuit } from "react-icons/lu";
import { GiConvergenceTarget } from "react-icons/gi";

const AIAccuracyAgent = ({ onClose }) => {
  // Core state management
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [accuracyPrediction, setAccuracyPrediction] = useState(null);
  const [realTimeInsights, setRealTimeInsights] = useState({
    currentAccuracy: 94.2,
    predictedAccuracy: 96.1,
    confidenceScore: 0.87,
    recommendation: 'Focus on medical imaging tasks for optimal performance'
  });
  const [researchCredits, setResearchCredits] = useState(5);

  // Animation controls
  const agentControls = useAnimation();
  const chatControls = useAnimation();
  const insightControls = useAnimation();

  // Refs
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Available AI agents [web:283][web:299]
  const availableAgents = [
    {
      id: 'accuracy_predictor',
      name: 'Accuracy Predictor',
      icon: <GiConvergenceTarget className="text-blue-400" size={24} />,
      description: 'Predicts your labeling accuracy for upcoming tasks',
      specialty: 'Real-time performance forecasting',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-400/50',
      features: ['Confidence scoring', 'Task difficulty assessment', 'Performance optimization']
    },
    {
      id: 'quality_coach',
      name: 'Quality Coach',
      icon: <BiShield className="text-green-400" size={24} />,
      description: 'Provides personalized tips to improve accuracy',
      specialty: 'Adaptive learning recommendations',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-400/50',
      features: ['Pattern recognition', 'Weakness identification', 'Skill development']
    },
    {
      id: 'insight_analyst',
      name: 'Insight Analyst',
      icon: <IoAnalytics className="text-purple-400" size={24} />,
      description: 'Analyzes your performance patterns and trends',
      specialty: 'Deep performance analytics',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/50',
      features: ['Trend analysis', 'Comparative benchmarking', 'Predictive insights']
    },
    {
      id: 'smart_assistant',
      name: 'Smart Assistant',
      icon: <LuBrainCircuit className="text-yellow-400" size={24} />,
      description: 'General AI assistant for labeling optimization',
      specialty: 'Multi-purpose optimization guidance',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-400/50',
      features: ['Context-aware suggestions', 'Real-time guidance', 'Performance optimization']
    }
  ];

  // System prompts for each agent [web:283][web:299]
  const systemPrompts = {
    accuracy_predictor: {
      greeting: "🎯 Hello! I'm your Accuracy Predictor. I analyze your labeling patterns and predict your performance on upcoming tasks. Let me help you optimize your accuracy and earn more $LBLX tokens!",
      system: "You are an AI accuracy prediction agent for LabelX. Analyze user performance patterns and provide specific, actionable predictions about their labeling accuracy. Focus on confidence scores, task difficulty assessment, and optimization strategies."
    },
    quality_coach: {
      greeting: "🛡️ Hi there! I'm your personal Quality Coach. I've analyzed your recent labeling performance and I'm here to help you improve your accuracy through personalized training and insights. Ready to level up?",
      system: "You are a quality coaching agent for data labeling. Provide personalized advice to improve accuracy, identify common mistakes, and suggest targeted practice areas. Be encouraging and specific in your recommendations."
    },
    insight_analyst: {
      greeting: "📊 Welcome! I'm your Insight Analyst. I dive deep into your performance data to uncover hidden patterns, compare you with top performers, and provide strategic insights for maximum token earnings.",
      system: "You are an analytics agent specializing in performance insights for data labeling. Analyze trends, provide comparative analysis, and deliver actionable insights about user performance patterns and optimization opportunities."
    },
    smart_assistant: {
      greeting: "🧠 Hello! I'm your Smart Assistant, your all-in-one AI companion for LabelX optimization. I can help with accuracy improvement, task selection, reward optimization, and any questions about the platform.",
      system: "You are a comprehensive AI assistant for the LabelX platform. Help users with accuracy improvement, task optimization, reward strategies, and general platform guidance. Provide practical, actionable advice."
    }
  };

  // Initialize real-time insights
  useEffect(() => {
    startRealTimeUpdates();
    loadUserStats();
  }, []);

  // Start real-time insight updates
  const startRealTimeUpdates = () => {
    const interval = setInterval(() => {
      setRealTimeInsights(prev => ({
        ...prev,
        currentAccuracy: prev.currentAccuracy + (Math.random() - 0.5) * 0.2,
        predictedAccuracy: prev.predictedAccuracy + (Math.random() - 0.5) * 0.3,
        confidenceScore: Math.max(0.7, Math.min(0.99, prev.confidenceScore + (Math.random() - 0.5) * 0.05))
      }));
    }, 3000);

    return () => clearInterval(interval);
  };

  // Load user statistics
  const loadUserStats = () => {
    if (typeof window !== 'undefined') {
      const stats = localStorage.getItem('labelx-user-stats');
      if (stats) {
        const parsed = JSON.parse(stats);
        setRealTimeInsights(prev => ({
          ...prev,
          currentAccuracy: parsed.accuracy || 94.2
        }));
      }
    }
  };

  // Haptic feedback
  const triggerHaptic = (type = 'impact', style = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'notification') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(style);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    }
  };

  // Handle agent selection
  const handleAgentSelect = (agent) => {
    if (researchCredits <= 0) {
      triggerHaptic('notification', 'error');
      return;
    }

    setSelectedAgent(agent);
    setResearchCredits(prev => Math.max(0, prev - 1));
    triggerHaptic('impact', 'medium');
    
    const prompt = systemPrompts[agent.id];
    setConversation([{
      role: 'assistant',
      content: prompt.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: `welcome_${Date.now()}`
    }]);

    // Animate agent selection
    agentControls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.4 }
    });
  };

  // Send message to AI agent
  const sendMessage = async () => {
    if (!userMessage.trim() || isLoading || !selectedAgent) return;

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: `user_${Date.now()}`
    };

    setConversation(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);
    triggerHaptic('impact', 'light');

    try {
      // Call the API route
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...conversation, newUserMessage],
          agentType: selectedAgent.id,
          systemPrompt: systemPrompts[selectedAgent.id].system,
          userContext: {
            currentAccuracy: realTimeInsights.currentAccuracy,
            labelsCompleted: 1247,
            streak: 8,
            weakAreas: ['medical imaging', 'financial analysis']
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: `assistant_${Date.now()}`,
        insights: data.insights || null
      };

      setConversation(prev => [...prev, assistantMessage]);
      
      // Update insights if provided
      if (data.accuracyPrediction) {
        setAccuracyPrediction(data.accuracyPrediction);
        insightControls.start({
          scale: [1, 1.1, 1],
          transition: { duration: 0.5 }
        });
      }

      triggerHaptic('notification', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: `error_${Date.now()}`
      };
      setConversation(prev => [...prev, errorMessage]);
      triggerHaptic('notification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
        className="glass rounded-3xl w-full max-w-md h-[90vh] flex flex-col relative overflow-hidden"
      >
        {/* Animated background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute inset-0"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
              >
                <LuBrainCircuit className="text-blue-400" size={24} />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Accuracy Agent</h2>
                <p className="text-xs text-gray-400">
                  {researchCredits} credits • {selectedAgent ? selectedAgent.name : 'Select an agent'}
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full glass-light hover:bg-white/10 transition-colors"
            >
              <IoClose className="text-gray-400" size={20} />
            </motion.button>
          </div>

          {!selectedAgent ? (
            /* Agent Selection Screen */
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Real-time Insights Header */}
              <motion.div 
                className="glass-light rounded-2xl p-4"
                animate={insightControls}
              >
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <IoTrendingUp className="text-green-400" />
                  Live Performance Insights
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <motion.div
                      key={Math.floor(realTimeInsights.currentAccuracy * 10)}
                      initial={{ scale: 1.2, color: "#22C55E" }}
                      animate={{ scale: 1, color: "#FFFFFF" }}
                      className="text-2xl font-bold mb-1"
                    >
                      {realTimeInsights.currentAccuracy.toFixed(1)}%
                    </motion.div>
                    <p className="text-xs text-gray-400">Current Accuracy</p>
                  </div>
                  
                  <div className="text-center">
                    <motion.div
                      key={Math.floor(realTimeInsights.predictedAccuracy * 10)}
                      initial={{ scale: 1.2, color: "#3B82F6" }}
                      animate={{ scale: 1, color: "#FFFFFF" }}
                      className="text-2xl font-bold mb-1"
                    >
                      {realTimeInsights.predictedAccuracy.toFixed(1)}%
                    </motion.div>
                    <p className="text-xs text-gray-400">Predicted Next</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Confidence Score</span>
                    <span className="text-sm text-white font-medium">
                      {Math.round(realTimeInsights.confidenceScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${realTimeInsights.confidenceScore * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Agent Selection Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TbRobot className="text-purple-400" />
                  Choose Your AI Assistant
                </h3>
                
                {availableAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    onClick={() => handleAgentSelect(agent)}
                    className={`glass-light rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                      researchCredits <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
                    }`}
                    whileHover={researchCredits > 0 ? { scale: 1.02 } : {}}
                    whileTap={researchCredits > 0 ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${agent.bgColor} border ${agent.borderColor}`}>
                        {agent.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{agent.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{agent.description}</p>
                        <p className="text-xs text-gray-500 mb-3">{agent.specialty}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {agent.features.map((feature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BiCoin className="text-yellow-400" size={16} />
                        <span className="text-sm text-white">1</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Credit Warning */}
              {researchCredits <= 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-warm rounded-2xl p-4 text-center"
                >
                  <IoWarningOutline className="text-orange-400 mx-auto mb-2" size={24} />
                  <p className="text-sm text-white mb-2">No research credits remaining</p>
                  <p className="text-xs text-gray-300">Complete more missions to earn credits</p>
                </motion.div>
              )}
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col">
              {/* Agent Info Bar */}
              <div className={`p-4 ${selectedAgent.bgColor} border-b border-white/10`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedAgent.name}</h3>
                    <p className="text-xs text-gray-300">{selectedAgent.specialty}</p>
                  </div>
                  <div className="ml-auto">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedAgent(null)}
                      className="p-2 rounded-lg glass-light"
                    >
                      <IoRefresh className="text-gray-400" size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {conversation.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'glass-light text-white'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                        
                        {message.insights && (
                          <div className="mt-3 p-2 bg-white/10 rounded-lg">
                            <p className="text-xs font-medium mb-1">💡 Insight</p>
                            <p className="text-xs">{message.insights}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="glass-light rounded-2xl p-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <IoSparkles className="text-blue-400" size={16} />
                        </motion.div>
                        <span className="text-sm text-gray-300">Analyzing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your accuracy, get tips, or request analysis..."
                    className="flex-1 glass-light rounded-2xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    disabled={isLoading}
                  />
                  
                  <motion.button
                    onClick={sendMessage}
                    disabled={!userMessage.trim() || isLoading}
                    className="p-3 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IoFlash className="text-white" size={20} />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIAccuracyAgent;
