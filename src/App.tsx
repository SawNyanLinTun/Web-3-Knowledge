import React, { useState, useEffect } from 'react';
import { StationId, StationMeta, Achievement, AhaContent } from './types';
import { TopNav } from './components/TopNav';
import { MapOverview } from './components/MapOverview';
import { AhaModal } from './components/AhaModal';
import { TrophyModal } from './components/TrophyModal';
import { BlenderStation } from './components/stations/BlenderStation';
import { TwoKeysStation } from './components/stations/TwoKeysStation';
import { AssemblyLineStation } from './components/stations/AssemblyLineStation';
import { SlotMachineStation } from './components/stations/SlotMachineStation';
import { GlassTowerStation } from './components/stations/GlassTowerStation';

const STATIONS: StationMeta[] = [
  {
    id: 1,
    glyph: '🌀',
    title: 'The Magic Blender',
    concept: 'Hashing',
    tagline: 'Blend fruits into digital fingerprints and trigger the avalanche effect!',
    accentColor: '#4D8AFF',
    badgeName: 'Master Alchemist',
    badgeEmoji: '🌀',
  },
  {
    id: 2,
    glyph: '📮',
    title: 'The Two Keys',
    concept: 'Wallets & Keys',
    tagline: 'Public drop slot vs. private vault key. Crack passwords with math!',
    accentColor: '#F4B740',
    badgeName: 'Vault Sentinel',
    badgeEmoji: '🔑',
  },
  {
    id: 3,
    glyph: '🏭',
    title: 'The Assembly Line',
    concept: 'Mempool & Fees',
    tagline: 'Pack 1 MB blocks with the highest-paying transactions before the clock runs out!',
    accentColor: '#22B8A6',
    badgeName: 'Master Dispatcher',
    badgeEmoji: '🏭',
  },
  {
    id: 4,
    glyph: '🎰',
    title: 'The Slot Machine',
    concept: 'Proof of Work',
    tagline: 'Upgrade hardware, burn energy, and guess nonces to seal the golden block!',
    accentColor: '#FF5D5D',
    badgeName: 'Golden Pickaxe',
    badgeEmoji: '⛏️',
  },
  {
    id: 5,
    glyph: '🗼',
    title: 'The Glass Tower',
    concept: 'Blockchain & Consensus',
    tagline: 'Chain blocks with light. Watch what happens when a thief alters the past!',
    accentColor: '#6C63FF',
    badgeName: 'Chain Guardian',
    badgeEmoji: '🗼',
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Master Alchemist',
    description: 'Blended inputs and discovered the one-way avalanche effect in Station 1.',
    emoji: '🌀',
    stationId: 1,
    unlocked: false,
  },
  {
    id: 'ach-2',
    title: 'Vault Sentinel',
    description: 'Unlocked Bob’s 256-bit vault using the secret private key in Station 2.',
    emoji: '🔑',
    stationId: 2,
    unlocked: false,
  },
  {
    id: 'ach-3',
    title: 'Master Dispatcher',
    description: 'Packed high-fee transactions into a 1 MB block on the Mempool line in Station 3.',
    emoji: '🏭',
    stationId: 3,
    unlocked: false,
  },
  {
    id: 'ach-4',
    title: 'Golden Pickaxe',
    description: 'Solved the Proof-of-Work difficulty target and mined a block in Station 4.',
    emoji: '⛏️',
    stationId: 4,
    unlocked: false,
  },
  {
    id: 'ach-5',
    title: 'Chain Guardian',
    description: 'Witnessed the domino cascade and defended the honest chain with consensus in Station 5.',
    emoji: '🗼',
    stationId: 5,
    unlocked: false,
  },
  {
    id: 'ach-all',
    title: 'Grand Blockmaster',
    description: 'Mastered all 5 stations and earned the Junior Cryptographer Diploma!',
    emoji: '👑',
    stationId: 'all',
    unlocked: false,
  },
];

