
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer;
  audioContext: AudioContext;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, audioContext }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.onended = null; // Prevent onended from firing on manual stop
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const playAudio = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      pausedTimeRef.current = audioContext.currentTime - startTimeRef.current;
      return;
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    const offset = pausedTimeRef.current % audioBuffer.duration;
    source.start(0, offset);
    
    source.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      pausedTimeRef.current = 0;
      sourceRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    
    sourceRef.current = source;
    startTimeRef.current = audioContext.currentTime - offset;
    setIsPlaying(true);

    const updateProgress = () => {
      if (sourceRef.current) {
        const elapsedTime = audioContext.currentTime - startTimeRef.current;
        setProgress((elapsedTime / audioBuffer.duration) * 100);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateProgress);

  }, [audioBuffer, audioContext, isPlaying, stopAudio]);

  useEffect(() => {
    // Cleanup on component unmount or when audioBuffer changes
    return () => {
      stopAudio();
    };
  }, [audioBuffer, stopAudio]);

  return (
    <div className="flex items-center w-full bg-gray-900/50 p-4 rounded-lg border border-gray-700">
      <button
        onClick={playAudio}
        className="flex-shrink-0 w-12 h-12 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-transform duration-200 transform active:scale-90"
      >
        <i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'} text-xl`}></i>
      </button>
      <div className="flex-grow mx-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-cyan-500 h-2 rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          ></div>
        </div>
      </div>
       <div className="text-xs text-gray-400 font-mono">
        {audioBuffer.duration.toFixed(2)}s
      </div>
    </div>
  );
};
