'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { IoCloudUpload, IoCheckmarkCircle, IoBrain, IoSparkles, IoClose, IoPlay, IoAnalytics, IoMic, IoMicOff, IoSend } from 'react-icons/io5';
import { BiUpload, BiFile, BiData, BiBot, BiSend, BiBarChart, BiShield, BiTarget, BiTime } from 'react-icons/bi';
import { TbFileSpreadsheet, TbFileText, TbRobot, TbBrain, TbDatabase, TbBulb, TbStars, TbZap, TbRocket } from 'react-icons/tb';
import { HiOutlineDocument } from 'react-icons/hi2';

const FixedAIAgentCreator = () => {
  // Core state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    dataContent: '',
    accuracy: 0,
    isTraining: false,
    isReady: false,
    capabilities: []
  });
  const [dragActive, setDragActive] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [credits, setCredits] = useState(25);
  const [showAgent, setShowAgent] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [voiceMode, setVoiceMode] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Animation controls
  const uploadControls = useAnimation();
  const agentControls = useAnimation();
  const chatControls = useAnimation();

  // Refs
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const chatScrollRef = useRef(null);
  const speechRecognition = useRef(null);

  // Project theme colors (Orange-focused)
  const themeColors = {
    primary: '#FF7A1A',
    secondary: '#FDD536',
    success: '#22C55E',
    error: '#EF4444',
    background: '#0D0D0D',
    surface: 'rgba(255, 122, 26, 0.1)',
    border: 'rgba(255, 122, 26, 0.3)',
    text: '#F5F5F5'
  };

  // Enhanced haptic feedback
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

  // File content extraction with better parsing
  const extractFileContent = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        let content = '';
        const result = e.target.result;
        const fileName = file.name.toLowerCase();
        
        try {
          if (fileName.endsWith('.csv')) {
            const lines = result.split('\n').filter(line => line.trim());
            const headers = lines[0]?.split(',').map(h => h.trim()) || [];
            const dataRows = lines.slice(1, Math.min(11, lines.length)); // First 10 rows
            
            content = `Dataset: ${file.name}\nType: CSV Data\nColumns: ${headers.length}\nRows: ${lines.length - 1}\n\nColumn Headers:\n${headers.join(', ')}\n\nSample Data:\n`;
            
            dataRows.forEach((row, idx) => {
              const cells = row.split(',').map(cell => cell.trim());
              content += `Row ${idx + 1}: ${cells.join(' | ')}\n`;
            });
            
            content += `\n[This is a sample of the full dataset with ${lines.length - 1} total rows]`;
            
          } else if (fileName.endsWith('.json')) {
            try {
              const jsonData = JSON.parse(result);
              const dataType = Array.isArray(jsonData) ? 'Array' : 'Object';
              const itemCount = Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData).length;
              
              content = `Dataset: ${file.name}\nType: JSON ${dataType}\nItems: ${itemCount}\n\nStructure Preview:\n${JSON.stringify(jsonData, null, 2).substring(0, 1500)}`;
              
              if (JSON.stringify(jsonData).length > 1500) {
                content += '\n\n[Truncated - showing first 1500 characters of JSON structure]';
              }
              
            } catch (jsonError) {
              content = `Dataset: ${file.name}\nType: JSON File (Raw Content)\n\nContent Preview:\n${result.substring(0, 1500)}`;
            }
          } else {
            // Plain text files
            const lines = result.split('\n');
            content = `Dataset: ${file.name}\nType: Text Document\nLines: ${lines.length}\n\nContent Preview:\n${result.substring(0, 2000)}`;
            
            if (result.length > 2000) {
              content += '\n\n[Truncated - showing first 2000 characters]';
            }
          }
          
        } catch (error) {
          console.error('Error parsing file:', error);
          content = `Dataset: ${file.name}\nType: Text Content\n\nRaw Content:\n${result.substring(0, 1000)}`;
        }
        
        resolve(content);
      };
      
      reader.onerror = () => {
        resolve(`Error reading file: ${file.name}`);
      };
      
      reader.readAsText(file);
    });
  };

  // Handle file upload with content extraction
  const handleFiles = async (files) => {
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
    
    for (const file of validFiles) {
      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: getFileType(file.name),
        status: 'processing',
        file: file
      };

      setUploadedFiles(prev => [...prev, fileObj]);
      
      // Extract content
      const content = await extractFileContent(file);
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileObj.id 
          ? { ...f, status: 'completed', content }
          : f
      ));

      // Train agent with extracted content
      setTimeout(() => trainAgent(fileObj, content), 1000);
    }
  };

  // Train agent with file content
  const trainAgent = async (fileData, content) => {
    triggerHaptic('medium');
    
    const capabilities = [
      'Data Analysis',
      'Pattern Recognition', 
      'Question Answering',
      'Content Summarization'
    ];

    setAgentConfig({
      name: `${fileData.name.split('.')[0]} AI Assistant`,
      description: `AI agent trained on ${fileData.name}`,
      dataContent: content,
      isTraining: true,
      accuracy: 0,
      capabilities: []
    });

    // Simulate training progress
    for (let i = 0; i < capabilities.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const accuracy = Math.min(96, 80 + (i + 1) * 4);
      
      setAgentConfig(prev => ({
        ...prev,
        accuracy,
        capabilities: [...prev.capabilities, capabilities[i]]
      }));
    }

    setAgentConfig(prev => ({
      ...prev,
      isTraining: false,
      isReady: true
    }));

    agentControls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.6 }
    });

    triggerHaptic('success');
    
    // Initialize conversation
    setConversation([{
      role: 'assistant',
      content: `Hello! I'm your AI assistant trained on "${fileData.name}". I have analyzed your data and I'm ready to help you explore insights, answer questions, and provide analysis. What would you like to know about your data?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    }]);
  };

  // FIXED: Correct API request format with proper messages array [web:355][web:361][web:370]
  const handleChat = async () => {
    if (!userInput.trim() || credits <= 0 || isTyping) return;
    
    triggerHaptic('light');
    setCredits(prev => Math.max(0, prev - 1));
    setApiError(null);
    
    const userMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    };
    
    setConversation(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsTyping(true);

    try {
      console.log('Sending API request to /api/agent');

      // Build proper messages array in OpenAI format [web:355][web:370]
      const messages = [
        {
          role: "system",
          content: `You are an AI data analyst assistant. You have been trained on the following dataset:

${agentConfig.dataContent}

Your role is to help users understand, analyze, and gain insights from this data. Answer questions based on the provided dataset. Be specific and reference the actual data when possible.`
        }
      ];

      // Add conversation history (last 6 messages for context)
      const recentConversation = conversation.slice(-6);
      recentConversation.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current user message
      messages.push({
        role: "user",
        content: currentInput
      });

      console.log('Messages array being sent:', messages);

      // Proper API request with OpenAI-compatible format [web:361][web:368]
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,  // Standard OpenAI format
          model: "gpt-3.5-turbo", // or whatever model you're using
          temperature: 0.7,
          max_tokens: 500,
          stream: false
        })
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      // Parse response
      const data = await response.json();
      console.log('API Response data:', data);
      
      // Handle different response formats
      let responseContent = '';
      if (data.choices && data.choices[0]?.message?.content) {
        // OpenAI format response
        responseContent = data.choices[0].message.content;
      } else if (data.response) {
        // Custom API format
        responseContent = data.response;
      } else if (data.message) {
        // Alternative format
        responseContent = data.message;
      } else {
        responseContent = 'I received your message but couldn\'t generate a proper response. Please try again.';
      }
      
      const assistantMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1,
        confidence: data.confidence || 90
      };
      
      setConversation(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat API Error:', error);
      setApiError(error.message);
      
      // Enhanced fallback with actual data analysis
      const intelligentFallback = generateIntelligentResponse(currentInput, agentConfig.dataContent);
      
      const assistantMessage = {
        role: 'assistant',
        content: `⚠️ API Connection Issue\n\n${intelligentFallback}\n\n*Note: This response was generated locally. For full AI capabilities, please check your internet connection.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1,
        isError: true
      };
      
      setConversation(prev => [...prev, assistantMessage]);
      triggerHaptic('error');
      
    } finally {
      setIsTyping(false);
    }
  };

  // Enhanced fallback with actual data analysis
  const generateIntelligentResponse = (input, dataContent) => {
    const lowerInput = input.toLowerCase();
    
    if (!dataContent) {
      return "I don't have any data to analyze yet. Please upload a data file first.";
    }

    // Extract meaningful information from data content
    const lines = dataContent.split('\n');
    const hasHeaders = lines.find(line => line.includes('Column Headers:') || line.includes('Columns:'));
    const hasRows = lines.find(line => line.includes('Rows:') || line.includes('Lines:'));
    const dataType = lines.find(line => line.includes('Type:'));
    
    if (lowerInput.includes('summarize') || lowerInput.includes('summary') || lowerInput.includes('overview')) {
      let summary = "Here's a summary of your data:\n\n";
      
      if (dataType) {
        summary += `• ${dataType.replace('Type:', '').trim()}\n`;
      }
      if (hasRows) {
        summary += `• ${hasRows.replace('Rows:', '').replace('Lines:', '').trim()} records\n`;
      }
      if (hasHeaders) {
        summary += `• Multiple data columns for analysis\n`;
      }
      
      summary += "\nKey insights:\n";
      summary += "• Data is structured and ready for analysis\n";
      summary += "• Multiple data points available for pattern recognition\n";
      summary += "• Can be used for statistical analysis and insights\n";
      
      return summary;
    }
    
    if (lowerInput.includes('columns') || lowerInput.includes('fields') || lowerInput.includes('headers')) {
      const headersLine = lines.find(line => line.includes('Column Headers:'));
      if (headersLine) {
        return `Your data contains the following columns:\n\n${headersLine.replace('Column Headers:', '').trim()}\n\nI can help you analyze any of these columns or their relationships.`;
      }
      return "I can see your data structure. What specific aspects would you like me to analyze?";
    }
    
    if (lowerInput.includes('analyze') || lowerInput.includes('insights') || lowerInput.includes('patterns')) {
      return `Based on your ${dataType?.replace('Type:', '').trim() || 'data'}, I can provide several types of analysis:\n\n• Statistical summaries and distributions\n• Pattern recognition and trends\n• Data quality assessment\n• Correlation analysis\n• Outlier detection\n\nWhat specific analysis would you like me to perform?`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return `I can help you with your ${dataType?.replace('Type:', '').trim() || 'uploaded data'} in several ways:\n\n• 📊 Data summarization and statistics\n• 🔍 Pattern and trend analysis\n• ❓ Answer specific questions about your data\n• 📈 Generate insights and recommendations\n• 🔎 Search and filter data points\n• 📋 Explain data structure and relationships\n\nJust ask me anything about your data!`;
    }
    
    if (lowerInput.includes('data') || lowerInput.includes('dataset')) {
      return `Your dataset contains:\n${hasRows ? `• ${hasRows.replace('Rows:', '').replace('Lines:', '').trim()} records` : ''}\n${hasHeaders ? '• Multiple structured columns' : ''}\n${dataType ? `• Format: ${dataType.replace('Type:', '').trim()}` : ''}\n\nWhat would you like to explore about this data?`;
    }
    
    // Default response with context
    return `I understand you're asking about "${input}". Based on your uploaded ${dataType?.replace('Type:', '').trim() || 'data'}, I can help you analyze and understand the information. Could you be more specific about what insights you're looking for?\n\nFor example, you could ask:\n• "What patterns do you see?"\n• "Summarize the key findings"\n• "What are the main columns?"\n• "Show me data insights"`;
  };

  // Voice recognition setup
  const setupVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      speechRecognition.current = new window.webkitSpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      
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

  // Utility functions
  const getFileType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ext === 'csv' ? 'csv' : ext === 'json' ? 'json' : 'text';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'csv': return <TbFileSpreadsheet className="text-green-400" size={24} />;
      case 'json': return <BiData className="text-blue-400" size={24} />;
      default: return <TbFileText className="text-purple-400" size={24} />;
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block p-4 rounded-full glass mb-4"
              style={{ backgroundColor: themeColors.surface }}
            >
              <TbRobot className="text-orange-400" size={36} />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">AI Agent Creator</h2>
            <p className="text-gray-400 text-sm">Upload your data and create a personalized AI assistant</p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            ref={dropRef}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
            className={`glass rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
              dragActive ? 'ring-2 ring-orange-400/50 scale-[1.02]' : ''
            }`}
            style={{ backgroundColor: dragActive ? 'rgba(255, 122, 26, 0.1)' : undefined }}
            whileHover={{ scale: dragActive ? 1.02 : 1.01 }}
          >
            <div className="text-center">
              <motion.div
                animate={dragActive ? { 
                  scale: 1.2, 
                  y: [-5, 5, -5]
                } : { 
                  scale: 1,
                  y: [0, -5, 0]
                }}
                transition={{ 
                  scale: { duration: 0.3 },
                  y: { duration: 2, repeat: Infinity }
                }}
                className="mb-6"
              >
                <IoCloudUpload className="mx-auto text-orange-400" size={48} />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">
                {dragActive ? 'Release to Upload' : 'Upload Training Data'}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Supports CSV, TXT, and JSON files up to 10MB
              </p>

              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-xl font-medium flex items-center gap-3 mx-auto text-white"
                style={{ backgroundColor: themeColors.primary }}
                whileHover={{ scale: 1.05, backgroundColor: '#FF8533' }}
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

          {/* File List */}
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
                      <div className="flex-1">
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • {file.type.toUpperCase()}
                        </p>
                      </div>
                      {file.status === 'completed' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <IoCheckmarkCircle className="text-green-400" size={20} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agent Status */}
          <AnimatePresence>
            {(agentConfig.isTraining || agentConfig.isReady) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-3xl p-6"
                // animate={agentControls}
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="inline-block p-4 rounded-full glass-light mb-4"
                    style={{ backgroundColor: themeColors.surface }}
                  >
                    <TbBrain className="text-orange-400" size={48} />
                  </motion.div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {agentConfig.isTraining ? 'Training AI Agent...' : '🎉 Agent Ready!'}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-4">{agentConfig.description}</p>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Training Progress</span>
                      <span className="text-white font-medium">{agentConfig.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: themeColors.primary }}
                        animate={{ width: `${agentConfig.accuracy}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Capabilities */}
                  {agentConfig.capabilities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Capabilities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {agentConfig.capabilities.map((capability, index) => (
                          <motion.div
                            key={capability}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 text-xs text-gray-300 p-2 glass-light rounded-lg"
                          >
                            <IoCheckmarkCircle className="text-green-400" size={14} />
                            <span>{capability}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {agentConfig.isReady && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowAgent(true)}
                      className="px-6 py-4 rounded-xl font-medium flex items-center gap-3 mx-auto text-white"
                      style={{ backgroundColor: themeColors.primary }}
                      whileHover={{ scale: 1.05, backgroundColor: '#FF8533' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoPlay size={20} />
                      Start Conversation
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* AI Agent Interface */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Agent Header */}
          <div className="glass-light rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-full glass-light"
                  style={{ backgroundColor: themeColors.surface }}
                >
                  <TbBrain className="text-orange-400" size={24} />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white">{agentConfig.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Active • {credits} credits</span>
                    {apiError && <span className="text-red-400">• API Issue</span>}
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

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-black/20 rounded-xl">
              {[
                { id: 'chat', label: 'Chat', icon: IoSend },
                { id: 'insights', label: 'Insights', icon: IoAnalytics },
                { id: 'performance', label: 'Stats', icon: BiBarChart }
              ].map(tab => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all`}
                  style={{
                    backgroundColor: activeTab === tab.id ? themeColors.primary : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#9CA3AF'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* API Status Alert */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs"
                >
                  ⚠️ API Connection Issue: {apiError}
                </motion.div>
              )}

              {/* Enhanced Chat Container */}
              <div className="glass rounded-2xl overflow-hidden">
                <div
                  ref={chatScrollRef}
                  className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-orange-400/50"
                >
                  <AnimatePresence>
                    {conversation.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'text-white'
                            : message.isError
                              ? 'glass-light text-yellow-200 border border-yellow-500/20'
                              : 'glass-light text-gray-200'
                        }`}
                        style={{
                          backgroundColor: message.role === 'user' ? themeColors.primary : undefined
                        }}>
                          <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                          {message.confidence && (
                            <div className="mt-2 text-xs text-gray-400">
                              Confidence: {message.confidence}%
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start"
                      >
                        <div className="glass-light p-3 rounded-2xl">
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
                  </AnimatePresence>
                </div>
              </div>

              {/* Chat Input */}
              <div className="glass-light rounded-2xl p-3 flex items-center gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Ask about your data..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                  disabled={credits <= 0 || isTyping}
                />
                
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={toggleVoiceMode}
                    className={`p-2 rounded-full transition-colors ${
                      voiceMode ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    style={{ backgroundColor: voiceMode ? themeColors.error : 'transparent' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {voiceMode ? <IoMicOff size={18} /> : <IoMic size={18} />}
                  </motion.button>
                  
                  <motion.button
                    onClick={handleChat}
                    disabled={!userInput.trim() || credits <= 0 || isTyping}
                    className="p-2 rounded-full text-white disabled:opacity-50"
                    style={{ backgroundColor: themeColors.primary }}
                    whileHover={!(!userInput.trim() || credits <= 0 || isTyping) ? { scale: 1.1 } : {}}
                    whileTap={!(!userInput.trim() || credits <= 0 || isTyping) ? { scale: 0.9 } : {}}
                  >
                    <BiSend size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Debug Info (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 p-2 glass-light rounded-xl">
                  <p>Debug: Data content length: {agentConfig.dataContent?.length || 0} chars</p>
                  <p>Messages format: OpenAI compatible array</p>
                  <p>API Endpoint: /api/agent</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Other tabs remain the same... */}
          {activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-4 h-80 flex items-center justify-center"
            >
              <div className="text-center text-gray-400">
                <IoAnalytics size={48} className="mx-auto mb-4 opacity-50" />
                <h4 className="font-medium text-white mb-2">Data Insights</h4>
                <p className="text-sm">Chat with your agent to generate insights</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-4 h-80"
            >
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BiBarChart className="text-orange-400" />
                Performance Stats
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="text-white">{agentConfig.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversations</span>
                  <span className="text-white">{Math.max(0, conversation.length - 1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Credits Used</span>
                  <span className="text-white">{25 - credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Size</span>
                  <span className="text-white">{agentConfig.dataContent ? `${(agentConfig.dataContent.length/1024).toFixed(1)}KB` : '0KB'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FixedAIAgentCreator;
