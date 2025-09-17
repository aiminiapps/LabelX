'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Brain, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function DataCenterHome() {
  const [coins, setCoins] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function fetchCoins() {
      try {
        setLoading(true);
        const response = await fetch('/api/coins');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch coin data');
        }

        if (isMounted) {
          setCoins(data);
          setError(null);
          // Trigger AI analysis for each coin
          data.forEach(coin => {
            getAIAnalysis(coin);
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCoins();

    return () => {
      isMounted = false;
    };
  }, []);

  const getAIAnalysis = async (coin) => {
    const coinKey = coin.symbol.toUpperCase();
    
    setAnalysisLoading(prev => ({ ...prev, [coinKey]: true }));
    
    try {
      const systemPrompt = `You are a crypto trading analyst. Analyze ${coin.name} (${coin.symbol}) based on the following data:
      - Current Price: $${coin.priceUsd}
      - 24h Change: ${coin.changePercent24Hr}%
      - Market Cap Rank: ${coin.rank}
      
      Provide a brief analysis in this EXACT format:
      RECOMMENDATION: [BUY/HOLD/SELL]
      DESCRIPTION: [One sentence explaining why - max 15 words]
      
      Keep it concise and actionable.`;

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
              content: `Analyze ${coin.name} with current price $${coin.priceUsd} and 24h change of ${coin.changePercent24Hr}%` 
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
        // Parse the AI response
        const reply = data.reply;
        const recommendationMatch = reply.match(/RECOMMENDATION:\s*(BUY|HOLD|SELL)/i);
        const descriptionMatch = reply.match(/DESCRIPTION:\s*(.+)/i);
        
        const recommendation = recommendationMatch ? recommendationMatch[1].toUpperCase() : 'HOLD';
        const description = descriptionMatch ? descriptionMatch[1].trim() : 'Analysis pending...';
        
        setAiAnalysis(prev => ({
          ...prev,
          [coinKey]: {
            recommendation,
            description,
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
          description: 'Analysis unavailable',
          timestamp: Date.now()
        }
      }));
    } finally {
      setAnalysisLoading(prev => ({ ...prev, [coinKey]: false }));
    }
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
      'LINK': 'bg-yellow-500',
      'SOL': 'bg-[#000508]',
      'XRP': 'bg-yellow-500',
      'BNB': 'bg-yellow-500'
    };
    return gradients[symbol?.toUpperCase()] || 'bg-yellow-500';
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'SELL':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'SELL':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-blue-500 bg-blue-400/10 border-blue-400/30';
    }
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatPercentage = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className=" text-white">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {error && (
        <div className="text-center hidden py-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mx-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      )}
      
      {!loading && !error && coins.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-6 mx-4">
            <p className="text-gray-400">No data available.</p>
          </div>
        </div>
      )}

      <div className="space-y-2 max-w-md mx-auto mb-24">
        {coins.map((coin, index) => {
          const coinKey = coin.symbol.toUpperCase();
          const analysis = aiAnalysis[coinKey];
          const isAnalysisLoading = analysisLoading[coinKey];
          
          return (
            <motion.div
              key={coin.symbol}
              className="relative group "
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${
                coin.changePercent24Hr >= 0 
                  ? 'from-green-500/20 to-emerald-500/20' 
                  : 'from-red-500/20 to-pink-500/20'
              } rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative glass">
                <div className="relative">
                  {/* Main coin info row */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Left Side - Coin Info */}
                    <div className="flex items-center space-x-4">
                      {/* Coin Icon */}
                      <div className={`w-12 h-12 ${getCoinGradient(coin.symbol)} ring-1 ring-black rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        {coin.image ? (
                          <img src={coin.image} alt={coin.name} className=" rounded-full" />
                        ) : (
                          getCoinIcon(coin.symbol)
                        )}
                      </div>
                      
                      {/* Coin Details */}
                      <div>
                        <h2 className="text-lg font-semibold text-black group-hover:text-cyan-300 transition-colors duration-300">
                          {coin.symbol?.toUpperCase()}
                        </h2>
                        <p className="text-gray-700 text-sm">
                          {coin.name} / USDT
                        </p>
                      </div>
                    </div>

                    {/* Right Side - Price Info */}
                    <div className="text-right">
                      <div className="text-xl font-medium text-stone-800 mb-1">
                        {formatPrice(coin.priceUsd)}
                      </div>
                      <div className={`flex items-center justify-end space-x-1 ${
                        coin.changePercent24Hr >= 0 ? 'text-green-700' : 'text-red-500'
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

                  {/* AI Analysis Section */}
                  <div className="border-t border-gray-200/20 pt-3">
                    <div className="flex items-center space-x-2 mb-2">
                    <div className="rounded-full size-8">
                      <Image src="/agent/agentlogo.png" alt="SPAI" width={45} height={45} />
                    </div>
                      <span className="text-lg font-medium text-gray-800">AI Analysis</span>
                    </div>
                    
                    {isAnalysisLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border border-blue-400 border-t-transparent"></div>
                        <span className="text-xs text-gray-500">Analyzing...</span>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-2">
                        {/* Recommendation Badge */}
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(analysis.recommendation)}`}>
                          {getRecommendationIcon(analysis.recommendation)}
                          <span>{analysis.recommendation}</span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {analysis.description}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Analysis pending...
                      </div>
                    )}
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