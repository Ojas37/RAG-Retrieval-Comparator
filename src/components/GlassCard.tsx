import React, { useState } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'cyan' | 'purple' | 'blue' | 'none';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glowColor = 'none',
  interactive = true,
  className = '',
  ...props
}) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const glowStyles = {
    cyan: 'hover:border-cyan-500/35 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]',
    purple: 'hover:border-purple-500/35 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)]',
    blue: 'hover:border-blue-500/35 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]',
    none: 'hover:border-white/15 hover:shadow-[0_0_20px_-10px_rgba(255,255,255,0.05)]'
  };

  const activeGlowColor = {
    cyan: 'rgba(6, 182, 212, 0.15)',
    purple: 'rgba(139, 92, 246, 0.15)',
    blue: 'rgba(59, 130, 246, 0.15)',
    none: 'rgba(255, 255, 255, 0.05)',
  }[glowColor];

  return (
    <div
      className={`relative glass-panel rounded-xl p-6 transition-all duration-300 overflow-hidden ${
        interactive ? `cursor-pointer ${glowStyles[glowColor]}` : ''
      } ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Premium cursor mouse glow tracker */}
      {interactive && isHovered && (
        <div
          className="absolute pointer-events-none rounded-full blur-[60px] transition-opacity duration-300"
          style={{
            width: '120px',
            height: '120px',
            background: `radial-gradient(circle, ${activeGlowColor} 0%, transparent 70%)`,
            left: `${coords.x - 60}px`,
            top: `${coords.y - 60}px`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
