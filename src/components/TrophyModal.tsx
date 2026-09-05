import React from 'react';
import { X, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { Achievement } from '../types';
import { sound } from '../utils/audio';

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  xp: number;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({
  isOpen,
  onClose,
  achievements,
  xp,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const rank =
    unlockedCount >= 6
      ? 'Grand Blockmaster 👑'
      : unlockedCount >= 4
      ? 'Senior Chain Architect ⚡'
      : unlockedCount >= 2
      ? 'Hash Tinkerer 🔧'
      : 'Factory Apprentice 🎒';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black rounded-[32px] p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_#000]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFE66D] border-2 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_#000] rotate-[-2deg]">
              🏆
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A]">
                Factory Trophy Case
              </h2>
              <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider">
                Rank: <strong className="text-black font-black">{rank}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl border-2 border-black hover:bg-[#FF6B6B] hover:text-white shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-colors cursor-pointer text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Banner */}
        <div className="my-4 p-4 rounded-2xl bg-[#FFE66D] border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-black uppercase tracking-widest">Experience Points</div>
            <div className="text-2xl font-black text-black">{xp.toLocaleString()} XP</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-black uppercase tracking-widest">Badges Earned</div>
            <div className="text-2xl font-black text-black">
              {unlockedCount} / {achievements.length}
            </div>
          </div>
        </div>

        {/* Badges List */}
        <div className="space-y-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border-3 transition-all flex items-center gap-3.5 ${
                ach.unlocked
                  ? 'bg-white border-black shadow-[4px_4px_0px_0px_#000]'
                  : 'bg-neutral-100 border-neutral-300 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 shrink-0 ${
                  ach.unlocked
                    ? 'bg-[#4ECDC4] border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-neutral-200 border-neutral-400'
                }`}
              >
                {ach.unlocked ? ach.emoji : '🔒'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black uppercase tracking-tight text-[#1A1A1A]">
                    {ach.title}
                  </h4>
                  {ach.unlocked && (
                    <span className="inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#55E6C1] border border-black text-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
                      <CheckCircle className="w-3 h-3 mr-1" /> Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-700 mt-1 font-semibold">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* All complete certificate preview */}
        {unlockedCount === achievements.length && (
          <div className="mt-5 p-4 rounded-2xl bg-[#55E6C1] border-3 border-black text-center shadow-[4px_4px_0px_0px_#000]">
            <ShieldCheck className="w-8 h-8 text-black mx-auto mb-1" />
            <div className="font-black uppercase tracking-wider text-black text-base">
              🎓 Official Junior Cryptographer Certificate Earned!
            </div>
            <p className="text-xs text-neutral-900 mt-1 font-bold">
              You mastered hashing, asymmetric keys, mempools, proof-of-work mining, and blockchain immutability!
            </p>
          </div>
        )}

        <div className="mt-5 text-center">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-[#F4B740] border-2 border-[#2A2438] font-bold font-display text-sm btn-chunky"
          >
            Back to Laboratory
          </button>
        </div>
      </div>
    </div>
  );
};
