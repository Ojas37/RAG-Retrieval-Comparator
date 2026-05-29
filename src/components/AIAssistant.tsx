import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Brain, 
  ChevronRight
} from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  insights?: {
    type: 'speed' | 'accuracy' | 'cost' | 'warning';
    title: string;
    description: string;
  }[];
}

const DEFAULT_CONVERSATION: Message[] = [
  {
    sender: 'ai',
    text: "Welcome, AI Researcher. I've finished auditing your active benchmark run (`run-104-hnsw`). Would you like me to highlight retrieval scaling constraints or analyze hybrid RRF trade-offs?",
    timestamp: '11:22 AM',
  },
  {
    sender: 'user',
    text: 'Analyze the accuracy vs latency trade-offs between Dense and Sparse retrieval.',
    timestamp: '11:23 AM',
  },
  {
    sender: 'ai',
    text: "Based on `run-104-hnsw`, here is a comparative breakdown of Dense and Sparse performance:\n\n1. **Accuracy**: Dense dominates, achieving `MRR@10: 0.898` and `Recall@10: 0.942`. Sparse lags by 8% (`Recall@10: 0.864`). This is due to sparse's inability to retrieve semantically matching passages lacking direct keyword overlaps.\n\n2. **Latency**: Sparse is 76% faster (`avgLatencyMs: 8.2ms` vs `14.5ms` for Dense) and processes 83% more throughput (`340 QPS` vs `185 QPS`). HNSW index lookups on the dense vector table add recursive traversal computation which impacts overall latency.\n\n3. **Hybrid (RRF)** combines the strength of both: it achieves an exceptional `MRR@10: 0.948` and `Recall@10: 0.976`, though at a cost of `avgLatencyMs: 28.4ms` due to executing both heads and merging lists via RRF formula.",
    timestamp: '11:23 AM',
    insights: [
      {
        type: 'accuracy',
        title: 'Hybrid Recall Peak',
        description: 'Combining dense and sparse yields an MRR increase of +6.4% over Dense alone.'
      },
      {
        type: 'speed',
        title: 'Sparse Speed Superiority',
        description: 'Lexical sparse indexes compiled in PostgreSQL average just 8.2ms under heavy load.'
      }
    ]
  }
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_CONVERSATION);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate smart researcher response
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Interesting query. Let me scan the pgvector index parameters.";
      let insights: any = undefined;

      const lowerVal = userMessage.text.toLowerCase();
      if (lowerVal.includes('hnsw') || lowerVal.includes('index')) {
        replyText = "HNSW construction requires tuned `m` and `ef_construction` parameters. In `run-104-hnsw` with `m=16` and `ef_construction=64`, pgvector compiles a well-balanced navigation graph on 12.5k vectors in 3.2 minutes. If we increase `m` to 32, we expect a +1.2% MRR boost, but build times will scale O(N log N) with higher link weights, and graph size on disk will expand from 142MB to ~190MB.";
        insights = [{
          type: 'warning',
          title: 'Memory Overhead Risk',
          description: 'HNSW dimensions scale aggressively. A memory pool exceeding 256MB is advised for index scaling.'
        }];
      } else if (lowerVal.includes('cost') || lowerVal.includes('embedding') || lowerVal.includes('price')) {
        replyText = "Your active run generated 24,105 chunks. Using the local model `BAAI/bge-small-en-v1.5`, all embedding operations are executed completely locally inside your sandbox CPU. This results in a total embedding API cost of **$0.00 USD (100% Free & Open-Source)**!";
        insights = [{
          type: 'cost',
          title: 'Zero API Charges',
          description: 'Local BAAI/bge-small-en-v1.5 execution delivers high recall with zero operating bills.'
        }];
      } else if (lowerVal.includes('optimize') || lowerVal.includes('improve')) {
        replyText = "To optimize your hybrid setup, I recommend three steps:\n\n1. **Trim Chunk Overlaps**: Shrinking chunk overlap from 20% to 10% reduces index dimensions by 15% and eliminates semantic duplicates.\n\n2. **RRF Param Tuning**: Setting k=60 inside Reciprocal Rank Fusion balances dense similarity weights and lexical sparse occurrences perfectly. \n\n3. **PostgreSQL Cache Warmup**: Execute `SELECT * FROM idx_rag_vectors_hnsw` on startup to preload the HNSW index graphs into memory buffers for low-latency warm queries.";
      } else {
        replyText = `Based on current RAG comparisons, hybrid systems outshine single-retrieval strategies across all vector distributions. Dense retrieval is recommended for semantic searches, whereas sparse BM25 handles precise word lookups like version numbers or product keys. Ask me to explain RRF SQL functions or pgvector maintenance metrics to delve deeper!`;
      }

      const aiMessage: Message = {
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        insights,
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[450px] max-w-full glass-panel border-y-0 border-r-0 flex flex-col justify-between transition-all duration-500 ease-in-out z-40 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">AI Retrieval Analyst</h3>
            <span className="text-[10px] text-purple-400 font-mono tracking-wide uppercase">
              RAG Performance Auditing
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Message Timeline */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            {/* Bubble */}
            <div
              className={`rounded-xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none'
                  : 'bg-white/[0.03] border border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text.split('\n\n').map((para, i) => (
                <p key={i} className="mb-2 last:mb-0">
                  {para.split('\n').map((line, j) => {
                    // Check if it starts with bullet point
                    if (line.startsWith('*')) {
                      return (
                        <span key={j} className="block pl-4 relative my-1">
                          <span className="absolute left-1 text-cyan-400">•</span>
                          {line.replace(/^\*\s*/, '')}
                        </span>
                      );
                    }
                    return <span key={j} className="block">{line}</span>;
                  })}
                </p>
              ))}
            </div>

            {/* Insights */}
            {msg.insights && (
              <div className="mt-3 w-full space-y-2">
                {msg.insights.map((insight, insIdx) => {
                  const colors = {
                    speed: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
                    accuracy: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
                    cost: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
                    warning: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
                  }[insight.type];

                  return (
                    <div
                      key={insIdx}
                      className={`p-3 rounded-lg border text-xs leading-normal flex flex-col gap-0.5 ${colors}`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5" />
                        {insight.title}
                      </span>
                      <span className="text-slate-400">{insight.description}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Timestamp */}
            <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 max-w-[200px]">
            <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-mono">AI is auditing runs...</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#08080a] flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI analyst about performance indices..."
          className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-[#0c0c10] border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
