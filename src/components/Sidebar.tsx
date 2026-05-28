import React from 'react';
import { 
  BarChart3, 
  UploadCloud, 
  Search, 
  Terminal, 
  Settings, 
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Brain,
  Database,
  Cpu
} from 'lucide-react';

export type ViewType = 'landing' | 'overview' | 'ingestion' | 'retrieval' | 'runs' | 'metrics' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  setIsCollapsed,
}) => {
  const menuItems = [
    { id: 'overview' as ViewType, name: 'Overview', icon: Activity, desc: 'RAG status and metrics' },
    { id: 'ingestion' as ViewType, name: 'Document Ingestion', icon: UploadCloud, desc: 'Chunk and index files' },
    { id: 'retrieval' as ViewType, name: 'Query Explorer', icon: Search, desc: 'Side-by-side strategy test' },
    { id: 'runs' as ViewType, name: 'Benchmark Runs', icon: Terminal, desc: 'Live execution logs' },
    { id: 'metrics' as ViewType, name: 'Deep Metrics', icon: BarChart3, desc: 'Accuracy & latency charts' },
    { id: 'settings' as ViewType, name: 'Settings', icon: Settings, desc: 'pgvector & configuration' },
  ];

  return (
    <div 
      className={`glass-panel border-y-0 border-l-0 flex flex-col justify-between transition-all duration-500 ease-in-out relative z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Section - Logo */}
      <div>
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onViewChange('landing')}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
              <Brain className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-bold text-sm bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  RAG Comparator
                </span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                  pgvector engine
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 ml-auto hidden md:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full group relative flex items-center rounded-xl transition-all duration-300 text-left ${
                  isCollapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-4'
                } ${
                  isActive 
                    ? 'bg-gradient-to-r from-white/[0.05] to-white/[0.01] border-l-2 border-cyan-400 text-white shadow-[inset_1px_0_15px_rgba(6,182,212,0.03)]' 
                    : 'text-slate-400 border-l-2 border-transparent hover:text-slate-100 hover:bg-white/[0.02]'
                }`}
              >
                {/* Active Icon Glow */}
                {isActive && (
                  <div className="absolute left-[-2px] w-[6px] h-8 rounded-r bg-cyan-400 blur-sm pointer-events-none" />
                )}
                
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                  isActive ? 'text-cyan-400' : 'group-hover:scale-110 group-hover:text-slate-200'
                }`} />

                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-sm leading-none mb-0.5">{item.name}</span>
                    <span className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                      {item.desc}
                    </span>
                  </div>
                )}

                {/* Floating tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-20 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 bg-[#0c0c10] border border-white/10 text-white rounded-lg py-1.5 px-3 text-xs whitespace-nowrap transition-all duration-300 shadow-xl z-50">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - System Stats */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {!isCollapsed ? (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 font-mono text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Index Engine:
              </span>
              <span className="text-white font-bold">pgvector 0.5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Memory Pool:
              </span>
              <span className="text-emerald-400 font-bold">98.4% idle</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full w-[24%]" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center cursor-pointer" onClick={() => onViewChange('settings')}>
            <Database className="w-5 h-5 text-slate-500 hover:text-cyan-400 transition-colors" />
          </div>
        )}

        <button
          onClick={() => onViewChange('landing')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold ${
            isCollapsed ? 'p-2' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Landing Portal</span>}
        </button>
      </div>
    </div>
  );
};
