import { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  analyserData?: Uint8Array;
  isPlaying: boolean;
  height?: number;
  barCount?: number;
}

export default function WaveformVisualizer({ 
  analyserData, 
  isPlaying, 
  height = 32, 
  barCount = 10 
}: WaveformVisualizerProps) {
  const [animatedHeights, setAnimatedHeights] = useState<number[]>(
    Array(barCount).fill(0).map(() => Math.random() * 0.6 + 0.2)
  );

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimatedHeights(prev => 
        prev.map((_, index) => {
          if (analyserData && analyserData.length > 0) {
            // Use actual audio data if available
            const dataIndex = Math.floor((index / barCount) * analyserData.length);
            return (analyserData[dataIndex] / 255) * 0.8 + 0.2;
          } else {
            // Fallback to animated simulation
            return Math.random() * 0.6 + 0.2;
          }
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, analyserData, barCount]);

  return (
    <div 
      className="flex items-end justify-center space-x-1"
      style={{ height }}
      data-testid="waveform-visualizer"
    >
      {animatedHeights.map((heightRatio, index) => (
        <div
          key={index}
          className={`waveform-bar bg-accent-blue w-1 rounded-sm transition-all duration-100 ${
            isPlaying ? '' : 'opacity-50'
          }`}
          style={{ 
            height: `${heightRatio * 100}%`,
            animationPlayState: isPlaying ? 'running' : 'paused'
          }}
          data-testid={`waveform-bar-${index}`}
        />
      ))}
    </div>
  );
}
