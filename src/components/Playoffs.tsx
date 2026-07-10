import React, { useState } from 'react';
import { Match, Team, StandingsRow } from '../types';
import { calculateStandings } from '../utils';
import { Trophy, Shield, HelpCircle, Calendar, MapPin, Sparkles, ChevronRight } from 'lucide-react';

interface PlayoffsProps {
  matches: Match[];
  teams: Team[];
  onNavigate?: (tab: 'home' | 'schedule' | 'standings' | 'admin') => void;
  onGeneratePlayoffs?: () => void;
  isAdmin?: boolean;
}

export default function Playoffs({ matches, teams, onNavigate, onGeneratePlayoffs, isAdmin = false }: PlayoffsProps) {
  const playoffMatches = matches.filter((m) => m.group === 'Playoff');

  const getTeam = (id: string) => {
    return teams.find((t) => t.id === id) || { name: 'TBD', shortName: 'TBD', logoUrl: '' };
  };

  // Organize matches by round/type
  // Let's identify matches by their stage or keyword in their title/id
  const qfMatches = playoffMatches.filter(m => m.stage.includes('Quarti') || m.id.startsWith('qf-'));
  const sfMatches = playoffMatches.filter(m => m.stage.includes('Semifinale') || m.id.startsWith('sf-'));
  const finalMatches = playoffMatches.filter(m => m.stage.includes('Finale') || m.id.startsWith('fn-'));

  // Sort them so they align correctly in the visual tree
  // QF1: 1A vs 4B, QF2: 2B vs 3A, QF3: 1B vs 4A, QF4: 2A vs 3B
  const sortedQFs = [...qfMatches].sort((a, b) => a.id.localeCompare(b.id));
  const sortedSFs = [...sfMatches].sort((a, b) => a.id.localeCompare(b.id));
  const sortedFNs = [...finalMatches].sort((a, b) => a.id.localeCompare(b.id));

  // Find placement finals:
  const final1st = sortedFNs.find(m => m.stage.includes('1°') || m.id === 'fn-1-2');
  const final3rd = sortedFNs.find(m => m.stage.includes('3°') || m.id === 'fn-3-4');
  const final5th = sortedFNs.find(m => m.stage.includes('5°') || m.id === 'fn-5-6');
  const final7th = sortedFNs.find(m => m.stage.includes('7°') || m.id === 'fn-7-8');

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-8 pb-12 animate-fade-in" id="playoffs-view">
      {/* Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-yellow-600 to-amber-700 p-6 text-white italic rounded-lg shadow-lg border-b-4 border-amber-800">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <Trophy className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 space-y-1">
          <span className="text-secondary font-mono text-xs font-bold tracking-widest uppercase">Fase Finale</span>
          <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
            Semifinali e Finali
          </h2>
          <p className="font-sans text-xs opacity-90 not-italic mt-1 text-amber-100">
            Tabellone generato automaticamente dal 1° all'8° posto sulla base delle classifiche dei gironi.
          </p>
        </div>
      </section>

      {playoffMatches.length === 0 ? (
        <div className="bg-surface-low border border-dashed border-white/10 rounded-xl p-8 text-center max-w-xl mx-auto space-y-6 glossy-card">
          <div className="w-16 h-16 bg-surface-high rounded-full flex items-center justify-center mx-auto border border-white/5">
            <Trophy className="w-8 h-8 text-secondary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-white uppercase italic">Tabellone Non Ancora Generato</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              I playoff dal 1° all'8° posto vengono generati incrociando automaticamente le prime 4 squadre del Girone A con le prime 4 del Girone B.
            </p>
          </div>
          {isAdmin ? (
            <div className="pt-2">
              <button
                onClick={onGeneratePlayoffs}
                className="btn-primary px-6 py-3 font-display text-xs font-black uppercase italic text-white rounded cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" /> Genera Tabellone Finali
              </button>
            </div>
          ) : (
            <div className="p-4 bg-surface-high/50 rounded-lg border border-white/5 text-xs text-on-surface-variant flex items-center gap-3">
              <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
              <p className="text-left">
                Per generare il tabellone delle Finali, accedi come Amministratore nel pannello di controllo ed esegui la configurazione.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Visual Bracket Tree Flow (Desktop horizontally / Mobile stacked) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4 overflow-x-auto pb-6">
            {/* Round 1: Quarti di Finale */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="border-b border-white/10 pb-2">
                <h3 className="font-display text-sm font-black text-secondary uppercase italic flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-secondary rounded-full" />
                  Quarti di Finale
                </h3>
                <span className="text-[10px] font-mono text-on-surface-variant uppercase font-semibold">Gara di andata/eliminazione</span>
              </div>

              <div className="space-y-6 py-2 flex-1 flex flex-col justify-around">
                {sortedQFs.map((match, i) => {
                  const team1 = getTeam(match.team1Id);
                  const team2 = getTeam(match.team2Id);
                  return (
                    <div key={match.id} className="bg-surface-low border border-white/5 rounded-lg glossy-card p-3 space-y-2 relative group hover:border-secondary transition-all">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-on-surface-variant uppercase">
                        <span>QF {i + 1}</span>
                        <span>{match.status === 'live' ? 'LIVE' : match.status === 'completed' ? 'FINALE' : match.time}</span>
                      </div>
                      <div className="space-y-1.5">
                        {/* Team 1 */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white uppercase truncate max-w-[140px]">{team1.name}</span>
                          <span className="font-mono font-black text-secondary">
                            {match.status !== 'scheduled' ? match.team1Score : '--'}
                          </span>
                        </div>
                        {/* Team 2 */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white uppercase truncate max-w-[140px]">{team2.name}</span>
                          <span className="font-mono font-black text-secondary">
                            {match.status !== 'scheduled' ? match.team2Score : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round 2: Semifinali */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="border-b border-white/10 pb-2">
                <h3 className="font-display text-sm font-black text-primary uppercase italic flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                  Semifinali (1°-4° Posto)
                </h3>
                <span className="text-[10px] font-mono text-on-surface-variant uppercase font-semibold">Verso la finalissima</span>
              </div>

              <div className="space-y-6 py-2 flex-1 flex flex-col justify-around">
                {sortedSFs.map((match, i) => {
                  const team1 = getTeam(match.team1Id);
                  const team2 = getTeam(match.team2Id);
                  return (
                    <div key={match.id} className="bg-surface-low border border-white/5 rounded-lg glossy-card p-3 space-y-2 relative group hover:border-primary transition-all">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-on-surface-variant uppercase">
                        <span>Semifinale {i + 1}</span>
                        <span>{match.status === 'live' ? 'LIVE' : match.status === 'completed' ? 'FINALE' : match.time}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white uppercase truncate max-w-[140px]">{team1.name}</span>
                          <span className="font-mono font-black text-primary">
                            {match.status !== 'scheduled' ? match.team1Score : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white uppercase truncate max-w-[140px]">{team2.name}</span>
                          <span className="font-mono font-black text-primary">
                            {match.status !== 'scheduled' ? match.team2Score : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round 3: Finali Posizionamento */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="border-b border-white/10 pb-2">
                <h3 className="font-display text-sm font-black text-yellow-500 uppercase italic flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Finali di Piazzamento
                </h3>
                <span className="text-[10px] font-mono text-on-surface-variant uppercase font-semibold">Podi e classifiche finali</span>
              </div>

              <div className="space-y-4 py-2 flex-1 flex flex-col justify-around">
                {/* 1°/2° Posto */}
                {final1st && (
                  <div className="bg-surface-low border-2 border-yellow-500 rounded-lg p-4 space-y-3 relative glossy-card">
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black uppercase rounded tracking-wider skew-x-[-10deg]">
                      1° & 2° Posto
                    </span>
                    <h4 className="font-display text-[10px] font-bold text-yellow-500 uppercase italic">Finalissima Cup</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-white uppercase truncate">{getTeam(final1st.team1Id).name}</span>
                        <span className="font-mono font-black text-yellow-500">{final1st.status !== 'scheduled' ? final1st.team1Score : '--'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-white uppercase truncate">{getTeam(final1st.team2Id).name}</span>
                        <span className="font-mono font-black text-yellow-500">{final1st.status !== 'scheduled' ? final1st.team2Score : '--'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3°/4° Posto */}
                {final3rd && (
                  <div className="bg-surface-low border border-white/10 rounded-lg p-3 space-y-2 relative glossy-card">
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded tracking-wider">
                      3° & 4° Posto
                    </span>
                    <h4 className="font-display text-[10px] font-bold text-primary uppercase italic">Finale Bronzo</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white uppercase truncate">{getTeam(final3rd.team1Id).name}</span>
                        <span className="font-mono font-bold text-primary">{final3rd.status !== 'scheduled' ? final3rd.team1Score : '--'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white uppercase truncate">{getTeam(final3rd.team2Id).name}</span>
                        <span className="font-mono font-bold text-primary">{final3rd.status !== 'scheduled' ? final3rd.team2Score : '--'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5°/6° Posto */}
                {final5th && (
                  <div className="bg-surface-low border border-white/5 rounded-lg p-2.5 space-y-1.5 glossy-card">
                    <div className="flex justify-between items-center text-[8px] font-mono text-on-surface-variant font-bold uppercase">
                      <span>Finale 5° & 6° Posto</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white uppercase truncate">{getTeam(final5th.team1Id).name}</span>
                        <span className="font-mono text-on-surface-variant">{final5th.status !== 'scheduled' ? final5th.team1Score : '--'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white uppercase truncate">{getTeam(final5th.team2Id).name}</span>
                        <span className="font-mono text-on-surface-variant">{final5th.status !== 'scheduled' ? final5th.team2Score : '--'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7°/8° Posto */}
                {final7th && (
                  <div className="bg-surface-low border border-white/5 rounded-lg p-2.5 space-y-1.5 glossy-card">
                    <div className="flex justify-between items-center text-[8px] font-mono text-on-surface-variant font-bold uppercase">
                      <span>Finale 7° & 8° Posto</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white uppercase truncate">{getTeam(final7th.team1Id).name}</span>
                        <span className="font-mono text-on-surface-variant">{final7th.status !== 'scheduled' ? final7th.team1Score : '--'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white uppercase truncate">{getTeam(final7th.team2Id).name}</span>
                        <span className="font-mono text-on-surface-variant">{final7th.status !== 'scheduled' ? final7th.team2Score : '--'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
