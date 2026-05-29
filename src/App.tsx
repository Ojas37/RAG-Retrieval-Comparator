import { useState, useEffect } from 'react';
import { Sidebar, type ViewType } from './components/Sidebar';
import { AIAssistant } from './components/AIAssistant';
import { LandingPage } from './views/LandingPage/LandingPage';
import { Overview } from './views/Dashboard/Overview';
import { Ingestion } from './views/Dashboard/Ingestion';
import { Retrieval } from './views/Dashboard/Retrieval';
import { BenchmarkRuns } from './views/Dashboard/BenchmarkRuns';
import { Metrics } from './views/Dashboard/Metrics';
import { Settings } from './views/Dashboard/Settings';
import { type BenchmarkRun, MOCK_RUNS } from './utils/mockData';
import { apiClient } from './utils/apiClient';
import { 
  Sparkles, 
  Database, 
  Cpu, 
  ChevronDown
} from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [historyRuns, setHistoryRuns] = useState<BenchmarkRun[]>([]);
  const [activeRun, setActiveRun] = useState<BenchmarkRun>(MOCK_RUNS[0]);

  // Global running simulator states
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);

  const fetchHistory = async () => {
    try {
      const history = await apiClient.getBenchmarkHistory();
      if (history && history.length > 0) {
        setHistoryRuns(history);
        const stillExists = history.find(r => r.id === activeRun?.id);
        if (!stillExists) {
          setActiveRun(history[0]);
        } else {
          setActiveRun(stillExists);
        }
      } else {
        setHistoryRuns(MOCK_RUNS);
      }
    } catch (err) {
      console.error("Failed to load history runs from backend:", err);
      setHistoryRuns(MOCK_RUNS);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectRun = (run: BenchmarkRun) => {
    setActiveRun(run);
  };

  const handleEnterDashboard = (view?: string) => {
    setCurrentView((view as ViewType) || 'overview');
  };

  // Switch rendering of views
  const renderViewContent = () => {
    switch (currentView) {
      case 'overview':
        return <Overview activeRun={activeRun} onNavigateToTab={setCurrentView} />;
      case 'ingestion':
        return <Ingestion />;
      case 'retrieval':
        return <Retrieval />;
      case 'runs':
        return (
          <BenchmarkRuns
            activeRun={activeRun}
            onSelectRun={handleSelectRun}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            runProgress={runProgress}
            setRunProgress={setRunProgress}
            historyRuns={historyRuns}
            fetchHistory={fetchHistory}
          />
        );
      case 'metrics':
        return <Metrics activeRun={activeRun} />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview activeRun={activeRun} onNavigateToTab={setCurrentView} />;
    }
  };

  // If on Landing Page, render isolated Hero UI
  if (currentView === 'landing') {
    return <LandingPage onEnterDashboard={handleEnterDashboard} />;
  }

  return (
    <div className="flex h-screen bg-[#07070a] overflow-hidden text-slate-100 font-sans relative selection:bg-cyan-500/30">
      
      {/* Visual background grids */}
      <div className="grid-overlay" />

      {/* Futuristic Glowing Ambient Mesh */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDuration: '6s' }} />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Console Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Global Dashboard Header bar */}
        <header className="h-16 border-b border-white/5 bg-[#07070a]/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Status indicator */}
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PGVECTOR ACTIVE
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Host: <b className="text-slate-300 font-bold">postgresql://localhost:5432/rag_bench</b>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Run Selector dropdown */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.01] hover:bg-white/5 cursor-pointer transition-all" onClick={() => setCurrentView('runs')}>
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-slate-300 font-mono font-bold truncate max-w-[150px]">
                {activeRun.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>

            {/* Collapsible Assistant Toggle Button */}
            <button
              onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-xs font-bold text-purple-400 transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)] shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Research AI
            </button>
          </div>
        </header>

        {/* Dashboard Active View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* View Header with dynamic Titles */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left border-b border-white/5 pb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase font-mono">
                  {currentView === 'overview' && 'RAG Overview'}
                  {currentView === 'ingestion' && 'Document Ingestion'}
                  {currentView === 'retrieval' && 'Query Drill-Down Explorer'}
                  {currentView === 'runs' && 'Benchmark History logs'}
                  {currentView === 'metrics' && 'Accuracy & Latency Metrics'}
                  {currentView === 'settings' && 'System Configuration'}
                </h1>
                <p className="text-slate-400 text-xs mt-1 font-light leading-normal">
                  {currentView === 'overview' && 'Aggregated retrieval indicators and active status.'}
                  {currentView === 'ingestion' && 'Partition files, clean symbols, and compile pgvector indices.'}
                  {currentView === 'retrieval' && 'Run side-by-side test queries to evaluate cosine similarities.'}
                  {currentView === 'runs' && 'Monitor and execute real-time postgres indexing operations.'}
                  {currentView === 'metrics' && 'Investigate accuracy distributions, Latency and Throughput Pareto limits.'}
                  {currentView === 'settings' && 'Fine-tune PostgreSQL memory limits and pgvector graph links.'}
                </p>
              </div>

              {/* Server indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.01] font-mono text-[10px] text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Sandbox CPU: 2.4GHz</span>
              </div>
            </div>

            {/* Render view contents */}
            {renderViewContent()}
          </div>
        </main>
      </div>

      {/* Collapsible AI assistant sidebar */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </div>
  );
}

export default App;
