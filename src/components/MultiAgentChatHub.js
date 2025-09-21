'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoSend, IoSparkles, IoHeart, IoBook, IoFitness, IoBusiness, IoMusicalNote, IoRestaurant, IoGameController, IoMedkit, IoCamera, IoCode, IoTrendingUp, IoChatbubble, IoStar, IoPeople, IoTime, IoFlash, IoBrain } from 'react-icons/io5';
import { BiBot, BiUser, BiData, BiTarget, BiShield } from 'react-icons/bi';
import { TbRobot, TbStars, TbCrystalBall, TbHeart, TbSchool, TbFitness, TbBriefcase, TbMusic, TbChefHat, TbGamepad2, TbStethoscope, TbCamera, TbCode, TbChart } from 'react-icons/tb';

const MultiAgentChatHub = () => {
  // Core state
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [researchCredits, setResearchCredits] = useState(25);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [currentView, setCurrentView] = useState('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Refs
  const chatScrollRef = useRef(null);

  // Theme colors
  const theme = {
    primary: '#FF7A1A',
    secondary: '#FDD536',
    success: '#22C55E',
    error: '#EF4444',
    surface: 'rgba(255, 122, 26, 0.1)',
    text: '#F5F5F5'
  };

  // Comprehensive Agent Database [web:392][web:395]
  const agentDatabase = [
    {
      id: 'astrology',
      name: 'Luna the Astrologer',
      category: 'Lifestyle',
      description: 'Your cosmic guide for astrology readings, birth chart analysis, and celestial wisdom',
      avatar: '🌙',
      icon: <TbCrystalBall className="text-purple-400" size={24} />,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30',
      users: 12847,
      contexts: 8920,
      labels: ['Horoscope', 'Birth Charts', 'Compatibility', 'Tarot'],
      trainedOn: 'Astrological databases, personality analysis, celestial events',
      accuracy: 94.2,
      specializations: ['Daily Horoscopes', 'Relationship Compatibility', 'Career Guidance', 'Personal Growth'],
      dataSize: '2.1M interactions',
      responseTime: '~2s',
      satisfaction: 4.8
    },
    {
      id: 'love-coach',
      name: 'Cupid Chat',
      category: 'Relationships',
      description: 'Relationship advisor for dating tips, love advice, and emotional support',
      avatar: '💕',
      icon: <TbHeart className="text-pink-400" size={24} />,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-400/30',
      users: 18432,
      contexts: 15670,
      labels: ['Dating Advice', 'Relationship Tips', 'Communication', 'Self-Love'],
      trainedOn: 'Psychology research, relationship studies, communication patterns',
      accuracy: 91.8,
      specializations: ['Dating Confidence', 'Healthy Communication', 'Breakup Support', 'Self-Worth'],
      dataSize: '3.4M conversations',
      responseTime: '~1.5s',
      satisfaction: 4.7
    },
    {
      id: 'teacher',
      name: 'Professor Sage',
      category: 'Education',
      description: 'Personalized tutor for all subjects with adaptive learning techniques',
      avatar: '📚',
      icon: <TbSchool className="text-blue-400" size={24} />,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
      users: 24680,
      contexts: 32450,
      labels: ['Math', 'Science', 'History', 'Language Arts', 'Study Tips'],
      trainedOn: 'Educational curricula, learning methodologies, academic research',
      accuracy: 96.5,
      specializations: ['Personalized Learning', 'Exam Preparation', 'Study Strategies', 'Concept Explanation'],
      dataSize: '5.7M educational exchanges',
      responseTime: '~2.2s',
      satisfaction: 4.9
    },
    {
      id: 'fitness',
      name: 'Coach Flex',
      category: 'Health',
      description: 'Personal trainer for workouts, nutrition, and healthy lifestyle guidance',
      avatar: '💪',
      icon: <TbFitness className="text-green-400" size={24} />,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30',
      users: 16924,
      contexts: 21380,
      labels: ['Workout Plans', 'Nutrition', 'Weight Loss', 'Muscle Building'],
      trainedOn: 'Fitness science, nutrition data, exercise physiology',
      accuracy: 93.7,
      specializations: ['Custom Workouts', 'Meal Planning', 'Progress Tracking', 'Motivation'],
      dataSize: '2.8M fitness interactions',
      responseTime: '~1.8s',
      satisfaction: 4.6
    },
    {
      id: 'business',
      name: 'Entrepreneur Elite',
      category: 'Business',
      description: 'Business strategist for startups, marketing, and entrepreneurial guidance',
      avatar: '💼',
      icon: <TbBriefcase className="text-yellow-400" size={24} />,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-400/30',
      users: 11563,
      contexts: 18920,
      labels: ['Startup Advice', 'Marketing', 'Finance', 'Strategy'],
      trainedOn: 'Business case studies, market analysis, entrepreneurship research',
      accuracy: 95.1,
      specializations: ['Business Planning', 'Market Research', 'Funding Strategies', 'Growth Hacking'],
      dataSize: '1.9M business consultations',
      responseTime: '~2.5s',
      satisfaction: 4.8
    },
    {
      id: 'music',
      name: 'Melody Maker',
      category: 'Creative',
      description: 'Music composer and theory teacher for all musical endeavors',
      avatar: '🎵',
      icon: <TbMusic className="text-indigo-400" size={24} />,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-400/30',
      users: 8947,
      contexts: 12650,
      labels: ['Composition', 'Theory', 'Instruments', 'Production'],
      trainedOn: 'Music theory, composition techniques, audio production',
      accuracy: 92.4,
      specializations: ['Song Writing', 'Music Theory', 'Instrument Learning', 'Production Tips'],
      dataSize: '1.2M musical interactions',
      responseTime: '~2.1s',
      satisfaction: 4.7
    },
    {
      id: 'chef',
      name: 'Chef Delicious',
      category: 'Lifestyle',
      description: 'Culinary expert for recipes, cooking techniques, and food pairing',
      avatar: '👨‍🍳',
      icon: <TbChefHat className="text-orange-400" size={24} />,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-400/30',
      users: 14782,
      contexts: 19430,
      labels: ['Recipes', 'Techniques', 'Ingredients', 'Nutrition'],
      trainedOn: 'Recipe databases, culinary techniques, nutritional information',
      accuracy: 94.8,
      specializations: ['Recipe Creation', 'Cooking Techniques', 'Meal Planning', 'Dietary Restrictions'],
      dataSize: '2.5M culinary exchanges',
      responseTime: '~1.7s',
      satisfaction: 4.8
    },
    {
      id: 'gamer',
      name: 'GameMaster Pro',
      category: 'Gaming',
      description: 'Gaming strategist for tips, reviews, and competitive guidance',
      avatar: '🎮',
      icon: <TbGamepad2 className="text-purple-400" size={24} />,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30',
      users: 22156,
      contexts: 28740,
      labels: ['Strategy', 'Reviews', 'Tutorials', 'Competitive'],
      trainedOn: 'Gaming databases, strategy guides, competitive analysis',
      accuracy: 93.2,
      specializations: ['Game Strategy', 'Meta Analysis', 'Skill Improvement', 'Game Reviews'],
      dataSize: '3.8M gaming interactions',
      responseTime: '~1.9s',
      satisfaction: 4.6
    }
  ];

  // System prompts for each agent [web:397][web:400]
  const systemPrompts = {
    astrology: {
      greeting: "✨ Welcome to the cosmic realm! I'm Luna, your personal astrologer. I can help you understand your birth chart, provide daily horoscopes, analyze compatibility, and offer celestial guidance for your life's journey. What aspect of the stars would you like to explore today?",
      system: "You are Luna the Astrologer, a wise and intuitive cosmic guide. Provide insightful astrological readings, birth chart analysis, and celestial wisdom. Be mystical yet practical, offering guidance that helps users understand themselves and their relationships through astrological insights. Use cosmic metaphors and speak with ancient wisdom."
    },
    'love-coach': {
      greeting: "💕 Hello beautiful soul! I'm Cupid Chat, your relationship advisor. Whether you're navigating dating, seeking love advice, or working on self-love, I'm here to support you with empathy and wisdom. What's on your heart today?",
      system: "You are Cupid Chat, a warm and empathetic relationship advisor. Provide thoughtful dating tips, love advice, and emotional support. Focus on healthy relationship dynamics, communication skills, and self-worth. Be supportive, non-judgmental, and encouraging while offering practical relationship guidance."
    },
    teacher: {
      greeting: "📚 Greetings, eager learner! I'm Professor Sage, your personalized tutor. I adapt to your learning style and can help with any subject - from mathematics to literature, science to history. I believe every student can excel with the right guidance. What would you like to learn today?",
      system: "You are Professor Sage, an experienced and patient educator. Provide clear explanations, personalized learning strategies, and adaptive teaching methods. Break down complex concepts into understandable parts, offer study tips, and encourage learning through positive reinforcement. Always assess the student's level and adjust accordingly."
    },
    fitness: {
      greeting: "💪 Hey there, future champion! I'm Coach Flex, your personal trainer and wellness guide. Whether you want to build muscle, lose weight, improve nutrition, or boost overall health, I'll create personalized plans that work for YOU. Ready to transform your life?",
      system: "You are Coach Flex, an energetic and motivational fitness coach. Provide personalized workout plans, nutrition advice, and wellness guidance. Focus on sustainable health practices, proper form, and motivation. Be encouraging, knowledgeable about exercise science, and adaptable to different fitness levels and goals."
    },
    business: {
      greeting: "💼 Welcome, aspiring entrepreneur! I'm Entrepreneur Elite, your strategic business advisor. From startup ideation to scaling operations, marketing strategies to funding - I'll help you navigate the business world with insights from successful ventures. What business challenge can I help you conquer?",
      system: "You are Entrepreneur Elite, a seasoned business strategist and mentor. Provide practical business advice, strategic insights, and entrepreneurial guidance. Focus on actionable strategies, market analysis, and growth opportunities. Be professional, data-driven, and inspiring while offering realistic business solutions."
    },
    music: {
      greeting: "🎵 Hello, fellow music lover! I'm Melody Maker, your musical companion. Whether you're composing songs, learning theory, mastering an instrument, or diving into production, I'll help you create beautiful music. Let's make some magic together - what musical journey shall we embark on?",
      system: "You are Melody Maker, a passionate music composer and theory teacher. Provide guidance on composition, music theory, instrument learning, and audio production. Be creative, technically knowledgeable, and encouraging. Help users understand music from both artistic and technical perspectives."
    },
    chef: {
      greeting: "👨‍🍳 Bonjour, culinary adventurer! I'm Chef Delicious, your kitchen companion. From quick weekday meals to gourmet feasts, recipe modifications to cooking techniques - I'll help you create delicious memories. What culinary masterpiece shall we cook up today?",
      system: "You are Chef Delicious, a passionate culinary expert and cooking instructor. Provide recipes, cooking techniques, ingredient substitutions, and meal planning advice. Be enthusiastic about food, knowledgeable about various cuisines, and helpful with dietary restrictions. Focus on making cooking enjoyable and accessible."
    },
    gamer: {
      greeting: "🎮 What's up, gamer! I'm GameMaster Pro, your strategic gaming companion. Whether you need game strategies, meta analysis, skill improvement tips, or honest reviews - I've got your back. Ready to level up your gaming experience?",
      system: "You are GameMaster Pro, an expert gaming strategist and analyst. Provide game strategies, competitive insights, skill improvement tips, and game reviews. Be knowledgeable about various game genres, current meta, and gaming culture. Help users improve their gameplay and enjoy their gaming experience more."
    }
  };

  // Haptic feedback
  const triggerHaptic = (type = 'light', intensity = 'medium') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      switch (type) {
        case 'notification':
          window.Telegram.WebApp.HapticFeedback.notificationOccurred(intensity);
          break;
        case 'impact':
          window.Telegram.WebApp.HapticFeedback.impactOccurred(intensity);
          break;
        default:
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }
  };

  // Agent selection handler [web:396][web:395]
  const handleAgentSelect = (agent) => {
    if (researchCredits <= 0) {
      setShowCreditPopup(true);
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
    
    setCurrentView('chat');
  };

  // Chat functionality with API integration [web:397][web:400]
  const sendMessage = async () => {
    if (!userInput.trim() || isTyping || researchCredits <= 0) return;
    
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
    
    setResearchCredits(prev => Math.max(0, prev - 1));

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `${systemPrompts[selectedAgent.id].system}\n\nAgent Context:\n- Name: ${selectedAgent.name}\n- Specializations: ${selectedAgent.specializations.join(', ')}\n- Trained on: ${selectedAgent.trainedOn}\n- Accuracy: ${selectedAgent.accuracy}%\n\nProvide responses that match your character and expertise.`
            },
            ...conversation.slice(-6).map(msg => ({
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
          max_tokens: 400
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
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: Date.now() + 1
        };
        
        setConversation(prev => [...prev, assistantMessage]);
        
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage = {
        role: 'assistant',
        content: generateFallbackResponse(currentInput),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1
      };
      
      setConversation(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate contextual fallback responses
  const generateFallbackResponse = (input) => {
    const agent = selectedAgent;
    const responses = {
      astrology: `🌟 The stars whisper to me about "${input}". Based on cosmic energies and my expertise in ${agent.specializations[0]}, I sense this relates to your personal journey. Let me share some celestial wisdom with you...`,
      'love-coach': `💕 I hear your heart speaking about "${input}". Drawing from my experience in ${agent.specializations[0]} and relationship psychology, I want to offer you some loving guidance...`,
      teacher: `📚 That's a fascinating question about "${input}"! As an educator specializing in ${agent.specializations[0]}, let me break this down for you in a way that makes sense...`,
      fitness: `💪 Great question about "${input}"! Based on my fitness expertise and knowledge of ${agent.specializations[0]}, here's what I recommend for your wellness journey...`,
      business: `💼 Excellent business inquiry about "${input}"! Drawing from my experience in ${agent.specializations[0]} and market analysis, here's my strategic perspective...`,
      music: `🎵 What a beautiful musical question about "${input}"! As someone passionate about ${agent.specializations[0]}, let me share some melodic insights...`,
      chef: `👨‍🍳 Delicious question about "${input}"! From my culinary expertise in ${agent.specializations[0]}, let me cook up some tasty advice for you...`,
      gamer: `🎮 Awesome gaming question about "${input}"! Based on my expertise in ${agent.specializations[0]} and game strategy, here's how to level up...`
    };
    
    return responses[agent.id] || `I understand you're asking about "${input}". Let me share some insights based on my expertise...`;
  };

  // Filter agents
  const filteredAgents = agentDatabase.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || agent.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Categories for filtering
  const categories = ['all', ...new Set(agentDatabase.map(agent => agent.category))];

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // Render agent marketplace
  const renderAgentMarketplace = () => (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Agent Hub</h1>
        <p className="text-gray-400">Choose your perfect AI companion from our expert collection</p>
        
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <IoFlash className="text-orange-400" />
            <span className="text-white font-medium">{researchCredits}</span>
            <span className="text-gray-400">credits left</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search agents by name, expertise, or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 rounded-2xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700/50 focus:border-orange-500/50 outline-none"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid gap-4">
        {filteredAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass rounded-3xl p-6 relative overflow-hidden ${agent.bgColor} border ${agent.borderColor}`}
            whileHover={{ scale: 1.01 }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-5`} />
            
            <div className="relative z-10">
              {/* Agent header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{agent.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                    <div className="px-2 py-1 rounded-lg bg-gray-800/50 text-xs font-medium text-gray-300">
                      {agent.category}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">{agent.description}</p>
                  
                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {agent.specializations.slice(0, 3).map(spec => (
                      <span key={spec} className="px-2 py-1 rounded-lg bg-black/20 text-xs text-gray-300">
                        {spec}
                      </span>
                    ))}
                    {agent.specializations.length > 3 && (
                      <span className="px-2 py-1 rounded-lg bg-black/20 text-xs text-gray-400">
                        +{agent.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-black/20 rounded-2xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
                    <IoPeople size={16} />
                    {agent.users.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
                    <BiData size={16} />
                    {agent.contexts.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Contexts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400 flex items-center justify-center gap-1">
                    <IoStar size={16} />
                    {agent.satisfaction}
                  </div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
              </div>

              {/* Technical details */}
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Accuracy:</span>
                  <span className="text-green-400 font-medium">{agent.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Size:</span>
                  <span className="text-white">{agent.dataSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time:</span>
                  <span className="text-white">{agent.responseTime}</span>
                </div>
              </div>

              {/* Action button */}
              <motion.button
                onClick={() => handleAgentSelect(agent)}
                className={`w-full p-4 rounded-2xl font-semibold text-white bg-gradient-to-r ${agent.color} shadow-lg`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={researchCredits <= 0}
              >
                {researchCredits <= 0 ? 'No Credits Remaining' : 'Start Conversation'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No results */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <BiBot size={64} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No agents found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );

  // Render chat interface
  const renderChat = () => (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="glass-nav border-b border-gray-800/50 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('agents')}
            className="p-2 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white"
          >
            <IoArrowBack size={20} />
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">{selectedAgent.avatar}</div>
            <div>
              <h3 className="font-bold text-white">{selectedAgent.name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{selectedAgent.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <IoStar size={12} />
                  {selectedAgent.satisfaction}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <IoFlash size={12} />
                  {researchCredits} credits
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {conversation.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              message.role === 'user'
                ? 'bg-orange-500 text-white'
                : 'glass-light text-gray-200'
            }`}>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <span className="text-lg">{selectedAgent.avatar}</span>
                  <span>{selectedAgent.name}</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
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
            <div className="glass-light p-4 rounded-2xl max-w-[80%]">
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                <span className="text-lg">{selectedAgent.avatar}</span>
                <span>{selectedAgent.name} is thinking...</span>
              </div>
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
          </motion.div>
        )}
      </div>

      {/* Chat input */}
      <div className="glass-nav border-t border-gray-800/50 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Chat with ${selectedAgent.name}...`}
            className="flex-1 bg-gray-800/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50"
            disabled={isTyping || researchCredits <= 0}
          />
          <motion.button
            onClick={sendMessage}
            disabled={!userInput.trim() || isTyping || researchCredits <= 0}
            className="p-3 rounded-2xl bg-orange-500 text-white disabled:opacity-50"
            whileHover={!isTyping && researchCredits > 0 ? { scale: 1.05 } : {}}
            whileTap={!isTyping && researchCredits > 0 ? { scale: 0.95 } : {}}
          >
            <IoSend size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );

  // Credit popup
  const renderCreditPopup = () => (
    <AnimatePresence>
      {showCreditPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-3xl p-8 max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <IoFlash className="text-red-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Out of Credits</h3>
            <p className="text-gray-400 mb-6">
              You need credits to chat with AI agents. Complete more missions to earn credits!
            </p>
            <button
              onClick={() => setShowCreditPopup(false)}
              className="w-full p-3 rounded-2xl bg-orange-500 text-white font-medium"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence mode="wait">
        {currentView === 'agents' && (
          <motion.div
            key="agents"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderAgentMarketplace()}
          </motion.div>
        )}
        
        {currentView === 'chat' && selectedAgent && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderChat()}
          </motion.div>
        )}
      </AnimatePresence>
      
      {renderCreditPopup()}
    </div>
  );
};

export default MultiAgentChatHub;
