import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';
import { CharacterHelper } from '../CharacterHelper';
import { ShieldCheck, ShieldAlert, Zap, RotateCcw, Users, Link2, Check, AlertTriangle } from 'lucide-react';
import { simpleHash, formatHashShort } from '../../utils/cryptoSim';

interface GlassTowerStationProps {
  onComplete: () => void;
  onAddXp: (amount: number) => void;
  isCompleted: boolean;
}

interface BlockData {
  index: number;
  data: string;
  prevHash: string;
  hash: string;
  isTampered: boolean;
}

export const GlassTowerStation: React.FC<GlassTowerStationProps> = ({
  onComplete,
  onAddXp,
  isCompleted,
}) => {
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number>(1);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [tamperedData, setTamperedData] = useState<string>('Thief steals 9,999 🍎 Apples!');
  const [networkNodes, setNetworkNodes] = useState<number>(100); // 1, 10, 100, 1000

  // Initial honest ledger blocks
  const initialBlocks: BlockData[] = [
    {
      index: 1,
      data: 'Alice sends 1 🍎 to Bob',
      prevHash: '000000000000',
      hash: simpleHash('block-1-honest'),
      isTampered: false,
    },
    {
      index: 2,
      data: 'Bob pays Charlie 2 🪙',
      prevHash: simpleHash('block-1-honest'),
      hash: simpleHash('block-2-honest'),
      isTampered: false,
    },
    {
      index: 3,
      data: 'Charlie buys 1 🍩 Donut',
      prevHash: simpleHash('block-2-honest'),
      hash: simpleHash('block-3-honest'),
      isTampered: false,
    },
    {
      index: 4,
      data: 'Diana mines 50 💎 Gems',
      prevHash: simpleHash('block-3-honest'),
      hash: simpleHash('block-4-honest'),
      isTampered: false,
    },
  ];

  // Calculate current block states based on tampering
  const blocks: BlockData[] = initialBlocks.map((blk, idx) => {
    if (!isTampered) return blk;

    if (idx === 0) {
      // Block 1 is directly tampered
      return {
        ...blk,
        data: tamperedData,
        hash: simpleHash('block-1-tampered'),
        isTampered: true,
      };
    } else {
      // Subsequent blocks become invalid because their stored prevHash doesn't match the new hash of the previous block
      return {
        ...blk,
        isTampered: true,
      };
    }
  });

  const handleTamper = () => {
    sound.playZap();
    setIsTampered(true);
    onAddXp(20);

    setTimeout(() => {
      sound.playBuzzer();
      onComplete();
    }, 800);
  };

  const handleRestore = () => {
    sound.playUnlock();
    setIsTampered(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#4ECDC4] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-2 shadow-[3px_3px_0px_0px_#000] rotate-[-1deg]">
          Station 05: Blockchain & Consensus
        </span>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
          The Glass Tower
        </h2>
        <p className="text-neutral-700 text-sm max-w-xl mx-auto mt-1 font-medium">
          Each block is chained to the previous one using its hash.
          What happens if a sneaky thief tries to rewrite an old block in history?
        </p>
      </div>

      <CharacterHelper
        message={
          isTampered
            ? `ALARM! The thief altered Block #1! Because every block holds the hash of the one before it, the laser link snapped! All ${networkNodes} validator nodes instantly rejected the fake chain!`
            : "Use the 'Time Travel' slider to inspect different blocks in history. Then click 'Help Thief Alter Block #1' to see why the blockchain is tamper-proof!"
        }
        mood={isTampered ? 'warning' : 'happy'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: The Glass Tower Visual */}
        <div
          className={`lg:col-span-6 bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center justify-between transition-colors ${
            isTampered ? 'bg-rose-50' : ''
          }`}
        >
          <div className="w-full flex justify-between items-center pb-2 mb-4 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <span>🗼</span> Transparent Chain of Blocks
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-black shadow-[1px_1px_0px_0px_#000] ${
                isTampered
                  ? 'bg-[#FF6B6B] text-white animate-pulse'
                  : 'bg-[#55E6C1] text-black'
              }`}
            >
              {isTampered ? '🚨 CHAIN CORRUPTED' : '🛡️ VALID CONSENSUS'}
            </span>
          </div>

          {/* Tower Blocks Stack */}
          <div className="w-full max-w-sm flex flex-col-reverse items-center gap-1.5 my-2">
            {blocks.map((blk, idx) => {
              const isSelected = selectedBlockIdx === blk.index;
              return (
                <React.Fragment key={blk.index}>
                  {/* Laser Cable Connector between blocks */}
                  {idx > 0 && (
                    <div
                      className={`w-3.5 h-6 rounded-full border-2 border-black transition-all duration-300 flex items-center justify-center ${
                        isTampered
                          ? 'bg-[#FF6B6B] rotate-6 scale-110 shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-[#4ECDC4] shadow-[2px_2px_0px_0px_#000]'
                      }`}
                    >
                      {isTampered && <Zap className="w-2.5 h-2.5 text-white animate-bounce" />}
                    </div>
                  )}

                  {/* Block Container */}
                  <motion.button
                    onClick={() => {
                      sound.playClick();
                      setSelectedBlockIdx(blk.index);
                    }}
                    animate={
                      isTampered
                        ? {
                            x: [-2, 2, -2, 2, 0],
                            scale: isSelected ? 1.02 : 1,
                          }
                        : { scale: isSelected ? 1.02 : 1 }
                    }
                    className={`w-full p-3.5 rounded-2xl border-3 border-black text-left transition-all flex items-center justify-between shadow-[3px_3px_0px_0px_#000] cursor-pointer ${
                      isTampered
                        ? 'bg-rose-100 text-rose-950'
                        : isSelected
                        ? 'bg-[#FFE66D] text-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center font-black text-sm shadow-[1px_1px_0px_0px_#000] ${
                          isTampered
                            ? 'bg-rose-300 text-black'
                            : 'bg-white text-black'
                        }`}
                      >
                        #{blk.index}
                      </div>

                      <div>
                        <div className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                          <span>{blk.data}</span>
                          {blk.index === 1 && !isTampered && <span>🍎</span>}
                        </div>
                        <div className="text-[10px] text-neutral-600 font-mono font-bold mt-0.5 flex items-center gap-1">
                          <Link2 className="w-2.5 h-2.5" />
                          <span>Hash: {formatHashShort(blk.hash)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xl">
                      {isTampered ? (
                        <span className="text-rose-600 animate-pulse">🔓</span>
                      ) : (
                        <span>🔒</span>
                      )}
                    </div>
                  </motion.button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="w-full pt-4 flex gap-2">
            {!isTampered ? (
              <button
                onClick={handleTamper}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-rose-100 border-3 border-black text-xs font-black uppercase tracking-wider text-rose-800 shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🦹</span> Help Thief Alter Block #1's Record!
              </button>
            ) : (
              <button
                onClick={handleRestore}
                className="w-full py-3 px-4 rounded-2xl bg-[#55E6C1] hover:bg-[#4ECDC4] border-3 border-black text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Sync with Honest Network Chain
              </button>
            )}
          </div>
        </div>

        {/* Right: Interactive Time Travel Slider & Network Consensus Node Slider */}
        <div className="lg:col-span-6 space-y-4">
          {/* Slider 1: Block Inspector Time Travel */}
          <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <span>⏳</span> Time Travel: Inspect Block
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                Block #{selectedBlockIdx}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={selectedBlockIdx}
              onChange={(e) => {
                sound.playClick();
                setSelectedBlockIdx(Number(e.target.value));
              }}
              className="w-full h-3.5 bg-neutral-100 rounded-lg border-2 border-black cursor-pointer appearance-none"
            />

            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider">
              <span>Block #1 (Genesis)</span>
              <span>Block #2</span>
              <span>Block #3</span>
              <span>Block #4</span>
            </div>

            {/* Block details card */}
            {(() => {
              const active = blocks.find((b) => b.index === selectedBlockIdx)!;
              return (
                <div className="p-3.5 bg-[#FFF9F2] border-3 border-black rounded-2xl text-xs space-y-1.5 shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex justify-between font-black uppercase tracking-wider text-[#1A1A1A]">
                    <span>Transaction Ledger:</span>
                    <span className="text-rose-600 normal-case">{active.data}</span>
                  </div>
                  <div className="text-[10px] text-neutral-700 font-bold flex justify-between">
                    <span>Previous Block Hash:</span>
                    <span className="font-mono font-black text-black">
                      {formatHashShort(active.prevHash)}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-700 font-bold flex justify-between">
                    <span>Block Signature Hash:</span>
                    <span className="font-mono font-black text-black">
                      {formatHashShort(active.hash)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Slider 2: Validator Nodes & Consensus Majority */}
          <div className="bg-white border-4 border-black rounded-[36px] p-6 shadow-[8px_8px_0px_0px_#000] space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <span>🌐</span> Network Validator Nodes
              </span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#55E6C1] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {networkNodes} Nodes
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={
                networkNodes === 1
                  ? 0
                  : networkNodes === 10
                  ? 1
                  : networkNodes === 100
                  ? 2
                  : 3
              }
              onChange={(e) => {
                const map = [1, 10, 100, 1000];
                setNetworkNodes(map[Number(e.target.value)]);
              }}
              className="w-full h-3.5 bg-neutral-100 rounded-lg border-2 border-black cursor-pointer appearance-none"
            />

            <div className="flex justify-between text-[10px] text-neutral-600 font-black uppercase tracking-wider">
              <span>1 Node (Single Server)</span>
              <span>10 Nodes</span>
              <span>100 Nodes</span>
              <span className="text-black font-black">1,000+ Nodes</span>
            </div>

            {/* Voting Consensus Outcome */}
            <div
              className={`p-3.5 rounded-2xl border-3 border-black text-xs flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#000] ${
                isTampered
                  ? 'bg-rose-200 text-rose-950'
                  : 'bg-[#55E6C1] text-black'
              }`}
            >
              {isTampered ? (
                <AlertTriangle className="w-6 h-6 text-rose-700 shrink-0" />
              ) : (
                <Check className="w-6 h-6 text-black shrink-0" />
              )}
              <div>
                <div className="font-black uppercase tracking-wider">
                  {isTampered
                    ? `Network Consensus: REJECTED! (${networkNodes - 1} vs 1)`
                    : `Network Consensus: 100% Verified (${networkNodes} nodes)`}
                </div>
                <p className="text-[11px] mt-0.5 font-medium leading-tight">
                  {isTampered
                    ? `Even if the hacker rewrites their local block, the other ${networkNodes - 1} honest computers compare hashes and reject the counterfeit chain immediately!`
                    : `All ${networkNodes} computers across the world agree on the exact same history.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
