'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SimpleChatBot() {
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with crypto trading strategies!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

    //bottom nav will be hidden when type
    useEffect(() => {
      const bottomNav = document.querySelector('.bottomnav');
      if (input.trim()) {
        bottomNav?.classList.add('hidden');
      } else {
        bottomNav?.classList.remove('hidden');
      }
    }, [input]);

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversation((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `You are CryptoBot, an expert cryptocurrency and blockchain AI assistant. Your expertise includes:

    🔹 TRADING & ANALYSIS:
    - Technical analysis (RSI, MACD, support/resistance, chart patterns)
    - Fundamental analysis (tokenomics, use cases, team evaluation)
    - Risk management strategies and position sizing
    - Market sentiment analysis and trend identification

    🔹 BLOCKCHAIN TECHNOLOGY:
    - Bitcoin, Ethereum, and major blockchain networks
    - Smart contracts, DeFi protocols, and dApps
    - Consensus mechanisms (PoW, PoS, DPoS)
    - Layer 2 solutions and scaling technologies

    🔹 INVESTMENT STRATEGIES:
    - Portfolio diversification in crypto
    - Dollar-cost averaging (DCA) strategies
    - HODLing vs active trading approaches
    - Yield farming and staking opportunities

    🔹 SECURITY & BEST PRACTICES:
    - Wallet security (hardware vs software wallets)
    - Private key management and seed phrase security
    - Identifying scams and rug pulls
    - Safe DeFi practices

    IMPORTANT GUIDELINES:
    - Always emphasize that crypto is high-risk and volatile
    - Never give specific financial advice, but provide educational information
    - Include relevant emojis to make responses engaging
    - Provide both beginner-friendly and advanced insights
    - Stay current with crypto trends and terminology
    - Encourage users to DYOR
    
    NOTE: write the response short as possible and use simple english so user will eassly understand and write only the text not markdown format.
    ` },
            ...conversation.slice(-5),
            userMessage,
          ],
        }),
      });

      let data;
      try {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          throw new Error("Invalid JSON response");
        }
      } catch (error) {
        console.error("Response parsing error:", error);
        throw new Error("Unexpected response format");
      }

      if (data.reply) {
        setConversation((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: data.reply, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
        ]);
      } else {
        throw new Error("No reply received");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm experiencing some technical difficulties. Please try again! 🔧",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] max-h-[75vh] flex flex-col">
      {/* Header */}
      <motion.div 
        className="p-2 border-b border-slate-700"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black">AI Chat Assistant</h1>
          <p className="text-sm text-slate-600">Ask me anything about Trading!</p>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {conversation.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Image src="/agent/agentlogo.png" alt="DNAU" width={45} height={45} className='size-7'/>
                      <span className="text-xs text-slate-700">DNAU Assistant • {msg.timestamp}</span>
                    </div>
                  )}
                  
                  <div className={`px-2.5 py-2 rounded-xl shadow-lg text-[14px] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-green-600/80 to-green-500 text-white' 
                      : 'text-black bg-white/60 border border-blue-500'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-slate-700">You • {msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Image src="/agent/agentlogo.png" alt="DNAU" width={45} height={45} className='size-7'/>
                </div>
                <div className="bg-white/60 rounded-xl p-4 border border-slate-700 ml-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <motion.div 
        className="border-t border-slate-700 p-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-white text-stone-800 placeholder-slate-400 rounded-xl px-4 py-3 pr-12 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}