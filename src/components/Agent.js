'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { IoCloudUpload, IoDocument, IoCheckmarkCircle, IoBrain, IoSparkles, IoClose, IoPlay, IoRefresh, IoArrowForward } from 'react-icons/io5';
import { BiUpload, BiFile, BiData, BiBot, BiMicrophone, BiSend } from 'react-icons/bi';
import { TbFileSpreadsheet, TbFileText, TbRobot, TbBrain, TbWand } from 'react-icons/tb';
import { HiOutlineDocument, HiOutlineDocumentText } from 'react-icons/hi2';

const AIAgentCreator = () => {
  // Core state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    dataType: 'mixed',
    accuracy: 0,
    isTraining: false,
    isReady: false
  });
  const [dragActive, setDragActive] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [credits, setCredits] = useState(10);
  const [showAgent, setShowAgent] = useState(false);

  // Animation controls
  const uploadControls = useAnimation();
  const agentControls = useAnimation();
  const trainingControls = useAnimation();

  // Refs
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Haptic feedback
  const triggerHaptic = (type = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'success') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  // File handling functions [web:302][web:305]
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['.csv', '.txt', '.json'];
      const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
      const isSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValid && isSize;
    });

    if (validFiles.length === 0) {
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    
    validFiles.forEach(file => {
      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.name.toLowerCase().endsWith('.csv') ? 'csv' : 
              file.name.toLowerCase().endsWith('.json') ? 'json' : 'txt',
        uploadProgress: 0,
        status: 'uploading',
        file: file
      };

      setUploadedFiles(prev => [...prev, fileObj]);
      simulateUpload(fileObj);
    });
  };

  // Simulate file upload with progress [web:300][web:303]
  const simulateUpload = (fileObj) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, uploadProgress: 100, status: 'completed' }
            : f
        ));

        // Auto-train agent after successful upload
        setTimeout(() => {
          trainAgent(fileObj);
        }, 1000);
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, uploadProgress: progress }
            : f
        ));
      }
    }, 200);
  };

  // Simulate agent training [web:306][web:312]
  const trainAgent = async (fileData) => {
    triggerHaptic('medium');
    
    setAgentConfig(prev => ({
      ...prev,
      name: `${fileData.name.split('.')[0]} AI Assistant`,
      description: `Intelligent agent trained on ${fileData.name}`,
      dataType: fileData.type,
      isTraining: true,
      accuracy: 0
    }));

    // Simulate training progress
    let accuracy = 0;
    const trainingInterval = setInterval(() => {
      accuracy += Math.random() * 15;
      if (accuracy >= 95) {
        accuracy = Math.min(98.5, 85 + Math.random() * 13.5);
        clearInterval(trainingInterval);
        
        setAgentConfig(prev => ({
          ...prev,
          accuracy: accuracy,
          isTraining: false,
          isReady: true
        }));

        // Success celebration
        agentControls.start({
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.8 }
        });

        triggerHaptic('success');
        
        // Initialize conversation
        setConversation([{
          role: 'assistant',
          content: `Hello! I'm your personalized AI agent trained on "${fileData.name}". I can help you analyze, query, and gain insights from your data. What would you like to know?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: `welcome_${Date.now()}`
        }]);
        
      } else {
        setAgentConfig(prev => ({ ...prev, accuracy }));
      }
    }, 300);
  };

  // Handle agent conversation [web:301][web:307]
  const handleAgentChat = async () => {
    if (!userInput.trim() || credits <= 0) return;
    
    triggerHaptic('light');
    setCredits(prev => Math.max(0, prev - 1));
    
    const userMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');

    // Simulate API call to /api/agent
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          context: uploadedFiles.map(f => ({ name: f.name, type: f.type })),
          agentConfig: agentConfig
        })
      });

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response || 'Based on your uploaded data, I can see interesting patterns. Let me analyze this further...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1
      };
      
      setConversation(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Agent API error:', error);
      
      // Fallback response
      const fallbackResponse = {
        role: 'assistant',
        content: 'I notice some interesting patterns in your data. Could you be more specific about what insights you\'re looking for?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1
      };
      
      setConversation(prev => [...prev, fallbackResponse]);
    }
  };

  // Get file icon
  const getFileIcon = (type) => {
    switch (type) {
      case 'csv': return <TbFileSpreadsheet className="text-green-400" size={24} />;
      case 'json': return <BiData className="text-blue-400" size={24} />;
      case 'txt': return <TbFileText className="text-purple-400" size={24} />;
      default: return <HiOutlineDocument className="text-gray-400" size={24} />;
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      {!showAgent ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="inline-block p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4"
            >
              <TbRobot className="text-blue-400" size={32} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Create AI Agent</h2>
            <p className="text-gray-400 text-sm">Upload your data and train a personalized AI assistant</p>
          </motion.div>

          {/* File Upload Area */}
          <motion.div
            ref={dropRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`glass rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
              dragActive ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''
            }`}
            animate={uploadControls}
          >
            {/* Animated background */}
            <div className="absolute inset-0">
              <motion.div
                animate={{
                  background: dragActive 
                    ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
                    : 'radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 70%)'
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              />
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                animate={dragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                className="mb-4"
              >
                <IoCloudUpload className="mx-auto text-blue-400" size={48} />
              </motion.div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {dragActive ? 'Drop your files here' : 'Upload Training Data'}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Supports CSV, TXT, and JSON files up to 10MB
              </p>

              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="glass-button px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BiUpload size={20} />
                Choose Files
              </motion.button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.txt,.json"
                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Uploaded Files */}
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
                    className="glass-light rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • {file.type.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'completed' ? (
                          <IoCheckmarkCircle className="text-green-400" size={20} />
                        ) : (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
                          />
                        )}
                      </div>
                    </div>
                    
                    {file.status !== 'completed' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <motion.div
                            className="bg-blue-400 h-1 rounded-full"
                            animate={{ width: `${file.uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agent Training Status */}
          <AnimatePresence>
            {agentConfig.isTraining || agentConfig.isReady ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-3xl p-6"
              >
                <div className="text-center">
                  <motion.div
                    animate={agentConfig.isTraining ? {
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    } : { rotate: 0, scale: 1 }}
                    transition={{ 
                      rotate: { duration: 2, repeat: agentConfig.isTraining ? Infinity : 0, ease: "linear" },
                      scale: { duration: 1, repeat: agentConfig.isTraining ? Infinity : 0 }
                    }}
                    className="mb-4"
                  >
                    <TbBrain className="mx-auto text-purple-400" size={48} />
                  </motion.div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {agentConfig.isTraining ? 'Training Your AI Agent...' : '🎉 Agent Ready!'}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-4">{agentConfig.description}</p>

                  {/* Training Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-white font-medium">{agentConfig.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full"
                        animate={{ width: `${agentConfig.accuracy}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {agentConfig.isReady && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowAgent(true)}
                      className="glass-warm px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoPlay size={20} />
                      Start Conversation
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : (
        /* AI Agent Chat Interface */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Agent Header */}
          <div className="glass-light rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20"
              >
                <TbBrain className="text-purple-400" size={24} />
              </motion.div>
              <div>
                <h3 className="font-bold text-white">{agentConfig.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>{agentConfig.accuracy.toFixed(1)}% Accuracy</span>
                  <span>•</span>
                  <span>{credits} credits</span>
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => setShowAgent(false)}
              className="p-2 rounded-full glass-light hover:bg-white/10"
              whileTap={{ scale: 0.9 }}
            >
              <IoClose size={20} className="text-gray-400" />
            </motion.button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatScrollRef}
            className="glass rounded-2xl p-4 h-80 overflow-y-auto space-y-4"
          >
            <AnimatePresence>
              {conversation.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'glass-light text-gray-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <div className="glass-light rounded-2xl p-3 flex items-center gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAgentChat()}
              placeholder="Ask me about your data..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              disabled={credits <= 0}
            />
            <motion.button
              onClick={handleAgentChat}
              disabled={!userInput.trim() || credits <= 0}
              className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!(!userInput.trim() || credits <= 0) ? { scale: 1.1 } : {}}
              whileTap={!(!userInput.trim() || credits <= 0) ? { scale: 0.9 } : {}}
            >
              <BiSend size={20} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIAgentCreator;
