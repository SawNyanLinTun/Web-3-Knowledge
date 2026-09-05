import React from 'react';
import { StationId, StationMeta } from '../types';
import { sound } from '../utils/audio';
import { CheckCircle2, ArrowRight, Sparkles, Award } from 'lucide-react';
import { CharacterHelper } from './CharacterHelper';

interface MapOverviewProps {
  onSelectStation: (id: StationId) => void;
  completedStations: Set<number>;
  stations: StationMeta[];
  xp: number;
}

export const MapOverview: React.FC<MapOverviewProps> = ({
  onSelectStation,
  completedStations,
  stations,
  xp,
}) => {
  const allComplete = stations.every((s) => completedStations.has(s.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-black text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-3 shadow-[3px_3px_0px_0px_#000]">
          <div className="w-2.5 h-2.5 bg-[#4ECDC4] rounded-full animate-ping"></div>
          PLANET CRYPTO • MIDDLE SCHOOL LAB
        </div>
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-[#1A1A1A]">
          WELCOME TO THE BLOCK FACTORY!
        </h2>
        <p className="text-[#1A1A1A] text-sm sm:text-base max-w-xl mx-auto mt-2 font-medium leading-relaxed">
          Five interactive stations with tactile sliders, real-time cryptography physics, and hands-on challenges.
          Poke, blend, mine, and chain blocks together to discover how crypto really works!
        </p>
      </div>

      <CharacterHelper
        message={
          allComplete
            ? "CONGRATULATIONS! You have mastered all 5 factory stations and earned the Grand Blockmaster rank! You can revisit any station to experiment with the sliders anytime!"
            : completedStations.size === 0
            ? "Ready to explore? Start with Station 1: The Magic Blender to see how digital fingerprints work!"
            : `Awesome progress! You've cleared ${completedStations.size} of 5 stations. Next up: dive into the next station on the factory floor!`
        }
        mood={allComplete ? 'celebrating' : 'happy'}
      />

      {/* 5 Stations Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {stations.map((st) => {
          const isDone = completedStations.has(st.id);
          const badgeColors = [
            'bg-[#4ECDC4]',
            'bg-[#FFE66D]',
            'bg-[#55E6C1]',
            'bg-[#FF6B6B]',
            'bg-[#A29BFE]',
          ];
          const cardBg = badgeColors[(st.id - 1) % badgeColors.length];

          return (
            <div
              key={st.id}
              onClick={() => {
                sound.playClick();
                onSelectStation(st.id);
              }}
              className={`group cursor-pointer bg-white border-4 border-black rounded-[32px] p-5 shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#000] hover:-translate-y-1 transition-all flex flex-col justify-between relative ${
                isDone ? 'ring-2 ring-[#4ECDC4]' : ''
              }`}
            >
              {/* Top Station Number & Concept Tag */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    0{st.id}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-black text-[#1A1A1A] shadow-[2px_2px_0px_0px_#000] ${cardBg}`}
                  >
                    {st.concept}
                  </span>
                </div>

                {/* Big Station Emoji */}
                <div className={`w-20 h-20 rounded-2xl ${cardBg} border-3 border-black flex items-center justify-center text-4xl mx-auto my-3 shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-transform`}>
                  {st.glyph}
                </div>

                <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A] text-center mt-2">
                  {st.title}
                </h3>
                <p className="text-xs text-neutral-600 text-center mt-1.5 font-medium leading-normal">
                  {st.tagline}
                </p>
              </div>

              {/* Bottom Card Action / Status */}
              <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-between">
                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Cleared!
                  </span>
                ) : (
                  <span className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Ready to Play
                  </span>
                )}

                <div className="p-2 rounded-xl bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_0px_#000] group-hover:bg-[#FF6B6B] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-black group-hover:text-white" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Bonus All-Station Trophy Box */}
        <div
          className={`bg-[#FFE66D] border-4 border-black rounded-[32px] p-5 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between text-center ${
            allComplete ? 'ring-4 ring-black' : ''
          }`}
        >
          <div>
            <div className="w-20 h-20 rounded-2xl bg-white border-3 border-black flex items-center justify-center text-4xl mx-auto mb-3 shadow-[4px_4px_0px_0px_#000] rotate-3">
              🏆
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A]">
              Grand Certificate
            </h3>
            <p className="text-xs text-neutral-800 mt-1.5 font-medium leading-relaxed">
              Complete all 5 stations to earn the official Junior Cryptographer diploma!
            </p>
          </div>

          <div className="mt-5 pt-3 border-t-2 border-black">
            <div className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
              {completedStations.size} of 5 Stations Cleared
            </div>
            <div className="w-full h-3 bg-white rounded-full border-2 border-black overflow-hidden mt-2 shadow-[2px_2px_0px_0px_#000]">
              <div
                className="h-full bg-[#4ECDC4] transition-all duration-300"
                style={{ width: `${(completedStations.size / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
