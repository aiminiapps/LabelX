'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoSend, IoSparkles, IoHeart, IoSchool, IoFitness, IoBusiness, IoMedical, IoEye, IoTrendingUp } from 'react-icons/io5';
import { BiBot, BiUser, BiTime, BiShield, BiData } from 'react-icons/bi';
import { TbBrain, TbStars, TbMoodSmile, TbBooks, TbHeartHandshake, TbRobot, TbCrystalBall } from 'react-icons/tb';
import { LuCpu } from "react-icons/lu";
import Image from 'next/image';

const LabelXAgentShowcase = () => {
  // --- Core state (LOGIC PRESERVED) ---
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [credits, setCredits] = useState(45);

  // Refs
  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);

  // LabelX Theme colors (Updated to Brand Yellow #FBBF24)
  const theme = {
    primary: '#FBBF24',
    secondary: '#F59E0B',
    success: '#22C55E',
    error: '#EF4444',
    surface: 'rgba(251, 191, 36, 0.1)',
    text: '#F5F5F5'
  };

  // Enhanced AI Agents (Data preserved, icons/colors tweaked for theme consistency)
  const agents = [
    {
      id: 'astrology',
      name: 'Luna the Cosmic Guide',
      title: 'Master Astrologer & Spiritual Advisor',
      description: 'Mystical insights into your cosmic journey through stars and planets',
      category: 'Spirituality',
      icon: <TbCrystalBall className="text-[#FBBF24]" size={28} />,
      color: 'from-purple-500 to-indigo-600',
      personality: 'Mystical, wise, and deeply intuitive with cosmic knowledge',
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
      icon: <IoHeart className="text-[#FBBF24]" size={28} />,
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
      icon: <IoSchool className="text-[#FBBF24]" size={28} />,
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
      icon: <IoFitness className="text-[#FBBF24]" size={28} />,
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
      icon: <IoBusiness className="text-[#FBBF24]" size={28} />,
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
      icon: <TbHeartHandshake className="text-[#FBBF24]" size={28} />,
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

  // Haptic feedback logic (PRESERVED)
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

  // Agent selection logic (PRESERVED)
  const selectAgent = (agent) => {
    if (credits <= 0) return;

    setSelectedAgent(agent);
    setCredits(prev => Math.max(0, prev - 1));
    
    setConversation([{
      id: Date.now(),
      role: 'assistant',
      content: `Hello! I'm ${agent.name}, your ${agent.title}. ${getAgentGreeting(agent)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentName: agent.name
    }]);
    
    triggerHaptic('medium');
  };

  // Greeting generation logic (PRESERVED)
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

  // Message sending logic (PRESERVED)
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      let responseContent = '';
      if (data.reply) {
        responseContent = data.reply;
      } else if (data.choices && data.choices[0]?.message?.content) {
        responseContent = data.choices[0].message.content;
      } else if (data.response) {
        responseContent = data.response;
      } else if (data.message) {
        responseContent = data.message;
      } else {
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

  // Fallback generation (PRESERVED)
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

  // Auto-scroll effect (PRESERVED)
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // --- RENDER FUNCTIONS (UI UPDATED TO LABELX THEME) ---

  // 1. Grid View Render
  const renderAgentGrid = () => (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 mb-4">
            <IoSparkles className="text-[#FBBF24]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FBBF24]">AI Specialists</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium text-white mb-4 tracking-tight">Select Your <span className="text-[#FBBF24]">Expert</span></h1>
        <p className="text-neutral-400 text-sm md:text-base font-light max-w-xl mx-auto">
          Access specialized AI agents trained on proprietary datasets for distinct domains.
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0A0A] border border-white/[0.08]">
            <LuCpu className="text-[#FBBF24]" size={16} />
            <span className="text-white text-sm font-mono">{credits} Credits</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0A0A] border border-white/[0.08]">
            <TbBrain className="text-blue-400" size={16} />
            <span className="text-white text-sm font-mono">{agents.length} Agents</span>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-[#0A0A0A] rounded-[24px] border border-white/[0.08] overflow-hidden hover:border-[#FBBF24]/30 transition-all duration-300"
            onClick={() => selectAgent(agent)}
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FBBF24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative p-6 md:p-8 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[#FBBF24]">
                  {agent.icon}
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-[10px] font-mono font-bold uppercase tracking-wide border border-[#FBBF24]/20">
                    {agent.category}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
              <p className="text-[#FBBF24] text-xs font-mono mb-3">{agent.title}</p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-2">{agent.description}</p>

              {/* Dashboard Stats (Grid) */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <StatCell label="Active Users" value={agent.activeUsers} />
                <StatCell label="Accuracy" value={agent.accuracy} highlight />
                <StatCell label="Latency" value={agent.responseTime} />
                <StatCell label="Rating" value={agent.satisfactionRate} />
              </div>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-white/[0.05]">
                <div className="flex items-center gap-2 mb-4">
                    <BiData className="text-neutral-500" />
                    <span className="text-[10px] text-neutral-500 font-mono">
                        TRAINED ON: {agent.contextSize}
                    </span>
                </div>
                <button className="w-full py-3 rounded-xl bg-[#FBBF24] text-black font-bold text-sm hover:bg-[#FCD34D] transition-colors shadow-[0_0_20px_-5px_rgba(251,191,36,0.3)]">
                  Initialize Chat (1 Credit)
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // 2. Chat View Render
  const renderChat = () => (
    <div className="flex flex-col h-screen max-h-screen bg-black relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none flex items-center gap-4 px-4 md:px-6 py-4 border-b border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-md z-20"
      >
        <button
          onClick={() => setSelectedAgent(null)}
          className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
        >
          <IoArrowBack size={20} />
        </button>
        
        <div className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20">
          {selectedAgent.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white text-sm md:text-base truncate">{selectedAgent.name}</h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider truncate">
                {selectedAgent.category} Node Active
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[#FBBF24] font-bold font-mono text-lg">{credits}</span>
          <span className="text-[10px] text-neutral-500 font-mono uppercase">Credits Rem.</span>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth" ref={chatScrollRef}>
        {conversation.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Sender Info (Assistant Only) */}
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 ml-1">
                   <div className="w-4 h-4 rounded-full bg-[#FBBF24]/20 flex items-center justify-center text-[10px] text-[#FBBF24] font-bold border border-[#FBBF24]/30">AI</div>
                   <span className="text-[10px] text-[#FBBF24] font-mono uppercase tracking-wide">{message.agentName}</span>
                   <span className="text-[10px] text-neutral-600 font-mono">{message.timestamp}</span>
                </div>
              )}

              {/* Message Bubble */}
              <div className={`
                relative px-5 py-3 md:py-4 md:px-6 rounded-2xl text-sm md:text-base leading-relaxed
                ${message.role === 'user' 
                  ? 'bg-[#FBBF24] text-black font-medium rounded-tr-sm shadow-[0_0_20px_-5px_rgba(251,191,36,0.3)]' 
                  : message.isError 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-sm'
                    : 'bg-[#111] border border-white/[0.08] text-neutral-200 rounded-tl-sm'
                }
              `}>
                <p className="whitespace-pre-line">{message.content}</p>
              </div>

              {/* Timestamp (User Only) */}
              {message.role === 'user' && (
                <span className="text-[10px] text-neutral-600 font-mono mt-1 mr-1">{message.timestamp}</span>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
             <div className="bg-[#111] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-bounce delay-200" />
             </div>
          </motion.div>
        )}
        <div className="h-4" /> {/* Spacer */}
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 md:p-6 bg-[#000000] border-t border-white/[0.08] z-20">
         <div className="max-w-4xl mx-auto relative flex items-center gap-3">
            <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Query ${selectedAgent.name}...`}
                className="flex-1 bg-[#0A0A0A] text-white placeholder-neutral-600 rounded-xl px-5 py-4 border border-white/[0.1] focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24]/50 outline-none transition-all font-sans text-sm md:text-base"
                disabled={isTyping}
                maxLength={500}
            />
            <motion.button
                onClick={sendMessage}
                disabled={!userInput.trim() || isTyping}
                whileHover={!isTyping && userInput.trim() ? { scale: 1.05 } : {}}
                whileTap={!isTyping && userInput.trim() ? { scale: 0.95 } : {}}
                className={`p-4 rounded-xl flex items-center justify-center transition-all ${
                    !userInput.trim() || isTyping 
                    ? 'bg-[#111] text-neutral-600 cursor-not-allowed border border-white/[0.05]' 
                    : 'bg-[#FBBF24] text-black shadow-lg hover:bg-[#FCD34D]'
                }`}
            >
                <IoSend size={20} />
            </motion.button>
         </div>
         <div className="max-w-4xl mx-auto mt-2 flex justify-between px-2">
            <span className="text-[10px] text-neutral-600 font-mono">{userInput.length} / 500 CHARS</span>
            <span className="text-[10px] text-neutral-600 font-mono hidden md:inline">PRESS ENTER TO SEND</span>
         </div>
      </div>
    </div>
  );

  // Main Return
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Global Background Ambience */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-[#FBBF24]/5 blur-[120px] rounded-full" />
        </div>

      <AnimatePresence mode="wait">
        {selectedAgent ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {renderChat()}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {renderAgentGrid()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for clean stats grid
const StatCell = ({ label, value, highlight }) => (
    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
        <span className="text-[10px] text-neutral-500 font-mono mb-1">{label}</span>
        <span className={`text-sm font-bold ${highlight ? 'text-[#FBBF24]' : 'text-white'}`}>{value}</span>
    </div>
);

export default LabelXAgentShowcase;