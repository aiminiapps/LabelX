'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, Brain, Target, TrendingUpIcon, AlertTriangle, DollarSign, Calendar, BarChart3, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';


export default function CoinAgent() {
  const [coins, setCoins] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState({});
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    async function fetchCoins() {
      try {
        setLoading(true);
        const response = await fetch('/api/coins');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch coin data');
        }

        setCoins(data);
        setError(null);
        
        // Trigger AI analysis for each coin
        data.forEach(coin => {
          getComprehensiveAIAnalysis(coin);
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCoins();
  }, []);

  const getComprehensiveAIAnalysis = async (coin) => {
    const coinKey = coin.symbol.toUpperCase();
    
    setAnalysisLoading(prev => ({ ...prev, [coinKey]: true }));
    
    try {
      const systemPrompt = `You are an expert crypto investment analyst with deep market knowledge. Analyze ${coin.name} (${coin.symbol}) comprehensively:

      Current Data:
      - Price: $${coin.priceUsd}
      - 24h Change: ${coin.changePercent24Hr}%
      - 24h Volume: $${coin.volumeUsd24Hr}
      - Market Cap Rank: ${coin.rank}

      Provide analysis in this EXACT format:
      RECOMMENDATION: [BUY/HOLD/SELL]
      CONFIDENCE: [HIGH/MEDIUM/LOW]
      INVESTMENT_ADVICE: [Should you invest? One creative sentence]
      RETURN_POTENTIAL: [Expected return percentage in next 30 days]
      RISK_LEVEL: [LOW/MEDIUM/HIGH]
      DETAILED_ANALYSIS: [2-3 sentences explaining technical and fundamental factors]
      PROS: [2 key advantages]
      CONS: [2 key risks]
      TIMEFRAME: [SHORT/MEDIUM/LONG] term investment
      
      Be creative, insightful, and provide actionable advice. Keep responses concise but informative.`;

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `Provide comprehensive investment analysis for ${coin.name} with current price $${coin.priceUsd} and 24h change ${coin.changePercent24Hr}%` 
            },
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
        const reply = data.reply;
        
        // Parse all fields from AI response
        const recommendation = reply.match(/RECOMMENDATION:\s*(BUY|HOLD|SELL)/i)?.[1]?.toUpperCase() || 'HOLD';
        const confidence = reply.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i)?.[1]?.toUpperCase() || 'MEDIUM';
        const investmentAdvice = reply.match(/INVESTMENT_ADVICE:\s*(.+)/i)?.[1]?.trim() || 'Proceed with caution and do your research.';
        const returnPotential = reply.match(/RETURN_POTENTIAL:\s*(.+)/i)?.[1]?.trim() || '+5-10%';
        const riskLevel = reply.match(/RISK_LEVEL:\s*(LOW|MEDIUM|HIGH)/i)?.[1]?.toUpperCase() || 'MEDIUM';
        const detailedAnalysis = reply.match(/DETAILED_ANALYSIS:\s*(.+?)(?=PROS:|$)/is)?.[1]?.trim() || 'Market conditions are mixed with moderate volatility expected.';
        const pros = reply.match(/PROS:\s*(.+?)(?=CONS:|$)/is)?.[1]?.trim() || 'Established market presence, Growing adoption';
        const cons = reply.match(/CONS:\s*(.+?)(?=TIMEFRAME:|$)/is)?.[1]?.trim() || 'Market volatility, Regulatory uncertainty';
        const timeframe = reply.match(/TIMEFRAME:\s*(SHORT|MEDIUM|LONG)/i)?.[1]?.toUpperCase() || 'MEDIUM';
        
        setAiAnalysis(prev => ({
          ...prev,
          [coinKey]: {
            recommendation,
            confidence,
            investmentAdvice,
            returnPotential,
            riskLevel,
            detailedAnalysis,
            pros: pros.split(',').map(p => p.trim()).slice(0, 2),
            cons: cons.split(',').map(c => c.trim()).slice(0, 2),
            timeframe,
            timestamp: Date.now()
          }
        }));
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
      setAiAnalysis(prev => ({
        ...prev,
        [coinKey]: {
          recommendation: 'HOLD',
          confidence: 'LOW',
          investmentAdvice: 'Analysis temporarily unavailable - research independently.',
          returnPotential: 'Unknown',
          riskLevel: 'HIGH',
          detailedAnalysis: 'Unable to provide analysis at this time.',
          pros: ['Market presence'],
          cons: ['Analysis unavailable'],
          timeframe: 'MEDIUM',
          timestamp: Date.now()
        }
      }));
    } finally {
      setAnalysisLoading(prev => ({ ...prev, [coinKey]: false }));
    }
  };

  const toggleCardExpansion = (coinKey) => {
    setExpandedCards(prev => ({
      ...prev,
      [coinKey]: !prev[coinKey]
    }));
  };

  const getCoinIcon = (symbol) => {
    const icons = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'ADA': '₳',
      'DOT': '●',
      'LINK': '⬡',
      'LTC': 'Ł',
      'XRP': '◆',
      'BNB': '◊'
    };
    return icons[symbol?.toUpperCase()] || '◉';
  };

  const getCoinGradient = (symbol) => {
    const gradients = {
      'BTC': 'bg-yellow-500',
      'ETH': 'bg-white',
      'ADA': 'bg-yellow-500',
      'DOT': 'bg-yellow-500',
      'SOL': 'bg-[#000508]',
      'LTC': 'bg-yellow-500',
      'XRP': 'bg-yellow-500',
      'BNB': 'bg-yellow-500'
    };
    return gradients[symbol?.toUpperCase()] || 'bg-yellow-500';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
        return 'text-green-400 bg-green-400/20 border-green-400/40';
      case 'SELL':
        return 'text-red-400 bg-red-400/20 border-red-400/40';
      default:
        return 'text-blue-500 bg-blue-400/20 border-blue-400/40';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH':
        return 'text-green-600';
      case 'LOW':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-600 bg-green-400/20';
      case 'HIGH':
        return 'text-red-500 bg-red-500/30';
      default:
        return 'text-blue-500 bg-blue-400/40';
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  };

  const formatPercentage = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-3'>
        <h1 className='text-2xl font-semibold text-black'>DNAU Trading Suggestion</h1>
        <div className='border border-black/60 p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer'>
          <Plus className='text-black'/>
        </div>
      </div>
      <p className='text-center mb-6 text-gray-700'>AI-powered investment insights with comprehensive market analysis</p>
      
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      )}
      
      {error && (
        <div className="text-center hidden py-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mx-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4 max-w-md mx-auto mb-24">
        {coins.map((coin, index) => {
          const coinKey = coin.symbol.toUpperCase();
          const analysis = aiAnalysis[coinKey];
          const isAnalysisLoading = analysisLoading[coinKey];
          const isExpanded = expandedCards[coinKey];
          
          return (
            <motion.div
              key={coin.symbol}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Enhanced Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${
                analysis?.recommendation === 'BUY' 
                  ? 'from-green-500/30 to-emerald-500/30' 
                  : analysis?.recommendation === 'SELL'
                  ? 'from-red-500/30 to-pink-500/30'
                  : 'from-blue-500/20 to-purple-500/20'
              } rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative glass transition-all duration-300 group-hover:transform group-hover:scale-[1.02] cursor-pointer">
                {/* Main Content */}
                <div className="relative" onClick={() => toggleCardExpansion(coinKey)}>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${getCoinGradient(coin.symbol)} ring-1 ring-black rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        {coin.image ? (
                          <img src={coin.image} alt={coin.name} className="rounded-full" />
                        ) : (
                          getCoinIcon(coin.symbol)
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-lg font-semibold text-stone-900 transition-colors duration-300">
                          {coin.symbol?.toUpperCase()}
                        </h2>
                        <p className="text-gray-700 text-sm">
                          {coin.name} / USDT
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-semibold text-stone-800 mb-1">
                        ${formatPrice(coin.priceUsd)}
                      </div>
                      <div className={`flex items-center justify-end space-x-1 ${
                        coin.changePercent24Hr >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {coin.changePercent24Hr >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {formatPercentage(coin.changePercent24Hr)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Quick Summary */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                      <Image src="/agent/agentlogo.png" alt="DNAU" width={45} height={45} className='size-8'/>
                        <span className="text-sm font-medium text-gray-800">AI Analysis</span>
                      </div>
                      {isExpanded ? <span className='flex items-center gap-1 text-stone-800 text-xs'><ChevronUp className="w-4 h-4 text-gray-600" /> Show Less</span> : <span className='flex items-center gap-1 text-stone-800 text-xs'><ChevronDown className="w-4 h-4 text-gray-600" /> Show More</span>}
                    </div>
                    
                    {isAnalysisLoading ? (
                      <div className="flex items-center space-x-2 py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border border-green-600 border-t-transparent"></div>
                        <span className="text-sm text-gray-800">Analyzing market conditions...</span>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-3">
                        {/* Recommendation and Confidence */}
                        <div className="flex items-center justify-between">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getRecommendationColor(analysis.recommendation)}`}>
                            <Target className="w-3 h-3" />
                            <span>{analysis.recommendation}</span>
                          </div>
                          <div className={`text-xs font-medium ${getConfidenceColor(analysis.confidence)}`}>
                            {analysis.confidence} Confidence
                          </div>
                        </div>

                        {/* Investment Advice */}
                        <div className="glass-dark bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 italic">{analysis.investmentAdvice}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 py-2">
                        Analysis pending...
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && analysis && !isAnalysisLoading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200/40 mt-4 pt-4 space-y-4"
                      >
                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <DollarSign className="w-4 h-4 text-green-700 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">Expected Return</div>
                            <div className="text-sm font-medium text-gray-800">{analysis.returnPotential}</div>
                          </div>
                          <div className="text-center">
                            <AlertTriangle className="w-4 h-4 text-red-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">Risk Level</div>
                            <div className={`text-sm font-medium px-2 py-1 rounded ${getRiskColor(analysis.riskLevel)}`}>
                              {analysis.riskLevel}
                            </div>
                          </div>
                          <div className="text-center">
                            <Calendar className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">Timeframe</div>
                            <div className="text-sm font-medium text-gray-800">{analysis.timeframe}</div>
                          </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="rounded-lg p-3 glass-purple">
                          <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                            Market Analysis
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysis.detailedAnalysis}</p>
                        </div>

                        {/* Pros and Cons */}
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-green-50/50 rounded-lg p-3 glass-dark">
                            <h4 className="text-sm font-medium text-green-800 mb-2">✅ Advantages</h4>
                            <ul className="space-y-1">
                              {analysis.pros.map((pro, idx) => (
                                <li key={idx} className="text-xs text-green-700">• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-red-50/50 rounded-lg p-3 glass-purple">
                            <h4 className="text-sm font-medium text-red-800 mb-2">⚠️ Risks</h4>
                            <ul className="space-y-1">
                              {analysis.cons.map((con, idx) => (
                                <li key={idx} className="text-xs text-red-700">• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Volume Info */}
                  <div className="border-t border-gray-200/30 pt-3 mt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">24h Volume:</span>
                      <span className="text-gray-800 font-medium">${coin.volumeUsd24Hr?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}