import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export interface AudioFile {
  file: File;
  url: string;
  name: string;
  format: string;
  sampleRate?: number;
  bitrate?: string;
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
    error: null,
  });

  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        setAudioState(prev => ({ ...prev, error: 'Failed to initialize audio system' }));
      }
    }
  }, []);

  const loadAudioFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const format = file.type.split('/')[1] || file.name.split('.').pop() || 'unknown';
    
    setAudioFile({
      file,
      url,
      name: file.name,
      format: format.toUpperCase(),
    });

    if (audioRef.current) {
      audioRef.current.src = url;
      setAudioState(prev => ({ ...prev, isLoading: true, error: null }));
    }
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await audioRef.current.play();
      setAudioState(prev => ({ ...prev, isPlaying: true, error: null }));
    } catch (error) {
      console.error('Play failed:', error);
      setAudioState(prev => ({ ...prev, error: 'Playback failed' }));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (audioState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [audioState.isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = time;
      setAudioState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      setAudioState(prev => ({ ...prev, volume }));
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setAudioState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        isLoading: false,
      }));
      
      if (audioFile) {
        setAudioFile(prev => prev ? {
          ...prev,
          sampleRate: 44100, // Default, would need Web Audio API to detect actual
          bitrate: '320 kbps', // Default, would need file analysis
        } : null);
      }
    };

    const handleTimeUpdate = () => {
      setAudioState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleEnded = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    const handleError = () => {
      setAudioState(prev => ({ ...prev, error: 'Failed to load audio file', isLoading: false }));
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioFile]);

  return {
    audioRef,
    audioContextRef,
    sourceRef,
    audioState,
    audioFile,
    loadAudioFile,
    play,
    pause,
    togglePlay,
    seekTo,
    setVolume,
    initializeAudioContext,
  };
}
