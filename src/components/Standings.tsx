import React, { useState } from 'react';
import { Match, Team, Scorer, StandingsRow } from '../types';
import { calculateStandings } from '../utils';
import { Trophy, Users, Shield, Target, Award, ArrowUp } from 'lucide-react';

interface StandingsProps {
  matches: Match[];
  teams: Team[];
  scorers: Scorer[];
}

export default function Standings({ matches, teams, scorers }: StandingsProps) {
  const [activeTab, setActiveTab] = useState<'gironi' | 'generale' | 'marcatori'>('gironi');

  const { groupA, groupB } = calculateStandings(matches, teams);

  const getTeam = (id: string) => {
    return teams.find((t) => t.id === id) || { name: 'Unknown', shortName: '??', logoUrl: '' };
  };

  // Pre-configured overall circuit standings (Tappa 1 + Tappa 2 accumulated points)
  const circuitStandings = [
    { pos: 1, name: 'Bari Waterpolo', id: 'bari-waterpolo', t1: 10, t2: 8, tot: 18 },
    { pos: 2, name: 'Salerno Tidal', id: 'salerno-tidal', t1: 6, t2: 10, tot: 16 },
    { pos: 3, name: 'Napoli Aquatic', id: 'napoli-aquatic', t1: 8, t2: 6, tot: 14 },
    { pos: 4, name: 'Catania Wave', id: 'catania-wave', t1: 4, t2: 4, tot: 8 },
    { pos: 5, name: 'Team Aqua', id: 'team-aqua', t1: 3, t2: 3, tot: 6 },
    { pos: 6, name: 'Poseidon Bari', id: 'poseidon', t1: 2, t2: 2, tot: 4 }
  ];

  const renderGironiTable = (title: string, groupData: StandingsRow[], borderTheme: string) => (
    <div className={`bg-surface-low overflow-hidden rounded-lg border-l-4 ${borderTheme} glossy-card`}>
      <div className="p-4 bg-surface-high flex justify-between items-center border-b border-white/5">
        <h3 className="font-display text-lg text-white font-extrabold italic uppercase tracking-tight">{title}</h3>
        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">FASE 1</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background font-mono text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-white/5">
            <tr>
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Squadra</th>
              <th className="p-4 text-center">G</th>
              <th className="p-4 text-center">DR</th>
              <th className="p-4 text-center font-bold text-secondary">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans text-xs">
            {groupData.map((row) => {
              const team = getTeam(row.teamId);
              return (
                <tr key={row.teamId} className="hover:bg-surface-high/30 transition-colors">
                  <td className="p-4 text-center font-display font-black italic text-secondary text-sm">
                    {row.rank}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border border-white/10 flex items-center justify-center text-black font-display font-black text-xs rounded shadow">
                      {team.shortName || team.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white uppercase tracking-tight">{team.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono text-on-surface-variant">{row.played}</td>
                  <td className={`p-4 text-center font-mono font-bold ${row.goalDifference > 0 ? 'text-primary' : row.goalDifference < 0 ? 'text-red-400' : 'text-on-surface-variant'}`}>
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="p-4 text-center font-display font-black text-secondary text-sm bg-white/2 rounded">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-8 pb-12 animate-fade-in" id="standings-view">
      {/* Red Block Header */}
      <section className="relative overflow-hidden bg-primary p-6 text-white italic rounded-lg border-b-4 border-primary-container shadow-lg">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
          <Trophy className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 space-y-1">
          <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
            Classifiche & Statistiche
          </h2>
          <p className="font-mono text-xs opacity-90 uppercase tracking-widest font-bold">
            Live Performance Tracking
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="flex w-full border-b border-white/10 sticky top-16 bg-background/95 backdrop-blur-md z-40 overflow-x-auto hide-scrollbar">
        {(['gironi', 'generale', 'marcatori'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 font-display text-xs sm:text-sm font-bold uppercase italic tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === tab
                ? 'text-primary border-b-4 border-primary font-black'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {tab === 'gironi' ? 'Gironi' : tab === 'generale' ? 'Generale' : 'Marcatori'}
          </button>
        ))}
      </nav>

      {/* TAB CONTENT: GIRONI */}
      {activeTab === 'gironi' && (
        <div className="space-y-8">
          {renderGironiTable('Girone A', groupA, 'border-l-primary')}
          {renderGironiTable('Girone B', groupB, 'border-l-secondary')}
        </div>
      )}

      {/* TAB CONTENT: GENERALE */}
      {activeTab === 'generale' && (
        <div className="bg-surface-low overflow-hidden rounded-lg border-2 border-primary glossy-card">
          <div className="p-5 bg-primary text-white italic flex flex-col justify-between sm:flex-row sm:items-center gap-2">
            <div>
              <h3 className="font-display text-lg font-black uppercase leading-none">Classifica Circuito Nazionale</h3>
              <p className="text-[10px] font-mono font-bold opacity-80 mt-1 uppercase tracking-widest">Aggiornato: Tappa 2</p>
            </div>
            <span className="bg-black/30 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded">
              Official Ranking System
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background font-mono text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="p-4 w-12 text-center">Pos</th>
                  <th className="p-4">Squadra</th>
                  <th className="p-4 text-center">Tappa 1</th>
                  <th className="p-4 text-center">Tappa 2</th>
                  <th className="p-4 text-center font-bold text-secondary bg-primary/10">TOT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans text-xs">
                {circuitStandings.map((row) => {
                  const team = getTeam(row.id);
                  return (
                    <tr key={row.id} className="hover:bg-surface-high/30 transition-colors">
                      <td className="p-4 text-center font-display font-black italic text-white text-sm">{row.pos}</td>
                      <td className="p-4 font-bold text-white uppercase tracking-tight flex items-center gap-3">
                        <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain bg-white/5 p-0.5 rounded" referrerPolicy="no-referrer" />
                        {row.name}
                      </td>
                      <td className="p-4 text-center font-mono text-on-surface-variant">{row.t1}</td>
                      <td className="p-4 text-center font-mono text-on-surface-variant">{row.t2}</td>
                      <td className="p-4 text-center font-display font-black text-secondary text-sm bg-primary/5">{row.tot}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MARCATORI */}
      {activeTab === 'marcatori' && (
        <div className="space-y-6">
          {/* Top 3 Scorer Podium Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Top 3 Card Generator */}
            {scorers.slice(0, 3).map((scorer, index) => {
              const team = getTeam(scorer.teamId);
              const rankTheme = 
                index === 0 
                  ? { border: 'border-4 border-primary', badge: 'bg-primary text-white', label: 'Capocannoniere', trophyColor: 'text-primary' }
                  : index === 1
                  ? { border: 'border-l-4 border-secondary', badge: 'bg-secondary text-black', label: '2° Posto', trophyColor: 'text-secondary' }
                  : { border: 'border-l-4 border-white/20', badge: 'bg-white/20 text-white', label: '3° Posto', trophyColor: 'text-on-surface-variant' };

              return (
                <div 
                  key={scorer.id} 
                  className={`bg-surface-low p-6 rounded-lg relative overflow-hidden flex flex-col justify-between italic glossy-card ${rankTheme.border}`}
                >
                  {/* Medal Icon on high-level position */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 opacity-20 flex items-center justify-center">
                    <Target className={`w-12 h-12 ${rankTheme.trophyColor}`} />
                  </div>

                  <div className="space-y-4">
                    {/* Portrait Avatar */}
                    <div className="w-20 h-20 border-2 border-white/10 rounded-lg overflow-hidden relative shadow-md bg-background">
                      <img 
                        src={scorer.portraitUrl} 
                        alt={scorer.name} 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div>
                      <span className={`text-[9px] font-mono font-bold tracking-widest block uppercase px-2 py-0.5 rounded w-max mb-2 ${rankTheme.badge}`}>
                        {rankTheme.label}
                      </span>
                      <h4 className="font-display text-lg font-extrabold text-white leading-tight mb-1">{scorer.name}</h4>
                      <p className="font-mono text-[10px] text-on-surface-variant uppercase not-italic">{team.name}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="bg-primary text-white inline-block px-4 py-1.5 font-display font-black text-sm uppercase rounded skew-x-[-12deg]">
                      {scorer.goals} Goal
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Scorers table */}
          <div className="bg-surface-low border border-white/5 rounded-lg glossy-card">
            <div className="p-4 bg-surface-high border-b border-white/5">
              <h3 className="font-display text-sm text-white font-extrabold uppercase italic flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Classifica Marcatori Completa
              </h3>
            </div>

            <table className="w-full text-left">
              <thead className="bg-background font-mono text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="p-4 w-12 text-center">Pos</th>
                  <th className="p-4">Giocatore</th>
                  <th className="p-4">Squadra</th>
                  <th className="p-4 text-center font-bold text-secondary">Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans text-xs">
                {scorers.map((scorer) => {
                  const team = getTeam(scorer.teamId);
                  return (
                    <tr key={scorer.id} className="hover:bg-surface-high/30 transition-colors">
                      <td className="p-4 text-center font-display font-black italic text-white text-sm">
                        {scorer.rank}
                      </td>
                      <td className="p-4 font-bold text-white uppercase tracking-tight">
                        <div className="flex items-center gap-2.5">
                          <img src={scorer.portraitUrl} alt={scorer.name} className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0" referrerPolicy="no-referrer" />
                          <span>{scorer.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant uppercase font-mono text-[10px]">{team.name}</td>
                      <td className="p-4 text-center font-display font-black text-secondary text-sm">{scorer.goals}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
