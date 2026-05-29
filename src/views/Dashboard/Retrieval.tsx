import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal,
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Clock, 
  BookOpen
} from 'lucide-react';
import { VectorVisualizer } from '../../components/VectorVisualizer';
import { MOCK_QUERIES, type QueryComparison } from '../../utils/mockData';
import { apiClient } from '../../utils/apiClient';

export const Retrieval: React.FC = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQueryText, setSelectedQueryText] = useState<string>('');
  const [comparison, setComparison] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dense' | 'sparse' | 'hybrid'>('hybrid');
  const [expandedChunks, setExpandedChunks] = useState<Record<string, boolean>>({});
  const [pcaPoints, setPcaPoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sparseFallbackApplied, setSparseFallbackApplied] = useState(false);
  const [sparseFallbackCount, setSparseFallbackCount] = useState(0);

  const handleRunSearch = async (queryText: string) => {
    if (!queryText) return;
    setIsLoading(true);
    try {
      const results = await apiClient.retrieve(queryText);
      setComparison(results);
      setSparseFallbackApplied(results.sparse_fallback_applied || false);
      setSparseFallbackCount(results.sparse_fallback_count || 0);
      
      const points = await apiClient.projectCoordinates({
        query: queryText,
        strategy: activeTab,
        dense: results.dense,
        sparse: results.sparse,
        hybrid: results.hybrid
      });
      setPcaPoints(points);
    } catch (err: any) {
      console.error("Retrieval failed, falling back:", err);
      const matchedMock = MOCK_QUERIES.find(q => q.query === queryText) || MOCK_QUERIES[0];
      setComparison({
        query: queryText,
        dense: matchedMock.dense,
        sparse: matchedMock.sparse,
        hybrid: matchedMock.hybrid
      });
      setSparseFallbackApplied(false);
      setSparseFallbackCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadQueries = async () => {
      try {
        const list = await apiClient.getGoldenQueries();
        if (list && list.length > 0) {
          setQueries(list);
          setSelectedQueryText(list[0].query_text);
          handleRunSearch(list[0].query_text);
        } else {
          const fallbackList = MOCK_QUERIES.map((q, idx) => ({ query_id: `mock-${idx}`, query_text: q.query }));
          setQueries(fallbackList);
          setSelectedQueryText(fallbackList[0].query_text);
          handleRunSearch(fallbackList[0].query_text);
        }
      } catch (err) {
        console.error("Failed to load golden queries:", err);
        const fallbackList = MOCK_QUERIES.map((q, idx) => ({ query_id: `mock-${idx}`, query_text: q.query }));
        setQueries(fallbackList);
        setSelectedQueryText(fallbackList[0].query_text);
        handleRunSearch(fallbackList[0].query_text);
      }
    };
    loadQueries();
  }, []);

  // Update PCA projections when changing strategies
  useEffect(() => {
    if (!comparison) return;
    const fetchPCA = async () => {
      try {
        const points = await apiClient.projectCoordinates({
          query: comparison.query,
          strategy: activeTab,
          dense: comparison.dense,
          sparse: comparison.sparse,
          hybrid: comparison.hybrid
        });
        setPcaPoints(points);
      } catch (err) {
        console.error("PCA projection failed:", err);
      }
    };
    fetchPCA();
  }, [activeTab, comparison]);

  const toggleExpandChunk = (chunkId: string) => {
    setExpandedChunks(prev => ({
      ...prev,
      [chunkId]: !prev[chunkId]
    }));
  };

  const highlightContentText = (text: string, matchedTerms: string[]) => {
    if (!matchedTerms || matchedTerms.length === 0) return text;
    
    // Build regex to match terms
    const escapedTerms = matchedTerms.map(term => term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');
    
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = matchedTerms.some(term => term.toLowerCase() === part.toLowerCase());
          return isMatch ? (
            <mark key={i} className="bg-yellow-400/20 text-yellow-200 border-b border-yellow-400 px-0.5 rounded font-medium">
              {part}
            </mark>
          ) : part;
        })}
      </>
    );
  };

  const activeChunks = comparison ? comparison[activeTab] : [];

  return (
    <div className="space-y-8 animate-fade-in pr-2">
      {/* Search Header Selector */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/35">
            <Search className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-bold text-xs text-white uppercase font-mono">Query Retrieval Comparator</h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Pick a benchmark golden evaluation query below to evaluate Dense Vector, Sparse Lexical, and Hybrid RRF outcomes.
            </p>
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedQueryText}
            onChange={(e) => {
              setSelectedQueryText(e.target.value);
              handleRunSearch(e.target.value);
            }}
            className="w-full bg-[#050508] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-3.5 text-xs text-slate-200 focus:outline-none cursor-pointer appearance-none shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] font-sans"
          >
            {queries.map((q, idx) => (
              <option key={idx} value={q.query_text}>
                {q.query_text}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main visual panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Vector Space Projections */}
        <div className="lg:col-span-2 space-y-6">
          <VectorVisualizer activeStrategy={activeTab} points={pcaPoints} />

          <div className="glass-panel p-6 rounded-xl space-y-4 text-left">
            <h4 className="font-bold text-xs text-white flex items-center gap-1.5 font-mono">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              RETRIEVAL PROFILE
            </h4>
            <div className="space-y-3 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Dense Embeddings:</span>
                <span className="text-cyan-400 font-bold">384 Dimensions (BGE)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Sparse tokens GIN:</span>
                <span className="text-purple-400 font-bold">English tsvector</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>RRF k-constant:</span>
                <span className="text-blue-400 font-bold">k = 60</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Distance Ops:</span>
                <span className="text-white">Cosine Vector Distance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed strategy retrieval chunks details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Strategy Tabs Navigation */}
          <div className="flex rounded-xl bg-white/[0.02] border border-white/10 p-1">
            <button
              onClick={() => setActiveTab('dense')}
              className={`flex-1 py-3.5 rounded-lg font-bold text-xs transition-all uppercase tracking-wider font-mono ${
                activeTab === 'dense'
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dense Retrieval
            </button>
            <button
              onClick={() => setActiveTab('sparse')}
              className={`flex-1 py-3.5 rounded-lg font-bold text-xs transition-all uppercase tracking-wider font-mono ${
                activeTab === 'sparse'
                  ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sparse (BM25)
            </button>
            <button
              onClick={() => setActiveTab('hybrid')}
              className={`flex-1 py-3.5 rounded-lg font-bold text-xs transition-all uppercase tracking-wider font-mono ${
                activeTab === 'hybrid'
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid (RRF)
            </button>
          </div>

          {/* Retrieved document chunks stack */}
          <div className="space-y-4 text-left">
            {activeTab === 'sparse' && sparseFallbackApplied && (
              <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[10px] text-amber-400 font-mono leading-normal flex items-start gap-2 animate-fade-in">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[8px] font-bold shrink-0">FALLBACK BADGE</span>
                <span>Sparse search yielded empty keyword matches. Loaded {sparseFallbackCount} semantic fallback hits.</span>
              </div>
            )}

            {activeChunks.map((chunk, index) => {
              const isExpanded = expandedChunks[chunk.id] || false;
              
              // Color settings based on strategy
              const colors = {
                dense: { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
                sparse: { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
                hybrid: { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
              }[activeTab];

              return (
                <div
                  key={chunk.id}
                  className={`glass-panel border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20`}
                >
                  {/* Card top stats summary */}
                  <div
                    onClick={() => toggleExpandChunk(chunk.id)}
                    className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center border ${colors.border} ${colors.bg} ${colors.text}`}>
                        #{index + 1}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {chunk.sourceDoc}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Document chunk block #{chunk.chunkIndex}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-[10px]">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-slate-400">Score:</span>
                        <span className="text-white font-bold">{chunk.score}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-slate-400">Time:</span>
                        <span className="text-white font-bold">{chunk.latencyMs}ms</span>
                      </div>
                      <div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content Container */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 bg-black/40 text-slate-300 text-xs leading-relaxed">
                      <p className="mb-3 whitespace-pre-wrap font-sans font-light">
                        {highlightContentText(chunk.content, chunk.matchedTerms)}
                      </p>
                      
                      {/* Keyword matched terms badges */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase shrink-0">MATCHED:</span>
                        {chunk.matchedTerms.map((term, tIdx) => (
                          <span
                            key={tIdx}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${colors.border} ${colors.bg} ${colors.text}`}
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
