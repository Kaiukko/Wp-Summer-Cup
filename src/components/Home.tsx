import React, { useState } from 'react';
import { Match, Team, TournamentConfig } from '../types';
import { Clock, Calendar, ChevronDown, ChevronUp, ArrowRight, Trophy, Share2, Check } from 'lucide-react';

interface HomeProps {
  matches: Match[];
  teams: Team[];
  onNavigate: (tab: any) => void;
  config?: TournamentConfig;
}

export default function Home({ matches, teams, onNavigate, config }: HomeProps) {
  const [showAllResults, setShowAllResults] = useState(false);
  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);

  const getTeam = (id: string) => {
    return teams.find((t) => t.id === id) || { name: 'Unknown', shortName: '??', logoUrl: '' };
  };

  const handleShare = async (match: Match) => {
    const team1 = getTeam(match.team1Id);
    const team2 = getTeam(match.team2Id);
    
    const title = 'Waterpolo Summer Cup';
    let text = '';
    
    if (match.status === 'live') {
      text = `💦 WATERPOLO SUMMER CUP - LIVE NOW! 💦\n\n🔴 IN CORSO: ${team1.name} ${match.team1Score} - ${match.team2Score} ${team2.name}\n⏱️ ${match.period || 'Periodo'} • ${match.timeRemaining || 'Live'}\n\nSegui gli aggiornamenti in tempo reale sulla web app ufficiale! 🏖️🤽‍♂️`;
    } else if (match.status === 'completed') {
      text = `💦 WATERPOLO SUMMER CUP - RISULTATO FINALE 💦\n\n🏁 ${team1.name} ${match.team1Score} - ${match.team2Score} ${team2.name}\n🏆 ${match.stage} • Girone ${match.group}\n\nScopri tutte le classifiche e i prossimi match sulla web app! 🥇🤽‍♂️`;
    } else {
      text = `💦 WATERPOLO SUMMER CUP 💦\n\n📅 PROSSIMO MATCH: ${team1.name} VS ${team2.name}\n🗓️ ${match.date} alle ore ${match.time}\n📍 Campo: ${match.pitch}\n\nNon perderti la sfida! Guarda il calendario completo sulla web app! 🗓️🤽‍♂️`;
    }

    const shareUrl = window.location.origin || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.log('Web Share API failed or cancelled, falling back to clipboard.', err);
      }
    }

    // Fallback to Clipboard
    try {
      const clipboardText = `${text}\n🔗 Link: ${shareUrl}`;
      await navigator.clipboard.writeText(clipboardText);
      setCopiedMatchId(match.id);
      setTimeout(() => setCopiedMatchId(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Find live matches
  const liveMatches = matches.filter((m) => m.status === 'live');
  // Find scheduled upcoming matches (not completed, not live)
  const upcomingMatches = matches.filter((m) => m.status === 'scheduled');
  // Find completed matches
  const completedMatches = matches.filter((m) => m.status === 'completed');

  // Limit upcoming matches shown on home screen
  const displayedUpcoming = upcomingMatches.slice(0, 2);

  // Determine which completed matches to display in "Ultimi Risultati"
  const displayedCompleted = showAllResults ? completedMatches : completedMatches.slice(0, 2);

  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="home-view">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden rounded-b-xl border-b border-primary/20">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center scale-105 filter brightness-90 transition-transform duration-10000"
            style={{ 
              backgroundImage: `url('${config?.bgImageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuARlFFel2gkPzHSH9gz2hC3p3pLp9NQiyVk4LNDiW4ibzL8unl5XxYzTdjBywDvpAKxjDNLJ4gGYUMSENImeVrN9ogJGIuPQco29J7ycos9VgnG9YAwnP_6avcY5Me1XheyPbFyat3w4wpvADHWKw8yoo-NIgs06NJyLCucyOLJ0DMfMibGPUyG16GrNeJ7AsmKh9cfVXeKYOqhVZPmg_bEU0BZmzJ-49L-_YUfoeb0beE_gogXYLw3EbXoYiLl-HLqtNDfaSeRSSs'}')` 
            }}
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="inline-block px-4 py-1.5 mb-4 bg-primary text-white font-mono text-xs uppercase tracking-[0.2em] font-bold animate-pulse rounded-full">
            Live Now
          </span>
          <h2 className="font-display text-4xl sm:text-6xl text-white mb-4 uppercase italic font-black leading-tight tracking-tighter">
            WATERPOLO<br />SUMMER CUP
          </h2>
          <p className="text-white/80 font-sans text-base sm:text-lg max-w-xl mx-auto uppercase tracking-wide font-medium">
            Il mare torna campo di gioco.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-12 relative z-20">
        {/* Tournament status & quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Status Card */}
          <div className="bg-surface-low p-6 flex flex-col justify-between border-l-4 border-secondary rounded-lg glossy-card">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs text-secondary uppercase font-bold tracking-widest">
                  Stato Torneo
                </h3>
                {config?.tappaNumber !== undefined && (
                  <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    TAPPA {config.tappaNumber}
                  </span>
                )}
              </div>
              <p className="font-display text-2xl text-white uppercase italic font-extrabold leading-none mt-1.5">
                {config?.tappaName || 'Tappa 1'}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 bg-surface-highest border border-white/10 text-on-surface-variant text-xs font-semibold uppercase tracking-wider rounded">
                Girone A
              </span>
              <span className="px-3 py-1 bg-surface-highest border border-white/10 text-on-surface-variant text-xs font-semibold uppercase tracking-wider rounded">
                Girone B
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('standings')}
              className="bg-primary text-white flex flex-col items-center justify-center p-6 hover:brightness-110 active:scale-95 transition-all group rounded-lg border-b-4 border-primary/40 font-display uppercase font-black"
              id="btn-quick-standings"
            >
              <Trophy className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-white" />
              <span className="text-sm tracking-tight text-center">Classifica Generale</span>
            </button>
            <button 
              onClick={() => onNavigate('schedule')}
              className="bg-surface-high text-white flex flex-col items-center justify-center p-6 hover:bg-surface-highest active:scale-95 transition-all group rounded-lg border-b-4 border-white/5 font-display uppercase font-black glossy-card"
              id="btn-quick-schedule"
            >
              <Calendar className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-secondary" />
              <span className="text-sm tracking-tight text-center">Calendario</span>
            </button>
          </div>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upcoming Matches (Left Panel) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl text-white flex items-center gap-2 uppercase italic font-bold">
                <Clock className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '4s' }} />
                Prossime Partite
              </h3>
              <button 
                onClick={() => onNavigate('schedule')}
                className="text-secondary hover:text-white transition-colors text-xs uppercase font-bold tracking-wider flex items-center gap-1"
              >
                Vedi Tutto <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Live matches get absolute priority */}
              {liveMatches.map((match) => {
                const team1 = getTeam(match.team1Id);
                const team2 = getTeam(match.team2Id);
                return (
                  <div key={match.id} className="pro-card p-5 flex flex-col justify-between relative overflow-hidden group rounded-lg border-l-4 border-l-secondary active-glow">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded animate-pulse">
                        In Corso
                      </span>
                      <span className="text-secondary font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                        {match.period || '2° Tempo'} • {match.timeRemaining || 'Live'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2">
                      <div className="flex items-center gap-3 flex-1">
                        <img src={team1.logoUrl} alt={team1.name} className="w-10 h-10 object-contain bg-white/5 p-1 rounded border border-white/10" referrerPolicy="no-referrer" />
                        <span className="font-display text-white font-bold tracking-tight text-sm uppercase italic line-clamp-1">{team1.name}</span>
                      </div>

                      <div className="px-4 py-1.5 bg-background border border-white/10 rounded text-center min-w-[80px]">
                        <span className="font-display text-secondary text-xl italic font-black">
                          {match.team1Score} - {match.team2Score}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="font-display text-white font-bold tracking-tight text-sm uppercase italic line-clamp-1 text-right">{team2.name}</span>
                        <img src={team2.logoUrl} alt={team2.name} className="w-10 h-10 object-contain bg-white/5 p-1 rounded border border-white/10" referrerPolicy="no-referrer" />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-on-surface-variant">
                      <span>{match.stage} • Girone {match.group}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(match); }}
                        className="text-secondary hover:text-white flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                        id={`share-live-${match.id}`}
                      >
                        {copiedMatchId === match.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Copiato!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Condividi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Show displayed upcoming matches */}
              {displayedUpcoming.length > 0 ? (
                displayedUpcoming.map((match) => {
                  const team1 = getTeam(match.team1Id);
                  const team2 = getTeam(match.team2Id);
                  return (
                    <div key={match.id} className="pro-card p-5 flex flex-col relative overflow-hidden group rounded-lg border-l-4 border-l-primary">
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2 py-0.5 bg-surface-highest text-white/80 text-[10px] font-bold uppercase tracking-wider rounded">
                          Programmata
                        </span>
                        <span className="text-on-surface-variant font-mono text-xs font-semibold">
                          {match.date} • {match.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2">
                        <div className="flex items-center gap-3 flex-1">
                          <img src={team1.logoUrl} alt={team1.name} className="w-10 h-10 object-contain bg-white/5 p-1 rounded border border-white/10" referrerPolicy="no-referrer" />
                          <span className="font-display text-white font-bold tracking-tight text-sm uppercase italic line-clamp-1">{team1.name}</span>
                        </div>

                        <div className="px-3 py-1 bg-surface-lowest border border-white/5 rounded text-center">
                          <span className="font-display text-on-surface-variant text-xs italic font-black">VS</span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-display text-white font-bold tracking-tight text-sm uppercase italic line-clamp-1 text-right">{team2.name}</span>
                          <img src={team2.logoUrl} alt={team2.name} className="w-10 h-10 object-contain bg-white/5 p-1 rounded border border-white/10" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-on-surface-variant">
                        <span>Campo: {match.pitch}</span>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleShare(match); }}
                            className="text-secondary hover:text-white flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                            id={`share-upcoming-${match.id}`}
                          >
                            {copiedMatchId === match.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-green-400">Copiato!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Condividi</span>
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => onNavigate('schedule')}
                            className="text-primary hover:underline font-bold cursor-pointer"
                          >
                            Dettagli
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-on-surface-variant bg-surface-low border border-white/5 rounded-lg font-mono text-xs">
                  Nessuna altra partita programmata.
                </div>
              )}
            </div>
          </div>

          {/* Latest Results (Right Panel) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-display text-xl text-white flex items-center gap-2 uppercase italic font-bold border-b border-white/10 pb-3">
              <Trophy className="w-5 h-5 text-secondary" />
              Ultimi Risultati
            </h3>

            <div className="space-y-3">
              {displayedCompleted.length > 0 ? (
                displayedCompleted.map((match) => {
                  const team1 = getTeam(match.team1Id);
                  const team2 = getTeam(match.team2Id);
                  const isTeam1Winner = (match.team1Score ?? 0) > (match.team2Score ?? 0);
                  const isTeam2Winner = (match.team2Score ?? 0) > (match.team1Score ?? 0);

                  return (
                    <div key={match.id} className="bg-surface-low p-4 border-r-4 border-primary rounded-lg glossy-card">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pb-1 border-b border-white/5">
                          <span>{match.stage} • Girone {match.group}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-secondary font-mono mr-1">FINALE</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleShare(match); }}
                              className="text-white/40 hover:text-secondary p-1 rounded hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                              id={`share-completed-${match.id}`}
                              title="Condividi"
                            >
                              {copiedMatchId === match.id ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Team 1 Row */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-3">
                            <img src={team1.logoUrl} alt={team1.name} className="w-6 h-6 object-contain bg-white/5 p-0.5 rounded" referrerPolicy="no-referrer" />
                            <span className={`text-xs uppercase font-bold ${isTeam1Winner ? 'text-white' : 'text-on-surface-variant'}`}>
                              {team1.name}
                            </span>
                          </div>
                          <span className={`font-display font-black text-lg italic ${isTeam1Winner ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {match.team1Score}
                          </span>
                        </div>

                        {/* Team 2 Row */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-3">
                            <img src={team2.logoUrl} alt={team2.name} className="w-6 h-6 object-contain bg-white/5 p-0.5 rounded" referrerPolicy="no-referrer" />
                            <span className={`text-xs uppercase font-bold ${isTeam2Winner ? 'text-white' : 'text-on-surface-variant'}`}>
                              {team2.name}
                            </span>
                          </div>
                          <span className={`font-display font-black text-lg italic ${isTeam2Winner ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {match.team2Score}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-on-surface-variant bg-surface-low border border-white/5 rounded-lg font-mono text-xs">
                  Nessun risultato registrato.
                </div>
              )}

              {completedMatches.length > 2 && (
                <button 
                  onClick={() => setShowAllResults(!showAllResults)}
                  className="w-full py-3.5 border-2 border-dashed border-white/10 text-on-surface-variant font-display text-xs hover:bg-surface-low transition-colors flex items-center justify-center gap-2 uppercase font-black cursor-pointer rounded"
                >
                  {showAllResults ? (
                    <>
                      <ChevronUp className="w-4 h-4 text-primary" /> Mostra Meno Risultati
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 text-secondary" /> Mostra Altri Risultati
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
