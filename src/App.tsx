import React, { useState, useEffect } from 'react';
import { Match, Team, Venue, Scorer, ActivityLog, Player, TournamentConfig } from './types';
import { 
  INITIAL_TEAMS, 
  INITIAL_MATCHES, 
  INITIAL_SCORERS, 
  INITIAL_VENUES, 
  INITIAL_ACTIVITY_LOGS 
} from './data';
import { calculateStandings, apiFetch } from './utils';
import HomeView from './components/Home';
import ScheduleView from './components/Schedule';
import StandingsView from './components/Standings';
import PlayoffsView from './components/Playoffs';
import AdminView from './components/Admin';
import ToastContainer, { ToastNotification } from './components/ToastContainer';
import { Home, Calendar, Trophy, Settings, Shield, Sparkles } from 'lucide-react';

const DEFAULT_CONFIG: TournamentConfig = {
  title: "Sport Project Bari",
  subtitle: "Waterpolo Summer Cup",
  primaryColor: "#ef4444",
  secondaryColor: "#f59e0b",
  logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKFuWF_QkpRPDAklc-pyDeRyCUaeNi0O00Gp5FLb12JmduTRvIiWrSZQ3hxXtH4DjBth8xzc-8vliqfR88a8uelw-x2iSVKI4dFfKNg2ztyPNsGP_dSLdRhapPUmw3xXm80Pps9Y0dEUDcFLD2JgcGdR2uwcUYNmd5VuSlkZzO2TFqPGEaI3vRKaBTI4amtkSGkBoczJkB-8Untq82cJyDhF60k1EA61KNQLbBWITSA-U7lM2a8jIUxAExFeX4rRme-SnScQHrTLM",
  bgImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARlFFel2gkPzHSH9gz2hC3p3pLp9NQiyVk4LNDiW4ibzL8unl5XxYzTdjBywDvpAKxjDNLJ4gGYUMSENImeVrN9ogJGIuPQco29J7ycos9VgnG9YAwnP_6avcY5Me1XheyPbFyat3w4wpvADHWKw8yoo-NIgs06NJyLCucyOLJ0DMfMibGPUyG16GrNeJ7AsmKh9cfVXeKYOqhVZPmg_bEU0BZmzJ-49L-_YUfoeb0beE_gogXYLw3EbXoYiLl-HLqtNDfaSeRSSs",
  adminPin: "SPB2026",
  tappaNumber: 1,
  tappaName: "Tappa 1"
};

