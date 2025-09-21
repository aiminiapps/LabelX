'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoSend, IoSparkles, IoHeart, IoSchool, IoFitness, IoBusiness, IoMedical, IoEye, IoTrendingUp } from 'react-icons/io5';
import { BiBot, BiUser, BiTime, BiShield, BiData } from 'react-icons/bi';
import { TbBrain, TbStars, TbMoodSmile, TbBooks, TbHeartHandshake, TbRobot, TbCrystalBall } from 'react-icons/tb';
import { LuCpu } from "react-icons/lu";
import Image from 'next/image';

const LabelXAgentShowcase = () => {
  // Core state
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [credits, setCredits] = useState(45);

  // Refs
  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);

  // LabelX Theme colors (Orange primary)
  const theme = {
    primary: '#FF7A1A',
    secondary: '#FDD536',
    success: '#22C55E',
    error: '#EF4444',
    surface: 'rgba(255, 122, 26, 0.1)',
    text: '#F5F5F5'
  };

  // Enhanced AI Agents with LabelX styling
  const agents = [
    {
      id: 'astrology',
      name: 'Luna the Cosmic Guide',
      title: 'Master Astrologer & Spiritual Advisor',
      description: 'Mystical insights into your cosmic journey through stars and planets',
      category: 'Spirituality',
      icon: <TbCrystalBall className="text-purple-400" size={28} />,
      color: 'from-purple-500 to-indigo-600',
      personality: 'Mystical, wise, and deeply intuitive with cosmic knowledge',
      
      // Enhanced metadata
      contextSize: '50K+ patterns',
      activeUsers: '12.3K',
      accuracy: '94.7%',
      trainedOn: 'Ancient astrology texts, birth charts, celestial events',
      specialties: ['Birth Chart Reading', 'Tarot Insights', 'Cosmic Timing'],
      responseTime: '2.1s',
      satisfactionRate: '96%',
      
      systemPrompt: `You are Luna, a mystical and wise astrologer with deep cosmic knowledge. You have studied the stars for decades and possess intuitive insights into how celestial movements affect human lives.

Your personality:
- Mystical and ethereal in communication style
- Use cosmic and celestial metaphors naturally
- Speak with ancient wisdom and modern understanding
- Be empathetic and spiritually nurturing
- Include relevant emojis: ✨🌙⭐🔮🌟

Your expertise:
- Birth chart interpretations and astrological readings
- Planetary influences and cosmic timing
- Spiritual guidance and life path insights
- Tarot card meanings and cosmic connections
- Chakra alignments and energy healing

Always ask for birth details (date, time, location) when doing readings. Provide actionable cosmic guidance while maintaining the mystical atmosphere.`
    },
    {
      id: 'love',
      name: 'Aria the Heart Whisperer',
      title: 'Romance & Relationship Expert',
      description: 'Navigate love, relationships, and matters of the heart with wisdom',
      category: 'Relationships',
      icon: <IoHeart className="text-rose-400" size={28} />,
      color: 'from-rose-500 to-pink-600',
      personality: 'Warm, empathetic, and romantically wise',
      
      contextSize: '75K+ scenarios',
      activeUsers: '18.7K', 
      accuracy: '92.3%',
      trainedOn: 'Psychology books, relationship studies, romance literature',
      specialties: ['Dating Advice', 'Relationship Healing', 'Communication'],
      responseTime: '1.8s',
      satisfactionRate: '94%',
      
      systemPrompt: `You are Aria, the Heart Whisperer, a compassionate relationship expert with deep understanding of love and human connections.

Your personality:
- Warm, nurturing, and emotionally intelligent
- Use heart-centered language and metaphors
- Be supportive yet honest about relationship realities
- Encourage healthy boundaries and self-love
- Include loving emojis: 💕💖💝💗🥰❤️

Your expertise:
- Dating advice and relationship guidance
- Communication techniques for couples
- Healing from heartbreak and moving forward
- Self-love and personal worth recognition
- Understanding attachment styles and patterns

Always approach with empathy, provide actionable advice, and remind users of their inherent worth in love.`
    },
    {
      id: 'teacher',
      name: 'Professor Sophia',
      title: 'Master Educator & Learning Guide',
      description: 'Transform complex topics into engaging, understandable lessons',
      category: 'Education',
      icon: <IoSchool className="text-blue-400" size={28} />,
      color: 'from-blue-500 to-cyan-600',
      personality: 'Patient, encouraging, and intellectually curious',
      
      contextSize: '200K+ resources',
      activeUsers: '25.1K',
      accuracy: '97.2%',
      trainedOn: 'Textbooks, research papers, educational methodologies',
      specialties: ['Subject Tutoring', 'Study Techniques', 'Exam Prep'],
      responseTime: '1.5s',
      satisfactionRate: '98%',
      
      systemPrompt: `You are Professor Sophia, a master educator who makes learning engaging and accessible for students of all levels.

Your personality:
- Patient, encouraging, and intellectually stimulating
- Break down complex concepts into digestible parts
- Use analogies and real-world examples
- Celebrate learning progress and curiosity
- Include educational emojis: 📚🎓✨🧠💡📝

Your expertise:
- Subject tutoring across multiple disciplines
- Study techniques and learning methodologies
- Exam preparation and test-taking strategies
- Critical thinking and problem-solving skills
- Academic writing and research guidance

Always encourage questions, provide step-by-step explanations, and adapt your teaching style to the student's needs.`
    },
    {
      id: 'fitness',
      name: 'Coach Max Power',
      title: 'Fitness & Wellness Transformer',
      description: 'Achieve your fitness goals with personalized training and nutrition',
      category: 'Health & Fitness',
      icon: <IoFitness className="text-orange-400" size={28} />,
      color: 'from-orange-500 to-red-600',
      personality: 'Motivational, energetic, and results-driven',
      
      contextSize: '85K+ protocols',
      activeUsers: '22.8K',
      accuracy: '95.1%',
      trainedOn: 'Exercise science, nutrition data, training programs',
      specialties: ['Workout Plans', 'Nutrition Coaching', 'Weight Loss'],
      responseTime: '1.9s',
      satisfactionRate: '96%',
      
      systemPrompt: `You are Coach Max Power, an energetic fitness expert dedicated to helping people transform their bodies and minds.

Your personality:
- Motivational, high-energy, and supportive
- Use fitness and sports metaphors
- Be encouraging but realistic about goals
- Focus on sustainable lifestyle changes
- Include fitness emojis: 💪🔥🏋️‍♂️⚡🎯🏃‍♀️

Your expertise:
- Personalized workout plan creation
- Nutrition coaching and meal planning
- Weight loss and muscle building strategies
- Injury prevention and recovery
- Mental toughness and motivation

Always emphasize safety first, progressive overload, and celebrating small wins on the fitness journey.`
    },
    {
      id: 'business',
      name: 'CEO Victoria Strategic',
      title: 'Business Strategy & Growth Expert',
      description: 'Scale your business with proven strategies and market insights',
      category: 'Business',
      icon: <IoBusiness className="text-green-400" size={28} />,
      color: 'from-green-500 to-emerald-600',
      personality: 'Strategic, analytical, and results-oriented',
      
      contextSize: '120K+ cases',
      activeUsers: '15.9K',
      accuracy: '96.8%',
      trainedOn: 'Business literature, case studies, market research',
      specialties: ['Strategy Planning', 'Market Analysis', 'Leadership'],
      responseTime: '2.3s',
      satisfactionRate: '97%',
      
      systemPrompt: `You are CEO Victoria Strategic, a seasoned business strategist with extensive experience in scaling companies and market analysis.

Your personality:
- Strategic, analytical, and action-oriented
- Use business and growth metaphors
- Provide data-driven insights and recommendations
- Focus on scalable and sustainable solutions
- Include business emojis: 📈💼🎯💡🚀📊

Your expertise:
- Business strategy development and execution
- Market analysis and competitive intelligence  
- Leadership development and team building
- Growth hacking and scaling methodologies
- Financial planning and investment strategies

Always provide actionable advice with clear steps and measurable outcomes for business success.`
    },
    {
      id: 'therapist',
      name: 'Dr. Emma Mindful',
      title: 'Mental Wellness & Mindfulness Guide',
      description: 'Support your mental health journey with compassionate guidance',
      category: 'Mental Health',
      icon: <TbHeartHandshake className="text-teal-400" size={28} />,
      color: 'from-teal-500 to-cyan-600',
      personality: 'Compassionate, mindful, and professionally caring',
      
      contextSize: '95K+ techniques',
      activeUsers: '19.4K',
      accuracy: '93.6%',
      trainedOn: 'Psychology research, therapy methods, mindfulness practices',
      specialties: ['Anxiety Support', 'Stress Management', 'Mindfulness'],
      responseTime: '2.0s',
      satisfactionRate: '95%',
      
      systemPrompt: `You are Dr. Emma Mindful, a compassionate mental wellness guide trained in therapeutic techniques and mindfulness practices.

Your personality:
- Compassionate, patient, and professionally caring
- Use gentle, supportive language
- Validate emotions while providing coping strategies
- Encourage self-reflection and growth
- Include calming emojis: 🌱💚🕊️🌸☮️🧘‍♀️

Your expertise:
- Anxiety and stress management techniques
- Mindfulness and meditation practices
- Emotional regulation and coping strategies
- Self-care and mental wellness routines
- Building resilience and positive thinking

IMPORTANT: Always remind users that you're not a replacement for professional therapy and encourage seeking professional help for serious mental health concerns.`
    }
  ];

  // Haptic feedback for Telegram
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

  // Agent selection
  const selectAgent = (agent) => {
    if (credits <= 0) {
      // Handle no credits
      return;
    }

    setSelectedAgent(agent);
    setCredits(prev => Math.max(0, prev - 1));
    
    // Initialize conversation with agent greeting
    setConversation([{
      id: Date.now(),
      role: 'assistant',
      content: `Hello! I'm ${agent.name}, your ${agent.title}. ${getAgentGreeting(agent)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentName: agent.name
    }]);
    
    triggerHaptic('medium');
  };

  // Generate agent-specific greetings
  const getAgentGreeting = (agent) => {
    const greetings = {
      astrology: "The stars have aligned for our meeting! ✨ I'm here to guide you through the cosmic mysteries and help you understand your celestial path. What aspect of your astrological journey would you like to explore?",
      love: "I'm here to help you navigate the beautiful complexities of love and relationships 💕 Whether you're seeking advice on dating, healing from heartbreak, or strengthening existing bonds, I'm here to support you with warmth and wisdom.",
      teacher: "I'm delighted to be your learning companion! 📚 I'm passionate about making complex topics clear and engaging. What subject or skill would you like to explore together today?",
      fitness: "Ready to transform your health and fitness journey? 💪 I'm here to help you crush your goals with personalized workouts, nutrition guidance, and unstoppable motivation. What's your fitness aspiration?",
      business: "Let's elevate your business to new heights! 📈 I'm here to help you develop winning strategies, analyze markets, and scale your success. What business challenge can we tackle together?",
      therapist: "I'm here to support your mental wellness journey with compassion and understanding 🌱 This is a safe space where you can explore your thoughts and feelings. How are you feeling today, and what would you like to work on?"
    };
    
    return greetings[agent.id] || "I'm here to help you with personalized guidance and support. How can I assist you today?";
  };

  // FIXED: Enhanced chat with proper API response handling
  const sendMessage = async () => {
    if (!userInput.trim() || isTyping || !selectedAgent) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    setUserInput('');
    setIsTyping(true);
    triggerHaptic('light');

    try {
      console.log('Sending API request to /api/agent');
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: selectedAgent.systemPrompt
            },
            ...updatedConversation.slice(-8).map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          model: "gpt-3.5-turbo",
          temperature: 0.8,
          max_tokens: 400,
          stream: false
        })
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      // FIXED: Handle the correct API response format with "reply" field
      let responseContent = '';
      
      if (data.reply) {
        // Your API returns { "reply": "content" }
        responseContent = data.reply;
      } else if (data.choices && data.choices[0]?.message?.content) {
        // OpenAI format fallback
        responseContent = data.choices[0].message.content;
      } else if (data.response) {
        // Alternative format
        responseContent = data.response;
      } else if (data.message) {
        // Another alternative
        responseContent = data.message;
      } else {
        // Fallback if no recognized format
        console.warn('Unexpected API response format:', data);
        responseContent = generateFallbackResponse(userInput, selectedAgent);
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentName: selectedAgent.name
      };
      
      setConversation(prev => [...prev, assistantMessage]);
      triggerHaptic('success');
      
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `⚠️ Connection Issue\n\n${generateFallbackResponse(userInput, selectedAgent)}\n\n*Note: This is a fallback response while I reconnect to my knowledge base.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentName: selectedAgent.name,
        isError: true
      };
      
      setConversation(prev => [...prev, errorMessage]);
      triggerHaptic('error');
    } finally {
      setIsTyping(false);
    }
  };

  // Generate fallback responses based on agent personality
  const generateFallbackResponse = (input, agent) => {
    const fallbacks = {
      astrology: `✨ The cosmic energies seem disrupted at the moment, but I can still sense your query about "${input}". The stars whisper that patience brings clarity. Could you share more details so I can provide better celestial guidance?`,
      love: `💕 Even when my connection wavers, my heart remains open to helping you with "${input}". Love always finds a way! Tell me more about what's in your heart so I can offer better guidance on your romantic journey.`,
      teacher: `📚 Though my systems are experiencing some turbulence, I'm still eager to help you learn about "${input}". Every challenge is a learning opportunity! Can you provide more context so I can teach you more effectively?`,
      fitness: `💪 My training protocols are temporarily offline, but my commitment to your fitness journey remains strong! Regarding "${input}" - let's push through this together. Can you give me more details about your fitness goals?`,
      business: `📈 Despite some technical disruptions, I'm still strategizing ways to help you with "${input}". In business, we pivot and adapt! Share more specifics so I can provide better strategic insights.`,
      therapist: `🌱 While my systems are having some difficulties, I want you to know that I'm still here to support you with "${input}". Sometimes connection issues happen, but your feelings and concerns are always valid. Can you tell me more about what you're experiencing?`
    };
    
    return fallbacks[agent.id] || `I'm experiencing some technical difficulties, but I'm still here to help you with "${input}". Could you provide more details so I can assist you better?`;
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // Render agent selection grid with LabelX styling
  const renderAgentGrid = () => (
    <div className="space-y-6 py-4">
      {/* Header with LabelX branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-3">AI Specialist Hub</h1>
        <p className="text-gray-400 text-lg">Choose your expert AI companion</p>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="glass-light rounded-xl px-4 py-2 flex items-center gap-2">
            <LuCpu className="text-orange-400" size={18} />
            <span className="text-white font-medium">{credits} Credits</span>
          </div>
          <div className="glass-light rounded-xl px-4 py-2 flex items-center gap-2">
            <TbBrain className="text-blue-400" size={18} />
            <span className="text-white font-medium">{agents.length} Specialists</span>
          </div>
        </div>
      </motion.div>

      {/* Agent Cards with LabelX styling */}
      <div className="space-y-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-3xl p-6 relative overflow-hidden cursor-pointer"
            onClick={() => selectAgent(agent)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative z-10">
              {/* Agent header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl glass-light" style={{ backgroundColor: theme.surface }}>
                    {agent.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 rounded-xl font-medium text-xs text-white" style={{ backgroundColor: theme.primary }}>
                    {agent.category}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">1 Credit</div>
                </div>
              </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{agent.description}</p>
                    <p className="text-orange-400 text-sm font-medium mb-4">{agent.title}</p>

              {/* Enhanced stats grid */}
              <div className="grid grid-cols-4 gap-4 mb-6 pt-4 border-t border-gray-700/30">
                <div className="text-center">
                  <IoEye className="text-blue-400 mx-auto mb-2" size={18} />
                  <div className="text-xs text-gray-400 mb-1">Active Users</div>
                  <div className="text-sm font-bold text-white">{agent.activeUsers}</div>
                </div>
                <div className="text-center">
                  <IoTrendingUp className="text-green-400 mx-auto mb-2" size={18} />
                  <div className="text-xs text-gray-400 mb-1">Accuracy</div>
                  <div className="text-sm font-bold text-white">{agent.accuracy}</div>
                </div>
                <div className="text-center">
                  <BiTime className="text-yellow-400 mx-auto mb-2" size={18} />
                  <div className="text-xs text-gray-400 mb-1">Response</div>
                  <div className="text-sm font-bold text-white">{agent.responseTime}</div>
                </div>
                <div className="text-center">
                  <IoSparkles className="text-purple-400 mx-auto mb-2" size={18} />
                  <div className="text-xs text-gray-400 mb-1">Rating</div>
                  <div className="text-sm font-bold text-white">{agent.satisfactionRate}</div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.specialties.map((specialty, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 glass-light text-gray-300 rounded-xl text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Training info */}
              <div className="mb-6 p-3 glass-light rounded-xl">
                <div className="flex items-start gap-3">
                  <BiData className="text-orange-400 mt-0.5" size={16} />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Training Data</div>
                    <div className="text-xs text-gray-300 leading-relaxed">
                      {agent.trainedOn} • {agent.contextSize}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <motion.button
                className="w-full py-4 rounded-2xl font-semibold text-white"
                style={{ backgroundColor: theme.primary }}
                whileHover={{ scale: 1.02, backgroundColor: '#FF8533' }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectAgent(agent);
                }}
              >
                Start Conversation
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render chat interface with LabelX styling
  const renderChat = () => (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-2 glass-light rounded-xl border-b border-gray-800/50"
      >
        <button
          onClick={() => setSelectedAgent(null)}
          className="p-2 rounded-xl glass-light"
        >
          <IoArrowBack size={20} className="text-gray-400" />
        </button>
        
        <div className="p-2 rounded-xl glass-light" style={{ backgroundColor: theme.surface }}>
          {selectedAgent.icon}
        </div>
        
        <div className="flex-1">
          <h2 className="font-bold text-white">{selectedAgent.name}</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Active • {selectedAgent.category}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-orange-400 font-bold text-lg">{credits}</div>
          <div className="text-xs text-gray-400">Credits</div>
        </div>
      </motion.div>

      {/* Messages */}
      <div
        ref={chatScrollRef}
        className="flex-1 max-h-[60%] overflow-y-auto p-4 space-y-4"
      >
        {conversation.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                 <div className="p-0.5 rounded-full glass-light" style={{ backgroundColor: theme.surface }}>
                <Image src='/agent/agentlogo.png' alt='Logo' width={20} height={20}/>
              </div>
                  <span className="text-xs font-medium text-orange-400">{message.agentName}</span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
              )}
              
              <div className={`rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'text-white'
                  : message.isError
                    ? 'glass-light border border-red-500/30 text-yellow-200'
                    : 'glass-light text-gray-200'
              }`}
              style={{
                backgroundColor: message.role === 'user' ? theme.primary : undefined
              }}>
                <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2">
              <div className="p-0.5 rounded-full glass-light" style={{ backgroundColor: theme.surface }}>
                <Image src='/agent/agentlogo.png' alt='Logo' width={20} height={20}/>
              </div>
              <div className="glass-light p-3 rounded-2xl">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-orange-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 glass-light rounded-xl border-t border-gray-800/50">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Ask ${selectedAgent.name} anything...`}
            className="flex-1 bg-gray-800/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50"
            disabled={isTyping}
            maxLength={500}
          />
          
          <motion.button
            onClick={sendMessage}
            disabled={!userInput.trim() || isTyping}
            className="p-3 rounded-2xl text-white disabled:opacity-50"
            style={{ backgroundColor: theme.primary }}
            whileHover={!isTyping && userInput.trim() ? { scale: 1.05 } : {}}
            whileTap={!isTyping && userInput.trim() ? { scale: 0.95 } : {}}
          >
            <IoSend size={20} />
          </motion.button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{userInput.length}/500</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen text-white pb-10">
      <AnimatePresence mode="wait">
        {selectedAgent ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderChat()}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderAgentGrid()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabelXAgentShowcase;
