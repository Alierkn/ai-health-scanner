'use client';

import { motion } from 'framer-motion';

interface ControlsProps {
  model: string;
  setModel: (model: string) => void;
  autoVoice: boolean;
  setAutoVoice: (enabled: boolean) => void;
  onStartScanning: () => void;
  onStopScanning: () => void;
  isScanning: boolean;
}

const models = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-vision-preview', label: 'GPT-4 Vision' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
];

export default function Controls({
  model,
  setModel,
  autoVoice,
  setAutoVoice,
  onStartScanning,
  onStopScanning,
  isScanning
}: ControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-4 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isScanning}
        >
          {models.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Auto Voice
        </label>
        <button
          onClick={() => setAutoVoice(!autoVoice)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoVoice ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoVoice ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={isScanning ? onStopScanning : onStartScanning}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isScanning
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
      </motion.button>
    </motion.div>
  );
}
