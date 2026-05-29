import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  Coins, 
  AlertTriangle,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const Ingestion: React.FC = () => {
  // Config states
  const [chunkStrategy, setChunkStrategy] = useState('recursive');
  const [chunkSize, setChunkSize] = useState(500);
  const [overlapSize, setOverlapSize] = useState(10); // in %
  const [embeddingModel, setEmbeddingModel] = useState('bge-small');
  const [indexType, setIndexType] = useState('hnsw');

  // Interactive Upload states
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingState, setProcessingState] = useState<'idle' | 'uploading' | 'processing' | 'completed'>('idle');

  // Embedding cost estimator logic
  const [estimates, setEstimates] = useState({ tokens: 125000, cost: 0.0025 });

  useEffect(() => {
    // Dynamically calculate estimated tokens and cost based on slider configurations
    const rawTokens = 12500 * (1000 / chunkSize) * (1 + overlapSize / 100);
    let modelPrice = 0.0; // Local BAAI/bge-small-en-v1.5 is 100% free!

    if (embeddingModel === 'openai-small') modelPrice = 0.00002;
    else if (embeddingModel === 'openai-large') modelPrice = 0.00013;
    else if (embeddingModel === 'cohere-v3') modelPrice = 0.0001;
    else if (embeddingModel === 'bge-large') modelPrice = 0.0;

    const costValue = (rawTokens / 1000) * modelPrice;
    setEstimates({
      tokens: Math.round(rawTokens * 5), // multiplier for text scale
      cost: Number(costValue.toFixed(4)),
    });
  }, [chunkSize, overlapSize, embeddingModel]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (processingState !== 'idle') return;

    const file = e.dataTransfer.files[0];
    if (file) startFakeUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startFakeUpload(file);
  };

  const startFakeUpload = (file: File) => {
    setUploadedFile({ name: file.name, size: file.size });
    setUploadProgress(0);
    setProcessingState('uploading');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProcessingState('processing');

        // Transition to text processing state
        setTimeout(() => {
          setProcessingState('completed');
        }, 3000);
      }
    }, 250);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in pr-2 text-left">
      {/* Left side: Sleek drag and drop upload zone */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            Document Pipeline Uploader
          </h3>
          
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${
              processingState === 'idle' 
                ? 'border-white/10 hover:border-cyan-500/35 hover:bg-white/[0.01] cursor-pointer' 
                : 'border-white/5 bg-black/20 cursor-not-allowed'
            }`}
          >
            <input
              type="file"
              id="file-select"
              onChange={handleFileChange}
              disabled={processingState !== 'idle'}
              className="hidden"
              accept=".pdf,.txt,.md,.jsonl"
            />
            
            {processingState === 'idle' && (
              <label htmlFor="file-select" className="cursor-pointer space-y-3 flex flex-col items-center">
                <div className="p-4 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs text-white font-bold">Drag and drop file here, or click to upload</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Supported: PDF, TXT, MD, JSONL (Max 25MB)</p>
                </div>
              </label>
            )}

            {/* Ingestion active progress bar */}
            {processingState === 'uploading' && (
              <div className="w-full max-w-sm space-y-3">
                <span className="text-[10px] text-cyan-400 font-mono font-bold block">UPLOADING DOCUMENT... {uploadProgress}%</span>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">{uploadedFile?.name}</p>
              </div>
            )}

            {/* Parsing chunking state */}
            {processingState === 'processing' && (
              <div className="w-full max-w-sm space-y-4 flex flex-col items-center py-4">
                <div className="flex gap-1 animate-pulse items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-white font-bold font-mono">COMPILING PGVECTOR INDEXES...</p>
                  <p className="text-[10px] text-purple-400 font-mono mt-1">recursive document parsing in progress</p>
                </div>
              </div>
            )}

            {/* Ingest finished */}
            {processingState === 'completed' && (
              <div className="w-full max-w-sm space-y-4 flex flex-col items-center py-2">
                <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-white font-bold font-mono">INGESTION PIPELINE COMPLETED!</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">File: {uploadedFile?.name}</p>
                </div>
                <button
                  onClick={() => setProcessingState('idle')}
                  className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/5 text-[10px] text-slate-300 font-bold transition-all"
                >
                  Upload Another File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Processing timeline visualizer */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h4 className="font-bold text-xs text-slate-400 uppercase font-mono">Pipeline execution status</h4>
          
          <div className="relative pl-6 space-y-6 border-l border-white/5 font-mono text-[10px]">
            <div className="relative">
              <span className={`absolute left-[-29px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                processingState !== 'idle' ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>1</span>
              <div>
                <span className="font-bold text-white block">Document Normalizer</span>
                <span className="text-slate-500">Filters invalid symbols and structural headers.</span>
              </div>
            </div>

            <div className="relative">
              <span className={`absolute left-[-29px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                processingState === 'processing' || processingState === 'completed' ? 'bg-purple-500 text-black' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>2</span>
              <div>
                <span className="font-bold text-white block">Tokenizer Chunker</span>
                <span className="text-slate-500">Partitions text elements utilizing the active sliding chunk strategy.</span>
              </div>
            </div>

            <div className="relative">
              <span className={`absolute left-[-29px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                processingState === 'completed' ? 'bg-blue-500 text-black' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>3</span>
              <div>
                <span className="font-bold text-white block">pgvector Index Compiler</span>
                <span className="text-slate-500">Performs batch bulk inserts and updates index trees on pgvector vectors.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Parameters Ingestion configuration panel */}
      <div className="lg:col-span-2 space-y-6">
        <GlassCard interactive={false} className="space-y-6 border-l-2 border-l-purple-400">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings className="w-4 h-4 text-purple-400" />
            Indexing Parameters
          </h3>

          <div className="space-y-5 text-xs">
            {/* Chunk strategy picker */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block flex items-center justify-between">
                <span>CHUNK STRATEGY</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              </label>
              <select
                value={chunkStrategy}
                onChange={(e) => setChunkStrategy(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
              >
                <option value="recursive">Recursive Splitting</option>
                <option value="fixed">Fixed Size Chunking</option>
                <option value="semantic">Semantic Sentence Splits</option>
              </select>
            </div>

            {/* Chunk size slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-slate-400 font-semibold">CHUNK SIZE</span>
                <span className="text-cyan-400 font-bold">{chunkSize} tokens</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Chunk overlap slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-slate-400 font-semibold">CHUNK OVERLAP</span>
                <span className="text-purple-400 font-bold">{overlapSize}% overlap</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={overlapSize}
                onChange={(e) => setOverlapSize(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Embedding Model */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block">EMBEDDING MODEL</label>
              <select
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
              >
                <option value="bge-small">BAAI/bge-small-en-v1.5 (384d) [Local & Free]</option>
                <option value="bge-large">BAAI/bge-large-en-v1.5 (1024d) [Local & Free]</option>
                <option value="openai-small">openai/text-embedding-3-small (1536d)</option>
                <option value="openai-large">openai/text-embedding-3-large (3072d)</option>
                <option value="cohere-v3">cohere/embed-english-v3.0 (1024d)</option>
              </select>
            </div>

            {/* pgvector Index */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block">PGVECTOR INDEX TYPE</label>
              <div className="grid grid-cols-3 gap-2">
                {['hnsw', 'ivfflat', 'none'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setIndexType(type)}
                    className={`py-2 rounded-lg font-bold font-mono text-[9px] uppercase border transition-all ${
                      indexType === type
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'border-white/10 bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tokens & Cost dynamic Estimator */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h4 className="font-bold text-xs text-white flex items-center gap-1.5 font-mono">
            <Coins className="w-4 h-4 text-cyan-400" />
            Active Cost Estimator
          </h4>
          
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-white/[0.01] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 block">TOTAL CHUNKS</span>
              <span className="text-sm font-extrabold text-white">
                {estimates.tokens.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-white/[0.01] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 block">EMBEDDING COST</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {estimates.cost === 0 ? 'FREE' : `$${estimates.cost.toFixed(4)}`}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-400 font-mono leading-normal flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Estimates depend on model list prices. Large overlaps increase total tokens by 15-30%.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
