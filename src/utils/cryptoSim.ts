// Deterministic hash and crypto simulation for educational visualization

export function simpleHash(input: string): string {
  // High-avalanche deterministic 64-char hex hash
  let h1 = 0x6a09e667 ^ input.length;
  let h2 = 0xbb67ae85 ^ (input.length * 31);
  let h3 = 0x3c6ef372 ^ (input.length * 107);
  let h4 = 0xa54ff53a ^ (input.length * 269);

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x85ebca6b) + h4;
    h1 = (h1 << 13) | (h1 >>> 19);
    h2 = Math.imul(h2 ^ ch, 0xc2b2ae35) + h1;
    h2 = (h2 << 17) | (h2 >>> 15);
    h3 = Math.imul(h3 ^ ch, 0x27d4eb2f) + h2;
    h3 = (h3 << 19) | (h3 >>> 13);
    h4 = Math.imul(h4 ^ ch, 0x165667b1) + h3;
    h4 = (h4 << 23) | (h4 >>> 9);
  }

  // 8 distinct words for 64 hex characters (8 x 8)
  const seeds = [h1, h2, h3, h4, h1 ^ h3, h2 ^ h4, h1 + h2, h3 + h4];
  let fullHex = '';
  for (let round = 0; round < 8; round++) {
    let w = seeds[round] ^ (round * 0x9e3779b9);
    for (let j = 0; j < input.length; j++) {
      w = Math.imul(w ^ (input.charCodeAt(j) * (round + 7)), 0x5bd1e995 + round * 0x10001);
      w ^= w >>> 15;
    }
    w = Math.imul(w ^ (w >>> 16), 0x22468225);
    w ^= w >>> 13;
    fullHex += (w >>> 0).toString(16).padStart(8, '0');
  }

  return fullHex.slice(0, 64);
}

// Generate an 8x8 color avatar matrix based on the hash (like GitHub identicons, visual hash)
export function hashToGrid(hashStr: string): string[] {
  const colors = [
    '#4D8AFF', '#FF5FA2', '#8F6BFF', '#22B8A6', '#F4B740',
    '#FF5D5D', '#00C897', '#FF8E00', '#9B51E0', '#3D3552'
  ];
  const grid: string[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      const charCode = hashStr.charCodeAt((row * 3 + col) % hashStr.length);
      const isFilled = (charCode % 2) === 0;
      const color = isFilled ? colors[charCode % colors.length] : '#FFFFFF';
      grid[row * 6 + col] = color;
      grid[row * 6 + (5 - col)] = color; // symmetric mirror
    }
  }
  return grid;
}

export function formatHashShort(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
}
