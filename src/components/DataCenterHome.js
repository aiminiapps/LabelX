'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoRefreshCircle, IoArrowUndo, IoArrowRedo } from 'react-icons/io5';
import { BiText, BiImage, BiMicrophone, BiBrain } from 'react-icons/bi';
import { TbSparkles, TbTarget } from 'react-icons/tb';

const SmartDataPresentation = () => {
  // Core state management
  const [currentItem, setCurrentItem] = useState(null);
  const [labelHistory, setLabelHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    accuracy: 0,
    streak: 0,
    points: 0
  });

  // Undo/Redo state
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Animation controls
  const cardControls = useAnimation();
  const progressControls = useAnimation();

  // Sample data items for demonstration
  const sampleDataItems = [
    {
      id: 1,
      type: 'text',
      content: 'The new AI model shows promising results in natural language processing tasks.',
      options: ['Positive', 'Negative', 'Neutral'],
      category: 'Sentiment Analysis',
      difficulty: 'Easy'
    },
    {
      id: 2,
      type: 'image',
      content: '/api/placeholder/300/200',
      options: ['Cat', 'Dog', 'Bird', 'Other'],
      category: 'Image Classification',
      difficulty: 'Medium'
    },
    {
      id: 3,
      type: 'text',
      content: 'Machine learning algorithms require large datasets for optimal performance.',
      options: ['Fact', 'Opinion', 'Question'],
      category: 'Content Classification',
      difficulty: 'Easy'
    },
    {
      id: 4,
      type: 'audio',
      content: 'Audio transcription task',
      options: ['Clear Speech', 'Background Noise', 'Music', 'Silence'],
      category: 'Audio Classification',
      difficulty: 'Hard'
    }
  ];

  // Initialize component
  useEffect(() => {
    setCurrentItem(sampleDataItems[0]);
    loadSessionStats();
  }, []);

  // Load session stats from localStorage
  const loadSessionStats = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('labelx-session-stats');
      if (saved) {
        setSessionStats(JSON.parse(saved));
      }
    }
  };

  // Save session stats to localStorage
  const saveSessionStats = (stats) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('labelx-session-stats', JSON.stringify(stats));
    }
  };

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

  // Handle label selection
  const handleLabelSelect = async (selectedLabel) => {
    triggerHaptic('medium');

    // Animate card selection
    await cardControls.start({
      scale: 0.98,
      transition: { duration: 0.1 }
    });

    // Create label entry
    const labelEntry = {
      itemId: currentItem.id,
      label: selectedLabel,
      timestamp: Date.now(),
      correct: Math.random() > 0.2 // Simulate 80% accuracy
    };

    // Update history
    const newHistory = [...labelHistory.slice(0, historyIndex + 1), labelEntry];
    setLabelHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanUndo(true);
    setCanRedo(false);

    // Update session stats
    const newStats = {
      ...sessionStats,
      completed: sessionStats.completed + 1,
      streak: labelEntry.correct ? sessionStats.streak + 1 : 0,
      accuracy: calculateAccuracy(newHistory),
      points: sessionStats.points + (labelEntry.correct ? 10 + sessionStats.streak : 5)
    };
    setSessionStats(newStats);
    saveSessionStats(newStats);

    // Animate success/feedback
    if (labelEntry.correct) {
      triggerHaptic('success');
      await progressControls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      });
    }

    // Load next item with smooth transition
    setTimeout(() => {
      loadNextItem();
    }, 500);
  };

  // Calculate session accuracy
  const calculateAccuracy = (history) => {
    if (history.length === 0) return 0;
    const correct = history.filter(entry => entry.correct).length;
    return Math.round((correct / history.length) * 100);
  };

  // Load next data item
  const loadNextItem = async () => {
    await cardControls.start({
      x: -300,
      opacity: 0,
      transition: { duration: 0.3 }
    });

    const nextIndex = (currentIndex + 1) % sampleDataItems.length;
    setCurrentIndex(nextIndex);
    setCurrentItem(sampleDataItems[nextIndex]);

    cardControls.start({
      x: [300, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      transition: { duration: 0.4, type: "spring" }
    });
  };

  // Undo last action
  const handleUndo = () => {
    if (canUndo && historyIndex >= 0) {
      triggerHaptic('light');
      setHistoryIndex(historyIndex - 1);
      setCanUndo(historyIndex > 0);
      setCanRedo(true);
      
      // Update stats
      const undoneEntry = labelHistory[historyIndex];
      const newStats = {
        ...sessionStats,
        completed: Math.max(0, sessionStats.completed - 1),
        points: Math.max(0, sessionStats.points - (undoneEntry.correct ? 10 : 5))
      };
      setSessionStats(newStats);
      saveSessionStats(newStats);
    }
  };

  // Redo last undone action
  const handleRedo = () => {
    if (canRedo && historyIndex < labelHistory.length - 1) {
      triggerHaptic('light');
      setHistoryIndex(historyIndex + 1);
      setCanRedo(historyIndex < labelHistory.length - 2);
      setCanUndo(true);

      // Update stats
      const redoneEntry = labelHistory[historyIndex + 1];
      const newStats = {
        ...sessionStats,
        completed: sessionStats.completed + 1,
        points: sessionStats.points + (redoneEntry.correct ? 10 : 5)
      };
      setSessionStats(newStats);
      saveSessionStats(newStats);
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return <BiText className="text-blue-400" size={18} />;
      case 'image': return <BiImage className="text-green-400" size={18} />;
      case 'audio': return <BiMicrophone className="text-purple-400" size={18} />;
      default: return <BiBrain className="text-yellow-400" size={18} />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (!currentItem) return null;

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      {/* Session Progress Header */}
      <div className="glass-light rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TbTarget className="text-yellow-400" size={20} />
            <span className="text-white font-medium">Session Progress</span>
          </div>
          <motion.div
            animate={progressControls}
            className="glass-warm px-3 py-1 rounded-full text-sm font-semibold"
          >
            {sessionStats.points} pts
          </motion.div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <motion.div
              key={sessionStats.completed}
              initial={{ scale: 1.2, color: "#3B82F6" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-xl font-bold"
            >
              {sessionStats.completed}
            </motion.div>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          
          <div className="text-center">
            <motion.div
              key={sessionStats.accuracy}
              initial={{ scale: 1.2, color: "#22C55E" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-xl font-bold"
            >
              {sessionStats.accuracy}%
            </motion.div>
            <p className="text-xs text-gray-400">Accuracy</p>
          </div>
          
          <div className="text-center">
            <motion.div
              key={sessionStats.streak}
              initial={{ scale: 1.2, color: "#F59E0B" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-xl font-bold flex items-center justify-center gap-1"
            >
              {sessionStats.streak}
              {sessionStats.streak > 0 && <TbSparkles size={16} className="text-yellow-400" />}
            </motion.div>
            <p className="text-xs text-gray-400">Streak</p>
          </div>
        </div>
      </div>

      {/* Main Data Presentation Card */}
      <motion.div
        animate={cardControls}
        className="glass rounded-3xl p-6 relative overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full" />
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full" />
        </div>

        {/* Content Header */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getTypeIcon(currentItem.type)}
              <span className="text-sm text-gray-300">{currentItem.category}</span>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(currentItem.difficulty)}`}>
              {currentItem.difficulty}
            </div>
          </div>
          
          <div className="w-full bg-gray-700/50 rounded-full h-1 mb-4">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / sampleDataItems.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Data Content Display */}
        <div className="relative z-10 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentItem.type === 'image' ? (
                <div className="glass-light rounded-2xl p-4 mb-6">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                    <BiImage size={48} className="text-gray-500" />
                  </div>
                </div>
              ) : (
                <div className="glass-light rounded-2xl p-6 mb-6">
                  <p className="text-white text-lg leading-relaxed font-medium">
                    {currentItem.content}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Label Options */}
        <div className="relative z-10 space-y-3">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <BiBrain size={18} className="text-blue-400" />
            Select the best label:
          </h3>
          
          <AnimatePresence>
            {currentItem.options.map((option, index) => (
              <motion.button
                key={`${currentItem.id}-${option}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleLabelSelect(option)}
                className="w-full glass-button text-left p-4 rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:scale-125 transition-transform" />
                  <span className="text-white font-medium">{option}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Undo/Redo Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`glass-button p-3 rounded-full ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          whileTap={canUndo ? { scale: 0.9 } : {}}
          transition={{ duration: 0.2 }}
        >
          <IoArrowUndo size={20} className={canUndo ? 'text-blue-400' : 'text-gray-500'} />
        </motion.button>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{labelHistory.length} actions</span>
        </div>

        <motion.button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`glass-button p-3 rounded-full ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          whileTap={canRedo ? { scale: 0.9 } : {}}
          transition={{ duration: 0.2 }}
        >
          <IoArrowRedo size={20} className={canRedo ? 'text-green-400' : 'text-gray-500'} />
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <motion.button
          onClick={() => triggerHaptic('light')}
          className="flex-1 glass-light p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <IoRefreshCircle size={18} className="text-gray-400" />
          <span className="text-sm text-gray-300">Skip Item</span>
        </motion.button>
        
        <motion.button
          className="flex-1 glass-warm p-3 rounded-xl flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <TbSparkles size={18} className="text-yellow-400" />
          <span className="text-sm text-white font-medium">Boost Mode</span>
        </motion.button>
      </div>
    </div>
  );
};

export default SmartDataPresentation;
