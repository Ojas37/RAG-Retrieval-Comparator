import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  GitMerge, 
  ChevronRight,
  Search,
  CheckCircle,
  Zap
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

interface LandingPageProps {
  onEnterDashboard: (view?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  return (
    <div className="relative min-h-screen bg-radial-grid overflow-hidden selection:bg-cyan-500/30">
      {/* Visual background grids */}
      <div className="grid-overlay" />

      {/* Futuristic Glowing Ambient Mesh */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse-glow" style={{ animationDuration: '4s' }} />
      <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[120px] animate-pulse-glow" style={{ animationDuration: '6s' }} />

      {/* Floating Header */}
      <header className="relative z-20 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase tracking-wider font-mono">
              Comparator.AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#strategies" className="hover:text-white transition-colors">Strategies</a>
          </nav>

          <button
            onClick={() => onEnterDashboard('overview')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/5 text-xs text-white font-semibold transition-all duration-300"
          >
            Launch Console
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 text-center space-y-10">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-mono shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Sparkles className="w-3.5 h-3.5" />
          pgvector benchmarking suite v1.4
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.05] font-sans">
          Benchmark Your <br />
          <span className="text-gradient-mixed animate-pulse-glow">RAG Retrieval Stack</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Compare Dense, Sparse, and Hybrid (RRF) Retrieval Systems built on PostgreSQL and <strong className="font-semibold text-slate-200">pgvector</strong> with high-fidelity, real-time MRR and recall audits.
        </p>

        {/* CTA triggers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onEnterDashboard('runs')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transform hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Start Benchmark Run
            <PlayCircleIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEnterDashboard('overview')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/5 text-slate-300 hover:text-white font-bold text-sm transition-all"
          >
            View Dashboard
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Floating statistics dashboard cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-16">
          <GlassCard glowColor="cyan" className="p-4 text-left border-l-2 border-l-cyan-400">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">DENSE MRR@10</span>
            <span className="text-2xl font-extrabold text-white">0.898</span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-1">↑ +2.4% vs IVFFlat</span>
          </GlassCard>

          <GlassCard glowColor="purple" className="p-4 text-left border-l-2 border-l-purple-400">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">SPARSE AVG SPEED</span>
            <span className="text-2xl font-extrabold text-white">8.2ms</span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-1">↓ 76% faster lookup</span>
          </GlassCard>

          <GlassCard glowColor="blue" className="p-4 text-left border-l-2 border-l-blue-400">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">HYBRID RRF RECALL</span>
            <span className="text-2xl font-extrabold text-white">97.6%</span>
            <span className="text-[10px] text-cyan-400 font-bold block mt-1">✓ Gold-Standard Peak</span>
          </GlassCard>

          <GlassCard className="p-4 text-left border-l-2 border-l-emerald-500">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">EMBEDDING COST</span>
            <span className="text-2xl font-extrabold text-slate-100">$0.22</span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">24.1k document chunks</span>
          </GlassCard>
        </div>
      </section>

      {/* ARCHITECTURE FLOW SECTION */}
      <section id="architecture" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-extrabold text-white">Multi-Strategy Evaluation Architecture</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Watch the streaming, fully optimized data flow from local unstructured documents into evaluated database vectors.
          </p>
        </div>

        {/* Pulsing Architecture SVG flow */}
        <div className="glass-panel p-8 rounded-2xl max-w-5xl mx-auto shadow-2xl relative overflow-hidden bg-black/40">
          <div className="absolute inset-0 bg-radial-grid opacity-20 pointer-events-none" />
          
          <svg className="w-full h-auto min-h-[300px]" viewBox="0 0 1000 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background connection links path */}
            <path d="M 120 160 H 880" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6" />
            
            {/* Animated neon line tracers */}
            <path d="M 120 160 H 880" stroke="url(#glowing-line)" strokeWidth="3" className="animate-dash-pulse" strokeDasharray="15 35" />

            {/* Glowing gradient templates */}
            <defs>
              <linearGradient id="glowing-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="shadow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#06b6d4" floodOpacity="0.6" />
              </filter>
              <filter id="shadow-purple" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#8b5cf6" floodOpacity="0.6" />
              </filter>
              <filter id="shadow-blue" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3b82f6" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Ingestion node (Step 1) */}
            <g transform="translate(120, 160)">
              <circle r="36" fill="#121218" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" />
              <circle r="26" fill="#16171d" stroke="#64748b" strokeWidth="2" />
              <UploadCloudIcon className="w-6 h-6 text-slate-300 -translate-x-3 -translate-y-3" />
              <text y="58" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">1. UPLOAD</text>
              <text y="70" fill="#64748b" fontSize="8" fontFamily="sans-serif" textAnchor="middle">TXT, PDF, JSONL</text>
            </g>

            {/* Chunking node (Step 2) */}
            <g transform="translate(300, 160)">
              <circle r="36" fill="#121218" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" />
              <circle r="26" fill="#16171d" stroke="#06b6d4" strokeWidth="2" filter="url(#shadow-cyan)" />
              <ScissorsIcon className="w-5 h-5 text-cyan-400 -translate-x-2.5 -translate-y-2.5" />
              <text y="58" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">2. CHUNKER</text>
              <text y="70" fill="#64748b" fontSize="8" fontFamily="sans-serif" textAnchor="middle">Recursive Splits</text>
            </g>

            {/* Embedding node (Step 3) */}
            <g transform="translate(480, 160)">
              <circle r="36" fill="#121218" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" />
              <circle r="26" fill="#16171d" stroke="#8b5cf6" strokeWidth="2" filter="url(#shadow-purple)" />
              <BrainIcon className="w-5 h-5 text-purple-400 -translate-x-2.5 -translate-y-2.5" />
              <text y="58" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3. EMBEDDING</text>
              <text y="70" fill="#64748b" fontSize="8" fontFamily="sans-serif" textAnchor="middle">OpenAI 1536d</text>
            </g>

            {/* pgvector Node (Step 4) */}
            <g transform="translate(660, 160)">
              <circle r="36" fill="#121218" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" />
              <circle r="26" fill="#16171d" stroke="#3b82f6" strokeWidth="2" filter="url(#shadow-blue)" />
              <DbIcon className="w-5 h-5 text-blue-400 -translate-x-2.5 -translate-y-2.5" />
              <text y="58" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">4. PGVECTOR</text>
              <text y="70" fill="#64748b" fontSize="8" fontFamily="sans-serif" textAnchor="middle">HNSW / GIN Index</text>
            </g>

            {/* Dashboard evaluation Node (Step 5) */}
            <g transform="translate(840, 160)">
              <circle r="36" fill="#121218" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" />
              <circle r="26" fill="#16171d" stroke="#10b981" strokeWidth="2" />
              <CheckCircle className="w-5 h-5 text-emerald-400 -translate-x-2.5 -translate-y-2.5 animate-pulse" />
              <text y="58" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">5. AUDIT</text>
              <text y="70" fill="#64748b" fontSize="8" fontFamily="sans-serif" textAnchor="middle">MRR Evaluation</text>
            </g>
          </svg>
        </div>
      </section>

      {/* STRATEGIES OVERVIEW SECTION */}
      <section id="strategies" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase font-bold">Strategy Battleground</span>
          <h2 className="text-3xl font-extrabold text-white">Compare Retrieval Paradigms Side-by-Side</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard glowColor="cyan" className="p-8 text-left space-y-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/35 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Dense Semantic Retrieval</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Uses high-dimensional cosine distance similarity lookups. Excellent at answering conceptual search queries by parsing synonyms and intent, but vulnerable to indexing memory bloats.
            </p>
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-[10px] space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Metric Type:</span><span className="text-cyan-400 font-semibold">L2 / Cosine Distance</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Memory overhead:</span><span className="text-cyan-400 font-semibold">O(N * M) Graph Weight</span></div>
            </div>
          </GlassCard>

          <GlassCard glowColor="purple" className="p-8 text-left space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/35 flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Sparse Keyword Retrieval</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Relies on classic BM25 lexical indexing inside postgres utilizing GIN/tsvector tokens. Extremely fast and lightweight, perfect for locating specific codes, version numbers, or UUID tags.
            </p>
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-[10px] space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Metric Type:</span><span className="text-purple-400 font-semibold">tf-idf / BM25 Weight</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Memory overhead:</span><span className="text-purple-400 font-semibold">Ultra-low Lexical Index</span></div>
            </div>
          </GlassCard>

          <GlassCard glowColor="blue" className="p-8 text-left space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/35 flex items-center justify-center">
              <GitMerge className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Hybrid Retrieval (RRF)</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              The gold-standard. Executes both Dense HNSW vector search and Lexical BM25 GIN queries, then blends rankings using Reciprocal Rank Fusion SQL CTE expressions. Spikes MRR accuracy to peak.
            </p>
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-[10px] space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Formula:</span><span className="text-blue-400 font-semibold">sum(1 / (60 + rank))</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Accuracy boost:</span><span className="text-emerald-400 font-semibold">Peak MRR@10 (0.948)</span></div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* DETAILED FEATURES GRID */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase font-bold">ENGINEER-READY WIDGETS</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Built Specifically for pgvector AI Architectures</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Don't guess RAG retrieval rates. Multi-Strategy Comparator equips ML teams with precise, robust benchmarking logs, query drill-downs, vector projections, and embedding budget estimators.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-1 h-fit rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"><CheckCircle className="w-4 h-4" /></div>
                <div className="text-xs text-slate-300 font-medium">Auto-Estimate Embedding Expenditure and Token volume inside document configuration panels.</div>
              </div>
              <div className="flex gap-3">
                <div className="p-1 h-fit rounded bg-purple-500/10 border border-purple-500/20 text-purple-400"><CheckCircle className="w-4 h-4" /></div>
                <div className="text-xs text-slate-300 font-medium">Tune Index parameters (HNSW nodes, ef_construction, IVFFlat centroids) to watch latency fluctuations.</div>
              </div>
              <div className="flex gap-3">
                <div className="p-1 h-fit rounded bg-blue-500/10 border border-blue-500/20 text-blue-400"><CheckCircle className="w-4 h-4" /></div>
                <div className="text-xs text-slate-300 font-medium">Verify exact keyword match mappings using advanced text highlight query builders.</div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Visual preview representation */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 blur-lg opacity-10" />
            <div className="glass-panel p-6 rounded-2xl shadow-2xl space-y-4 text-left border-white/10 relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-bold text-xs text-white flex items-center gap-1.5 font-mono"><Terminal className="w-4 h-4 text-purple-400" /> index_compiler.sql</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              
              <pre className="text-[10px] text-slate-300 font-mono leading-relaxed bg-[#050508] p-4 rounded-lg overflow-x-auto border border-white/5">
{`-- Build Dense Cosine Index
CREATE INDEX ON rag_vectors 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Query using Reciprocal Rank Fusion (RRF)
WITH dense_hits AS (
  SELECT id, rank() OVER (ORDER BY embedding <=> $1) as rank
  FROM rag_vectors LIMIT 20
),
sparse_hits AS (
  SELECT id, rank() OVER (ORDER BY ts_rank(sparse_tokens, $2) DESC) as rank
  FROM rag_vectors WHERE sparse_tokens @@ $2 LIMIT 20
)
SELECT d.id, 
       (1.0 / (60.0 + d.rank)) + COALESCE(1.0 / (60.0 + s.rank), 0.0) as rrf_score
FROM dense_hits d FULL OUTER JOIN sparse_hits s ON d.id = s.id
ORDER BY rrf_score DESC;`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK GRID */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center">
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-semibold block mb-6">COMPATIBLE INFRASTRUCTURE STACK</span>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-60 hover:opacity-90 transition-opacity">
          <span className="font-bold text-sm font-mono text-slate-400">POSTGRESQL</span>
          <span className="font-bold text-sm font-mono text-cyan-400">PGVECTOR</span>
          <span className="font-bold text-sm font-mono text-slate-400">OPENAI EMBEDDINGS</span>
          <span className="font-bold text-sm font-mono text-purple-400">COHERE EM-v3</span>
          <span className="font-bold text-sm font-mono text-slate-400">LANGCHAIN</span>
          <span className="font-bold text-sm font-mono text-blue-400">FASTAPI</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050508] py-8 text-center text-xs text-slate-500 font-mono">
        © 2026 Multi-Strategy RAG Retrieval Comparator. Built for AI infrastructure engineers.
      </footer>
    </div>
  );
};

// Internal minimal icon components
const PlayCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M 16 16 L 12 12 L 8 16" />
    <path d="M 12 12 L 12 21" />
    <path d="M 20.39 18.39 A 5 5 0 0 0 18 9 h -1.26 A 8 8 0 1 0 3 16.3" />
  </svg>
);

const ScissorsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="9.8" y1="8.2" x2="21" y2="19.4" />
    <line x1="9.8" y1="15.8" x2="21" y2="4.6" />
  </svg>
);

const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);

const DbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);
