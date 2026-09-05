import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, ChevronRight, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface CharacterHelperProps {
  message: string;
  mood?: 'happy' | 'thinking' | 'surprised' | 'warning' | 'celebrating';
  onDismiss?: () => void;
}

export const CharacterHelper: React.FC<CharacterHelperProps> = ({
  message,
  mood = 'happy',
  onDismiss,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const getRobotFace = () => {
    switch (mood) {
      case 'surprised':
        return '😲';
      case 'thinking':
        return '🤔';
      case 'warning':
        return '⚠️';
      case 'celebrating':
        return '🥳';
      case 'happy':
      default:
        return '🤖';
    }
  };

  const getBgColor = () => {
    switch (mood) {
      case 'warning':
        return 'bg-rose-100 border-black';
      case 'celebrating':
        return 'bg-[#FFE66D] border-black';
      default:
        return 'bg-white border-black';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-3 px-2">
      <AnimatePresence>
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`border-4 rounded-[28px] p-3.5 sm:p-4 shadow-[6px_6px_0px_0px_#000] flex items-start gap-3 relative transition-colors ${getBgColor()}`}
          >
            {/* Robot Avatar */}
            <motion.div
              animate={
                mood === 'celebrating'
                  ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }
                  : { y: [0, -3, 0] }
              }
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-12 h-12 rounded-2xl bg-[#FFE66D] border-3 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_#000] shrink-0"
            >
              {getRobotFace()}
            </motion.div>

            {/* Speech Bubble */}
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                <span>Blocky the Factory Bot</span>
                <span className="w-2 h-2 rounded-full bg-[#4ECDC4] border border-black animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-800 mt-1 leading-relaxed font-bold">
                {message}
              </p>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setCollapsed(true);
                if (onDismiss) onDismiss();
              }}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-xl border border-black/20 hover:bg-black/10 text-black cursor-pointer"
              title="Minimize Blocky"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              sound.playClick();
              setCollapsed(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4ECDC4] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-black uppercase tracking-wider text-[#1A1A1A] hover:bg-[#FFE66D] cursor-pointer"
          >
            <span>🤖 Need a hint? Ask Blocky!</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
