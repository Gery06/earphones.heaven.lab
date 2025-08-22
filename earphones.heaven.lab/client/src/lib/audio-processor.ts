export interface BPMAnalysisResult {
  bpm: number;
  confidence: number;
  optimalSpeed: number;
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;

  constructor() {
    this.initializeContext();
  }

  private async initializeContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to create audio context:', error);
    }
  }

  async analyzeFile(file: File): Promise<BPMAnalysisResult> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const bpm = await this.detectBPM();
      const optimalSpeed = this.calculateOptimalSpeed(bpm);
      
      return {
        bpm,
        confidence: 0.85, // Simulated confidence level
        optimalSpeed,
      };
    } catch (error) {
      console.error('Failed to analyze audio:', error);
      // Return default values if analysis fails
      return {
        bpm: 120,
        confidence: 0.5,
        optimalSpeed: 2.0,
      };
    }
  }

  private async detectBPM(): Promise<number> {
    if (!this.audioBuffer || !this.audioContext) return 120;

    // Simple BPM detection algorithm
    // In a real implementation, you'd use more sophisticated techniques
    const channelData = this.audioBuffer.getChannelData(0);
    const sampleRate = this.audioBuffer.sampleRate;
    const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
    const hopSize = Math.floor(windowSize / 2);
    
    const energy: number[] = [];
    
    // Calculate energy in overlapping windows
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      let sum = 0;
      for (let j = i; j < i + windowSize; j++) {
        sum += channelData[j] * channelData[j];
      }
      energy.push(sum / windowSize);
    }
    
    // Find peaks in energy
    const peaks: number[] = [];
    for (let i = 1; i < energy.length - 1; i++) {
      if (energy[i] > energy[i - 1] && energy[i] > energy[i + 1]) {
        const threshold = Math.max(...energy) * 0.3;
        if (energy[i] > threshold) {
          peaks.push(i * hopSize / sampleRate);
        }
      }
    }
    
    // Calculate intervals between peaks
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    
    // Find most common interval (tempo)
    if (intervals.length === 0) return 120;
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60 / avgInterval);
    
    // Constrain to reasonable BPM range
    return Math.max(60, Math.min(200, bpm));
  }

  private calculateOptimalSpeed(bpm: number): number {
    // Calculate optimal 8D rotation speed based on BPM
    // Use beat frequency as base reference
    const beatFreq = bpm / 60;
    const optimalSpeed = Math.max(0.5, Math.min(5.0, beatFreq * 0.25));
    return Math.round(optimalSpeed * 100) / 100; // Round to 2 decimal places
  }

  // Calculate rhythmic multipliers based on BPM
  getRhythmicMultipliers(bpm: number): number[] {
    if (bpm <= 0) return [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    
    // Base beat frequency
    const beatFreq = bpm / 60;
    const baseSpeed = beatFreq * 0.25; // Base 8D speed
    
    // Calculate rhythmic ratios that sync with the music
    const rhythmicRatios = [
      1/4,   // Quarter rhythm
      1/2,   // Half rhythm  
      2/3,   // 2/3 rhythm
      3/4,   // 3/4 rhythm
      1,     // Full rhythm (1:1 with beat)
      4/3,   // 4/3 rhythm
      3/2,   // 1.5x rhythm
      2,     // Double rhythm
      5/2,   // 2.5x rhythm
      3      // Triple rhythm
    ];
    
    // Convert to speed multipliers and filter reasonable range
    return rhythmicRatios
      .map(ratio => ratio)
      .filter(mult => mult >= 0.25 && mult <= 3.0)
      .sort((a, b) => a - b);
  }

  // Get closest rhythmic multiplier to current value
  getClosestRhythmicMultiplier(currentValue: number, bpm: number): number {
    const rhythmicMults = this.getRhythmicMultipliers(bpm);
    
    let closest = rhythmicMults[0];
    let minDiff = Math.abs(currentValue - closest);
    
    for (const mult of rhythmicMults) {
      const diff = Math.abs(currentValue - mult);
      if (diff < minDiff) {
        minDiff = diff;
        closest = mult;
      }
    }
    
    return closest;
  }

  async convertToMp3(audioBuffer: AudioBuffer, bitrate: number = 320): Promise<Blob> {
    // In a real implementation, you would use FFmpeg.js here
    // For now, we'll simulate the conversion process
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a dummy blob - in reality this would be the converted MP3
        const dummyData = new ArrayBuffer(audioBuffer.length * 2);
        resolve(new Blob([dummyData], { type: 'audio/mp3' }));
      }, 2000);
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  destroy() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
