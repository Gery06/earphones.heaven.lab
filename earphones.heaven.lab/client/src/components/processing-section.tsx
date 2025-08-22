import { useState } from 'react';
import { Download, Clock, CheckCircle, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AudioProcessor } from '@/lib/audio-processor';

interface ProcessingSectionProps {
  audioFile: File | null;
  eightDSpeed: number;
  isEffectActive: boolean;
}

export default function ProcessingSection({ 
  audioFile, 
  eightDSpeed, 
  isEffectActive 
}: ProcessingSectionProps) {
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [quality, setQuality] = useState('320');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      const processor = new AudioProcessor();
      
      // Simulate processing steps
      const steps = [
        { progress: 20, message: 'Loading audio file...' },
        { progress: 40, message: 'Applying 8D effects...' },
        { progress: 60, message: 'Processing spatial audio...' },
        { progress: 80, message: 'Converting format...' },
        { progress: 100, message: 'Finalizing...' }
      ];

      for (const step of steps) {
        setProcessingProgress(step.progress);
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // In a real implementation, this would process the audio with 8D effects
      // For now, we'll create a dummy blob
      const processedBlob = new Blob([audioFile], { type: `audio/${outputFormat}` });
      const url = URL.createObjectURL(processedBlob);
      setDownloadUrl(url);
      setIsReady(true);
      
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !audioFile) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${audioFile.name.replace(/\.[^/.]+$/, '')}_8D.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const effectAppliedStatus = isEffectActive ? 'Applied' : 'Ready';
  const fileReadyStatus = isReady ? 'Ready' : (isProcessing ? 'Processing' : 'Waiting');

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center text-foreground">
          <Download className="w-5 h-5 text-accent-blue mr-3" />
          Export & Download
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-foreground">Output Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Output Format</label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="bg-background border-border text-foreground" data-testid="select-output-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3 (Recommended)</SelectItem>
                    <SelectItem value="wav">WAV (Lossless)</SelectItem>
                    <SelectItem value="m4a">M4A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Quality</label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="bg-background border-border text-foreground" data-testid="select-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="320">320 kbps (High)</SelectItem>
                    <SelectItem value="256">256 kbps</SelectItem>
                    <SelectItem value="192">192 kbps (Standard)</SelectItem>
                    <SelectItem value="128">128 kbps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-foreground">Processing Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">8D Effect:</span>
                <span className="text-green-400 flex items-center" data-testid="text-effect-applied-status">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {effectAppliedStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">File Ready:</span>
                <span className={`flex items-center ${isReady ? 'text-green-400' : 'text-muted-foreground'}`} data-testid="text-file-ready-status">
                  {isReady ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  {fileReadyStatus}
                </span>
              </div>
              <Progress 
                value={processingProgress} 
                className="w-full"
                data-testid="progress-processing"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          {!isReady ? (
            <Button
              onClick={handleProcess}
              disabled={!audioFile || isProcessing}
              className="bg-accent-blue hover:bg-accent-blue/80 text-black font-semibold px-8 py-3 transition-all transform hover:scale-105 glow-effect"
              data-testid="button-process"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              {isProcessing ? 'Processing...' : 'Process & Download 8D Audio'}
            </Button>
          ) : (
            <Button
              onClick={handleDownload}
              className="bg-accent-blue hover:bg-accent-blue/80 text-black font-semibold px-8 py-3 transition-all transform hover:scale-105 glow-effect"
              data-testid="button-download"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
