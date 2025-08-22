import { useState, useEffect } from 'react';
import { Settings, Wand2, Eye, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AudioProcessor, BPMAnalysisResult } from '@/lib/audio-processor';

export type EightDMode = 'manual' | 'automatic';

interface ControlPanelProps {
  mode: EightDMode;
  onModeChange: (mode: EightDMode) => void;
  manualSpeed: number;
  onManualSpeedChange: (speed: number) => void;
  autoMultiplier: number;
  onAutoMultiplierChange: (multiplier: number) => void;
  audioFile: File | null;
  onAnalyzeComplete?: (result: BPMAnalysisResult) => void;
  analysisResult?: BPMAnalysisResult | null;
}

export default function ControlPanel({
  mode,
  onModeChange,
  manualSpeed,
  onManualSpeedChange,
  autoMultiplier,
  onAutoMultiplierChange,
  audioFile,
  onAnalyzeComplete,
  analysisResult: externalAnalysisResult,
}: ControlPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localAnalysisResult, setLocalAnalysisResult] = useState<BPMAnalysisResult | null>(null);
  const [rhythmicMultipliers, setRhythmicMultipliers] = useState<number[]>([]);

  // Use external analysis result if available, otherwise use local
  const analysisResult = externalAnalysisResult || localAnalysisResult;

  const handleAnalyze = async () => {
    if (!audioFile) return;
    
    setIsAnalyzing(true);
    try {
      const processor = new AudioProcessor();
      const result = await processor.analyzeFile(audioFile);
      setLocalAnalysisResult(result);
      
      // Calculate rhythmic multipliers based on detected BPM
      const rhythmicMults = processor.getRhythmicMultipliers(result.bpm);
      setRhythmicMultipliers(rhythmicMults);
      
      // Snap current multiplier to closest rhythmic value
      const closestMult = processor.getClosestRhythmicMultiplier(autoMultiplier, result.bpm);
      if (Math.abs(closestMult - autoMultiplier) > 0.01) {
        onAutoMultiplierChange(closestMult);
      }
      
      onAnalyzeComplete?.(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle multiplier change with rhythm sync
  const handleMultiplierChange = (value: number) => {
    if (analysisResult && rhythmicMultipliers.length > 0) {
      // Find closest rhythmic multiplier
      let closest = rhythmicMultipliers[0];
      let minDiff = Math.abs(value - closest);
      
      for (const mult of rhythmicMultipliers) {
        const diff = Math.abs(value - mult);
        if (diff < minDiff) {
          minDiff = diff;
          closest = mult;
        }
      }
      
      onAutoMultiplierChange(closest);
    } else {
      onAutoMultiplierChange(value);
    }
  };

  const effectStatus = audioFile ? 'Effect: Ready' : 'Effect: No file loaded';
  const finalSpeed = mode === 'manual' 
    ? manualSpeed 
    : analysisResult ? analysisResult.optimalSpeed * autoMultiplier : 0;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
          <Settings className="w-5 h-5 text-accent-blue mr-3" />
          8D Mode & Settings
        </h3>
        
        {/* Mode Selection */}
        <div className="mb-6">
          <RadioGroup
            value={mode}
            onValueChange={(value: EightDMode) => onModeChange(value)}
            className="flex space-x-8"
            data-testid="mode-selection"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual" className="text-foreground font-medium cursor-pointer">
                Manual Mode
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="automatic" id="automatic" />
              <Label htmlFor="automatic" className="text-foreground font-medium cursor-pointer">
                Automatic Mode
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Mode-specific settings */}
        <div className="border-t border-border pt-6">
          {mode === 'manual' ? (
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Manual Settings</h4>
              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-3">
                    Movement Speed{' '}
                    <span className="text-accent-blue font-bold" data-testid="text-manual-speed">
                      {manualSpeed.toFixed(2)} Hz
                    </span>
                  </Label>
                  <Slider
                    value={[manualSpeed]}
                    onValueChange={([value]) => onManualSpeedChange(value)}
                    min={0.01}
                    max={5}
                    step={0.01}
                    className="slider-thumb"
                    data-testid="slider-manual-speed"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.01 Hz</span>
                    <span>5.0 Hz</span>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Detected BPM:</span>
                    <span className="ml-2 text-accent-blue font-bold" data-testid="text-detected-bpm">
                      {analysisResult ? `${analysisResult.bpm} BPM` : '-- BPM'}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">Base Speed:</span>
                    <span className="ml-2 text-accent-blue font-bold" data-testid="text-optimal-speed">
                      {analysisResult ? `${analysisResult.optimalSpeed.toFixed(2)} Hz` : '-- Hz'}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">Current Speed:</span>
                    <span className="ml-2 text-green-400 font-bold">
                      {manualSpeed.toFixed(2)} Hz
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Automatic Settings</h4>
              
              <div className="space-y-6">
                <div className="text-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!audioFile || isAnalyzing}
                    className="bg-accent-blue hover:bg-accent-blue/80 text-black font-medium"
                    data-testid="button-auto-analyze"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Analyzing...' : 'Auto Analyze'}
                  </Button>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-3">
                    <Music className="w-4 h-4 inline mr-1" />
                    Rhythmic Speed Multiplier{' '}
                    <span className="text-accent-blue font-bold" data-testid="text-auto-multiplier">
                      {autoMultiplier.toFixed(2)}×
                    </span>
                  </Label>
                  <Slider
                    value={[autoMultiplier]}
                    onValueChange={([value]) => handleMultiplierChange(value)}
                    min={0.25}
                    max={3}
                    step={0.05}
                    className="slider-thumb"
                    data-testid="slider-auto-multiplier"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.25×</span>
                    <span>3.0×</span>
                  </div>
                  {rhythmicMultipliers.length > 0 && (
                    <div className="mt-3 p-2 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Rhythmic Values:</div>
                      <div className="flex flex-wrap gap-1">
                        {rhythmicMultipliers.map((mult) => (
                          <button
                            key={mult}
                            onClick={() => onAutoMultiplierChange(mult)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              Math.abs(autoMultiplier - mult) < 0.01
                                ? 'bg-accent-blue text-black font-bold'
                                : 'bg-muted text-muted-foreground hover:bg-accent-blue/20'
                            }`}
                          >
                            {mult.toFixed(2)}×
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Detected BPM:</span>
                    <span className="ml-2 text-accent-blue font-bold" data-testid="text-detected-bpm">
                      {analysisResult ? `${analysisResult.bpm} BPM` : '-- BPM'}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">Base Speed:</span>
                    <span className="ml-2 text-accent-blue font-bold" data-testid="text-optimal-speed">
                      {analysisResult ? `${analysisResult.optimalSpeed.toFixed(2)} Hz` : '-- Hz'}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">Current Speed:</span>
                    <span className="ml-2 text-green-400 font-bold">
                      {analysisResult ? `${(analysisResult.optimalSpeed * autoMultiplier).toFixed(2)} Hz` : '-- Hz'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
