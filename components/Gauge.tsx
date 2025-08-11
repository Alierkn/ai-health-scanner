'use client';

import { motion } from 'framer-motion';

interface GaugeProps {
  score: number;
}

export default function Gauge({ score }: GaugeProps) {
  const percentage = (score / 10) * 100;
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGaugeColor = (score: number) => {
    if (score >= 8) return 'stroke-green-500';
    if (score >= 6) return 'stroke-yellow-500';
    if (score >= 4) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 mb-4">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={getGaugeColor(score)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeDasharray="1"
            strokeDashoffset="1"
            style={{
              pathLength: percentage / 100
            }}
          />
          {/* Needle */}
          <motion.line
            x1="100"
            y1="80"
            x2="100"
            y2="20"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ transformOrigin: "100px 80px" }}
          />
          {/* Center dot */}
          <circle cx="100" cy="80" r="4" fill="#374151" />
        </svg>
        
        {/* Score labels */}
        <div className="absolute bottom-0 left-0 text-xs text-gray-500">1</div>
        <div className="absolute bottom-0 right-0 text-xs text-gray-500">10</div>
      </div>
      
      {/* Score display */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className={`text-4xl font-bold ${getScoreColor(score)}`}
      >
        {score}/10
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-gray-600 mt-2 text-center"
      >
        Health Score
      </motion.p>
    </div>
  );
}
