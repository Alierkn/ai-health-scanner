'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatusPill from '@/components/StatusPill';
import Gauge from '@/components/Gauge';
import ProsConsCard from '@/components/ProsConsCard';
import Controls from '@/components/Controls';
import { initializeCamera, captureFrame, stopCamera } from '@/lib/camera';
import { speakScore, cancelSpeech } from '@/lib/speech';
import type { HealthAnalysis } from '@/lib/parseJson';

type Status = 'idle' | 'requesting' | 'analyzing' | 'live';

export default function Home() {
  const [status, setStatus] = useState<Status>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analysis, setAnalysis] = useState<HealthAnalysis>({
    score: 5,
    pros: ['Point camera at food product'],
    cons: ['Analysis will appear here']
  });
  const [model, setModel] = useState('gpt-4o');
  const [autoVoice, setAutoVoice] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScanning = async () => {
    try {
      setStatus('requesting');
      setError(null);
      
      const mediaStream = await initializeCamera();
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        
        await videoRef.current.play();
        
        setStatus('live');
        setIsScanning(true);
        
        // Start capturing frames every 2.5 seconds
        intervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            await analyzeFrame();
          }
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to start scanning:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setStatus('idle');
    }
  };

  const stopScanning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (stream) {
      stopCamera(stream);
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    cancelSpeech();
    setStatus('idle');
    setIsScanning(false);
    setError(null);
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || status === 'analyzing') return;
    
    try {
      setStatus('analyzing');
      
      const dataUrl = captureFrame(videoRef.current);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataUrl, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const newAnalysis: HealthAnalysis = await response.json();
      
      // Speak score if it changed and auto voice is enabled
      if (newAnalysis.score !== analysis.score) {
        speakScore(newAnalysis.score, autoVoice);
      }
      
      setAnalysis(newAnalysis);
      setStatus('live');
      setError(null);
      
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStatus('live');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (stream) {
        stopCamera(stream);
      }
      cancelSpeech();
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Health Scanner
          </h1>
          <p className="text-gray-600">
            Point your camera at food products for instant health analysis
          </p>
        </motion.div>

        {/* Status */}
        <div className="flex justify-center mb-6">
          <StatusPill status={status} />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black rounded-lg overflow-hidden aspect-video relative"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay={false}
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-lg">Camera feed will appear here</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Controls and Analysis */}
          <div className="space-y-6">
            {/* Controls */}
            <Controls
              model={model}
              setModel={setModel}
              autoVoice={autoVoice}
              setAutoVoice={setAutoVoice}
              onStartScanning={startScanning}
              onStopScanning={stopScanning}
              isScanning={isScanning}
            />

            {/* Gauge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <Gauge score={analysis.score} />
            </motion.div>
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ProsConsCard
            title="Pros"
            items={analysis.pros}
            type="pros"
          />
          <ProsConsCard
            title="Cons"
            items={analysis.cons}
            type="cons"
          />
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>Powered by OpenAI Vision API • PWA Ready</p>
          <p className="mt-1">Add to home screen for the best experience</p>
        </motion.div>
      </div>
    </div>
  );
}