export default function App() {
  const [currentStation, setCurrentStation] = useState<StationId>('map');
  const [completedStations, setCompletedStations] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('blockfactory_completed');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [xp, setXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('blockfactory_xp');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('blockfactory_achievements');
      return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  const [activeAha, setActiveAha] = useState<AhaContent | null>(null);
  const [isTrophyOpen, setIsTrophyOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('blockfactory_completed', JSON.stringify(Array.from(completedStations)));
      localStorage.setItem('blockfactory_xp', xp.toString());
      localStorage.setItem('blockfactory_achievements', JSON.stringify(achievements));
    } catch {
      // ignore storage errors
    }
  }, [completedStations, xp, achievements]);

  const addXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const handleStationComplete = (stationId: 1 | 2 | 3 | 4 | 5) => {
    const isFirstTime = !completedStations.has(stationId);
    if (isFirstTime) {
      setCompletedStations((prev) => new Set([...prev, stationId]));
      addXp(50);

      // Unlock station achievement
      setAchievements((prev) =>
        prev.map((a) => (a.stationId === stationId ? { ...a, unlocked: true } : a))
      );

      // Check if all 5 completed
      if (completedStations.size + 1 >= 5) {
        setAchievements((prev) =>
          prev.map((a) => (a.stationId === 'all' ? { ...a, unlocked: true } : a))
        );
      }
    }

    // Trigger Aha Modal with customized middle-school explanations
    const ahaData: Record<number, AhaContent> = {
      1: {
        stationId: 1,
        badge: '🌀',
        title: 'Same in, same out. Different in, different out!',
        text: 'Every time you blend the exact same fruit, you get the exact same digital fingerprint. But tweak the slider by just 1%, and the Avalanche Effect flips almost every bit in the output! Plus, once blended, math won’t let anyone reverse it.',
        term: 'Real Cryptography Term: Hash Function (SHA-256)',
        middleSchoolFact:
          'Bitcoin miners compute over 500 quintillion SHA-256 hashes every second to secure the network!',
        xpEarned: 50,
      },
      2: {
        stationId: 2,
        badge: '🔑',
        title: 'Share the Mailbox Slot, Guard the Private Key!',
        text: 'Anyone in the world can drop a letter or coins into your Public Address slot—it’s safe to show everyone! But only your secret Private Key can open the vault door. If you lose your private key, nobody on Earth can break the 256-bit math.',
        term: 'Real Cryptography Term: Asymmetric Encryption (Public & Private Keys)',
        middleSchoolFact:
          'A 256-bit private key has more possible combinations than the number of atoms in the entire visible universe!',
        xpEarned: 50,
      },
      3: {
        stationId: 3,
        badge: '🏭',
        title: 'Limited Space = Higher Gas Fees Win!',
        text: 'Each block in the factory only holds 1,000 KB (1 MB) of space. When thousands of people want to send transactions at the same time, miners prioritize the items with the highest fee tip to maximize their earnings.',
        term: 'Real Cryptography Term: The Mempool & Gas Fees',
        middleSchoolFact:
          'During crazy NFT drops or crypto bull runs, Ethereum gas fees once surged over $100 per transaction!',
        xpEarned: 50,
      },
      4: {
        stationId: 4,
        badge: '🎰',
        title: 'Locking Blocks Costs Real Work & Energy!',
        text: 'Miners don’t get lucky by magic—they burn real electricity guessing billions of random nonce numbers until they find a hash with enough leading zeros. This mathematical effort is what prevents hackers from spamming or rewriting blocks!',
        term: 'Real Cryptography Term: Proof of Work (PoW) & Difficulty',
        middleSchoolFact:
          'Satoshi Nakamoto built a rule that automatically recalibrates the difficulty every 2,016 blocks so Bitcoin blocks always take roughly 10 minutes!',
        xpEarned: 50,
      },
      5: {
        stationId: 5,
        badge: '🗼',
        title: 'Change the Past, and the Present Breaks Loudly!',
        text: 'Because every block contains the hash of the block before it, altering even one apple in Block #1 instantly breaks the laser link to Block #2, which shatters Block #3 and #4. And all 1,000 honest computers worldwide reject the fake chain in a heartbeat!',
        term: 'Real Cryptography Term: Blockchain Immutability & Consensus',
        middleSchoolFact:
          'The very first "Genesis Block" mined by Satoshi Nakamoto on January 3, 2009 is still cryptographically linked to every transaction today!',
        xpEarned: 50,
      },
    };

    setActiveAha(ahaData[stationId]);
  };

  const handleResetProgress = () => {
    setCompletedStations(new Set());
    setXp(0);
    setAchievements(INITIAL_ACHIEVEMENTS);
    localStorage.removeItem('blockfactory_completed');
    localStorage.removeItem('blockfactory_xp');
    localStorage.removeItem('blockfactory_achievements');
    setCurrentStation('map');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#1A1A1A] flex flex-col selection:bg-[#FFE66D] selection:text-black relative">
      {/* Subtle Dot Matrix Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-4 artistic-dot-bg z-0" />

      {/* Top Navbar */}
      <TopNav
        currentStation={currentStation}
        onSelectStation={(id) => setCurrentStation(id)}
        completedStations={completedStations}
        xp={xp}
        onOpenTrophies={() => setIsTrophyOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-start relative z-10">
        {currentStation === 'map' && (
          <MapOverview
            onSelectStation={(id) => setCurrentStation(id)}
            completedStations={completedStations}
            stations={STATIONS}
            xp={xp}
          />
        )}

        {currentStation === 1 && (
          <BlenderStation
            onComplete={() => handleStationComplete(1)}
            onAddXp={addXp}
            isCompleted={completedStations.has(1)}
            onNextStation={() => setCurrentStation(2)}
          />
        )}

        {currentStation === 2 && (
          <TwoKeysStation
            onComplete={() => handleStationComplete(2)}
            onAddXp={addXp}
            isCompleted={completedStations.has(2)}
          />
        )}

        {currentStation === 3 && (
          <AssemblyLineStation
            onComplete={() => handleStationComplete(3)}
            onAddXp={addXp}
            isCompleted={completedStations.has(3)}
          />
        )}

        {currentStation === 4 && (
          <SlotMachineStation
            onComplete={() => handleStationComplete(4)}
            onAddXp={addXp}
            isCompleted={completedStations.has(4)}
          />
        )}

        {currentStation === 5 && (
          <GlassTowerStation
            onComplete={() => handleStationComplete(5)}
            onAddXp={addXp}
            isCompleted={completedStations.has(5)}
          />
        )}
      </main>

      {/* Artistic Flair High-Contrast Neo-Brutalist Footer */}
      <footer className="relative z-10 mt-6 mb-6 max-w-6xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] mx-auto bg-[#1A1A1A] border-4 border-black text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Real-Time Telemetry Dots */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#FF6B6B] rounded-full animate-pulse"></div>
            <span className="text-white text-[11px] font-mono uppercase tracking-[0.2em]">Consensus: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#55E6C1] rounded-full"></div>
            <span className="text-white text-[11px] font-mono uppercase tracking-[0.2em]">Cryptography: SHA-256</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#FFE66D] rounded-full"></div>
            <span className="text-white text-[11px] font-mono uppercase tracking-[0.2em]">Stations: {completedStations.size}/5 Clear</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTrophyOpen(true)}
            className="bg-[#FF6B6B] hover:bg-white text-white hover:text-black border-2 border-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_#FFF] active:translate-y-1 active:shadow-none cursor-pointer"
          >
            Trophy Case 🏆
          </button>
          <button
            onClick={() => setCurrentStation('map')}
            className="bg-[#4ECDC4] hover:bg-white text-black border-2 border-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_#FFF] active:translate-y-1 active:shadow-none cursor-pointer"
          >
            Factory Map 🗺️
          </button>
        </div>
      </footer>

      {/* Aha Modal */}
      <AhaModal
        content={activeAha}
        onClose={() => {
          const finishedId = activeAha?.stationId;
          setActiveAha(null);
          if (finishedId !== 1) {
            setCurrentStation('map');
          }
        }}
      />

      {/* Trophy / Achievements Modal */}
      <TrophyModal
        isOpen={isTrophyOpen}
        onClose={() => setIsTrophyOpen(false)}
        achievements={achievements}
        xp={xp}
      />
    </div>
  );
}
