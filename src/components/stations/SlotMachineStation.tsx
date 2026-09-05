import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';
import { CharacterHelper } from '../CharacterHelper';
import { Pickaxe, Flame, Fan, Zap, Trophy, Play, Pause, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlotMachineStationProps {
  onComplete: () => void;
  onAddXp: (amount: number) => void;
  isCompleted: boolean;
}

export const SlotMachineStation: React.FC<SlotMachineStationProps> = ({
  onComplete,
  onAddXp,
  isCompleted,
}) => {
  // Mining state
  const [isMining, setIsMining] = useState<boolean>(false);
  const [nonce, setNonce] = useState<number>(0);
  const [currentHashPrefix, setCurrentHashPrefix] = useState<string>('7F2A');
  const [solved, setSolved] = useState<boolean>(false);
  const [blocksMinedCount, setBlocksMinedCount] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(35); // 35C to 95C
  const [totalHashesCalculated, setTotalHashesCalculated] = useState<number>(0);

  // Interactive Sliders
  const [difficultyLevel, setDifficultyLevel] = useState<number>(2); // 1, 2, 3, 4
  const [rigLevel, setRigLevel] = useState<number>(2); // 1: Calc, 2: Laptop, 3: Gaming PC, 4: ASIC Farm

  const animFrame = useRef<number | null>(null);

  const getTargetPrefix = (diff: number) => {
    return '0'.repeat(diff);
  };

  const getRigMeta = (level: number) => {
    switch (level) {
      case 1:
        return { name: 'Pocket Calculator', emoji: '🧮', speed: 12, powerWatts: '5 Watts' };
      case 2:
        return { name: 'School Laptop', emoji: '💻', speed: 45, powerWatts: '65 Watts' };
      case 3:
        return { name: 'RGB Gaming Beast', emoji: '🖥️', speed: 180, powerWatts: '450 Watts' };
      case 4:
      default:
        return { name: 'Hydropower ASIC Farm', emoji: '⚡', speed: 650, powerWatts: '3,000 Watts' };
    }
  };

  const currentRig = getRigMeta(rigLevel);
  const targetPrefix = getTargetPrefix(difficultyLevel);

  // Mining loop
  useEffect(() => {
    if (!isMining || solved) return;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      const nextNonce = nonce + count * Math.ceil(currentRig.speed / 8);
      setNonce(nextNonce);
      setTotalHashesCalculated((prev) => prev + currentRig.speed);

      // Increase temperature slightly with ceiling
      setTemperature((prev) => Math.min(88, prev + 0.3));

      // Generate a random hex representation
      const hexChars = '0123456789ABCDEF';
      let randHex = '';
      for (let i = 0; i < 4; i++) {
        randHex += hexChars[Math.floor(Math.random() * hexChars.length)];
      }

      // Check if we hit the difficulty target
      // Statistically determine success based on speed and difficulty
      const chance = (currentRig.speed / (Math.pow(16, difficultyLevel) * 2));
      const luckyHit = Math.random() < chance || count > (250 / difficultyLevel);

      if (luckyHit) {
        // Success! Force winning prefix
        const winHash = targetPrefix + randHex.slice(targetPrefix.length);
        setCurrentHashPrefix(winHash);
        handleBlockSolved();
      } else {
        // Normal miss
        if (randHex.startsWith(targetPrefix)) {
          // If accidentally matches but wasn't chosen, scramble first char so it requires effort
          randHex = 'A' + randHex.slice(1);
        }
        setCurrentHashPrefix(randHex);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isMining, solved, difficultyLevel, rigLevel]);

  const handleBlockSolved = () => {
    setIsMining(false);
    setSolved(true);
    sound.playUnlock();
    sound.playCoin();
    setBlocksMinedCount((prev) => prev + 1);
    onAddXp(35);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.55 },
      colors: ['#FFC93C', '#F4B740', '#FF5FA2', '#4D8AFF'],
    });

    onComplete();
  };

  const handleStartMining = () => {
    sound.playClick();
    setSolved(false);
    setIsMining(true);
  };

  const handleStopMining = () => {
    sound.playClick();
    setIsMining(false);
  };

  const handleResetRig = () => {
    sound.playClick();
    setIsMining(false);
    setSolved(false);
    setNonce(0);
    setTemperature(35);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFE66D] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-2 shadow-[3px_3px_0px_0px_#000] rotate-[1.5deg]">
          Station 04: Proof of Work & Mining
        </span>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
          The Slot Machine
        </h2>
        <p className="text-neutral-700 text-sm max-w-xl mx-auto mt-1 font-medium">
          Miners burn electricity guessing random lucky numbers (<strong>Nonces</strong>) to seal a block.
          Adjust the <strong>Difficulty</strong> and <strong>Rig Hardware</strong> sliders to win the golden block!
        </p>
      </div>

      <CharacterHelper
        message={
          solved
            ? `JACKPOT! The hash starts with '${targetPrefix}'! The golden lock clicked shut and you earned the block reward! That's Proof of Work!`
            : isMining
            ? `Mining in progress at ${currentRig.speed * 10} guesses/sec! Looking for a hash starting with '${targetPrefix}'...`
            : "Use the sliders below to upgrade your computer or set how many zeros the block requires. Then hit 'Start Mining Rig'!"
        }
        mood={solved ? 'celebrating' : isMining ? 'happy' : 'thinking'}
      />

      <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: The Mining Rig Visualizer */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#FFF9F2] border-3 border-black rounded-2xl p-6 relative min-h-[380px] shadow-[4px_4px_0px_0px_#000]">
          {/* Rig Hardware Title */}
          <div className="w-full flex justify-between items-center pb-2 mb-3 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <span>{currentRig.emoji}</span> {currentRig.name}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFE66D] border border-black text-black font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
              {currentRig.powerWatts}
            </span>
          </div>

          {/* Golden Block Vault Box */}
          <div className="relative my-3 flex flex-col items-center">
            <div className="w-52 h-34 bg-white border-4 border-black rounded-2xl flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#000] relative overflow-hidden">
              <span className="text-4xl mb-1">📦</span>
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                BLOCK #{100 + blocksMinedCount}
              </span>

              {/* Gold lock badge */}
              <AnimatePresence>
                {solved && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1.1, rotate: 0 }}
                    className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-[#FFE66D] border-3 border-black flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_#000]"
                  >
                    🔒
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Target Criteria Pill */}
            <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-white border-2 border-black text-xs font-black uppercase tracking-wider text-[#1A1A1A] shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
              <span>Target: Hash starts with</span>
              <span className="font-mono font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded border border-black">
                "{targetPrefix}"
              </span>
            </div>
          </div>

          {/* Slot Machine Digital Tumbler / Reels */}
          <div className="my-3 flex items-center gap-2">
            {currentHashPrefix.split('').map((char, idx) => (
              <div
                key={idx}
                className={`w-13 h-15 rounded-xl border-3 border-black flex items-center justify-center text-2xl font-black shadow-[3px_3px_0px_0px_#000] ${
                  char === '0' && idx < difficultyLevel
                    ? 'bg-[#55E6C1] text-black'
                    : 'bg-[#1A1A1A] text-[#FFE66D]'
                }`}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Stats bar (Fan, Temp, Nonce) */}
          <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t-2 border-black text-center">
            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-[9px] text-neutral-600 font-black uppercase tracking-wider flex items-center justify-center gap-1">
                <Fan
                  className={`w-3 h-3 ${
                    isMining ? 'text-black animate-spin' : 'text-neutral-400'
                  }`}
                />
                Fan Speed
              </div>
              <div className="text-xs font-black text-[#1A1A1A] mt-0.5">
                {isMining ? `${rigLevel * 2500} RPM` : 'Idle'}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-[9px] text-neutral-600 font-black uppercase tracking-wider flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-rose-500" /> Temp
              </div>
              <div className="text-xs font-black text-[#1A1A1A] mt-0.5">
                {Math.round(temperature)}°C
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-[9px] text-neutral-600 font-black uppercase tracking-wider">Nonce Guess</div>
              <div className="text-xs font-mono font-black text-[#1A1A1A] truncate mt-0.5">
                #{nonce}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sliders & Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Slider 1: Difficulty Level */}
          <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <span>🎯</span> Mining Difficulty
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {difficultyLevel} Leading Zero{difficultyLevel > 1 ? 'es' : ''} ("{targetPrefix}")
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={difficultyLevel}
              disabled={isMining}
              onChange={(e) => {
                setDifficultyLevel(Number(e.target.value));
                setSolved(false);
              }}
              className="w-full h-3.5 bg-white rounded-lg border-2 border-black cursor-pointer appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider mt-1.5">
              <span>Diff 1 ("0")</span>
              <span>Diff 2 ("00")</span>
              <span>Diff 3 ("000")</span>
              <span className="text-rose-600">Diff 4 ("0000")</span>
            </div>
            <p className="text-[11px] text-neutral-700 font-medium mt-2 leading-tight">
              Each extra zero makes the math <strong>16x harder</strong>! Bitcoin adjusts this every 2 weeks so blocks stay 10 minutes apart.
            </p>
          </div>

          {/* Slider 2: Rig Upgrade */}
          <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <span>⚡</span> Hardware Hashrate Upgrade
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {currentRig.name}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={rigLevel}
              disabled={isMining}
              onChange={(e) => {
                setRigLevel(Number(e.target.value));
                setSolved(false);
              }}
              className="w-full h-3.5 bg-white rounded-lg border-2 border-black cursor-pointer appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider mt-1.5">
              <span>🧮 Calculator</span>
              <span>💻 Laptop</span>
              <span>🖥️ PC</span>
              <span>⚡ ASIC</span>
            </div>
            <p className="text-[11px] text-neutral-700 font-medium mt-2 leading-tight">
              Faster computers guess more nonces per second, using more electricity in exchange for higher odds of solving the block!
            </p>
          </div>

          {/* Action Mining Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {!isMining ? (
              <button
                onClick={handleStartMining}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FF6B6B] hover:bg-[#FF9F43] border-3 border-black text-white font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pickaxe className="w-5 h-5 fill-current" />
                <span>{solved ? 'Mine Another Block!' : 'Start Mining Rig!'}</span>
              </button>
            ) : (
              <button
                onClick={handleStopMining}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FFE66D] hover:bg-[#4ECDC4] border-3 border-black text-black font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause className="w-5 h-5" />
                <span>Pause Mining</span>
              </button>
            )}

            <button
              onClick={handleResetRig}
              className="py-3.5 px-5 rounded-2xl bg-white hover:bg-neutral-100 border-3 border-black text-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Reward Status banner */}
          {solved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#55E6C1] border-3 border-black rounded-2xl flex items-center justify-between text-xs shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-black" />
                <div>
                  <div className="font-black uppercase tracking-wider text-black">Miner Reward Collected!</div>
                  <div className="text-[11px] text-neutral-800 font-bold">
                    +3.125 Block Subsidy & Fees Credited
                  </div>
                </div>
              </div>
              <div className="font-black uppercase tracking-wider text-black text-sm bg-white px-2.5 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                +{50} Coins 🪙
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
