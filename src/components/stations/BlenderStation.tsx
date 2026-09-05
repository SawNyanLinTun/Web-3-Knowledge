import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { simpleHash, hashToGrid, formatHashShort } from '../../utils/cryptoSim';
import { sound } from '../../utils/audio';
import { CharacterHelper } from '../CharacterHelper';
import { Sliders, Hash, Sparkles, Link as LinkIcon, RefreshCw, Copy, Check, ArrowDown, ArrowRight } from 'lucide-react';
import { IngredientVisual } from './IngredientVisual';

interface BlenderStationProps {
  onComplete: () => void;
  onAddXp: (amount: number) => void;
  isCompleted: boolean;
  onNextStation?: () => void;
}

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  baseColor: string;
  shapeType: 'square' | 'star' | 'triangle' | 'hexagon' | 'diamond';
}

const INGREDIENTS: Ingredient[] = [
  { id: 'apple', name: 'Fresh Apple', emoji: '🍎', baseColor: '#FF5D5D', shapeType: 'square' },
  { id: 'green_apple', name: 'Sour Apple', emoji: '🍏', baseColor: '#22B8A6', shapeType: 'star' },
  { id: 'leaf', name: 'Forest Leaf', emoji: '🍃', baseColor: '#8F6BFF', shapeType: 'triangle' },
  { id: 'pepper', name: 'Glitch Pepper', emoji: '🌶️', baseColor: '#FF5FA2', shapeType: 'diamond' },
  { id: 'donut', name: 'Crypto Donut', emoji: '🍩', baseColor: '#F4B740', shapeType: 'hexagon' },
];

export interface ChainBlock {
  id: string;
  blockNumber: number;
  ingredient: Ingredient;
  biteSize: number;
  spiceLevel: number;
  hash: string;
  grid: string[];
  diffPctFromPrev: number;
  timestamp: string;
  matchedBlockNumber?: number;
}

