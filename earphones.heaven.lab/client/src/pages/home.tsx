import { useState, useEffect, useRef } from 'react';
import { Music, HelpCircle } from 'lucide-react';
import logoImage from '@assets/logopng_1755878943316.png';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/hooks/use-audio';
import { EightDProcessor } from '@/lib/8d-effects';
import { BPMAnalysisResult } from '@/lib/audio-processor';
import FileUpload from '@/components/file-upload';
import AudioPlayer from '@/components/audio-player';
import ControlPanel, { EightDMode } from '@/components/control-panel';
import ProcessingSection from '@/components/processing-section';

export default function Home() {
  const { toast } = useToast();
  const {
    audioRef,
    audioContextRef,
    sourceRef,
    audioState,
    audioFile,
    loadAudioFile,
    togglePlay,
    seekTo,
    initializeAudioContext,
  } = useAudio();

  // 8D Effect states
  const [mode, setMode] = useState<EightDMode>('manual');
  const [manualSpeed, setManualSpeed] = useState(2.5);
  const [autoMultiplier, setAutoMultiplier] = useState(1.0);
  const [is8DActive, setIs8DActive] = useState(false);
  
  // Audio processing
  const eightDProcessorRef = useRef<EightDProcessor | null>(null);
  const [analyserData, setAnalyserData] = useState<Uint8Array>();
  const [analysisResult, setAnalysisResult] = useState<BPMAnalysisResult | null>(null);

  // Initialize 8D processor when audio context is ready
  useEffect(() => {
    if (audioContextRef.current && sourceRef.current && !eightDProcessorRef.current) {
      eightDProcessorRef.current = new EightDProcessor(audioContextRef.current, sourceRef.current);
    }
  }, [audioContextRef.current, sourceRef.current]);

  // Update 8D effect parameters
  useEffect(() => {
    if (!eightDProcessorRef.current) return;

    const speed = mode === 'manual' 
      ? manualSpeed 
      : analysisResult ? analysisResult.optimalSpeed * autoMultiplier : manualSpeed;

    eightDProcessorRef.current.updateConfig({
      speed,
      intensity: 1.0,
      radius: 5.0,
    });
  }, [mode, manualSpeed, autoMultiplier, analysisResult]);

  // Start/stop 8D effect based on playback
  useEffect(() => {
    if (!eightDProcessorRef.current) return;

    if (audioState.isPlaying && audioFile) {
      eightDProcessorRef.current.start();
      setIs8DActive(true);
    } else {
      eightDProcessorRef.current.stop();
      setIs8DActive(false);
    }
  }, [audioState.isPlaying, audioFile]);

  // Update analyser data for visualization
  useEffect(() => {
    if (!eightDProcessorRef.current || !audioState.isPlaying) return;

    const updateAnalyserData = () => {
      if (eightDProcessorRef.current) {
        const data = eightDProcessorRef.current.getAnalyserData();
        setAnalyserData(data);
      }
      requestAnimationFrame(updateAnalyserData);
    };

    updateAnalyserData();
  }, [audioState.isPlaying]);

  const handleFileSelect = async (file: File) => {
    initializeAudioContext();
    loadAudioFile(file);
    
    toast({
      title: "File uploaded successfully!",
      description: `${file.name} is ready for 8D processing.`,
    });

    // Analyze audio automatically for BPM detection
    try {
      const { AudioProcessor } = await import('@/lib/audio-processor');
      const processor = new AudioProcessor();
      const result = await processor.analyzeFile(file);
      setAnalysisResult(result);
      
      toast({
        title: "Audio analyzed automatically",
        description: `Detected ${result.bpm} BPM, base speed: ${result.optimalSpeed.toFixed(2)} Hz`,
      });
    } catch (error) {
      console.error('Auto-analysis failed:', error);
      // Don't show error toast, analysis is optional
    }
  };

  const handleRemoveFile = () => {
    // Stop audio if playing
    if (audioState.isPlaying) {
      togglePlay();
    }
    
    // Clear audio file and reset state
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    
    // Reset all state
    setAnalysisResult(null);
    setMode('manual');
    setManualSpeed(2.5);
    setAutoMultiplier(1.0);
    
    // Clear audio context and processor
    if (eightDProcessorRef.current) {
      eightDProcessorRef.current.destroy();
      eightDProcessorRef.current = null;
    }
    
    toast({
      title: "File removed",
      description: "You can upload a new file now.",
    });
  };


  const handleModeChange = (newMode: EightDMode) => {
    setMode(newMode);
    toast({
      title: `Switched to ${newMode} mode`,
      description: `8D effect mode changed without interrupting playback.`,
    });
  };

  const handleAnalysisComplete = (result: BPMAnalysisResult) => {
    setAnalysisResult(result);
    toast({
      title: "Audio analysis complete",
      description: `Detected ${result.bpm} BPM, optimal speed: ${result.optimalSpeed.toFixed(2)} Hz`,
    });
  };

  const currentSpeed = mode === 'manual' 
    ? manualSpeed 
    : analysisResult ? analysisResult.optimalSpeed * autoMultiplier : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="Earphones Heaven Logo" 
                className="w-10 h-10 object-contain filter brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">earphones.heaven's 8d lab</h1>
              <p className="text-sm text-muted-foreground">create your 8d music</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-accent-blue hover:bg-accent-blue/80 text-black font-medium glow-effect"
              data-testid="button-help"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            <Button 
              className="bg-accent-blue hover:bg-accent-blue/80 text-black font-medium"
              disabled={!audioFile}
              data-testid="button-header-download"
            >
              <Music className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Row 1: File Upload Section */}
        <div className="mb-8">
          <FileUpload 
            onFileSelect={handleFileSelect}
            isLoading={audioState.isLoading}
            currentFile={audioFile}
            onRemoveFile={handleRemoveFile}
          />
        </div>

        {/* Row 2: Audio Player + 8D Mode Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Audio Player - A sinistra */}
          <div className="lg:col-span-1">
            <AudioPlayer
              audioState={audioState}
              audioFile={audioFile}
              onTogglePlay={togglePlay}
              onSeek={seekTo}
              analyserData={analyserData}
            />
          </div>

          {/* 8D Mode & Settings - A destra */}
          <div className="lg:col-span-1">
            <ControlPanel
              mode={mode}
              onModeChange={handleModeChange}
              manualSpeed={manualSpeed}
              onManualSpeedChange={setManualSpeed}
              autoMultiplier={autoMultiplier}
              onAutoMultiplierChange={setAutoMultiplier}
              audioFile={audioFile?.file || null}
              onAnalyzeComplete={handleAnalysisComplete}
              analysisResult={analysisResult}
            />
          </div>
        </div>

        {/* Row 3: Export & Download Section */}
        <div>
          <ProcessingSection
            audioFile={audioFile?.file || null}
            eightDSpeed={currentSpeed}
            isEffectActive={is8DActive}
          />
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onLoadedData={initializeAudioContext}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
}
