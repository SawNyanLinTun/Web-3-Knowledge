import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AhaContent } from '../types';
import { sound } from '../utils/audio';
import { Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';

interface AhaModalProps {
  content: AhaContent | null;
  onClose: () => void;
}

export const AhaModal: React.FC<AhaModalProps> = ({ content, onClose }) => {
  useEffect(() => {
    if (content) {
      sound.playFanfare();
      // Burst celebratory confetti
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4D8AFF', '#FF5FA2', '#22B8A6', '#F4B740', '#8F6BFF'],
      });
    }
  }, [content]);

  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black rounded-[32px] p-6 sm:p-8 max-w-lg w-full text-center shadow-[12px_12px_0px_0px_#000] transform animate-in zoom-in-95 duration-300 relative">
        {/* Floating badge */}
        <div className="w-22 h-22 rounded-2xl bg-[#FFE66D] border-4 border-black flex items-center justify-center text-5xl mx-auto -mt-16 shadow-[6px_6px_0px_0px_#000] rotate-[-4deg]">
          {content.badge}
        </div>

        {/* XP Reward Pill */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#4ECDC4] border-2 border-black text-black text-xs font-black uppercase tracking-wider mt-4 shadow-[3px_3px_0px_0px_#000]">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          +{content.xpEarned} XP Unlocked!
        </div>

        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1A1A1A] mt-3 mb-2 leading-snug">
          {content.title}
        </h3>

        <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-4 font-medium">
          {content.text}
        </p>

        {/* Middle School Fact Box */}
        <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 text-left mb-5 shadow-[4px_4px_0px_0px_#000] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#FFE66D] border-2 border-black text-black shrink-0 mt-0.5 shadow-[2px_2px_0px_0px_#000]">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-black uppercase tracking-wider">
              Fun Middle School Fact:
            </div>
            <p className="text-xs text-neutral-800 mt-1 font-semibold leading-normal">
              {content.middleSchoolFact}
            </p>
          </div>
        </div>

        {/* Real Term Tag */}
        <div className="inline-block px-4 py-2 rounded-full bg-black text-white font-black uppercase text-xs tracking-wider mb-6 shadow-[3px_3px_0px_0px_#000]">
          {content.term}
        </div>

        <div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FF6B6B] hover:bg-[#FFE66D] text-white hover:text-black border-3 border-black font-black uppercase text-sm tracking-wider shadow-[5px_5px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Awesome! Continue
          </button>
        </div>
      </div>
    </div>
  );
};
