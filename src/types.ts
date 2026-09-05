export type StationId = 'map' | 1 | 2 | 3 | 4 | 5;

export interface StationMeta {
  id: 1 | 2 | 3 | 4 | 5;
  glyph: string;
  title: string;
  concept: string;
  tagline: string;
  accentColor: string;
  badgeName: string;
  badgeEmoji: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  stationId: 1 | 2 | 3 | 4 | 5 | 'all';
  unlocked: boolean;
}

export interface AhaContent {
  stationId: 1 | 2 | 3 | 4 | 5;
  badge: string;
  title: string;
  text: string;
  term: string;
  middleSchoolFact: string;
  xpEarned: number;
}
