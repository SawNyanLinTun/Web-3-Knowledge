import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';
import { CharacterHelper } from '../CharacterHelper';
import { Mail, Key, Lock, Unlock, ShieldAlert, Sparkles, Send } from 'lucide-react';

interface TwoKeysStationProps {
  onComplete: () => void;
  onAddXp: (amount: number) => void;
  isCompleted: boolean;
}

const PRESET_MESSAGES = [
  '🍕 Secret pizza party after school!',
  '🪙 Transfer 50 factory coins to Alice',
  '🎮 Do not share your password with anyone!',
  '🚀 Launch the blockchain spaceship!',
];

export const TwoKeysStation: React.FC<TwoKeysStationProps> = ({
  onComplete,
  onAddXp,
  isCompleted,
}) => {
  const [customMsg, setCustomMsg] = useState<string>(PRESET_MESSAGES[0]);
  const [lettersInVault, setLettersInVault] = useState<string[]>([
    'Welcome to your factory wallet!',
    'Alice sent you 10 gold coins 🪙',
  ]);
  const [isSlotBuzzing, setIsSlotBuzzing] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [flyingLetter, setFlyingLetter] = useState<boolean>(false);

  // Security Bit-Length Slider
  const [keyBitLength, setKeyBitLength] = useState<number>(256); // 4, 8, 16, 64, 256
  // Hacker brute force simulator slider
  const [hackerGuesses, setHackerGuesses] = useState<number>(0);
  const [isHackerCracking, setIsHackerCracking] = useState<boolean>(false);

  const getCrackTimeText = (bits: number) => {
    switch (bits) {
      case 4:
        return '⚡ 0.001 seconds (16 combinations - any calculator cracks it!)';
      case 8:
        return '⚡ 0.05 seconds (256 combinations - easy peek)';
      case 16:
        return '⏱️ 3 seconds (65,536 combinations)';
      case 64:
        return '⏳ 58 years (18 quintillion combinations)';
      case 256:
      default:
        return '🌌 100 Trillion Years (More combinations than atoms in the universe!)';
    }
  };

  const handleSendLetter = () => {
    if (!customMsg.trim() || flyingLetter) return;
    sound.playPop();
    setFlyingLetter(true);

    setTimeout(() => {
      setLettersInVault((prev) => [customMsg, ...prev]);
      setFlyingLetter(false);
      sound.playCoin();
      onAddXp(10);
    }, 800);
  };

  const handleTrySteal = () => {
    sound.playBuzzer();
    setIsSlotBuzzing(true);
    setTimeout(() => setIsSlotBuzzing(false), 500);
  };

  const handleUnlockVault = () => {
    if (isVaultOpen) return;
    sound.playUnlock();
    setIsVaultOpen(true);
    onAddXp(25);
    onComplete();
  };

  const handleRunHackerSimulator = () => {
    setIsHackerCracking(true);
    sound.playClick();
    let current = 0;
    const max = keyBitLength <= 16 ? Math.pow(2, keyBitLength) : 500;
    const interval = setInterval(() => {
      current += Math.max(1, Math.floor(max / 15));
      if (current >= max) {
        current = max;
        clearInterval(interval);
        setIsHackerCracking(false);
        if (keyBitLength <= 16) {
          sound.playBuzzer();
        } else {
          sound.playClick();
        }
      }
      setHackerGuesses(current);
    }, 40);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFE66D] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-2 shadow-[3px_3px_0px_0px_#000] rotate-[1deg]">
          Station 02: Asymmetric Cryptography
        </span>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
          The Two Keys (Wallets)
        </h2>
        <p className="text-neutral-700 text-sm max-w-xl mx-auto mt-1 font-medium">
          Anyone can drop a message or coins into your <strong>Public Address</strong>.
          Only your secret <strong>Private Key</strong> can unlock the vault to read or spend them!
        </p>
      </div>

      <CharacterHelper
        message={
          !isVaultOpen
            ? "Try dropping a secret letter into the brass slot above! Then click 'Try to reach in' to see why one-way slots keep mail safe. To claim your mail, click Bob's Red Lock Key!"
            : "Boom! Vault unlocked! Remember: Share your Public Address like your school locker number, but NEVER share your Private Key with anyone!"
        }
        mood={isVaultOpen ? 'celebrating' : isSlotBuzzing ? 'warning' : 'happy'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Mailbox & Vault Visual */}
        <div className="lg:col-span-6 bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center pb-3 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <span>📫</span> Bob's Crypto Wallet Box
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#4ECDC4] border border-black text-black font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              Public / Private Pair
            </span>
          </div>

          {/* Physical Mailbox & Vault Stage - Unified Dual-Key Enclosure */}
          <div className="my-6 relative flex flex-col items-center w-full max-w-xs">
            <div className="w-64 border-4 border-black rounded-[36px] overflow-hidden shadow-[6px_6px_0px_0px_#000] bg-[#1A1A1A]">
              {/* Top Mailbox (Public Key) */}
              <div className="w-full bg-[#FFE66D] border-b-4 border-black p-5 relative flex flex-col items-center justify-center">
                <div className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                  <span>PUBLIC KEY</span>
                  <span className="bg-black/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold">Deposit Slot</span>
                </div>

                {/* Mail Slot */}
                <div
                  onClick={handleTrySteal}
                  className={`w-44 h-7 bg-black rounded-full mt-1 cursor-pointer transition-transform flex items-center justify-center border-2 border-black ${
                    isSlotBuzzing ? 'bg-rose-600 scale-105 animate-shake' : 'hover:scale-102'
                  }`}
                  title="Click to attempt reaching inside"
                >
                  <div className="w-32 h-1 bg-white/40 rounded-full" />
                </div>

                <div className="text-[10px] text-[#1A1A1A] font-black uppercase tracking-wider mt-2.5 flex items-center gap-1">
                  <span>Anyone can deposit mail</span>
                  <span>✉️</span>
                </div>

                {/* Animated flying letter */}
                <AnimatePresence>
                  {flyingLetter && (
                    <motion.div
                      initial={{ y: -50, scale: 1.2, opacity: 0 }}
                      animate={{ y: 15, scale: 0.6, opacity: 1 }}
                      exit={{ y: 70, opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="absolute text-3xl pointer-events-none z-20"
                    >
                      ✉️
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Vault (Private Key - Red Lock Key) */}
              <div className="w-full bg-[#1A1A1A] p-5 relative flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[#FFE66D] mb-3">
                  <span>PRIVATE KEY</span>
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono text-[#55E6C1]">Secret Vault</span>
                </div>

                <AnimatePresence mode="wait">
                  {!isVaultOpen ? (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2.5"
                    >
                      <button
                        onClick={handleUnlockVault}
                        className="w-16 h-16 rounded-2xl bg-[#FF6B6B] hover:bg-[#ff5252] border-3 border-black flex items-center justify-center text-3xl text-white shadow-[3px_3px_0px_0px_#000] hover:scale-105 active:translate-y-1 transition-transform group cursor-pointer"
                        title="Click Bob's Red Lock Key to unlock"
                      >
                        <Lock className="w-8 h-8 text-white group-hover:animate-bounce" />
                      </button>
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#FFE66D] text-center">
                        Locked with 256-bit Math
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full flex flex-col items-center justify-start text-center"
                    >
                      <div className="flex items-center gap-1.5 text-[#55E6C1] text-xs font-black uppercase tracking-wider mb-2">
                        <Unlock className="w-4 h-4" /> Vault Opened!
                      </div>
                      <div className="w-full bg-white rounded-xl p-2.5 max-h-28 overflow-y-auto space-y-1.5 text-left border-2 border-black shadow-inner">
                        {lettersInVault.map((letter, i) => (
                          <div key={i} className="text-[10px] text-neutral-900 font-bold truncate">
                            📩 {letter}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleTrySteal}
              className="flex-1 py-3 px-3 rounded-2xl bg-white hover:bg-rose-100 border-3 border-black text-xs font-black uppercase tracking-wider text-rose-800 shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              Try reaching INTO slot!
            </button>

            {!isVaultOpen ? (
              <button
                onClick={handleUnlockVault}
                className="flex-1 py-3 px-3 rounded-2xl bg-[#FFE66D] hover:bg-[#4ECDC4] border-3 border-black text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-4 h-4 text-black" />
                Use Private Key
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsVaultOpen(false);
                }}
                className="flex-1 py-3 px-3 rounded-2xl bg-neutral-200 hover:bg-neutral-300 border-3 border-black text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                Lock Vault Back
              </button>
            )}
          </div>
        </div>

        {/* Right: Message Sender & Security Bit Slider */}
        <div className="lg:col-span-6 space-y-4">
          {/* Send Message Card */}
          <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000]">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span>✉️</span> Send Encrypted Message / Coins to Bob
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type a secret message..."
                className="w-full p-3 rounded-xl border-3 border-black text-xs font-bold focus:outline-none focus:bg-[#FFF9F2] shadow-[3px_3px_0px_0px_#000]"
              />

              <div className="flex flex-wrap gap-2">
                {PRESET_MESSAGES.slice(0, 3).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomMsg(p)}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-[#FFF9F2] border-2 border-black hover:bg-[#FFE66D] text-black font-bold truncate max-w-[210px] shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSendLetter}
                disabled={flyingLetter}
                className="w-full py-3.5 rounded-2xl bg-[#4ECDC4] hover:bg-[#FFE66D] border-3 border-black text-black font-black uppercase text-xs sm:text-sm tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Deposit to Bob's Public Slot
              </button>
            </div>
          </div>

          {/* Interactive Slider: Bit-Length & Brute-Force Cracking Simulation */}
          <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <span>🔐</span> Key Strength (Bit Length)
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {keyBitLength} Bits
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={
                keyBitLength === 4
                  ? 0
                  : keyBitLength === 8
                  ? 1
                  : keyBitLength === 16
                  ? 2
                  : keyBitLength === 64
                  ? 3
                  : 4
              }
              onChange={(e) => {
                const map = [4, 8, 16, 64, 256];
                setKeyBitLength(map[Number(e.target.value)]);
                setHackerGuesses(0);
              }}
              className="w-full h-3.5 bg-neutral-100 rounded-lg border-2 border-black cursor-pointer appearance-none"
            />

            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider">
              <span>4-Bit</span>
              <span>8-Bit</span>
              <span>16-Bit</span>
              <span>64-Bit</span>
              <span className="text-rose-600 font-black">256-Bit</span>
            </div>

            {/* Crack time info */}
            <div className="p-3.5 bg-[#FFF9F2] border-3 border-black rounded-2xl text-xs space-y-1 shadow-[3px_3px_0px_0px_#000]">
              <div className="font-black uppercase tracking-wider text-[#1A1A1A]">Supercomputer Guess Time:</div>
              <div className="text-[11px] text-neutral-800 font-bold">
                {getCrackTimeText(keyBitLength)}
              </div>
            </div>

            {/* Hacker Simulator Button */}
            <button
              onClick={handleRunHackerSimulator}
              disabled={isHackerCracking}
              className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-[#FFE66D] border-3 border-black text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🕵️</span>
              {isHackerCracking
                ? `Hacker Testing Keys... (${hackerGuesses} checked)`
                : `Test Brute-Force Guessing on ${keyBitLength}-Bit Lock`}
            </button>

            {hackerGuesses > 0 && !isHackerCracking && (
              <div
                className={`p-3 rounded-2xl text-xs text-center font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] ${
                  keyBitLength <= 16
                    ? 'bg-rose-200 text-rose-950'
                    : 'bg-[#55E6C1] text-black'
                }`}
              >
                {keyBitLength <= 16
                  ? `🚨 Lock Cracked in ${hackerGuesses} tries! Too weak for crypto!`
                  : `🛡️ Impenetrable! After ${hackerGuesses} tries, the hacker gave up! 256-bit math is unbreakable!`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
