import { useCallback, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AudioState, AudioFile } from '@/hooks/use-audio';
import { AudioProcessor } from '@/lib/audio-processor';

interface AudioPlayerProps {
  audioState: AudioState;
  audioFile: AudioFile | null;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  analyserData?: Uint8Array;
}

export default function AudioPlayer({ 
  audioState, 
  audioFile, 
  onTogglePlay, 
  onSeek,
  analyserData
}: AudioPlayerProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const audioProcessor = useRef(new AudioProcessor());

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current || !audioState.duration) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioState.duration;
    
    onSeek(newTime);
  }, [audioState.duration, onSeek]);

  const formatTime = useCallback((seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    return audioProcessor.current.formatTime(seconds);
  }, []);

  const progressPercentage = audioState.duration > 0 
    ? (audioState.currentTime / audioState.duration) * 100 
    : 0;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
          <Play className="w-5 h-5 text-accent-blue mr-3" />
          Audio Player
        </h3>
        
        {/* Player Controls */}
        <div className="flex items-center justify-center mb-8">
          <Button
            onClick={onTogglePlay}
            disabled={!audioFile || audioState.isLoading}
            className="w-16 h-16 rounded-full bg-accent-blue hover:bg-accent-blue/80 text-black text-2xl transition-all transform hover:scale-105 glow-effect"
            data-testid="button-play-pause"
          >
            {audioState.isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Timeline Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span data-testid="text-current-time">{formatTime(audioState.currentTime)}</span>
            <span data-testid="text-total-duration">{formatTime(audioState.duration)}</span>
          </div>
          
          {/* Timeline Bar */}
          <div 
            ref={timelineRef}
            className="relative bg-muted h-2 rounded-full cursor-pointer"
            onClick={handleTimelineClick}
            data-testid="timeline-bar"
          >
            <div 
              className="timeline-progress h-2 rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
              data-testid="timeline-progress"
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-accent-blue rounded-full border-2 border-black transition-all duration-100"
              style={{ left: `${progressPercentage}%` }}
              data-testid="timeline-thumb"
            />
          </div>
        </div>

        {/* Audio Information */}
        <div className="bg-background rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">File:</span>
              <span className="ml-2 text-foreground" data-testid="text-filename">
                {audioFile?.name || 'No file selected'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Format:</span>
              <span className="ml-2 text-foreground" data-testid="text-format">
                {audioFile?.format || '-'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Sample Rate:</span>
              <span className="ml-2 text-foreground" data-testid="text-sample-rate">
                {audioFile?.sampleRate ? `${audioFile.sampleRate} Hz` : '-'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Bitrate:</span>
              <span className="ml-2 text-foreground" data-testid="text-bitrate">
                {audioFile?.bitrate || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {audioState.error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive" data-testid="text-error">
              {audioState.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
