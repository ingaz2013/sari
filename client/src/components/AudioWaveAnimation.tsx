import { useEffect, useState } from 'react';

interface AudioWaveAnimationProps {
  isPlaying?: boolean;
  className?: string;
}

export default function AudioWaveAnimation({ isPlaying = true, className = '' }: AudioWaveAnimationProps) {
  const [bars] = useState([
    { height: 12, delay: 0 },
    { height: 20, delay: 0.1 },
    { height: 16, delay: 0.2 },
    { height: 24, delay: 0.15 },
    { height: 14, delay: 0.25 },
    { height: 18, delay: 0.05 },
    { height: 22, delay: 0.3 },
  ]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-1 bg-primary rounded-full transition-all duration-300"
          style={{
            height: isPlaying ? `${bar.height}px` : '8px',
            animation: isPlaying ? `wave 0.8s ease-in-out ${bar.delay}s infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0% { height: 8px; }
          100% { height: var(--max-height, 24px); }
        }
      `}</style>
    </div>
  );
}
