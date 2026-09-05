import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';
import { CharacterHelper } from '../CharacterHelper';
import { Play, RotateCcw, Zap, Clock, DollarSign, Package } from 'lucide-react';

interface AssemblyLineStationProps {
  onComplete: () => void;
  onAddXp: (amount: number) => void;
  isCompleted: boolean;
}

interface BeltItem {
  id: number;
  emoji: string;
  name: string;
  fee: number;
  sizeKb: number;
  isStudentTx?: boolean;
  xPos: number; // percentage 100 to -20
}

export const AssemblyLineStation: React.FC<AssemblyLineStationProps> = ({
  onComplete,
  onAddXp,
  isCompleted,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [score, setScore] = useState<number>(0);
  const [packedItems, setPackedItems] = useState<BeltItem[]>([]);
  const [totalSizeKb, setTotalSizeKb] = useState<number>(0);
  const maxBlockCapacityKb = 1000; // 1 MB block limit

  // Interactive Sliders
  const [beltSpeed, setBeltSpeed] = useState<number>(1.5); // 1 to 3
  const [studentGasBid, setStudentGasBid] = useState<number>(20); // 1 to 50
  const [studentTxPacked, setStudentTxPacked] = useState<boolean>(false);

  // Active items moving across conveyor belt
  const [items, setItems] = useState<BeltItem[]>([]);
  const nextId = useRef<number>(1);
  const animFrame = useRef<number | null>(null);

  const ITEM_TEMPLATES = [
    { emoji: '🍕', name: 'Pizza Pay', fee: 2, sizeKb: 150 },
    { emoji: '🎮', name: 'Game Skin', fee: 5, sizeKb: 200 },
    { emoji: '💎', name: 'Diamond NFT', fee: 18, sizeKb: 250 },
    { emoji: '🪙', name: 'Coin Swap', fee: 10, sizeKb: 180 },
    { emoji: '🚀', name: 'VIP Transfer', fee: 35, sizeKb: 300 },
    { emoji: '📄', name: 'Smart Contract', fee: 8, sizeKb: 220 },
  ];

  // Start game
  const handleStartBelt = () => {
    sound.playClick();
    setIsRunning(true);
    setTimeLeft(25);
    setScore(0);
    setPackedItems([]);
    setTotalSizeKb(0);
    setItems([]);
    setStudentTxPacked(false);

    // Inject the student's custom transaction right away
    setItems([
      {
        id: nextId.current++,
        emoji: '⭐',
        name: 'MY TRANSACTION',
        fee: studentGasBid,
        sizeKb: 180,
        isStudentTx: true,
        xPos: 95,
      },
    ]);
  };

  // Main game loop & spawner
  useEffect(() => {
    if (!isRunning) return;

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawner
    const spawnInterval = setInterval(() => {
      const template = ITEM_TEMPLATES[Math.floor(Math.random() * ITEM_TEMPLATES.length)];
      // Random bonus high fee
      const feeModifier = Math.random() > 0.6 ? 2 : 1;
      const newItem: BeltItem = {
        id: nextId.current++,
        emoji: template.emoji,
        name: template.name,
        fee: template.fee * feeModifier,
        sizeKb: template.sizeKb,
        xPos: 105,
      };

      setItems((prev) => [...prev.slice(-8), newItem]);
    }, Math.max(700, 1500 / beltSpeed));

    // Physics / position update loop
    let lastTime = performance.now();
    const updateMotion = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            xPos: item.xPos - (18 * beltSpeed * delta),
          }))
          .filter((item) => item.xPos > -25)
      );

      animFrame.current = requestAnimationFrame(updateMotion);
    };

    animFrame.current = requestAnimationFrame(updateMotion);

    return () => {
      clearInterval(timerInterval);
      clearInterval(spawnInterval);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [isRunning, beltSpeed]);

  const endGame = () => {
    setIsRunning(false);
    sound.playFanfare();
    onAddXp(30);
    if (packedItems.length >= 3) {
      onComplete();
    }
  };

  const handleGrabItem = (item: BeltItem) => {
    if (!isRunning) return;
    if (totalSizeKb + item.sizeKb > maxBlockCapacityKb) {
      sound.playBuzzer();
      return;
    }

    sound.playCoin();
    setScore((prev) => prev + item.fee);
    setTotalSizeKb((prev) => prev + item.sizeKb);
    setPackedItems((prev) => [...prev, item]);
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (item.isStudentTx) {
      setStudentTxPacked(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#FF6B6B] border-2 border-black text-white text-xs font-black uppercase tracking-wider mb-2 shadow-[3px_3px_0px_0px_#000] rotate-[-1deg]">
          Station 03: Mempool & Gas Fees
        </span>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
          The Assembly Line
        </h2>
        <p className="text-neutral-700 text-sm max-w-xl mx-auto mt-1 font-medium">
          You are the Block Builder! Transactions roll down the Mempool conveyor belt.
          Each block only fits <strong>1,000 KB (1 MB)</strong>. Pick the highest-fee transactions before time runs out!
        </p>
      </div>

      <CharacterHelper
        message={
          !isRunning
            ? "Configure your Gas Fee Bid slider below to see how paying a higher tip helps transactions get packed first! Then click 'Start the Assembly Line'!"
            : totalSizeKb >= 900
            ? "Block is almost 100% packed with high fees! You are maximizing revenue like a pro miner!"
            : studentTxPacked
            ? "Your VIP transaction got packed into the block! Fast confirmation achieved!"
            : "Tap the transactions with the highest gold fee tags ($$$) before they fall off the belt!"
        }
        mood={studentTxPacked ? 'celebrating' : isRunning ? 'happy' : 'thinking'}
      />

      <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-6">
        {/* HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Clock className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-[10px] font-black text-neutral-600 uppercase tracking-wider">Time Remaining</div>
              <div className="text-xl font-black text-[#1A1A1A]">{timeLeft}s</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#55E6C1] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <DollarSign className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-[10px] font-black text-neutral-600 uppercase tracking-wider">Block Fees Earned</div>
              <div className="text-xl font-black text-black">${score}</div>
            </div>
          </div>

          {/* Block Capacity Meter */}
          <div className="flex-1 min-w-[200px] max-w-xs">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1">
              <span>📦 Block Space (Max 1 MB)</span>
              <span>{totalSizeKb} / {maxBlockCapacityKb} KB</span>
            </div>
            <div className="w-full h-5 bg-white border-2 border-black rounded-lg overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded transition-all duration-200 ${
                  totalSizeKb > 850 ? 'bg-[#FF6B6B]' : 'bg-[#4ECDC4]'
                }`}
                style={{ width: `${Math.min(100, (totalSizeKb / maxBlockCapacityKb) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* The Conveyor Belt (Mempool) */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <span>🏭</span> Live Mempool Conveyor Belt (Click items to pack!)
            </span>
            {isRunning && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-black bg-[#FFE66D] px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" /> {beltSpeed}x speed
              </span>
            )}
          </div>

          {/* Belt Track */}
          <div className="relative h-30 bg-[#FFF9F2] border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#000] flex items-center">
            {/* Belt stripes */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #000 0 20px, transparent 20px 40px)',
              }}
            />

            {!isRunning && items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-black uppercase tracking-wider text-black bg-[#FFF9F2]/80">
                Conveyor is paused. Press "Start the Assembly Line" below!
              </div>
            )}

            {/* Rolling Items */}
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleGrabItem(item)}
                style={{ left: `${item.xPos}%` }}
                className={`absolute top-3 w-22 h-22 rounded-2xl border-3 flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-[3px_3px_0px_0px_#000] ${
                  item.isStudentTx
                    ? 'bg-[#FFE66D] border-black ring-2 ring-black'
                    : item.fee >= 15
                    ? 'bg-rose-100 border-black'
                    : 'bg-white border-black'
                }`}
              >
                {/* Fee badge */}
                <div
                  className={`absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full border-2 border-black text-[10px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_#000] ${
                    item.fee >= 15 ? 'bg-[#FF6B6B] text-white' : 'bg-[#55E6C1]'
                  }`}
                >
                  +${item.fee}
                </div>

                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[9px] font-black text-[#1A1A1A] truncate w-18 text-center leading-tight uppercase">
                  {item.name}
                </span>
                <span className="text-[8px] text-neutral-600 font-mono font-bold">{item.sizeKb} KB</span>
              </button>
            ))}
          </div>
        </div>

        {/* Packed Block Tray (What's in the current block) */}
        <div className="bg-[#FFF9F2] border-3 border-dashed border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <span>📦</span> Current Block Contents ({packedItems.length} transactions)
            </span>
            {totalSizeKb >= maxBlockCapacityKb && (
              <span className="text-xs font-black uppercase text-rose-600">FULL (Capacity Reached!)</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[50px] items-center">
            {packedItems.length === 0 ? (
              <span className="text-xs text-neutral-600 font-bold italic">
                Block is empty. Tap moving transactions above to add them!
              </span>
            ) : (
              packedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-white border-2 border-black text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
                >
                  <span>{item.emoji}</span>
                  <span className="text-[11px] font-black uppercase text-[#1A1A1A]">{item.name}</span>
                  <span className="text-[10px] text-black font-mono font-black bg-[#55E6C1] px-1.5 py-0.5 rounded border border-black">+${item.fee}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Interactive Sliders (Speed & Student Gas Bid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Slider 1: Belt Speed / Traffic */}
          <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                <span>⚡</span> Network Traffic / Speed
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {beltSpeed}x
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.5"
              value={beltSpeed}
              onChange={(e) => setBeltSpeed(Number(e.target.value))}
              className="w-full h-3.5 bg-white rounded-lg border-2 border-black cursor-pointer appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider mt-1.5">
              <span>1x (Slow)</span>
              <span>2x (Normal)</span>
              <span>3x (Rush Hour!)</span>
            </div>
          </div>

          {/* Slider 2: Your Gas Fee Bid */}
          <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                <span>⭐</span> Your Custom Gas Fee Bid
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#55E6C1] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                ${studentGasBid} Tip
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={studentGasBid}
              onChange={(e) => setStudentGasBid(Number(e.target.value))}
              className="w-full h-3.5 bg-white rounded-lg border-2 border-black cursor-pointer appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider mt-1.5">
              <span>$1 (Snail)</span>
              <span>$25 (Express)</span>
              <span>$50 (Rocket VIP)</span>
            </div>
          </div>
        </div>

        {/* Start / Action Controls */}
        <div className="pt-2 flex justify-center">
          {!isRunning ? (
            <button
              onClick={handleStartBelt}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FF9F43] hover:bg-[#FFE66D] border-3 border-black text-black font-black uppercase text-sm tracking-wider shadow-[5px_5px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              {score > 0 ? 'Run Line Again' : 'Start the Assembly Line!'}
            </button>
          ) : (
            <div className="text-xs font-black uppercase tracking-wider text-black bg-[#FFE66D] px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
              Line is rolling! Quick, click transactions to fill the block!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
