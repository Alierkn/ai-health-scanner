'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ProsConsCardProps {
  title: string;
  items: string[];
  type: 'pros' | 'cons';
}

export default function ProsConsCard({ title, items, type }: ProsConsCardProps) {
  const isPositive = type === 'pros';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${
        isPositive ? 'border-green-500' : 'border-red-500'
      }`}
    >
      <h3 className={`font-semibold text-lg mb-3 ${
        isPositive ? 'text-green-700' : 'text-red-700'
      }`}>
        {title}
      </h3>
      
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start mb-2 last:mb-0"
          >
            <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
              isPositive ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-sm italic"
        >
          No {type} available
        </motion.div>
      )}
    </motion.div>
  );
}
