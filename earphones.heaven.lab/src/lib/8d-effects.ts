export interface EightDConfig {
  speed: number;
  intensity: number;
  radius: number;
}

export class EightDProcessor {
  private audioContext: AudioContext;
  private source: MediaElementAudioSourceNode;
  private pannerNodes: PannerNode[] = [];
  private gainNode!: GainNode;
  private analyserNode!: AnalyserNode;
  private isActive: boolean = false;
  private animationId: number | null = null;
  private angle: number = 0;
  private config: EightDConfig;

  constructor(audioContext: AudioContext, source: MediaElementAudioSourceNode) {
    this.audioContext = audioContext;
    this.source = source;
    this.config = {
      speed: 2.5,
      intensity: 1.0,
      radius: 5.0,
    };

    this.setupNodes();
  }

  private setupNodes() {
    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);

    // Create analyser node for visualization
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.3;

    // Create single panner for true 8D circular movement
    const panner = this.audioContext.createPanner();
    
    // Configure for maximum 8D effect
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'linear';
    panner.refDistance = 1;
    panner.maxDistance = 10;
    panner.rolloffFactor = 1;
    
    // Wide cone for immersive effect
    panner.coneInnerAngle = 180;
    panner.coneOuterAngle = 360;
    panner.coneOuterGain = 0.8;
    
    // Start position (right side)
    panner.positionX.setValueAtTime(3, this.audioContext.currentTime);
    panner.positionY.setValueAtTime(0, this.audioContext.currentTime);
    panner.positionZ.setValueAtTime(0, this.audioContext.currentTime);
    
    this.pannerNodes.push(panner);

    this.connectNodes();
  }

  private connectNodes() {
    // Disconnect any previous connections
    try {
      this.source.disconnect();
    } catch (e) {
      // Ignore if not connected
    }

    // Simple direct connection for clear 8D effect
    // Connect: source -> gain -> analyser -> panner -> destination
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    
    // Connect to the single panner for true 8D circular movement
    this.analyserNode.connect(this.pannerNodes[0]);
    this.pannerNodes[0].connect(this.audioContext.destination);
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.animate();
  }

  stop() {
    this.isActive = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Reset panner position to center front
    if (this.pannerNodes.length > 0) {
      const panner = this.pannerNodes[0];
      panner.positionX.setValueAtTime(0, this.audioContext.currentTime);
      panner.positionY.setValueAtTime(0, this.audioContext.currentTime);
      panner.positionZ.setValueAtTime(-1, this.audioContext.currentTime);
    }
  }

  private animate() {
    if (!this.isActive) return;

    const now = this.audioContext.currentTime;
    // Increase speed for more noticeable 8D effect
    this.angle += this.config.speed * 0.05;

    const panner = this.pannerNodes[0];
    
    // Create perfect circular motion around the listener's head
    const radius = this.config.radius * this.config.intensity;
    
    // Classic 8D movement: horizontal circle around the head
    const x = Math.cos(this.angle) * radius;
    const z = Math.sin(this.angle) * radius;
    const y = 0; // Keep on horizontal plane for classic 8D effect
    
    // Immediate position updates for sharp 8D movement
    panner.positionX.setValueAtTime(x, now);
    panner.positionY.setValueAtTime(y, now);
    panner.positionZ.setValueAtTime(z, now);
    
    // Set listener position at center (head)
    try {
      const listener = this.audioContext.listener;
      if (listener.positionX) {
        listener.positionX.setValueAtTime(0, now);
        listener.positionY.setValueAtTime(0, now);
        listener.positionZ.setValueAtTime(0, now);
      }
      
      // Keep listener facing forward for consistent 8D experience
      if (listener.forwardX) {
        listener.forwardX.setValueAtTime(0, now);
        listener.forwardY.setValueAtTime(0, now);
        listener.forwardZ.setValueAtTime(-1, now);
        listener.upX.setValueAtTime(0, now);
        listener.upY.setValueAtTime(1, now);
        listener.upZ.setValueAtTime(0, now);
      }
    } catch (e) {
      // Fallback for older browsers
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateConfig(config: Partial<EightDConfig>) {
    this.config = { ...this.config, ...config };
  }

  getAnalyserData(): Uint8Array {
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  setVolume(volume: number) {
    this.gainNode.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.audioContext.currentTime
    );
  }

  destroy() {
    this.stop();
    this.pannerNodes.forEach(panner => panner.disconnect());
    this.gainNode.disconnect();
    this.analyserNode.disconnect();
  }
}
