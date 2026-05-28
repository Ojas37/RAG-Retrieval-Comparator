import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid
} from 'recharts';
import { BarChart3, LineChart as ChartIcon, Compass, Sparkles } from 'lucide-react';
import { type BenchmarkRun } from '../../utils/mockData';

interface MetricsProps {
  activeRun: BenchmarkRun;
}

export const Metrics: React.FC<MetricsProps> = ({ activeRun }) => {
  // 1. Radar Capabilites Data
  const radarData = [
    { subject: 'MRR Accuracy', dense: activeRun.dense.mrr10 * 100, sparse: activeRun.sparse.mrr10 * 100, hybrid: activeRun.hybrid.mrr10 * 100 },
    { subject: 'Recall @10', dense: activeRun.dense.recall10 * 100, sparse: activeRun.sparse.recall10 * 100, hybrid: activeRun.hybrid.recall10 * 100 },
    { subject: 'Retrieval Speed', dense: (1 - activeRun.dense.avgLatencyMs / 50) * 100, sparse: (1 - activeRun.sparse.avgLatencyMs / 50) * 100, hybrid: (1 - activeRun.hybrid.avgLatencyMs / 50) * 100 },
    { subject: 'Keyword Accuracy', dense: 40, sparse: 95, hybrid: 98 },
    { subject: 'Semantic Depth', dense: 92, sparse: 35, hybrid: 96 },
  ];

  // 2. Accuracy MRR comparison
  const accuracyData = [
    {
      name: 'MRR @1',
      Dense: activeRun.dense.mrr1,
      Sparse: activeRun.sparse.mrr1,
      Hybrid: activeRun.hybrid.mrr1,
    },
    {
      name: 'MRR @5',
      Dense: activeRun.dense.mrr5,
      Sparse: activeRun.sparse.mrr5,
      Hybrid: activeRun.hybrid.mrr5,
    },
    {
      name: 'MRR @10',
      Dense: activeRun.dense.mrr10,
      Sparse: activeRun.sparse.mrr10,
      Hybrid: activeRun.hybrid.mrr10,
    },
  ];

  // 3. Latency distribution curves
  const latencyCurveData = [
    { qps: 10, Dense: activeRun.dense.avgLatencyMs, Sparse: activeRun.sparse.avgLatencyMs, Hybrid: activeRun.hybrid.avgLatencyMs },
    { qps: 50, Dense: activeRun.dense.avgLatencyMs * 1.1, Sparse: activeRun.sparse.avgLatencyMs * 1.05, Hybrid: activeRun.hybrid.avgLatencyMs * 1.15 },
    { qps: 100, Dense: activeRun.dense.avgLatencyMs * 1.25, Sparse: activeRun.sparse.avgLatencyMs * 1.12, Hybrid: activeRun.hybrid.avgLatencyMs * 1.35 },
    { qps: 200, Dense: activeRun.dense.avgLatencyMs * 1.6, Sparse: activeRun.sparse.avgLatencyMs * 1.3, Hybrid: activeRun.hybrid.avgLatencyMs * 1.8 },
    { qps: 300, Dense: activeRun.dense.avgLatencyMs * 2.2, Sparse: activeRun.sparse.avgLatencyMs * 1.6, Hybrid: activeRun.hybrid.avgLatencyMs * 2.6 },
  ];

  // 4. Latency vs Recall scatter (Queries)
  const scatterData = [
    { x: activeRun.dense.avgLatencyMs, y: activeRun.dense.recall10 * 100, name: 'Dense Retrieval Cluster' },
    { x: activeRun.sparse.avgLatencyMs, y: activeRun.sparse.recall10 * 100, name: 'Sparse BM25 Cluster' },
    { x: activeRun.hybrid.avgLatencyMs, y: activeRun.hybrid.recall10 * 100, name: 'Hybrid (RRF) Target' },
  ];

  // Custom tooltips to maintain modern neon styling
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border-white/10 p-3 rounded-lg text-[10px] font-mono space-y-1">
          <p className="text-white font-bold">{payload[0].name || payload[0].payload.subject || payload[0].payload.name}</p>
          {payload.map((item: any, i: number) => (
            <p key={i} style={{ color: item.color || item.fill }}>
              {item.name || item.dataKey}: {typeof item.value === 'number' && item.value < 1 ? item.value.toFixed(3) : item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in pr-2">
      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Capability Radar Evaluation */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Multidimensional Capability Profile</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                <Radar name="Dense" dataKey="dense" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                <Radar name="Sparse" dataKey="sparse" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                <Radar name="Hybrid" dataKey="hybrid" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy MRR Bar Chart */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Mean Reciprocal Rank (MRR) Accuracy</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} domain={[0, 1.0]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                <Bar dataKey="Dense" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sparse" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Hybrid" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency over Throughput curves */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <ChartIcon className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Latency Scaling vs Request Throughput (QPS)</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="qps" stroke="#64748b" fontSize={9} unit=" QPS" />
                <YAxis stroke="#64748b" fontSize={9} unit=" ms" />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="Dense" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Sparse" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Hybrid" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency vs Recall Scatter plot */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Pareto Frontier: Latency vs Recall</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" />
                <XAxis type="number" dataKey="x" name="Latency" unit=" ms" stroke="#64748b" fontSize={9} domain={[0, 45]} />
                <YAxis type="number" dataKey="y" name="Recall@10" unit=" %" stroke="#64748b" fontSize={9} domain={[80, 100]} />
                <ZAxis type="category" dataKey="name" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={customTooltip} />
                <Scatter name="Dense" data={[scatterData[0]]} fill="#06b6d4" shape="circle" line strokeWidth={1} strokeDasharray="3 3" />
                <Scatter name="Sparse" data={[scatterData[1]]} fill="#8b5cf6" shape="triangle" line strokeWidth={1} strokeDasharray="3 3" />
                <Scatter name="Hybrid" data={[scatterData[2]]} fill="#3b82f6" shape="star" line strokeWidth={1} strokeDasharray="3 3" />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
