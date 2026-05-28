import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TermIcon, XCircle, Trash2 } from 'lucide-react';
import { MOCK_TERMINAL_LOGS } from '../utils/mockData';

interface TerminalProps {
  isRunning: boolean;
  onStopRun: () => void;
  runProgress: number;
}

export const Terminal: React.FC<TerminalProps> = ({
  isRunning,
  onStopRun,
  runProgress,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const logIndexRef = useRef(0);

  // Scroll to bottom whenever logs update
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle active running log simulator
  useEffect(() => {
    if (!isRunning) {
      if (logs.length === 0) {
        setLogs([
          '🟢 [SYSTEM] pgvector Comparator Console. Idle.',
          '💡 [SYSTEM] Click "Trigger Evaluation Run" above to simulate real-time HNSW / IVFFlat benchmarking.'
        ]);
      }
      return;
    }

    setLogs(['⚡ [SYSTEM] Preparing ingestion pipelines & pgvector sandbox environment...']);
    logIndexRef.current = 0;

    const interval = setInterval(() => {
      if (logIndexRef.current < MOCK_TERMINAL_LOGS.length) {
        const nextLog = MOCK_TERMINAL_LOGS[logIndexRef.current];
        setLogs(prev => [...prev, nextLog]);
        logIndexRef.current += 1;
      } else {
        clearInterval(interval);
      }
    }, 450); // Speed of logs streaming

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleClear = () => {
    if (isRunning) return;
    setLogs(['🟢 Console cleared. Ready.']);
  };

  return (
    <div className="flex flex-col h-[400px] rounded-xl border border-white/10 overflow-hidden bg-[#050508] shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-mono text-xs text-slate-300">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-2">
          <TermIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-200">pgvector.engine.logs</span>
          {isRunning ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] text-cyan-400 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
              RUNNING
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[9px] text-slate-400 font-bold">
              IDLE
            </span>
          )}
        </div>
        
        {/* Logs controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={isRunning}
            className="p-1 rounded-md border border-white/5 bg-white/[0.01] hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Terminal Logs Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 bg-black/60 selection:bg-cyan-500/30">
        {logs.map((log, index) => {
          // Color coding logs dynamically
          let logColor = 'text-slate-300';
          if (log.includes('🔴') || log.includes('[ERROR]')) logColor = 'text-red-400';
          else if (log.includes('⚙️') || log.includes('[CONFIG]')) logColor = 'text-slate-400 font-light';
          else if (log.includes('🐘') || log.includes('[PGVECTOR]')) logColor = 'text-cyan-400 font-semibold';
          else if (log.includes('🔨') || log.includes('[INDEXING]')) logColor = 'text-purple-400';
          else if (log.includes('🚀') || log.includes('[EMBEDDING]')) logColor = 'text-blue-400';
          else if (log.includes('🎯') || log.includes('[EVALUATION]')) logColor = 'text-amber-400 font-semibold';
          else if (log.includes('🏁') || log.includes('[SYSTEM] Benchmarking run finished')) logColor = 'text-emerald-400 font-bold';
          else if (log.includes('⚡') || log.includes('[SYSTEM]')) logColor = 'text-white font-bold bg-white/5 px-1 py-0.5 rounded';

          return (
            <div key={index} className={`leading-normal whitespace-pre-wrap ${logColor}`}>
              <span className="text-slate-600 mr-2 select-none">
                {String(index + 1).padStart(3, '0')}
              </span>
              {log}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Footer controls & run simulator animation */}
      {isRunning && (
        <div className="px-4 py-3 bg-[#08080c] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-[10px] text-cyan-400 font-bold shrink-0">BUILD PROGRESS</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${runProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-bold w-8 text-right">{runProgress}%</span>
          </div>

          <button
            onClick={onStopRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold transition-all"
          >
            <XCircle className="w-3.5 h-3.5" />
            ABORT RUN
          </button>
        </div>
      )}
    </div>
  );
};