export const BlenderStation: React.FC<BlenderStationProps> = ({
  onComplete,
  onAddXp,
  isCompleted,
  onNextStation,
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>(INGREDIENTS[0]);
  const [biteSize, setBiteSize] = useState<number>(0); // 0 to 100%
  const [spiceLevel, setSpiceLevel] = useState<number>(0); // 0 to 10
  const [isBlending, setIsBlending] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [unblendFailed, setUnblendFailed] = useState<boolean>(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [lastMatch, setLastMatch] = useState<{
    originalBlockNumber: number;
    matchedBlockNumber: number;
    hash: string;
    ingredientName: string;
    biteSize: number;
  } | null>(null);

  // Initial Genesis Block
  const initialHash = simpleHash(`${INGREDIENTS[0].id}-bite:0%-spice:0`);
  const [chain, setChain] = useState<ChainBlock[]>([
    {
      id: 'genesis-block',
      blockNumber: 1,
      ingredient: INGREDIENTS[0],
      biteSize: 0,
      spiceLevel: 0,
      hash: initialHash,
      grid: hashToGrid(initialHash),
      diffPctFromPrev: 0,
      timestamp: 'Genesis Block',
    },
  ]);

  // Current calculated input string & hash for live display
  const currentInputString = `${selectedIngredient.id}-bite:${biteSize}%-spice:${spiceLevel}`;
  const currentHash = simpleHash(currentInputString);
  const currentGrid = hashToGrid(currentHash);
  const matchingBlockForCurrent = chain.find((b) => b.hash === currentHash);

  // Core helper to append a block to the Hash Chain inside the box
  const addToChain = (
    ingredient: Ingredient,
    bite: number,
    spice: number,
    forcedHash?: string
  ) => {
    const hashVal = forcedHash || simpleHash(`${ingredient.id}-bite:${bite}%-spice:${spice}`);

    // Check if any block in the existing chain has the exact same hash
    const matchingBlock = chain.find((b) => b.hash === hashVal);
    const isSameHash = Boolean(matchingBlock);

    // If the latest block was already an identical match of this exact state, avoid infinite duplicate loops
    if (chain.length > 0) {
      const last = chain[chain.length - 1];
      if (last.hash === hashVal && last.matchedBlockNumber !== undefined) {
        onComplete();
        return;
      }
    }

    let diff = 0;
    if (chain.length > 0) {
      const prevHash = chain[chain.length - 1].hash;
      let diffCount = 0;
      for (let i = 0; i < Math.min(prevHash.length, hashVal.length); i++) {
        if (prevHash[i] !== hashVal[i]) diffCount++;
      }
      diff = Math.round((diffCount / prevHash.length) * 100);
    }

    const nextBlockNumber = chain.length + 1;
    const nextBlock: ChainBlock = {
      id: Math.random().toString(),
      blockNumber: nextBlockNumber,
      ingredient,
      biteSize: bite,
      spiceLevel: spice,
      hash: hashVal,
      grid: hashToGrid(hashVal),
      diffPctFromPrev: diff,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      matchedBlockNumber: matchingBlock ? matchingBlock.blockNumber : undefined,
    };

    setChain((prev) => [...prev, nextBlock]);

    // ONLY when two hash values are the same -> show notification with original message!
    if (isSameHash && matchingBlock) {
      setLastMatch({
        originalBlockNumber: matchingBlock.blockNumber,
        matchedBlockNumber: nextBlockNumber,
        hash: hashVal,
        ingredientName: ingredient.name,
        biteSize: bite,
      });
      sound.playFanfare();
      onAddXp(25);
      onComplete(); // Triggers AhaModal with original message: "Same in, same out. Different in, different out!"
    }
  };

  // 1. User picks a new fruit -> calculate new hash, show it, add to box. Notification ONLY if hash matches an existing block!
  const handleSelectIngredient = (item: Ingredient) => {
    sound.playClick();
    setSelectedIngredient(item);
    setShowOutput(false);
    const newHash = simpleHash(`${item.id}-bite:${biteSize}%-spice:${spiceLevel}`);
    addToChain(item, biteSize, spiceLevel, newHash);
  };

  // 2. User chooses different size presets (0%, 50%, 100%) -> calculate new hash, show it, add to box. Notification ONLY if hash matches an existing block!
  const handleSelectBitePreset = (newBite: number) => {
    sound.playClick();
    setBiteSize(newBite);
    const newHash = simpleHash(`${selectedIngredient.id}-bite:${newBite}%-spice:${spiceLevel}`);
    addToChain(selectedIngredient, newBite, spiceLevel, newHash);
  };

  // 3. User releases or finishes moving bite slider -> calculate new hash, show it, add to box. Notification ONLY if hash matches an existing block!
  const handleSliderCommit = (val: number) => {
    const newHash = simpleHash(`${selectedIngredient.id}-bite:${val}%-spice:${spiceLevel}`);
    addToChain(selectedIngredient, val, spiceLevel, newHash);
  };

  // 4. User tests recreating an earlier block to verify identical hash matching
  const handleTestSameBlock = (targetBlock: ChainBlock) => {
    sound.playClick();
    setSelectedIngredient(targetBlock.ingredient);
    setBiteSize(targetBlock.biteSize);
    setSpiceLevel(targetBlock.spiceLevel);
    addToChain(targetBlock.ingredient, targetBlock.biteSize, targetBlock.spiceLevel, targetBlock.hash);
  };

  const handleResetChain = () => {
    sound.playClick();
    const resetHash = simpleHash(`${selectedIngredient.id}-bite:${biteSize}%-spice:${spiceLevel}`);
    setChain([
      {
        id: 'genesis-' + Date.now(),
        blockNumber: 1,
        ingredient: selectedIngredient,
        biteSize: biteSize,
        spiceLevel: spiceLevel,
        hash: resetHash,
        grid: hashToGrid(resetHash),
        diffPctFromPrev: 0,
        timestamp: 'Genesis Block',
      },
    ]);
  };

  const handleCopyHash = (hashStr: string, id: string) => {
    navigator.clipboard.writeText(hashStr);
    setCopiedHashId(id);
    sound.playClick();
    setTimeout(() => setCopiedHashId(null), 1500);
  };

  const handleBlend = () => {
    sound.playBlender(0.9);
    setIsBlending(true);
    setShowOutput(false);
    setUnblendFailed(false);

    setTimeout(() => {
      setIsBlending(false);
      setShowOutput(true);
      sound.playPop();

      addToChain(selectedIngredient, biteSize, spiceLevel, currentHash);
      onAddXp(15);
      // NOTE: We strictly DO NOT trigger onComplete() here to prevent unsolicited notification popups!
    }, 900);
  };

  const handleUnblend = () => {
    sound.playBuzzer();
    setUnblendFailed(true);
  };

  // Latest block in chain
  const latestBlock = chain[chain.length - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#4ECDC4] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-2 shadow-[3px_3px_0px_0px_#000] rotate-[-1deg]">
          Station 01: Cryptographic Hashing
        </span>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
          The Magic Blender
        </h2>
        <p className="text-neutral-700 text-sm max-w-xl mx-auto mt-1 font-medium">
          Pick an ingredient or tweak its bite size. Watch its unique cryptographic SHA-256 hash
          generate and link automatically into the <strong>Hash Chain Box</strong> below!
        </p>
      </div>

      <CharacterHelper
        message={
          lastMatch
            ? `🎯 BINGO! Block #${lastMatch.originalBlockNumber} and Block #${lastMatch.matchedBlockNumber} generated the EXACT SAME 64-character hash! That proves cryptographic determinism: Same input will ALWAYS produce the exact same digital fingerprint!`
            : unblendFailed
            ? "Hahaha! See? You can blend fruits into hashes, but math won't let you reverse a hash back into fruit! That's the one-way trapdoor function!"
            : chain.length <= 1
            ? "Welcome to Station 1! Click any fruit or adjust the 'Bite Taken' size below. Notice how every new change adds a block. Try to make two hash values the SAME to unlock the secret discovery!"
            : latestBlock.diffPctFromPrev > 50
            ? `Avalanche Effect in action! Tweak just one bite, and ${latestBlock.diffPctFromPrev}% of the bits in the output completely scramble!`
            : "Notice how every link in the chain holds a unique digital fingerprint of that exact moment in time!"
        }
        mood={lastMatch ? 'celebrating' : unblendFailed ? 'surprised' : chain.length > 2 ? 'celebrating' : 'happy'}
      />

      {/* Identical Hash Match Banner (Shown when two hash values are the same!) */}
      {lastMatch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-[#FFE66D] border-4 border-black rounded-[28px] shadow-[6px_6px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border-3 border-black flex items-center justify-center text-2xl shrink-0 shadow-[3px_3px_0px_0px_#000] animate-bounce">
              🎯
            </div>
            <div>
              <div className="text-xs font-black uppercase text-black tracking-wider flex items-center gap-2">
                <span>Identical Hash Match Found!</span>
                <span className="px-2.5 py-0.5 rounded-full bg-black text-[#55E6C1] text-[10px] font-mono font-black">
                  Block #{lastMatch.originalBlockNumber} == Block #{lastMatch.matchedBlockNumber}
                </span>
              </div>
              <p className="text-xs text-neutral-800 font-bold mt-0.5">
                Two hash values are completely identical! <strong>Same in, same out.</strong> Every time you blend the exact same fruit and size, SHA-256 guarantees the exact same hash!
              </p>
            </div>
          </div>
          <button
            onClick={() => onComplete()}
            className="px-4 py-2.5 rounded-xl bg-black text-[#FFE66D] hover:bg-neutral-800 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 shrink-0 cursor-pointer"
          >
            Re-open Notification
          </button>
        </motion.div>
      )}

      {/* Main Studio Console */}
      <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Interactive Controls & Sliders */}
        <div className="lg:col-span-6 space-y-5">
          {/* Ingredient Picker */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
              Step 1: Choose Raw Input Data (Ingredient)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {INGREDIENTS.map((item) => {
                const isSelected = selectedIngredient.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectIngredient(item)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-black bg-[#FFE66D] shadow-[4px_4px_0px_0px_#000] -translate-y-1'
                        : 'border-black/40 bg-white hover:border-black shadow-[2px_2px_0px_0px_#000]'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className="text-[10px] font-black text-[#1A1A1A] truncate w-full text-center uppercase">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Slider 1: Bite Size */}
          <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                <span>🍎</span> Bite Taken (Modify Bits)
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {biteSize}% eaten
              </span>
            </div>

            {/* Live Interactive Shape Preview in Step 1 */}
            <div className="flex items-center gap-3 p-2.5 bg-white border-2 border-black rounded-xl mb-3 shadow-[2px_2px_0px_0px_#000]">
              <div className="w-14 h-14 bg-[#FFF9F2] border-2 border-black rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                <IngredientVisual
                  ingredientId={selectedIngredient.id}
                  biteSize={biteSize}
                  size={46}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black uppercase text-[#1A1A1A] truncate flex items-center gap-1.5">
                  <span>{selectedIngredient.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFE66D] border border-black font-black">
                    {biteSize === 0 ? 'Full' : biteSize >= 75 ? 'Core' : `${biteSize}% Bite`}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 font-bold mt-0.5">
                  {biteSize === 0 && 'Original data shape with 0% altered bits.'}
                  {biteSize > 0 && biteSize < 35 && 'Nibble taken! Bits begin shifting.'}
                  {biteSize >= 35 && biteSize < 75 && 'Half-eaten! 50% of the original shape is gone!'}
                  {biteSize >= 75 && '100% Core! Completely eaten down to the skeleton!'}
                </div>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={biteSize}
              onChange={(e) => {
                setBiteSize(Number(e.target.value));
              }}
              onPointerUp={(e) => {
                handleSliderCommit(Number((e.target as HTMLInputElement).value));
              }}
              onTouchEnd={(e) => {
                handleSliderCommit(Number((e.target as HTMLInputElement).value));
              }}
              onKeyUp={(e) => {
                handleSliderCommit(Number((e.target as HTMLInputElement).value));
              }}
              className="w-full h-3.5 bg-white rounded-lg border-2 border-black cursor-pointer appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectBitePreset(0)}
                className={`hover:text-black cursor-pointer underline decoration-2 ${
                  biteSize === 0 ? 'text-black font-black' : ''
                }`}
              >
                0% (Untouched)
              </button>
              <button
                type="button"
                onClick={() => handleSelectBitePreset(50)}
                className={`hover:text-black cursor-pointer underline decoration-2 ${
                  biteSize === 50 ? 'text-black font-black' : ''
                }`}
              >
                50% (Half Bite)
              </button>
              <button
                type="button"
                onClick={() => handleSelectBitePreset(100)}
                className={`hover:text-black cursor-pointer underline decoration-2 ${
                  biteSize === 100 ? 'text-black font-black' : ''
                }`}
              >
                100% (Core)
              </button>
            </div>

            {/* Live Real-time Hash Value Display for Chosen Size */}
            <div className="mt-3 p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-neutral-800" />
                  Current SHA-256 Hash Value:
                </span>
                {matchingBlockForCurrent ? (
                  <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-[#FFE66D] border border-black text-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1 animate-pulse">
                    <span>🎯</span> Matches Block #{matchingBlockForCurrent.blockNumber}!
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-[#55E6C1] border border-black text-black shadow-[1px_1px_0px_0px_#000]">
                    Live Digest
                  </span>
                )}
              </div>
              <div className="font-mono text-xs font-black text-black bg-[#FFE66D] p-2 rounded-lg border-2 border-black truncate shadow-inner flex items-center justify-between">
                <span className="text-rose-700">{currentHash.slice(0, 8)}</span>
                <span className="text-black font-bold tracking-widest px-1">••••</span>
                <span className="text-indigo-700">{currentHash.slice(-8)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-700 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-black" />
                  {selectedIngredient.name} ({biteSize}% size)
                </span>
                {matchingBlockForCurrent ? (
                  <span className="text-amber-800 font-black text-[9px] uppercase tracking-wide flex items-center gap-1">
                    <span>🎯</span> Same Input = Same Hash!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-black text-[9px] uppercase tracking-wide flex items-center gap-1">
                    <LinkIcon className="w-2.5 h-2.5" />
                    Chained (#{chain.length})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Slider 2: Spice / Noise */}
          <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                <span>🌶️</span> Glitch Noise (Nonce variance)
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#55E6C1] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                Level {spiceLevel}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={spiceLevel}
              onChange={(e) => {
                setSpiceLevel(Number(e.target.value));
              }}
              onPointerUp={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                const newHash = simpleHash(`${selectedIngredient.id}-bite:${biteSize}%-spice:${val}`);
                addToChain(selectedIngredient, biteSize, val, newHash);
              }}
              className="w-full h-3.5 bg-white rounded-lg border-2 border-black cursor-pointer appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider mt-1.5">
              <span>Level 0 (Pure)</span>
              <span>Level 5</span>
              <span>Level 10 (Ultra Spice)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleBlend}
              disabled={isBlending}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FFE66D] hover:bg-[#FF6B6B] hover:text-white border-3 border-black font-black uppercase text-sm tracking-wider text-[#1A1A1A] shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🌀</span>
              <span>{isBlending ? 'Blending Math...' : 'Blend into Hash!'}</span>
            </button>

            <button
              onClick={handleUnblend}
              disabled={!showOutput}
              className="py-3.5 px-5 rounded-2xl bg-white hover:bg-rose-100 border-3 border-black font-black uppercase text-xs tracking-wider text-[#1A1A1A] shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Try to reverse the hash"
            >
              <span>⏪</span>
              <span>Unblend?</span>
            </button>
          </div>

          {/* Unblend Error alert */}
          <AnimatePresence>
            {unblendFailed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-rose-100 border-3 border-black rounded-2xl text-xs text-rose-950 font-bold flex items-start gap-2 shadow-[4px_4px_0px_0px_#000]"
              >
                <span className="text-base">🚫</span>
                <div>
                  <strong className="uppercase font-black">Error: One-Way Mathematical Trapdoor!</strong>
                  <p className="font-semibold mt-1">
                    You cannot un-blend a smoothie back into fresh apples! Hashing irreversibly destroys the original shape while maintaining a unique fingerprint.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: The Physical Blender Graphic */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#FFF9F2] border-4 border-black rounded-[32px] p-6 min-h-[380px] shadow-[6px_6px_0px_0px_#000]">
          {/* Blender Physical Graphics */}
          <div className="relative w-44 h-56 flex flex-col items-center">
            {/* Blender Jar */}
            <motion.div
              animate={
                isBlending
                  ? {
                      x: [-3, 3, -3, 3, 0],
                      rotate: [-2, 2, -2, 2, 0],
                    }
                  : {}
              }
              transition={{ repeat: isBlending ? Infinity : 0, duration: 0.1 }}
              className="w-32 h-40 bg-linear-to-b from-cyan-100/60 to-cyan-200/80 border-4 border-black rounded-t-xl rounded-b-3xl relative overflow-hidden flex flex-col items-center justify-end shadow-inner"
            >
              {/* Glass reflection streak */}
              <div className="absolute top-2 left-2 w-3 h-28 bg-white/60 rounded-full rotate-6 pointer-events-none" />

              {/* Inside items / liquid */}
              <AnimatePresence mode="wait">
                {!isBlending && !showOutput && (
                  <motion.div
                    key={`${selectedIngredient.id}-${Math.floor(biteSize / 25)}`}
                    initial={{ scale: 0.8, y: -10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="mb-4 relative flex flex-col items-center justify-center"
                  >
                    <IngredientVisual
                      ingredientId={selectedIngredient.id}
                      biteSize={biteSize}
                      size={64}
                    />
                    <div className="mt-1 px-2 py-0.5 rounded-md bg-white/95 border-2 border-black text-[9px] font-black uppercase tracking-wider text-[#1A1A1A] shadow-[1px_1px_0px_0px_#000]">
                      {biteSize === 0
                        ? '100% Intact'
                        : biteSize >= 75
                        ? '100% Core'
                        : `${biteSize}% Bite`}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Blending liquid swirl */}
              {isBlending && (
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: '75%' }}
                  transition={{ duration: 0.8 }}
                  className="w-full rounded-b-2xl opacity-90 flex items-center justify-center text-2xl border-t-2 border-black"
                  style={{ backgroundColor: selectedIngredient.baseColor }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.2, ease: 'linear' }}
                  >
                    🌀
                  </motion.div>
                </motion.div>
              )}

              {/* Blender blades */}
              <div className="w-16 h-3 bg-black rounded-full mb-1 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-black" />
              </div>
            </motion.div>

            {/* Blender Motor Base */}
            <div className="w-40 h-14 bg-black border-2 border-black rounded-b-2xl -mt-1 flex items-center justify-center gap-3 px-4 shadow-[4px_4px_0px_0px_#000]">
              <div className="w-3 h-3 rounded-full bg-[#55E6C1] animate-ping" />
              <span className="text-[10px] font-mono font-black text-[#FFE66D] uppercase tracking-wider">
                SHA-256 ENGINE
              </span>
            </div>
          </div>

          {/* Output Display */}
          <div className="w-full mt-5">
            {showOutput ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-3 border-black rounded-2xl p-4 text-center shadow-[4px_4px_0px_0px_#000]"
              >
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                    Output Fingerprint
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#55E6C1] border border-black text-black font-black uppercase tracking-wider">
                    Hash Verified
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {/* Visual Pixel Avatar Matrix */}
                  <div className="w-16 h-16 rounded-xl border-2 border-black p-1 bg-white grid grid-cols-6 gap-0.5 shadow-[2px_2px_0px_0px_#000]">
                    {currentGrid.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-full h-full rounded-xs transition-colors duration-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Hash text code */}
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-[10px] text-neutral-600 font-black uppercase tracking-wider flex items-center justify-between">
                      <span>64-Char Signature:</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black text-[#FFE66D] font-mono font-black">
                        {biteSize}% SIZE
                      </span>
                    </div>
                    <div className="font-mono text-xs font-black text-black bg-[#FFE66D] p-2 rounded-xl border-2 border-black mt-1 break-all select-all shadow-[2px_2px_0px_0px_#000]">
                      {currentHash.slice(0, 8)}...{currentHash.slice(-8)}
                    </div>
                  </div>
                </div>

                {latestBlock.diffPctFromPrev > 0 && (
                  <div className="mt-3 py-2 px-3 rounded-xl bg-[#A29BFE] border-2 border-black text-black text-xs flex items-center justify-between shadow-[2px_2px_0px_0px_#000]">
                    <span className="font-black uppercase tracking-wider">⚡ Avalanche Effect:</span>
                    <span className="font-mono font-black">
                      {latestBlock.diffPctFromPrev}% bits flipped!
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-4 text-xs font-black uppercase tracking-wider text-neutral-600">
                Configure sliders and click "Blend into Hash" to generate the smoothie!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ⛓️ THE HASH CHAIN BOX */}
      <div
        id="hash-chain-box"
        className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b-3 border-black">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⛓️</span>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A]">
                The Hash Chain Box
              </h3>
              <span className="px-3 py-0.5 rounded-full bg-[#FFE66D] border-2 border-black text-xs font-mono font-black text-black shadow-[2px_2px_0px_0px_#000]">
                {chain.length} {chain.length === 1 ? 'Block' : 'Blocks'} Chained
              </span>
            </div>
            <p className="text-neutral-700 text-xs font-bold mt-1">
              Every time you select a new fruit or adjust the bite size, its unique SHA-256 hash
              is stamped and linked as a new block in this cryptographic chain!
            </p>
          </div>

          <button
            onClick={handleResetChain}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 self-start sm:self-auto shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Chain</span>
          </button>
        </div>

        {/* Chained Blocks List */}
        <div className="space-y-4">
          {chain.map((block, idx) => {
            const isLatest = idx === chain.length - 1;
            const isGenesis = idx === 0;

            return (
              <div key={block.id} className="relative">
                {/* Chain Link Connector between blocks */}
                {!isGenesis && (
                  <div className="flex items-center justify-center my-2">
                    <div className="px-3 py-1 rounded-full bg-black text-[#FFE66D] border-2 border-black text-[11px] font-mono font-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                      <LinkIcon className="w-3.5 h-3.5 text-[#55E6C1]" />
                      <span>CHAIN LINK #{idx} ➔ #{idx + 1}</span>
                      <span className="text-[#55E6C1] hidden sm:inline">
                        (⚡ {block.diffPctFromPrev}% bits flipped)
                      </span>
                    </div>
                  </div>
                )}

                {/* Block Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`border-3 border-black rounded-2xl p-4 transition-all ${
                    block.matchedBlockNumber
                      ? 'bg-[#FFFDE7] shadow-[5px_5px_0px_0px_#000] ring-2 ring-[#FFE66D]'
                      : isLatest
                      ? 'bg-[#FFF9F2] shadow-[5px_5px_0px_0px_#000] ring-2 ring-[#FFE66D]'
                      : 'bg-white shadow-[3px_3px_0px_0px_#000]'
                  }`}
                >
                  {/* Identical Hash Match Banner if this block matches an earlier block */}
                  {block.matchedBlockNumber && (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-[#FFE66D] border-2 border-black text-black text-xs font-black flex flex-wrap items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm">🎯</span>
                        <span>100% IDENTICAL HASH MATCH WITH BLOCK #{block.matchedBlockNumber}!</span>
                      </span>
                      <span className="font-mono text-[10px] bg-black text-[#55E6C1] px-2 py-0.5 rounded-md">
                        Same In = Same Out
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Block Info & Ingredient visual */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mini visual */}
                      <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000] overflow-hidden">
                        <IngredientVisual
                          ingredientId={block.ingredient.id}
                          biteSize={block.biteSize}
                          size={36}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_0px_#000] ${
                            isGenesis ? 'bg-[#55E6C1] text-black' : 'bg-[#FFE66D] text-black'
                          }`}>
                            {isGenesis ? 'BLOCK #1 (GENESIS)' : `BLOCK #${block.blockNumber}`}
                          </span>
                          {block.matchedBlockNumber ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-black text-[#FFE66D] uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                              🎯 Duplicate Match
                            </span>
                          ) : isLatest ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#FF6B6B] text-white uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              Latest Block
                            </span>
                          ) : null}
                        </div>

                        <div className="text-sm font-black text-[#1A1A1A] truncate mt-1 flex items-center gap-1.5">
                          <span>{block.ingredient.emoji} {block.ingredient.name}</span>
                          <span className="text-[11px] font-mono font-bold text-neutral-600">
                            • {block.biteSize}% Size
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hash Value Box */}
                    <div className="flex-1 max-w-xl">
                      <div className="flex items-center justify-between mb-1 text-[10px] text-neutral-600 font-black uppercase">
                        <span>SHA-256 Digest:</span>
                        <span className="font-mono text-neutral-500">{block.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 font-mono text-xs font-black text-black bg-[#FFE66D] p-2 rounded-xl border-2 border-black truncate select-all shadow-[2px_2px_0px_0px_#000]">
                          <span className="text-rose-700">{block.hash.slice(0, 10)}</span>
                          <span className="text-black">{block.hash.slice(10, 26)}</span>
                          <span className="text-neutral-500 font-bold">••••</span>
                          <span className="text-indigo-700">{block.hash.slice(-10)}</span>
                        </div>
                        <button
                          onClick={() => handleCopyHash(block.hash, block.id)}
                          className="p-2 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 shrink-0"
                          title="Copy 64-char hash"
                        >
                          {copiedHashId === block.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-black" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Identicon thumbnail */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <div className="w-10 h-10 rounded-lg border-2 border-black grid grid-cols-6 gap-0.5 p-0.5 bg-white shadow-[2px_2px_0px_0px_#000]">
                        {block.grid.slice(0, 36).map((c, i) => (
                          <div key={i} style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Re-Blend action to test identical matching */}
                  <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-neutral-500 font-bold">
                      Recipe: {block.ingredient.name} • {block.biteSize}% bite • Spice {block.spiceLevel}
                    </span>
                    <button
                      onClick={() => handleTestSameBlock(block)}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFE66D] border border-black shadow-[1px_1px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Test this exact fruit and size again to verify deterministic matching"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-Blend (Test Same Hash)</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Next Station Navigation Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFF9F2] border-4 border-black rounded-[28px] p-5 shadow-[6px_6px_0px_0px_#000]">
        <div>
          <h4 className="text-sm font-black uppercase tracking-tight text-[#1A1A1A] flex items-center gap-2">
            <span>🎉</span>
            <span>Mastered Cryptographic Hashes?</span>
          </h4>
          <p className="text-neutral-700 text-xs font-bold mt-0.5">
            You've generated {chain.length} blocks in your hash chain. When you're ready, proceed to unlock Bob's Vault with asymmetric keys!
          </p>
        </div>
        <button
          onClick={() => {
            sound.playCoin();
            if (onNextStation) {
              onNextStation();
            } else {
              onComplete();
            }
          }}
          className="px-6 py-3 rounded-2xl bg-[#4ECDC4] hover:bg-[#3ec4bb] border-3 border-black font-black uppercase text-xs tracking-wider text-black shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span>Continue to Station 2: The Two Keys</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
