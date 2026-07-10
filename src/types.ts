export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  group: 'A' | 'B';
}

export interface Match {
  id: string;
  stage: string;
  group: 'A' | 'B' | 'Playoff';
  date: string; // e.g. 'Sabato 15 Giugno'
  time: string; // e.g. '18:30'
  team1Id: string;
  team2Id: string;
  team1Score?: number;
  team2Score?: number;
  status: 'live' | 'completed' | 'scheduled';
  period?: string; // e.g. '2° Tempo'
  timeRemaining?: string; // e.g. '04:32'
  pitch: string; // e.g. 'Pitch 1'
}

export interface Scorer {
  id: string;
  name: string;
  teamId: string;
  goals: number;
  portraitUrl: string;
  rank: number;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: string;
  tags: string[];
  imageUrl: string;
}

export interface ActivityLog {
  id: string;
  type: 'registration' | 'result' | 'maintenance' | 'login' | 'system';
  message: string;
  details: string;
  timestamp: string;
}

export interface StandingsRow {
  rank: number;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: 'Portiere' | 'Difensore' | 'Attaccante' | 'Centroboa' | 'Misto';
  goals: number;
  portraitUrl?: string;
  number?: number;
}

export interface TournamentConfig {
  title: string;
  subtitle: string;
  primaryColor: string; // e.g. '#0284c7'
  secondaryColor: string; // e.g. '#f59e0b'
  logoUrl: string;
  bgImageUrl: string;
  headerBgImageUrl?: string;
  adminPin: string; // PIN for protected access
  tappaNumber?: number;
  tappaName?: string;
}

