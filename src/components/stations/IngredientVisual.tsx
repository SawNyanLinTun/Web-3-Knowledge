import React from 'react';

interface IngredientVisualProps {
  ingredientId: string;
  biteSize: number; // 0 to 100
  size?: number;
  className?: string;
}

export const IngredientVisual: React.FC<IngredientVisualProps> = ({
  ingredientId,
  biteSize,
  size = 64,
  className = '',
}) => {
  // Normalize stage based on biteSize:
  // 0: Whole / untouched
  // 1 to 34: Small bite taken
  // 35 to 74: Half-eaten (50%)
  // 75 to 100: Core / crumbs (100%)
  const isUntouched = biteSize === 0;
  const isSmallBite = biteSize > 0 && biteSize < 35;
  const isHalfBitten = biteSize >= 35 && biteSize < 75;
  const isCoreOrEmpty = biteSize >= 75;

  const renderApple = (skinColor: string, leafColor: string = '#4ECDC4') => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`overflow-visible select-none drop-shadow-[2px_2px_0px_#000] ${className}`}
      >
        {/* Apple Stem */}
        <path
          d="M 50 30 C 51 18, 58 14, 62 10"
          stroke="#3D2314"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Apple Leaf */}
        <path
          d="M 52 24 C 66 16, 74 22, 70 30 C 62 32, 54 28, 52 24 Z"
          fill={leafColor}
          stroke="#000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* STAGE 1: Whole Apple (0% Bite) */}
        {isUntouched && (
          <g>
            {/* Full Apple Body */}
            <path
              d="M 50 34 C 40 25, 20 28, 18 48 C 16 66, 32 84, 50 84 C 68 84, 84 66, 82 48 C 80 28, 60 25, 50 34 Z"
              fill={skinColor}
              stroke="#000"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Glossy specular highlight */}
            <path
              d="M 28 42 C 24 50, 26 60, 30 66"
              stroke="#FFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.75"
              fill="none"
            />
            <circle cx="33" cy="38" r="2.5" fill="#FFF" opacity="0.75" />
          </g>
        )}

        {/* STAGE 2: Small Bite Taken (1% - 34%) */}
        {isSmallBite && (
          <g>
            {/* Apple body with bite on right side */}
            <path
              d="M 50 34 C 40 25, 20 28, 18 48 C 16 66, 32 84, 50 84 C 66 84, 80 68, 80 58 C 73 57, 72 51, 76 46 C 72 41, 73 35, 79 36 C 74 29, 62 26, 50 34 Z"
              fill={skinColor}
              stroke="#000"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Cream inner flesh visible in bite */}
            <path
              d="M 80 58 C 73 57, 72 51, 76 46 C 72 41, 73 35, 79 36"
              stroke="#FFF2B2"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Specular highlight on remaining skin */}
            <path
              d="M 28 42 C 24 50, 26 60, 30 66"
              stroke="#FFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
              fill="none"
            />
            {/* Tiny bite crumbs */}
            <circle cx="85" cy="48" r="2" fill={skinColor} stroke="#000" strokeWidth="1" />
            <circle cx="88" cy="56" r="1.5" fill="#FFF2B2" stroke="#000" strokeWidth="0.8" />
          </g>
        )}

        {/* STAGE 3: Half Apple (35% - 74%, e.g. 50% Bite) */}
        {isHalfBitten && (
          <g>
            {/* Half Apple Body (Entire right half eaten away with teeth marks) */}
            <path
              d="M 50 34 C 40 25, 20 28, 18 48 C 16 66, 32 84, 50 84 C 44 76, 43 68, 48 62 C 41 56, 42 48, 48 44 C 43 40, 44 35, 50 34 Z"
              fill={skinColor}
              stroke="#000"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Creamy Flesh Edge along the deep bite */}
            <path
              d="M 50 84 C 44 76, 43 68, 48 62 C 41 56, 42 48, 48 44 C 43 40, 44 35, 50 34"
              stroke="#FFF2B2"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Core Apple Seed inside the half */}
            <ellipse
              cx="40"
              cy="54"
              rx="2.5"
              ry="4"
              transform="rotate(15 40 54)"
              fill="#2A2438"
              stroke="#000"
              strokeWidth="1"
            />
            {/* Specular highlight on left skin */}
            <path
              d="M 27 44 C 24 51, 25 58, 28 64"
              stroke="#FFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.75"
              fill="none"
            />
            {/* Flying teeth crumbs */}
            <circle cx="58" cy="45" r="2.5" fill={skinColor} stroke="#000" strokeWidth="1" />
            <circle cx="64" cy="58" r="2" fill="#FFF2B2" stroke="#000" strokeWidth="1" />
            <circle cx="56" cy="68" r="1.5" fill={skinColor} stroke="#000" strokeWidth="0.8" />
          </g>
        )}

        {/* STAGE 4: Apple Core (75% - 100%, 100% Core) */}
        {isCoreOrEmpty && (
          <g>
            {/* Top skin sliver */}
            <path
              d="M 40 35 C 44 31, 56 31, 60 35 C 56 40, 44 40, 40 35 Z"
              fill={skinColor}
              stroke="#000"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Bottom skin sliver */}
            <path
              d="M 42 78 C 46 83, 54 83, 58 78 C 55 74, 45 74, 42 78 Z"
              fill={skinColor}
              stroke="#000"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Thin bitten core column */}
            <path
              d="M 44 38 C 46 47, 48 51, 48 57 C 48 63, 46 69, 44 75 L 56 75 C 54 69, 52 63, 52 57 C 52 51, 54 47, 56 38 Z"
              fill="#FFF2B2"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Two dark apple seeds in the core */}
            <ellipse
              cx="49"
              cy="53"
              rx="2"
              ry="3.5"
              transform="rotate(-15 49 53)"
              fill="#2A2438"
            />
            <ellipse
              cx="51"
              cy="61"
              rx="2"
              ry="3.5"
              transform="rotate(15 51 61)"
              fill="#2A2438"
            />
            {/* Dropped seeds and crumbs at bottom */}
            <circle cx="68" cy="80" r="2.5" fill={skinColor} stroke="#000" strokeWidth="1" />
            <circle cx="74" cy="78" r="1.5" fill="#FFF2B2" stroke="#000" strokeWidth="1" />
            <circle cx="30" cy="80" r="2" fill={skinColor} stroke="#000" strokeWidth="1" />
          </g>
        )}
      </svg>
    );
  };

  const renderDonut = () => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`overflow-visible select-none drop-shadow-[2px_2px_0px_#000] ${className}`}
      >
        {isUntouched && (
          <g>
            {/* Whole Donut */}
            <circle cx="50" cy="50" r="32" fill="#F4B740" stroke="#000" strokeWidth="3" />
            <circle cx="50" cy="50" r="26" fill="#FF6B6B" stroke="#000" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="12" fill="#FFF9F2" stroke="#000" strokeWidth="3" />
            {/* Sprinkles */}
            <rect x="42" y="30" width="6" height="2.5" rx="1" fill="#FFE66D" transform="rotate(30 42 30)" />
            <rect x="58" y="34" width="6" height="2.5" rx="1" fill="#4ECDC4" transform="rotate(-20 58 34)" />
            <rect x="34" y="52" width="6" height="2.5" rx="1" fill="#FFFFFF" transform="rotate(45 34 52)" />
            <rect x="56" y="64" width="6" height="2.5" rx="1" fill="#FFE66D" transform="rotate(10 56 64)" />
          </g>
        )}

        {(isSmallBite || isHalfBitten) && (
          <g>
            {/* Half Bitten Donut */}
            <path
              d="M 50 18 A 32 32 0 0 0 50 82 C 45 74, 44 66, 48 60 C 42 54, 43 46, 48 40 C 44 34, 44 26, 50 18 Z"
              fill="#F4B740"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Frosting layer */}
            <path
              d="M 50 24 A 26 26 0 0 0 50 76 C 46 70, 45 64, 49 60 C 44 54, 45 46, 49 40 C 46 34, 46 28, 50 24 Z"
              fill="#FF6B6B"
              stroke="#000"
              strokeWidth="2"
            />
            {/* Donut hole crescent */}
            <path d="M 50 38 A 12 12 0 0 0 50 62 Z" fill="#FFF9F2" stroke="#000" strokeWidth="2.5" />
            <circle cx="62" cy="48" r="2.5" fill="#F4B740" stroke="#000" strokeWidth="1" />
            <circle cx="68" cy="58" r="2" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
          </g>
        )}

        {isCoreOrEmpty && (
          <g>
            {/* Only crumbs remain */}
            <circle cx="45" cy="52" r="3.5" fill="#F4B740" stroke="#000" strokeWidth="1.5" />
            <circle cx="55" cy="48" r="2.5" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
            <circle cx="52" cy="58" r="4" fill="#F4B740" stroke="#000" strokeWidth="1.5" />
            <circle cx="62" cy="56" r="2" fill="#FFE66D" stroke="#000" strokeWidth="1" />
            <circle cx="38" cy="56" r="2" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
          </g>
        )}
      </svg>
    );
  };

  const renderPepper = () => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`overflow-visible select-none drop-shadow-[2px_2px_0px_#000] ${className}`}
      >
        {isUntouched && (
          <g>
            <path
              d="M 50 22 C 55 12, 65 14, 68 8"
              stroke="#22B8A6"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 38 25 C 45 22, 55 22, 62 25 C 60 28, 40 28, 38 25 Z"
              fill="#22B8A6"
              stroke="#000"
              strokeWidth="2"
            />
            <path
              d="M 40 26 C 65 30, 72 55, 66 75 C 62 85, 48 88, 48 88 C 48 88, 34 68, 36 45 C 37 32, 38 27, 40 26 Z"
              fill="#FF5D5D"
              stroke="#000"
              strokeWidth="3"
            />
          </g>
        )}

        {(isSmallBite || isHalfBitten) && (
          <g>
            <path
              d="M 50 22 C 55 12, 65 14, 68 8"
              stroke="#22B8A6"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 38 25 C 45 22, 55 22, 62 25 C 60 28, 40 28, 38 25 Z"
              fill="#22B8A6"
              stroke="#000"
              strokeWidth="2"
            />
            <path
              d="M 40 26 C 58 30, 64 42, 62 55 C 56 50, 52 55, 46 52 C 40 56, 36 50, 37 45 C 37 32, 38 27, 40 26 Z"
              fill="#FF5D5D"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Pepper seeds */}
            <circle cx="50" cy="50" r="2" fill="#FFE66D" stroke="#000" strokeWidth="0.8" />
            <circle cx="54" cy="54" r="1.8" fill="#FFE66D" stroke="#000" strokeWidth="0.8" />
          </g>
        )}

        {isCoreOrEmpty && (
          <g>
            <path
              d="M 50 22 C 55 12, 65 14, 68 8"
              stroke="#22B8A6"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 38 25 C 45 22, 55 22, 62 25 C 60 30, 40 30, 38 25 Z"
              fill="#22B8A6"
              stroke="#000"
              strokeWidth="2"
            />
            <circle cx="50" cy="34" r="2" fill="#FFE66D" stroke="#000" strokeWidth="0.8" />
            <circle cx="56" cy="38" r="1.5" fill="#FF5D5D" stroke="#000" strokeWidth="0.8" />
          </g>
        )}
      </svg>
    );
  };

  const renderLeaf = () => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`overflow-visible select-none drop-shadow-[2px_2px_0px_#000] ${className}`}
      >
        {isUntouched && (
          <g>
            <path
              d="M 25 75 Q 45 65 75 25"
              stroke="#000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 75 25 C 40 20, 20 40, 25 75 C 60 80, 80 60, 75 25 Z"
              fill="#4ECDC4"
              stroke="#000"
              strokeWidth="3"
            />
            <path d="M 40 55 Q 52 48 60 40" stroke="#000" strokeWidth="2" fill="none" />
          </g>
        )}

        {(isSmallBite || isHalfBitten) && (
          <g>
            <path
              d="M 25 75 Q 45 65 75 25"
              stroke="#000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 75 25 C 55 22, 45 35, 48 42 C 40 45, 42 55, 45 60 C 35 62, 30 70, 25 75 C 50 78, 65 65, 75 25 Z"
              fill="#4ECDC4"
              stroke="#000"
              strokeWidth="3"
            />
          </g>
        )}

        {isCoreOrEmpty && (
          <g>
            {/* Bare leaf skeleton */}
            <path
              d="M 25 75 Q 45 65 75 25"
              stroke="#000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M 40 58 Q 48 52 52 48" stroke="#000" strokeWidth="2" fill="none" />
            <path d="M 52 46 Q 60 40 64 36" stroke="#000" strokeWidth="2" fill="none" />
            <circle cx="68" cy="45" r="2" fill="#4ECDC4" stroke="#000" strokeWidth="1" />
          </g>
        )}
      </svg>
    );
  };

  if (ingredientId === 'apple') {
    return renderApple('#FF5D5D', '#4ECDC4');
  }

  if (ingredientId === 'green_apple') {
    return renderApple('#2ED573', '#FFE66D');
  }

  if (ingredientId === 'donut') {
    return renderDonut();
  }

  if (ingredientId === 'pepper') {
    return renderPepper();
  }

  if (ingredientId === 'leaf') {
    return renderLeaf();
  }

  // Fallback to red apple
  return renderApple('#FF5D5D', '#4ECDC4');
};
