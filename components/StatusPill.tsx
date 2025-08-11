'use client';

import { motion } from 'framer-motion';

interface StatusPillProps {
  status: 'idle' | 'requesting' | 'analyzing' | 'live';
}

const statusConfig = {
  idle: { text: 'Ready to scan', color: 'bg-gray-500' },
  requesting: { text: 'Requesting camera...', color: 'bg-yellow-500' },
  analyzing: { text: 'Analyzing...', color: 'bg-blue-500' },
  live: { text: 'Live', color: 'bg-green-500' }
};

export default function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium ${config.color}`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-2 h-2 bg-white rounded-full mr-2"
      />
      {config.text}
    </motion.div>
  );
}
