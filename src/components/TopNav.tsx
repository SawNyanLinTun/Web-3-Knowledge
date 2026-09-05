import React from 'react';
import { Volume2, VolumeX, Award, RotateCcw } from 'lucide-react';
import { StationId } from '../types';
import { sound } from '../utils/audio';

interface TopNavProps {
  currentStation: StationId;
  onSelectStation: (id: StationId) => void;
  completedStations: Set<number>;
  xp: number;
  onOpenTrophies: () => void;
  onResetProgress: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentStation,
  onSelectStation,
  completedStations,
  xp,
  onOpenTrophies,
  onResetProgress,
}) => {
  const [muted, setMuted] = React.useState(sound.isMuted());

  const handleToggleMute = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const stations = [
    { id: 1, label: '1', title: 'Magic Blender (Hash)' },
    { id: 2, label: '2', title: 'Two Keys (Wallets)' },
    { id: 3, label: '3', title: 'Assembly Line (Mempool)' },
    { id: 4, label: '4', title: 'Slot Machine (Mining)' },
    { id: 5, label: '5', title: 'Glass Tower (Chain)' },
  ];

  // Level calculation: 100 XP per level
  const currentLevel = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F2] border-b-4 border-black px-3 sm:px-6 py-2.5 shadow-[0_4px_0_0_#000]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        {/* Brand & Simulation Live Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onSelectStation('map');
            }}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="bg-[#FF6B6B] border-3 sm:border-4 border-black px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-[4px_4px_0px_0px_#000] rotate-[-2deg] group-hover:rotate-0 transition-transform">
              <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-1.5">
                <span>🧊</span> THE BLOCK FACTORY
              </h1>
            </div>
          </button>

          <div className="bg-white border-2 border-black px-3 py-1 rounded-full hidden md:flex items-center gap-2 shadow-[3px_3px_0px_0px_#000]">
            <div className="w-2.5 h-2.5 bg-[#55E6C1] border border-black rounded-full animate-pulse"></div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#1A1A1A]">Simulation Live</span>
          </div>
        </div>

        {/* Station Navigation Dots */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onSelectStation('map');
            }}
            className={`px-3 py-1 rounded-xl border-2 border-black text-xs font-black uppercase tracking-wider transition-all ${
              currentStation === 'map'
                ? 'bg-[#FFE66D] text-black shadow-[3px_3px_0px_0px_#000]'
                : 'bg-white hover:bg-[#FFEBD1] text-black shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            🗺️ Map
          </button>

          {stations.map((st) => {
            const isDone = completedStations.has(st.id);
            const isCurrent = currentStation === st.id;
            return (
              <button
                key={st.id}
                title={st.title}
                onClick={() => {
                  sound.playClick();
                  onSelectStation(st.id as StationId);
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-black flex items-center justify-center text-xs sm:text-sm font-black transition-all ${
                  isCurrent
                    ? 'bg-[#FF6B6B] text-white shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                    : isDone
                    ? 'bg-[#4ECDC4] text-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white hover:bg-amber-50 text-black shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                {isDone ? '✓' : st.label}
              </button>
            );
          })}
        </div>

        {/* Right stats & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* EXP Points Box */}
          <div
            onClick={onOpenTrophies}
            className="cursor-pointer bg-[#4ECDC4] border-3 sm:border-4 border-black px-3 sm:px-4 py-1 rounded-2xl shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] flex flex-col items-center hover:-translate-y-0.5 transition-transform"
            title="Click to view Trophies & Achievements"
          >
            <span className="text-[9px] font-black uppercase text-black leading-none">EXP Points</span>
            <span className="text-sm sm:text-lg font-black text-black leading-tight">{xp.toLocaleString()}</span>
          </div>

          {/* Rank Box */}
          <div
            onClick={onOpenTrophies}
            className="cursor-pointer bg-[#FFE66D] border-3 sm:border-4 border-black px-3 sm:px-4 py-1 rounded-2xl shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] hidden sm:flex flex-col items-center hover:-translate-y-0.5 transition-transform"
            title="Click to view Rank & Badges"
          >
            <span className="text-[9px] font-black uppercase text-black leading-none">Rank</span>
            <span className="text-sm sm:text-base font-black text-black leading-tight">LV.{currentLevel}</span>
          </div>

          {/* Trophy button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTrophies();
            }}
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#FFE66D] shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all text-black"
            title="Badges & Trophies"
          >
            <Award className="w-4 h-4 text-black" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#4ECDC4] shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all text-black"
            title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-black" />}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('Reset your factory lab progress and badges?')) {
                onResetProgress();
              }
            }}
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#FF6B6B] hover:text-white shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all text-gray-500"
            title="Reset Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
