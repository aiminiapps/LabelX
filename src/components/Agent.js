'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { IoCloudUpload, IoDocument, IoCheckmarkCircle, IoBrain, IoSparkles, IoClose, IoPlay, IoRefresh, IoArrowForward, IoEye, IoTrendingUp, IoFlash, IoAnalytics, IoSearch, IoFilter, IoDownload, IoMic, IoMicOff, IoCamera } from 'react-icons/io5';
import { BiUpload, BiFile, BiData, BiBot, BiMicrophone, BiSend, BiBarChart, BiPieChart, BiLineChart, BiTrendingUp, BiShield, BiCpu, BiCloud, BiTime, BiBookmark, BiShare } from 'react-icons/bi';
import { TbFileSpreadsheet, TbFileText, TbRobot, TbBrain, TbWand, TbChartLine, TbChartBar, TbChartPie, TbDatabase, TbPlugConnected, TbBulb, TbStars, TbRocket } from 'react-icons/tb';
import { HiOutlineDocument, HiOutlineDocumentText, HiOutlineChartBar } from 'react-icons/hi2';
import { GiConvergenceTarget } from "react-icons/gi";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FiZap } from "react-icons/fi";


const UltraAIAgentCreator = () => {
  // Enhanced state management
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    dataType: 'mixed',
    accuracy: 0,
    confidence: 0,
    isTraining: false,
    isReady: false,
    capabilities: [],
    insights: [],
    modelSize: 0,
    processingSpeed: 0
  });
  const [dragActive, setDragActive] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [credits, setCredits] = useState(25);
  const [showAgent, setShowAgent] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, insights, performance
  const [voiceMode, setVoiceMode] = useState(false);
  const [dataInsights, setDataInsights] = useState(null);
  const [agentPersonality, setAgentPersonality] = useState('professional');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedAgents, setSavedAgents] = useState([]);
  const [showVisualizations, setShowVisualizations] = useState(false);

  // Enhanced animation controls
  const uploadControls = useAnimation();
  const agentControls = useAnimation();
  const trainingControls = useAnimation();
  const insightControls = useAnimation();
  const particleControls = useAnimation();

  // Refs for advanced features
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const chatScrollRef = useRef(null);
  const canvasRef = useRef(null);
  const speechRecognition = useRef(null);

  // Enhanced haptic patterns [web:317][web:321]
  const triggerHaptic = (pattern = 'light', type = 'impact') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      switch (pattern) {
        case 'success':
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          break;
        case 'error':
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
          break;
        case 'pulse':
          // Custom pulse pattern
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('light'), 0);
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('medium'), 100);
          setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('light'), 200);
          break;
        case 'burst':
          for (let i = 0; i < 3; i++) {
            setTimeout(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('light'), i * 50);
          }
          break;
        default:
          window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  // Advanced file analysis [web:317][web:320]
  const analyzeFileContent = async (file) => {
    setIsAnalyzing(true);
    
    // Simulate advanced AI analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        const insights = {
          rowCount: Math.floor(Math.random() * 10000) + 1000,
          columnCount: Math.floor(Math.random() * 50) + 5,
          dataQuality: Math.random() * 30 + 70, // 70-100%
          patterns: [
            'Strong correlation between variables A and B',
            'Seasonal trends detected in time series data',
            'Outliers identified in 3.2% of records',
            'Missing data in 5 columns (<2% impact)'
          ],
          suggestedModels: ['Classification', 'Regression', 'Clustering'],
          complexity: file.size > 1024 * 1024 ? 'High' : file.size > 512 * 1024 ? 'Medium' : 'Low'
        };
        
        setDataInsights(insights);
        setIsAnalyzing(false);
        resolve(insights);
      }, 3000);
    });
  };

  // Enhanced drag & drop with advanced validation
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      await handleFiles(files);
    }
  }, []);

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['.csv', '.txt', '.json', '.xlsx', '.sql'];
      const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
      const isSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      return isValid && isSize;
    });

    if (validFiles.length === 0) {
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    
    for (const file of validFiles) {
      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: getFileType(file.name),
        uploadProgress: 0,
        status: 'uploading',
        file: file,
        insights: null,
        preview: null
      };

      setUploadedFiles(prev => [...prev, fileObj]);
      await simulateAdvancedUpload(fileObj);
    }
  };

  // Advanced upload simulation with file analysis
  const simulateAdvancedUpload = async (fileObj) => {
    let progress = 0;
    
    // Upload progress
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 20 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, uploadProgress: 100, status: 'analyzing' }
            : f
        ));

        // Start file analysis
        analyzeFileContent(fileObj.file).then(insights => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'completed', insights }
              : f
          ));
          
          // Auto-train agent
          trainAdvancedAgent(fileObj, insights);
        });
        
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, uploadProgress: progress }
            : f
        ));
      }
    }, 150);
  };

  // Advanced agent training with multiple capabilities [web:317][web:319]
  const trainAdvancedAgent = async (fileData, insights) => {
    triggerHaptic('pulse');
    
    const capabilities = [
      'Data Analysis & Insights',
      'Pattern Recognition', 
      'Anomaly Detection',
      'Predictive Modeling',
      'Natural Language Queries',
      'Real-time Monitoring'
    ];

    setAgentConfig(prev => ({
      ...prev,
      name: `${fileData.name.split('.')[0]} Intelligence`,
      description: `Advanced AI agent trained on ${fileData.name} with ${capabilities.length} specialized capabilities`,
      dataType: fileData.type,
      isTraining: true,
      accuracy: 0,
      confidence: 0,
      capabilities: [],
      insights: insights?.patterns || [],
      modelSize: Math.floor(fileData.size / 1024) + Math.random() * 500,
      processingSpeed: Math.random() * 900 + 100
    }));

    // Training simulation with capabilities
    for (let i = 0; i < capabilities.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const accuracy = Math.min(98, 75 + (i + 1) * 3.5 + Math.random() * 5);
      const confidence = Math.min(95, 70 + (i + 1) * 4 + Math.random() * 3);
      
      setAgentConfig(prev => ({
        ...prev,
        accuracy,
        confidence,
        capabilities: [...prev.capabilities, capabilities[i]]
      }));

      triggerHaptic('light');
    }

    // Training complete
    setAgentConfig(prev => ({
      ...prev,
      isTraining: false,
      isReady: true
    }));

    // Success animation
    await agentControls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: { duration: 1.5 }
    });

    triggerHaptic('burst');
    
    // Initialize conversation with enhanced greeting
    setConversation([{
      role: 'assistant',
      content: `🎉 Hello! I'm your advanced AI agent, successfully trained on "${fileData.name}".\n\nI've analyzed ${insights?.rowCount?.toLocaleString() || 'your'} data points and I'm ready to help with:\n\n• ${capabilities.slice(0, 3).join('\n• ')}\n\nWhat would you like to explore first?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: `welcome_${Date.now()}`,
      type: 'greeting',
      metadata: {
        confidence: prev => prev.confidence,
        capabilities: capabilities.length
      }
    }]);
  };

  // Enhanced chat with context awareness [web:321][web:317]
  const handleAdvancedChat = async () => {
    if (!userInput.trim() || credits <= 0) return;
    
    triggerHaptic('light');
    setCredits(prev => Math.max(0, prev - 1));
    
    const userMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now(),
      sentiment: analyzeSentiment(userInput)
    };
    
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');

    // Enhanced API call with context
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          context: {
            files: uploadedFiles.map(f => ({ 
              name: f.name, 
              type: f.type, 
              insights: f.insights 
            })),
            agentConfig: agentConfig,
            conversationHistory: conversation.slice(-5), // Last 5 messages
            personality: agentPersonality,
            dataInsights: dataInsights
          }
        })
      });

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response || generateContextualResponse(userInput),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1,
        confidence: Math.random() * 20 + 80,
        reasoning: data.reasoning,
        suggestions: data.suggestions || []
      };
      
      setConversation(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Agent API error:', error);
      
      const fallbackResponse = {
        role: 'assistant',
        content: generateContextualResponse(userInput),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1,
        confidence: 75,
        isError: true
      };
      
      setConversation(prev => [...prev, fallbackResponse]);
    }
  };

  // Generate contextual responses based on data insights [web:320][web:321]
  const generateContextualResponse = (input) => {
    const responses = [
      `Based on your ${agentConfig.dataType} data, I can see ${dataInsights?.patterns?.length || 'several'} key patterns. ${dataInsights?.patterns?.[0] || 'Let me analyze this further.'} Would you like me to dive deeper into specific metrics?`,
      `I've processed ${dataInsights?.rowCount?.toLocaleString() || 'your'} records with ${agentConfig.accuracy.toFixed(1)}% accuracy. The data shows interesting trends that could help with decision-making. What specific insights are you looking for?`,
      `Your data quality score is ${dataInsights?.dataQuality?.toFixed(1) || '85.2'}%. I can help you explore correlations, detect anomalies, or generate predictions. What would be most valuable for your analysis?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Voice recognition setup [web:323][web:325]
  const setupVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      speechRecognition.current = new window.webkitSpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';
      
      speechRecognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        triggerHaptic('success');
      };
      
      speechRecognition.current.onerror = () => {
        setVoiceMode(false);
        triggerHaptic('error');
      };
    }
  };

  const toggleVoiceMode = () => {
    if (!speechRecognition.current) setupVoiceRecognition();
    
    if (voiceMode) {
      speechRecognition.current?.stop();
      setVoiceMode(false);
    } else {
      speechRecognition.current?.start();
      setVoiceMode(true);
      triggerHaptic('medium');
    }
  };

  // Enhanced utility functions
  const getFileType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    const typeMap = {
      'csv': 'csv',
      'xlsx': 'excel', 
      'txt': 'text',
      'json': 'json',
      'sql': 'database'
    };
    return typeMap[ext] || 'unknown';
  };

  const getFileIcon = (type) => {
    const iconMap = {
      'csv': <TbFileSpreadsheet className="text-green-400" size={24} />,
      'excel': <TbFileSpreadsheet className="text-emerald-400" size={24} />,
      'json': <BiData className="text-blue-400" size={24} />,
      'text': <TbFileText className="text-purple-400" size={24} />,
      'database': <TbDatabase className="text-orange-400" size={24} />
    };
    return iconMap[type] || <HiOutlineDocument className="text-gray-400" size={24} />;
  };

  const analyzeSentiment = (text) => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'wrong', 'error'];
    
    const words = text.toLowerCase().split(' ');
    const positive = words.some(word => positiveWords.includes(word));
    const negative = words.some(word => negativeWords.includes(word));
    
    return positive ? 'positive' : negative ? 'negative' : 'neutral';
  };

  // Particle animation effect
  useEffect(() => {
    particleControls.start({
      y: [-20, -100, -20],
      opacity: [0, 1, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        stagger: 0.2
      }
    });
  }, []);

  // Performance monitoring
  const getPerformanceMetrics = () => ({
    responseTime: `${agentConfig.processingSpeed.toFixed(0)}ms`,
    modelSize: `${agentConfig.modelSize.toFixed(1)}MB`,
    accuracy: `${agentConfig.accuracy.toFixed(1)}%`,
    confidence: `${agentConfig.confidence.toFixed(1)}%`,
    uptime: '99.8%'
  });

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      {!showAgent ? (
        <>
          {/* Enhanced Header with Particles */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative"
          >
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400 rounded-full"
                  animate={particleControls}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </div>

            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="inline-block p-4 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 mb-4 relative"
            >
              <TbRocket className="text-blue-400" size={36} />
              
              {/* Orbital rings */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-blue-400/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border border-purple-400/20 rounded-full"
              />
            </motion.div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Ultra AI Agent Creator
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload your data, train advanced AI agents, and unlock intelligent insights with next-generation capabilities
            </p>
          </motion.div>

          {/* Advanced Upload Zone */}
          <motion.div
            ref={dropRef}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
            className={`glass rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
              dragActive ? 'ring-2 ring-blue-400/50 bg-blue-500/10 scale-[1.02]' : ''
            }`}
            animate={uploadControls}
          >
            {/* Dynamic background patterns */}
            <div className="absolute inset-0">
              <motion.div
                animate={{
                  background: dragActive 
                    ? [
                        'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)'
                      ]
                    : [
                        'radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.05) 0%, transparent 70%)',
                        'radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                        'radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.05) 0%, transparent 70%)'
                      ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0"
              />
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                animate={dragActive ? { 
                  scale: 1.2, 
                  rotate: [0, 10, -10, 0],
                  y: [-5, 5, -5]
                } : { 
                  scale: 1, 
                  rotate: 0,
                  y: [0, -5, 0]
                }}
                transition={{ 
                  scale: { duration: 0.3 },
                  rotate: { duration: 0.6 },
                  y: { duration: 2, repeat: Infinity }
                }}
                className="mb-6"
              >
                <IoCloudUpload className="mx-auto text-blue-400" size={52} />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">
                {dragActive ? 'Release to Upload' : 'Advanced Data Upload'}
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                {dragActive 
                  ? 'Drop your files here to begin AI analysis'
                  : 'Supports CSV, Excel, JSON, TXT, SQL files up to 50MB with intelligent preprocessing'
                }
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-button px-6 py-3 rounded-xl font-medium flex items-center gap-3 mx-auto"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiUpload size={20} />
                  Choose Files
                  <FaWandMagicSparkles size={16} className="text-purple-400" />
                </motion.button>

                {/* Advanced features */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-4">
                  <div className="flex items-center gap-1">
                    <FiZap size={14} className="text-yellow-400" />
                    <span>Auto Analysis</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BiShield size={14} className="text-green-400" />
                    <span>Secure Upload</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TbBulb size={14} className="text-blue-400" />
                    <span>Smart Insights</span>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.txt,.json,.xlsx,.sql"
                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Enhanced File List with Insights */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-light rounded-2xl p-4 overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-white truncate">{file.name}</p>
                          <div className="flex items-center gap-2">
                            {file.status === 'completed' ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1"
                              >
                                <IoCheckmarkCircle className="text-green-400" size={18} />
                                <span className="text-xs text-green-400">Ready</span>
                              </motion.div>
                            ) : file.status === 'analyzing' ? (
                              <div className="flex items-center gap-1">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                                />
                                <span className="text-xs text-purple-400">Analyzing</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                                />
                                <span className="text-xs text-blue-400">Uploading</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                          <span>{file.type.toUpperCase()}</span>
                          {file.insights && (
                            <span className="text-green-400">
                              {file.insights.rowCount?.toLocaleString()} rows
                            </span>
                          )}
                        </div>
                        
                        {/* Progress bar */}
                        {file.status !== 'completed' && (
                          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                            <motion.div
                              className={`h-1.5 rounded-full ${
                                file.status === 'analyzing' ? 'bg-purple-400' : 'bg-blue-400'
                              }`}
                              animate={{ width: `${file.uploadProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}
                        
                        {/* Quick insights */}
                        {file.insights && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 p-2 bg-black/20 rounded-lg"
                          >
                            <p className="text-xs text-gray-300 mb-1">
                              Quality Score: <span className="text-green-400">{file.insights.dataQuality?.toFixed(1)}%</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.insights.patterns?.[0] || 'Analysis complete'}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Agent Status */}
          <AnimatePresence>
            {(agentConfig.isTraining || agentConfig.isReady) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-3xl p-6 relative overflow-hidden"
                // animate={agentControls}
              >
                {/* Animated background */}
                <div className="absolute inset-0">
                  <motion.div
                    animate={{
                      background: agentConfig.isTraining 
                        ? [
                            'linear-gradient(45deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                            'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
                          ]
                        : 'linear-gradient(45deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                    }}
                    transition={{ duration: 2, repeat: agentConfig.isTraining ? Infinity : 0 }}
                    className="absolute inset-0"
                  />
                </div>

                <div className="relative z-10">
                  {/* Agent Avatar */}
                  <div className="text-center mb-6">
                    <motion.div
                      animate={agentConfig.isTraining ? {
                        rotate: 360,
                        scale: [1, 1.15, 1]
                      } : { 
                        rotate: 0, 
                        scale: 1,
                        boxShadow: [
                          '0 0 20px rgba(34, 197, 94, 0.3)',
                          '0 0 40px rgba(34, 197, 94, 0.2)',
                          '0 0 20px rgba(34, 197, 94, 0.3)'
                        ]
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: agentConfig.isTraining ? Infinity : 0, ease: "linear" },
                        scale: { duration: 1.5, repeat: agentConfig.isTraining ? Infinity : 0 },
                        boxShadow: { duration: 2, repeat: agentConfig.isReady ? Infinity : 0 }
                      }}
                      className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 mb-4"
                    >
                      <TbBrain className="text-purple-400" size={48} />
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {agentConfig.isTraining ? 'Training Advanced AI Agent...' : '🚀 Ultra Agent Ready!'}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-4">{agentConfig.description}</p>
                  </div>

                  {/* Training Progress */}
                  <div className="space-y-4 mb-6">
                    {/* Accuracy */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Accuracy</span>
                        <span className="text-white font-medium">{agentConfig.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full relative overflow-hidden"
                          animate={{ width: `${agentConfig.accuracy}%` }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-white font-medium">{agentConfig.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                          animate={{ width: `${agentConfig.confidence}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Capabilities */}
                  {agentConfig.capabilities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <TbStars className="text-yellow-400" size={16} />
                        Trained Capabilities
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {agentConfig.capabilities.map((capability, index) => (
                          <motion.div
                            key={capability}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 text-xs text-gray-300 p-2 bg-black/20 rounded-lg"
                          >
                            <IoCheckmarkCircle className="text-green-400 flex-shrink-0" size={14} />
                            <span>{capability}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {agentConfig.isReady && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowAgent(true)}
                      className="w-full glass-warm px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-3 relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.2)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <IoPlay size={20} />
                      </motion.div>
                      Start Ultra Conversation
                      <TbRocket size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Ultra AI Agent Interface */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Enhanced Agent Header */}
          <div className="glass-light rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative"
                >
                  <TbBrain className="text-purple-400" size={24} />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white">{agentConfig.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Active</span>
                    </div>
                    <span>•</span>
                    <span>{agentConfig.accuracy.toFixed(1)}% Accuracy</span>
                    <span>•</span>
                    <span>{credits} credits</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setShowAgent(false)}
                  className="p-2 rounded-full glass-light hover:bg-white/10"
                  whileTap={{ scale: 0.9 }}
                >
                  <IoClose size={20} className="text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-black/20 rounded-xl">
              {[
                { id: 'chat', label: 'Chat', icon: BiSend },
                { id: 'insights', label: 'Insights', icon: IoAnalytics },
                { id: 'performance', label: 'Performance', icon: BiBarChart }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    triggerHaptic('light');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Chat Messages */}
                <div
                  ref={chatScrollRef}
                  className="glass rounded-2xl p-4 h-80 overflow-y-auto space-y-4"
                >
                  <AnimatePresence>
                    {conversation.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] p-3 rounded-2xl relative ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'glass-light text-gray-200'
                        }`}>
                          {message.role === 'assistant' && message.confidence && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                              <GiConvergenceTarget size={12} />
                              <span>Confidence: {message.confidence.toFixed(1)}%</span>
                            </div>
                          )}
                          
                          <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                          
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {message.suggestions.map((suggestion, i) => (
                                <button
                                  key={i}
                                  onClick={() => setUserInput(suggestion)}
                                  className="block w-full text-left text-xs p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Enhanced Chat Input */}
                <div className="glass-light rounded-2xl p-3 flex items-center gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdvancedChat()}
                    placeholder="Ask about your data insights..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                    disabled={credits <= 0}
                  />
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={toggleVoiceMode}
                      className={`p-2 rounded-full transition-colors ${
                        voiceMode ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {voiceMode ? <IoMicOff size={18} /> : <IoMic size={18} />}
                    </motion.button>
                    
                    <motion.button
                      onClick={handleAdvancedChat}
                      disabled={!userInput.trim() || credits <= 0}
                      className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!(!userInput.trim() || credits <= 0) ? { 
                        scale: 1.1,
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" 
                      } : {}}
                      whileTap={!(!userInput.trim() || credits <= 0) ? { scale: 0.9 } : {}}
                    >
                      <BiSend size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Data Insights Dashboard */}
                <div className="glass rounded-2xl p-4">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <IoAnalytics className="text-blue-400" />
                    Data Insights
                  </h4>
                  
                  {dataInsights ? (
                    <div className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass-light p-3 rounded-xl text-center">
                          <div className="text-lg font-bold text-blue-400">
                            {dataInsights.rowCount?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">Records</div>
                        </div>
                        <div className="glass-light p-3 rounded-xl text-center">
                          <div className="text-lg font-bold text-green-400">
                            {dataInsights.dataQuality?.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">Quality</div>
                        </div>
                      </div>
                      
                      {/* Patterns */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Key Patterns</h5>
                        <div className="space-y-2">
                          {dataInsights.patterns?.map((pattern, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-2 text-xs text-gray-300 p-2 bg-black/20 rounded-lg"
                            >
                              <TbBulb className="text-yellow-400 flex-shrink-0 mt-0.5" size={12} />
                              <span>{pattern}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <IoAnalytics size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Upload data to see insights</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Performance Metrics */}
                <div className="glass rounded-2xl p-4">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BiBarChart className="text-green-400" />
                    Agent Performance
                  </h4>
                  
                  <div className="space-y-4">
                    {Object.entries(getPerformanceMetrics()).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Performance Chart Placeholder */}
                  <div className="mt-6 h-32 glass-light rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <BiLineChart size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Performance visualization</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default UltraAIAgentCreator;
