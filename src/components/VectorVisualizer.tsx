import React, { useState, useRef, useEffect } from 'react';
import { Network, ZoomIn, ZoomOut } from 'lucide-react';
import { MOCK_VECTOR_POINTS } from '../utils/mockData';

interface VectorVisualizerProps {
  activeStrategy: 'dense' | 'sparse' | 'hybrid';
  points?: any[];
}

export const VectorVisualizer: React.FC<VectorVisualizerProps> = ({ activeStrategy, points = MOCK_VECTOR_POINTS }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseAngle = 0;

    const render = () => {
      // Clear with subtle alpha trail for extra tech feel
      ctx.fillStyle = '#060609';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Cluster outlines / Semantic borders
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.beginPath();
      ctx.arc(160, 200, 90, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.beginPath();
      ctx.arc(380, 320, 80, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.beginPath();
      ctx.arc(240, 260, 100, 0, Math.PI * 2);
      ctx.stroke();

      pulseAngle += 0.03;
      const activePulse = Math.sin(pulseAngle) * 3 + 6;

      // Draw Query Vector (focus point)
      const queryPt = points.find(p => p.strategy === 'query') || { x: 50, y: 50 };
      const qX = (queryPt.x / 100) * canvas.width;
      const qY = (queryPt.y / 100) * canvas.height;

      // Pulse glow query
      ctx.shadowBlur = activePulse * 2;
      ctx.shadowColor = '#3b82f6';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(qX, qY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Query labeling
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText('ACTIVE QUERY EMBEDDING', qX - 55, qY - 15);

      // Render vector chunk points
      points.filter(pt => pt.strategy !== 'query').forEach(pt => {
        // Map 0-100 coordinates to canvas size
        const ptX = (pt.x / 100) * canvas.width;
        const ptY = (pt.y / 100) * canvas.height;

        let ptColor = '#64748b'; // default
        let isStrategyActive = false;

        if (pt.strategy === 'dense') {
          ptColor = '#06b6d4';
          isStrategyActive = activeStrategy === 'dense';
        } else if (pt.strategy === 'sparse') {
          ptColor = '#8b5cf6';
          isStrategyActive = activeStrategy === 'sparse';
        } else if (pt.strategy === 'hybrid') {
          ptColor = '#3b82f6';
          isStrategyActive = activeStrategy === 'hybrid';
        }

        const size = isStrategyActive ? 6 : 4;
        
        // Draw distance line connectors if strategy is active
        if (isStrategyActive) {
          ctx.strokeStyle = `rgba(${
            pt.strategy === 'dense' ? '6, 182, 212' : pt.strategy === 'sparse' ? '139, 92, 246' : '59, 130, 246'
          }, 0.25)`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(qX, qY);
          ctx.lineTo(ptX, ptY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw dot
        ctx.shadowBlur = isStrategyActive ? activePulse : 0;
        ctx.shadowColor = ptColor;
        ctx.fillStyle = ptColor;
        ctx.beginPath();
        ctx.arc(ptX, ptY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label if active
        if (isStrategyActive) {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '9px system-ui';
          ctx.fillText(`score: ${pt.score}`, ptX + 8, ptY + 3);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeStrategy]);

  // Handle canvas mouse move hover tests
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let foundPoint = null;

    // Check hit test
    points.filter(pt => pt.strategy !== 'query').forEach(pt => {
      const ptX = (pt.x / 100) * canvas.width;
      const ptY = (pt.y / 100) * canvas.height;
      const dist = Math.hypot(ptX - mouseX, ptY - mouseY);

      // Hit threshold
      if (dist < 10) {
        foundPoint = pt;
        setTooltipPos({ x: e.clientX - rect.left + 15, y: e.clientY - rect.top + 15 });
      }
    });

    setHoveredPoint(foundPoint);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="relative w-full rounded-xl border border-white/10 overflow-hidden bg-[#060609] h-[360px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
      {/* Header bar controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono">
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          <span>2D VECTOR SPACE MAP</span>
        </div>

        <div className="flex gap-1">
          <button className="p-1 rounded bg-black/60 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white pointer-events-auto transition-all">
            <ZoomIn className="w-3 h-3" />
          </button>
          <button className="p-1 rounded bg-black/60 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white pointer-events-auto transition-all">
            <ZoomOut className="w-3 h-3" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating high-tech cursor tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-20 pointer-events-none glass-panel border-white/20 p-3 rounded-lg text-left text-[10px] space-y-1 w-64 shadow-2xl"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center justify-between font-bold border-b border-white/5 pb-1">
            <span className={`uppercase font-mono ${
              hoveredPoint.strategy === 'dense' ? 'text-cyan-400' : hoveredPoint.strategy === 'sparse' ? 'text-purple-400' : 'text-blue-400'
            }`}>
              {hoveredPoint.strategy} CHUNK
            </span>
            <span className="text-white font-mono">Score: {hoveredPoint.score}</span>
          </div>
          <p className="text-slate-200 line-clamp-3 leading-normal font-sans font-light">
            {hoveredPoint.label} — This vector represents a core sub-document block matching key features of structural HNSW indexing parameters or RRF postgresql window formulas.
          </p>
        </div>
      )}
    </div>
  );
};