const INITIAL_PLAYERS: Player[] = [
  { id: 'player-1', name: 'Luca Moretti', teamId: 'bari-waterpolo', role: 'Attaccante', goals: 14, number: 10, portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAON0DLWxZrfOVSQpuvh1hEFetVljv5ZIdg8Y-gGjiGwWQQ7Mbs8C5Fq3X9_sVFUsGWHj4-_d9agG2jlfUSodSFc-7pSuvCDLLyhWyeaIO9vGH_S_5qnM26mjCwya8gq4ooafgnwlkfVvnsHCNnpo47xzY-Oo39c0ePizoIszuuf0ullTRZwvc-DF0CKEl1JckNNiQFQS77flU-PHX5vz6xVtwWogD16U0K8w-pR-8CgD3L9dSvogIIypS-eyQQoaDcI2PAvj4wUeM' },
  { id: 'player-2', name: 'Marco Rossi', teamId: 'napoli-aquatic', role: 'Centroboa', goals: 11, number: 9, portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKDLGVaHF-O8eOOir0tYBN666UXcBuS38Z2N7LAWsTUDBIzuviAVe61eIpp4e_s4yY3AapFhts7E_DPAdazGW0wvegDVfV04t2pbMwW35uNTlqUWhXCKYPHIIdknL3sqHOxR4WfiKo4usP_b4D_qvTPIkF1x3BdEQzukXR-C18uttbF_KvTHtjvbVMUz_FDEzF8t2OiXYtqpsQiTydyjB0DCiLpg0A7KwAZL7EhaCltGaJmhpXA3EJq67xdfaJ4AfrXh84it41f2A' },
  { id: 'player-3', name: 'Alessandro De Santis', teamId: 'salerno-tidal', role: 'Attaccante', goals: 9, number: 7, portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9OEJ_9qGuTn3lKrFFDVE0UW9EinZrd7QNnCzKqqWwYIj5aMTlOop2sadnRGUAur3-xqY8643ZNMzkakVr9nI6BkQotvuenpQlwAIVr-cpuutfnq7ic4q24TPdJPR9lG6MxDol4n62tCxcm7451TRokti3kEOoQmJZsVhyivtXgCz0sg3ZP9qnWPLlIwWslGkaM8yOXhFvM3LBI24GatXQe7K8YN_aiDVP0BrpbQs8btU7_0MotYnkaQ51choTJTg8Eq5qKV5ighw' },
  { id: 'player-4', name: 'Giuseppe Bianchi', teamId: 'roma-delta', role: 'Difensore', goals: 8, number: 4, portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKDLGVaHF-O8eOOir0tYBN666UXcBuS38Z2N7LAWsTUDBIzuviAVe61eIpp4e_s4yY3AapFhts7E_DPAdazGW0wvegDVfV04t2pbMwW35uNTlqUWhXCKYPHIIdknL3sqHOxR4WfiKo4usP_b4D_qvTPIkF1x3BdEQzukXR-C18uttbF_KvTHtjvbVMUz_FDEzF8t2OiXYtqpsQiTydyjB0DCiLpg0A7KwAZL7EhaCltGaJmhpXA3EJq67xdfaJ4AfrXh84it41f2A' },
  { id: 'player-5', name: 'Stefano Verdi', teamId: 'catania-wave', role: 'Attaccante', goals: 7, number: 11, portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9OEJ_9qGuTn3lKrFFDVE0UW9EinZrd7QNnCzKqqWwYIj5aMTlOop2sadnRGUAur3-xqY8643ZNMzkakVr9nI6BkQotvuenpQlwAIVr-cpuutfnq7ic4q24TPdJPR9lG6MxDol4n62tCxcm7451TRokti3kEOoQmJZsVhyivtXgCz0sg3ZP9qnWPLlIwWslGkaM8yOXhFvM3LBI24GatXQe7K8YN_aiDVP0BrpbQs8btU7_0MotYnkaQ51choTJTg8Eq5qKV5ighw' },
  { id: 'player-6', name: 'Fabio Gagliardi', teamId: 'team-aqua', role: 'Portiere', goals: 0, number: 1 },
  { id: 'player-7', name: 'Davide Russo', teamId: 'team-aqua', role: 'Attaccante', goals: 5, number: 3 },
  { id: 'player-8', name: 'Roberto Esposito', teamId: 'barracudas', role: 'Centroboa', goals: 6, number: 5 },
  { id: 'player-9', name: 'Giovanni Gallo', teamId: 'sharks-bari', role: 'Difensore', goals: 4, number: 8 },
  { id: 'player-10', name: 'Nicola Neri', teamId: 'poseidon', role: 'Attaccante', goals: 6, number: 9 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'standings' | 'playoff' | 'admin'>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Layout and branding configurations
  const [config, setConfig] = useState<TournamentConfig>(DEFAULT_CONFIG);

  // Primary Collections
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch full state from backend on mount
  useEffect(() => {
    apiFetch('/api/db')
      .then(res => {
        if (!res.ok) throw new Error('API down');
        return res.json();
      })
      .then(data => {
        if (data.config) setConfig(data.config);
        if (data.teams && data.teams.length > 0) setTeams(data.teams);
        else {
          // If server database is empty for teams/matches, save our default constants first
          updateTeamsOnServer(INITIAL_TEAMS);
          updateMatchesOnServer(INITIAL_MATCHES);
          updateVenuesOnServer(INITIAL_VENUES);
          updateActivityLogsOnServer(INITIAL_ACTIVITY_LOGS);
          updatePlayersOnServer(INITIAL_PLAYERS);
        }
        if (data.matches && data.matches.length > 0) setMatches(data.matches);
        if (data.venues && data.venues.length > 0) setVenues(data.venues);
        if (data.activityLogs && data.activityLogs.length > 0) setActivityLogs(data.activityLogs);
        if (data.players && data.players.length > 0) setPlayers(data.players);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('API fetch failed, falling back to local memory storage', err);
        // Load fallback from localStorage if present
        const savedTeams = localStorage.getItem('spb_teams');
        const savedMatches = localStorage.getItem('spb_matches');
        const savedVenues = localStorage.getItem('spb_venues');
        const savedLogs = localStorage.getItem('spb_activity_logs');
        const savedPlayers = localStorage.getItem('spb_players');
        const savedConfig = localStorage.getItem('spb_config');

        if (savedTeams) setTeams(JSON.parse(savedTeams));
        if (savedMatches) setMatches(JSON.parse(savedMatches));
        if (savedVenues) setVenues(JSON.parse(savedVenues));
        if (savedLogs) setActivityLogs(JSON.parse(savedLogs));
        if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
        if (savedConfig) setConfig(JSON.parse(savedConfig));
        setIsLoading(false);
      });
  }, []);

  // Real-time background sync with polling (every 4 seconds)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      apiFetch('/api/db')
        .then(res => {
          if (!res.ok) throw new Error('Polling failed');
          return res.json();
        })
        .then(data => {
          if (!data) return;

          // 1. Sync config if different
          if (data.config) {
            setConfig(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.config)) {
                return data.config;
              }
              return prev;
            });
          }

          // 2. Sync teams if different
          if (data.teams && data.teams.length > 0) {
            setTeams(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.teams)) {
                return data.teams;
              }
              return prev;
            });
          }

          // 3. Sync players if different
          if (data.players && data.players.length > 0) {
            setPlayers(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.players)) {
                return data.players;
              }
              return prev;
            });
          }

          // 4. Sync venues if different
          if (data.venues && data.venues.length > 0) {
            setVenues(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.venues)) {
                return data.venues;
              }
              return prev;
            });
          }

          // 5. Sync activity logs if different
          if (data.activityLogs && data.activityLogs.length > 0) {
            setActivityLogs(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.activityLogs)) {
                return data.activityLogs;
              }
              return prev;
            });
          }

          // 6. Sync matches and trigger real-time toast alerts for score/status updates
          if (data.matches && data.matches.length > 0) {
            setMatches(prevMatches => {
              const incomingMatches: Match[] = data.matches;

              // Only trigger toasts if there is an existing matches state (not first load)
              if (prevMatches && prevMatches.length > 0 && !isLoading) {
                incomingMatches.forEach(newMatch => {
                  const oldMatch = prevMatches.find(m => m.id === newMatch.id);
                  if (oldMatch) {
                    const scoreChanged = (newMatch.team1Score !== oldMatch.team1Score || newMatch.team2Score !== oldMatch.team2Score);
                    const statusChanged = (newMatch.status !== oldMatch.status);

                    if (scoreChanged || statusChanged) {
                      // Retrieve team names and logos
                      const t1 = (data.teams || teams).find((t: Team) => t.id === newMatch.team1Id) || { name: 'Unknown', logoUrl: '' };
                      const t2 = (data.teams || teams).find((t: Team) => t.id === newMatch.team2Id) || { name: 'Unknown', logoUrl: '' };

                      const oldScoreStr = oldMatch.status === 'scheduled' || oldMatch.team1Score === undefined
                        ? '0' 
                        : `${oldMatch.team1Score} - ${oldMatch.team2Score}`;
                      const newScoreStr = newMatch.status === 'scheduled' || newMatch.team1Score === undefined
                        ? '0 - 0' 
                        : `${newMatch.team1Score} - ${newMatch.team2Score}`;

                      const toastId = `toast-${Date.now()}-${newMatch.id}`;
                      setToasts(prevToasts => {
                        // Prevent duplicate toasts for the exact same event
                        if (prevToasts.some(t => t.id.endsWith(newMatch.id) && t.newScore === newScoreStr && t.status === newMatch.status)) {
                          return prevToasts;
                        }
                        return [
                          ...prevToasts,
                          {
                            id: toastId,
                            matchId: newMatch.id,
                            team1Name: t1.name,
                            team2Name: t2.name,
                            team1Logo: t1.logoUrl || '',
                            team2Logo: t2.logoUrl || '',
                            oldScore: oldScoreStr,
                            newScore: newScoreStr,
                            status: newMatch.status,
                            period: newMatch.period,
                            type: scoreChanged ? 'score_update' : 'status_change'
                          }
                        ];
                      });
                    }
                  }
                });
              }

              if (JSON.stringify(prevMatches) !== JSON.stringify(incomingMatches)) {
                return incomingMatches;
              }
              return prevMatches;
            });
          }
        })
        .catch(err => {
          // Silent catch for intermittent connection hiccups
        });
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [isLoading, teams]);

  // Sync to backend and save in local cache as fallback
  const updateTeamsOnServer = (newTeams: Team[]) => {
    setTeams(newTeams);
    localStorage.setItem('spb_teams', JSON.stringify(newTeams));
    apiFetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeams)
    }).catch(err => console.error('Failed to sync teams', err));
  };

  const updateMatchesOnServer = (newMatches: Match[]) => {
    setMatches(newMatches);
    localStorage.setItem('spb_matches', JSON.stringify(newMatches));
    apiFetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMatches)
    }).catch(err => console.error('Failed to sync matches', err));
  };

  const updateVenuesOnServer = (newVenues: Venue[]) => {
    setVenues(newVenues);
    localStorage.setItem('spb_venues', JSON.stringify(newVenues));
    apiFetch('/api/venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVenues)
    }).catch(err => console.error('Failed to sync venues', err));
  };

  const updatePlayersOnServer = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    localStorage.setItem('spb_players', JSON.stringify(newPlayers));
    apiFetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayers)
    }).catch(err => console.error('Failed to sync players', err));
  };

  const updateActivityLogsOnServer = (newLogs: ActivityLog[]) => {
    setActivityLogs(newLogs);
    localStorage.setItem('spb_activity_logs', JSON.stringify(newLogs));
    apiFetch('/api/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLogs)
    }).catch(err => console.error('Failed to sync logs', err));
  };

  const updateConfigOnServer = (newConfig: TournamentConfig) => {
    setConfig(newConfig);
    localStorage.setItem('spb_config', JSON.stringify(newConfig));
    apiFetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    }).catch(err => console.error('Failed to sync config', err));
  };

  // Dynamically recalculate scorers from players goals list
  const scorers: Scorer[] = [...players]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .map((p, index) => ({
      id: `scorer-${p.id}`,
      name: p.name,
      teamId: p.teamId,
      goals: p.goals,
      portraitUrl: p.portraitUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKDLGVaHF-O8eOOir0tYBN666UXcBuS38Z2N7LAWsTUDBIzuviAVe61eIpp4e_s4yY3AapFhts7E_DPAdazGW0wvegDVfV04t2pbMwW35uNTlqUWhXCKYPHIIdknL3sqHOxR4WfiKo4usP_b4D_qvTPIkF1x3BdEQzukXR-C18uttbF_KvTHtjvbVMUz_FDEzF8t2OiXYtqpsQiTydyjB0DCiLpg0A7KwAZL7EhaCltGaJmhpXA3EJq67xdfaJ4AfrXh84it41f2A',
      rank: index + 1
    }));

  // Apply layout custom color theme dynamically
  useEffect(() => {
    const root = document.documentElement;
    if (config.primaryColor) {
      root.style.setProperty('--color-primary', config.primaryColor);
    }
    if (config.secondaryColor) {
      root.style.setProperty('--color-secondary', config.secondaryColor);
    }
  }, [config.primaryColor, config.secondaryColor]);

  // Automated playoff matches generator
  const handleGeneratePlayoffs = () => {
    const { groupA, groupB } = calculateStandings(matches, teams);
    
    // Sort and get top 4 teams
    const topA = groupA.slice(0, 4).map(r => r.teamId);
    const topB = groupB.slice(0, 4).map(r => r.teamId);

    // Make sure we have enough teams
    if (topA.length < 4 || topB.length < 4) {
      alert("Sono necessarie almeno 4 squadre per girone con partite giocate per generare i playoff!");
      return;
    }

    const newPlayoffMatches: Match[] = [
      // Quarti di finale
      {
        id: 'qf-1',
        stage: 'Quarti di Finale 1',
        group: 'Playoff',
        date: 'Sabato 22 Giugno',
        time: '17:00',
        team1Id: topA[0], // 1° Girone A
        team2Id: topB[3], // 4° Girone B
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      },
      {
        id: 'qf-2',
        stage: 'Quarti di Finale 2',
        group: 'Playoff',
        date: 'Sabato 22 Giugno',
        time: '18:15',
        team1Id: topB[1], // 2° Girone B
        team2Id: topA[2], // 3° Girone A
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      },
      {
        id: 'qf-3',
        stage: 'Quarti di Finale 3',
        group: 'Playoff',
        date: 'Sabato 22 Giugno',
        time: '19:30',
        team1Id: topB[0], // 1° Girone B
        team2Id: topA[3], // 4° Girone A
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      },
      {
        id: 'qf-4',
        stage: 'Quarti di Finale 4',
        group: 'Playoff',
        date: 'Sabato 22 Giugno',
        time: '20:45',
        team1Id: topA[1], // 2° Girone A
        team2Id: topB[2], // 3° Girone B
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      },

      // Semifinali
      {
        id: 'sf-1',
        stage: 'Semifinale 1 (1°-4° Posto)',
        group: 'Playoff',
        date: 'Domenica 23 Giugno',
        time: '10:00',
        team1Id: topA[0], // Winner QF1 (Placeholder)
        team2Id: topB[1], // Winner QF2 (Placeholder)
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      },
      {
        id: 'sf-2',
        stage: 'Semifinale 2 (1°-4° Posto)',
        group: 'Playoff',
        date: 'Domenica 23 Giugno',
        time: '11:15',
        team1Id: topB[0], // Winner QF3 (Placeholder)
        team2Id: topA[1], // Winner QF4 (Placeholder)
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      },

      // Finali
      {
        id: 'fn-7-8',
        stage: 'Finale 7° e 8° Posto',
        group: 'Playoff',
        date: 'Domenica 23 Giugno',
        time: '16:00',
        team1Id: topA[3],
        team2Id: topB[3],
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[2]?.name || 'Molo San Nicola (Sea Field)'
      },
      {
        id: 'fn-5-6',
        stage: 'Finale 5° e 6° Posto',
        group: 'Playoff',
        date: 'Domenica 23 Giugno',
        time: '17:15',
        team1Id: topA[2],
        team2Id: topB[2],
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[2]?.name || 'Molo San Nicola (Sea Field)'
      },
      {
        id: 'fn-3-4',
        stage: 'Finale 3° e 4° Posto',
        group: 'Playoff',
        date: 'Domenica 23 Giugno',
        time: '18:30',
        team1Id: topB[1],
        team2Id: topA[1],
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      },
      {
        id: 'fn-1-2',
        stage: 'Finale 1° e 2° Posto (Finalissima)',
        group: 'Playoff',
        date: 'Domenica 23 Giugno',
        time: '20:00',
        team1Id: topA[0],
        team2Id: topB[0],
        team1Score: 0,
        team2Score: 0,
        status: 'scheduled',
        pitch: venues[0]?.name || 'Stadio del Nuoto Bari'
      }
    ];

    const logs: ActivityLog = {
      id: `log-${Date.now()}`,
      type: 'system',
      message: 'Tabellone Playoff Generato',
      details: 'Incrociati accoppiamenti gironi per fasi finali 1°-8° posto.',
      timestamp: 'Just now'
    };

    updateMatchesOnServer([...matches.filter(m => m.group !== 'Playoff'), ...newPlayoffMatches]);
    updateActivityLogsOnServer([logs, ...activityLogs]);
    alert("Tabellone Playoff Generato con Successo! Le partite sono ora disponibili nella sezione Playoff e Calendario.");
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans select-none">
      {/* TopAppBar - Sticky & Frosted */}
      <header 
        className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b-2 border-primary z-50 transition-all duration-300 overflow-hidden"
        style={config.headerBgImageUrl ? {
          backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.85)), url(${config.headerBgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 h-full max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            {/* Logo box */}
            <div 
              onClick={() => setActiveTab('home')} 
              className="w-10 h-10 bg-white flex items-center justify-center overflow-hidden border-2 border-primary rounded shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <img 
                alt="Sport Project Bari Logo" 
                className="w-full h-full object-contain" 
                src={config.logoUrl}
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Title */}
            <div onClick={() => setActiveTab('home')} className="cursor-pointer">
              <h1 className="font-display text-base sm:text-xl font-black tracking-tighter text-white uppercase italic leading-none flex items-center gap-1.5 hover:text-primary transition-colors">
                {config.title}
              </h1>
              <p className="text-[9px] font-mono font-bold tracking-widest text-secondary uppercase leading-none mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile / Admin Quick Switch */}
            <button 
              onClick={() => setActiveTab('admin')}
              className={`w-9 h-9 rounded-full border-2 hover:border-primary hover:bg-surface-high active:scale-95 transition-all cursor-pointer shadow-lg flex items-center justify-center ${activeTab === 'admin' ? 'border-primary bg-primary/20 text-primary' : 'border-white/10 bg-surface/50 text-white'}`}
              title="Pannello di Controllo"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 pt-16 pb-24 overflow-x-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-t-primary border-white/10 rounded-full animate-spin" />
            <p className="font-mono text-xs uppercase text-on-surface-variant tracking-widest">Caricamento database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView matches={matches} teams={teams} onNavigate={setActiveTab} config={config} />
            )}
            {activeTab === 'schedule' && (
              <ScheduleView matches={matches} teams={teams} venues={venues} />
            )}
            {activeTab === 'standings' && (
              <StandingsView matches={matches} teams={teams} scorers={scorers} />
            )}
            {activeTab === 'playoff' && (
              <PlayoffsView 
                matches={matches} 
                teams={teams} 
                onGeneratePlayoffs={handleGeneratePlayoffs}
                isAdmin={true} // Allow triggering from tab or admin area
              />
            )}
            {activeTab === 'admin' && (
              <AdminView 
                matches={matches} 
                setMatches={updateMatchesOnServer}
                venues={venues} 
                setVenues={updateVenuesOnServer} 
                teams={teams}
                setTeams={updateTeamsOnServer}
                scorers={scorers}
                activityLogs={activityLogs}
                setActivityLogs={updateActivityLogsOnServer}
                players={players}
                setPlayers={updatePlayersOnServer}
                config={config}
                setConfig={updateConfigOnServer}
                onGeneratePlayoffs={handleGeneratePlayoffs}
              />
            )}
          </>
        )}
      </main>

      {/* Real-time Toast Alerts on HomeView */}
      {activeTab === 'home' && (
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/5 z-50 shadow-2xl h-16">
        <div className="flex justify-around items-center h-full max-w-lg mx-auto px-4 w-full">
          {/* Home */}
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 cursor-pointer ${
              activeTab === 'home' 
                ? 'text-primary' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="font-display font-black text-[9px] uppercase tracking-wide">Home</span>
          </button>

          {/* Schedule */}
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 cursor-pointer ${
              activeTab === 'schedule' 
                ? 'text-primary' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="font-display font-black text-[9px] uppercase tracking-wide">Calendario</span>
          </button>

          {/* Standings */}
          <button 
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 cursor-pointer ${
              activeTab === 'standings' 
                ? 'text-primary' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="font-display font-black text-[9px] uppercase tracking-wide">Classifiche</span>
          </button>

          {/* Playoff */}
          <button 
            onClick={() => setActiveTab('playoff')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 cursor-pointer ${
              activeTab === 'playoff' 
                ? 'text-primary' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="font-display font-black text-[9px] uppercase tracking-wide">Semifinali e Finali</span>
          </button>

          {/* Admin */}
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 cursor-pointer ${
              activeTab === 'admin' 
                ? 'text-primary' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="font-display font-black text-[9px] uppercase tracking-wide">Admin</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
