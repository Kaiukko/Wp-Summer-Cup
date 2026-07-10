import React, { useState } from 'react';
import { Match, Team, Venue } from '../types';
import { Calendar, Filter, Search, MapPin, X, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ScheduleProps {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
}

export default function Schedule({ matches, teams, venues }: ScheduleProps) {
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [selectedPitch, setSelectedPitch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatchDetails, setSelectedMatchDetails] = useState<Match | null>(null);

  const getTeam = (id: string) => {
    return teams.find((t) => t.id === id) || { name: 'Unknown', shortName: '??', logoUrl: '' };
  };

  const getVenueDetails = (pitchName: string) => {
    return venues.find(v => v.name.toLowerCase().includes(pitchName.toLowerCase()) || pitchName.toLowerCase().includes(v.name.toLowerCase())) || {
      name: pitchName,
      location: 'Località non specificata',
      capacity: 'N/A',
      tags: ['OUTDOOR']
    };
  };

  // Dynamically obtain unique stages and pitches from matches to ensure correctness
  const stages = Array.from(new Set(matches.map(m => m.stage))).filter(Boolean);
  const pitches = Array.from(new Set(matches.map(m => m.pitch))).filter(Boolean);

  // Filter matches based on criteria
  const filteredMatches = matches.filter((match) => {
    const matchesStage = selectedStage === 'all' || match.stage === selectedStage;
    const matchesGroup = selectedGroup === 'all' || match.group === selectedGroup;
    const matchesPitch = selectedPitch === 'all' || match.pitch === selectedPitch;
    const matchesTeam = selectedTeamId === 'all' || match.team1Id === selectedTeamId || match.team2Id === selectedTeamId;
    
    // Team name search filter
    const team1 = getTeam(match.team1Id);
    const team2 = getTeam(match.team2Id);
    const matchesQuery = searchQuery === '' || 
      team1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team2.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStage && matchesGroup && matchesPitch && matchesTeam && matchesQuery;
  });

  // Group filtered matches by Date
  const matchesByDate: Record<string, Match[]> = {};
  filteredMatches.forEach((match) => {
    if (!matchesByDate[match.date]) {
      matchesByDate[match.date] = [];
    }
    matchesByDate[match.date].push(match);
  });

  const dates = Object.keys(matchesByDate);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-8 pb-12 animate-fade-in" id="schedule-view">
      {/* Search and Header banner */}
      <section className="relative overflow-hidden bg-primary/10 border-l-4 border-primary p-6 rounded-lg glossy-card">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Calendar className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 space-y-1">
          <span className="text-primary font-mono text-xs font-bold tracking-widest uppercase">Programmazione Completa</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase italic text-white tracking-tight">
            Calendario Gare
          </h2>
          <p className="text-white/60 font-sans text-xs">Filtra e cerca gli incontri per tappa, girone, squadra o campo di gioco.</p>
        </div>
      </section>

      {/* Tappa Selector Buttons */}
      <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-6 py-2.5 font-display text-sm italic font-extrabold uppercase transition-colors rounded cursor-pointer whitespace-nowrap ${
            selectedStage === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
          }`}
        >
          Tutte le Tappe
        </button>
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-6 py-2.5 font-display text-sm italic font-extrabold uppercase transition-colors rounded cursor-pointer whitespace-nowrap ${
              selectedStage === stage
                ? 'bg-primary text-white'
                : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-low p-5 rounded-lg glossy-card space-y-4 border border-white/5">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Girone Toggles */}
          <div className="flex bg-background p-1 rounded border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold font-display italic transition-colors rounded cursor-pointer whitespace-nowrap ${
                selectedGroup === 'all'
                  ? 'bg-secondary text-black'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Tutti i Gironi
            </button>
            {(['A', 'B', 'Playoff'] as const).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold font-display italic transition-colors rounded cursor-pointer whitespace-nowrap ${
                  selectedGroup === group
                    ? 'bg-secondary text-black'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {group === 'Playoff' ? 'Playoff' : `Girone ${group}`}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full lg:max-w-xs flex items-center">
            <span className="absolute left-3 text-on-surface-variant">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cerca squadra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-background border border-white/10 hover:border-white/20 focus:border-primary focus:outline-none text-xs uppercase font-mono text-white transition-colors rounded"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-on-surface-variant hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/5 items-end">
          {/* Team Filter */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">
              Squadra
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-background border border-white/10 rounded px-3 py-2 text-xs focus:outline-none text-white font-mono focus:border-primary cursor-pointer"
            >
              <option value="all">TUTTE LE SQUADRE</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Pitch/Venue Filter */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">
              Campo di Gioco
            </label>
            <select
              value={selectedPitch}
              onChange={(e) => setSelectedPitch(e.target.value)}
              className="w-full bg-background border border-white/10 rounded px-3 py-2 text-xs focus:outline-none text-white font-mono focus:border-primary cursor-pointer"
            >
              <option value="all">TUTTI I CAMPI</option>
              {pitches.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {(selectedStage !== 'all' || selectedGroup !== 'all' || selectedTeamId !== 'all' || selectedPitch !== 'all' || searchQuery !== '') ? (
            <div className="flex md:col-span-2 lg:col-span-1 justify-end">
              <button
                onClick={() => {
                  setSelectedStage('all');
                  setSelectedGroup('all');
                  setSelectedTeamId('all');
                  setSelectedPitch('all');
                  setSearchQuery('');
                }}
                className="w-full lg:w-auto px-4 py-2 bg-surface-high hover:bg-surface-highest border border-white/10 text-white text-[10px] font-bold font-display italic uppercase rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-red-400" />
                <span>Resetta Filtri</span>
              </button>
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </div>

      {/* List of Matches */}
      <div className="space-y-8">
        {dates.length > 0 ? (
          dates.map((date) => (
            <section key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-primary rounded-full" />
                <h3 className="font-display text-lg text-white font-extrabold tracking-tight">
                  {date}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchesByDate[date].map((match, index) => {
                  const team1 = getTeam(match.team1Id);
                  const team2 = getTeam(match.team2Id);

                  return (
                    <motion.div 
                      key={match.id} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}
                      className={`bg-surface-low border border-white/5 p-5 relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col justify-between ${
                        match.status === 'live' 
                          ? 'border-l-4 border-l-primary active-glow' 
                          : match.status === 'completed'
                          ? 'border-l-4 border-l-white/20 opacity-80'
                          : 'border-l-4 border-l-secondary'
                      }`}
                    >
                      {/* Card Header Status */}
                      <div className="flex justify-between items-center mb-4">
                        {match.status === 'live' ? (
                          <>
                            <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded animate-pulse">
                              In Corso
                            </span>
                            <span className="text-secondary font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                              {match.period || '2° Tempo'}
                            </span>
                          </>
                        ) : match.status === 'completed' ? (
                          <>
                            <span className="px-2 py-0.5 bg-surface-highest text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded">
                              Terminata
                            </span>
                            <span className="text-on-surface-variant font-mono text-xs font-bold">
                              {match.time}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 bg-background text-on-surface-variant border border-white/10 text-[10px] font-black uppercase tracking-widest rounded">
                              Programmata
                            </span>
                            <span className="text-secondary font-mono text-xs font-bold">
                              {match.time}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Team vs Team Layout */}
                      <div className="space-y-4 flex-1 flex flex-col justify-center py-2">
                        {/* Team 1 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={team1.logoUrl} alt={team1.name} className="w-8 h-8 object-contain bg-white/5 p-1 rounded" referrerPolicy="no-referrer" />
                            <span className="font-display font-bold text-xs uppercase tracking-tight text-white line-clamp-1">{team1.name}</span>
                          </div>
                          {match.status !== 'scheduled' ? (
                            <span className={`font-display text-lg font-black italic ${(match.team1Score ?? 0) > (match.team2Score ?? 0) ? 'text-primary' : 'text-on-surface-variant'}`}>
                              {match.team1Score}
                            </span>
                          ) : (
                            <span className="font-display text-xs text-on-surface-variant italic">--</span>
                          )}
                        </div>

                        {/* Separator / VS */}
                        {match.status === 'scheduled' && (
                          <div className="h-[2px] w-full bg-white/5 relative my-1">
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-low border border-white/10 px-2 rounded-full text-[10px] text-primary font-black italic">VS</span>
                          </div>
                        )}

                        {/* Team 2 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={team2.logoUrl} alt={team2.name} className="w-8 h-8 object-contain bg-white/5 p-1 rounded" referrerPolicy="no-referrer" />
                            <span className="font-display font-bold text-xs uppercase tracking-tight text-white line-clamp-1">{team2.name}</span>
                          </div>
                          {match.status !== 'scheduled' ? (
                            <span className={`font-display text-lg font-black italic ${(match.team2Score ?? 0) > (match.team1Score ?? 0) ? 'text-primary' : 'text-on-surface-variant'}`}>
                              {match.team2Score}
                            </span>
                          ) : (
                            <span className="font-display text-xs text-on-surface-variant italic">--</span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {match.pitch}
                        </span>
                        
                        <button 
                          onClick={() => setSelectedMatchDetails(match)}
                          className="px-3 py-1 bg-surface-high border border-white/5 hover:bg-surface-highest transition-colors text-[10px] font-bold font-display italic uppercase text-white rounded cursor-pointer"
                        >
                          Dettagli
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16 text-on-surface-variant bg-surface-low border border-white/5 rounded-lg font-mono text-sm uppercase">
            Nessun incontro trovato per i filtri selezionati.
          </div>
        )}
      </div>

      {/* Match Details Modal Dialog */}
      {selectedMatchDetails && (() => {
        const match = selectedMatchDetails;
        const team1 = getTeam(match.team1Id);
        const team2 = getTeam(match.team2Id);
        const venue = getVenueDetails(match.pitch);

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-surface-low border border-white/10 max-w-md w-full rounded-xl overflow-hidden shadow-2xl relative animate-scale-up">
              <div className="bg-primary text-white p-4 font-display italic font-extrabold flex justify-between items-center">
                <span>Dettagli Incontro</span>
                <button 
                  onClick={() => setSelectedMatchDetails(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Visual Teams display */}
                <div className="flex items-center justify-between bg-background p-4 rounded border border-white/5">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={team1.logoUrl} alt={team1.name} className="w-12 h-12 object-contain bg-white/5 p-1 rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                    <span className="text-center text-xs font-bold uppercase font-display italic text-white line-clamp-1">{team1.name}</span>
                  </div>

                  <div className="text-center px-4 font-display font-black">
                    {match.status !== 'scheduled' ? (
                      <span className="text-2xl text-primary font-mono">{match.team1Score} - {match.team2Score}</span>
                    ) : (
                      <span className="text-xs text-on-surface-variant uppercase tracking-widest font-mono">VS</span>
                    )}
                    <div className="text-[10px] text-on-surface-variant uppercase font-semibold mt-1">
                      {match.status === 'live' ? 'IN CORSO' : match.status === 'completed' ? 'FINALE' : 'PROGRAMMATA'}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={team2.logoUrl} alt={team2.name} className="w-12 h-12 object-contain bg-white/5 p-1 rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                    <span className="text-center text-xs font-bold uppercase font-display italic text-white line-clamp-1">{team2.name}</span>
                  </div>
                </div>

                {/* Match metadata list */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-on-surface-variant">Tappa:</span>
                    <span className="text-white font-bold">{match.stage}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-on-surface-variant">Gruppo:</span>
                    <span className="text-secondary font-bold">Girone {match.group}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-on-surface-variant">Giorno:</span>
                    <span className="text-white font-bold">{match.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-on-surface-variant">Orario:</span>
                    <span className="text-white font-bold">{match.time}</span>
                  </div>
                </div>

                {/* Pitch Details */}
                <div className="p-4 bg-surface-high rounded-lg border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase font-display italic">
                    <MapPin className="w-4 h-4" />
                    <span>Sede: {match.pitch}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium pl-6">{venue.location}</p>
                  <div className="pl-6 pt-1 flex flex-wrap gap-1.5">
                    <span className="bg-background text-[9px] font-mono font-bold text-secondary px-2 py-0.5 rounded border border-white/5">
                      {venue.capacity || 'STANDING ONLY'}
                    </span>
                    {venue.tags && venue.tags.map((tag: string) => (
                      <span key={tag} className="bg-background text-[9px] font-mono font-bold text-white/50 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMatchDetails(null)}
                  className="w-full py-2.5 bg-primary text-white text-xs font-black font-display italic uppercase tracking-wider rounded border border-primary hover:bg-transparent hover:text-primary transition-all cursor-pointer"
                >
                  Chiudi Dettagli
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
