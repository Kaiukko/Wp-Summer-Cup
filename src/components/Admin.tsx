import React, { useState } from 'react';
import { apiFetch } from '../utils';
import { Match, Team, Venue, Scorer, ActivityLog, Player, TournamentConfig } from '../types';
import { 
  Shield, 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  X, 
  Save, 
  AlertTriangle,
  PlusCircle,
  Clock,
  Play,
  Lock,
  Palette,
  Eye,
  KeyRound,
  RotateCcw,
  Trophy,
  Camera,
  Upload,
  Image,
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface AdminProps {
  matches: Match[];
  setMatches: (m: Match[]) => void;
  venues: Venue[];
  setVenues: (v: Venue[]) => void;
  teams: Team[];
  setTeams: (t: Team[]) => void;
  scorers: Scorer[];
  activityLogs: ActivityLog[];
  setActivityLogs: (l: ActivityLog[]) => void;
  players: Player[];
  setPlayers: (p: Player[]) => void;
  config: TournamentConfig;
  setConfig: (c: TournamentConfig) => void;
  onGeneratePlayoffs: () => void;
}

export default function Admin({
  matches,
  setMatches,
  venues,
  setVenues,
  teams,
  setTeams,
  scorers,
  activityLogs,
  setActivityLogs,
  players,
  setPlayers,
  config,
  setConfig,
  onGeneratePlayoffs
}: AdminProps) {
  // Authentication PIN Code gate
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Session persistent in current memory session
    return false;
  });
  const [authError, setAuthError] = useState('');

  // Sections
  const [adminSection, setAdminSection] = useState<'dashboard' | 'teams' | 'players' | 'matches' | 'venues' | 'config'>('dashboard');

  // Modal control states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamForm, setTeamForm] = useState<Partial<Team>>({ name: '', shortName: '', logoUrl: '', group: 'A' });

  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerForm, setPlayerForm] = useState<Partial<Player>>({ name: '', teamId: '', role: 'Attaccante', goals: 0, number: 1, portraitUrl: undefined });

  // Camera integration state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [photoTarget, setPhotoTarget] = useState<'player' | 'team' | 'config' | 'bgImage' | 'headerBgImage' | null>(null);

  // Stop camera if component unmounts
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Hook stream to video element when camera is active
  React.useEffect(() => {
    if (cameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error("Errore nell'avvio del video:", err);
      });
    }
  }, [cameraActive, cameraStream]);

  // Supabase Integration state and handlers
  const [supabaseStatus, setSupabaseStatus] = useState<{
    configured: boolean;
    connected: boolean;
    supabaseUrl: string | null;
    error: string | null;
    sqlSetupScript: string;
  } | null>(null);
  const [loadingSupabaseStatus, setLoadingSupabaseStatus] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [localSupabaseUrl, setLocalSupabaseUrl] = useState(localStorage.getItem('spb_supabase_url') || '');
  const [localSupabaseKey, setLocalSupabaseKey] = useState(localStorage.getItem('spb_supabase_key') || '');

  const handleSaveLocalSupabase = (url: string, key: string) => {
    if (url.trim()) {
      localStorage.setItem('spb_supabase_url', url.trim());
    } else {
      localStorage.removeItem('spb_supabase_url');
    }

    if (key.trim()) {
      localStorage.setItem('spb_supabase_key', key.trim());
    } else {
      localStorage.removeItem('spb_supabase_key');
    }
    
    // Refresh status
    setTimeout(() => {
      fetchSupabaseStatus();
    }, 100);
  };

  const fetchSupabaseStatus = () => {
    setLoadingSupabaseStatus(true);
    apiFetch('/api/supabase/status')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Il server ha risposto con codice ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setSupabaseStatus(data);
        setLoadingSupabaseStatus(false);
      })
      .catch(err => {
        console.error("Failed to load Supabase status", err);
        setSupabaseStatus({
          configured: false,
          connected: false,
          supabaseUrl: null,
          error: `Errore di connessione o analisi dati: ${err.message || err}`,
          sqlSetupScript: `-- SQL setup script to run in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS sport_project_bari_db (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row-Level Security (RLS) to allow read/write API access
ALTER TABLE sport_project_bari_db DISABLE ROW LEVEL SECURITY;

-- Insert starting seed row
INSERT INTO sport_project_bari_db (id, data)
VALUES ('primary', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;`
        });
        setLoadingSupabaseStatus(false);
      });
  };

  React.useEffect(() => {
    if (adminSection === 'config') {
      fetchSupabaseStatus();
    }
  }, [adminSection]);

  const startCamera = async (target: 'player' | 'team' | 'config' | 'bgImage' | 'headerBgImage' = 'player') => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("La fotocamera non è supportata o non è accessibile in questa modalità (assicurati di usare HTTPS o un browser moderno).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setCameraActive(true);
      setPhotoTarget(target);
    } catch (err) {
      console.error("Errore nell'accesso alla fotocamera:", err);
      alert("Impossibile accedere alla fotocamera. Verifica i permessi del browser.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setPhotoTarget(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        if (photoTarget === 'team') {
          setTeamForm(prev => ({ ...prev, logoUrl: dataUrl }));
        } else if (photoTarget === 'config') {
          setConfig({ ...config, logoUrl: dataUrl });
        } else if (photoTarget === 'bgImage') {
          setConfig({ ...config, bgImageUrl: dataUrl });
        } else if (photoTarget === 'headerBgImage') {
          setConfig({ ...config, headerBgImageUrl: dataUrl });
        } else {
          setPlayerForm(prev => ({ ...prev, portraitUrl: dataUrl }));
        }
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'player' | 'team' | 'config' | 'bgImage' | 'headerBgImage' = 'player') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === 'team') {
          setTeamForm(prev => ({ ...prev, logoUrl: result }));
        } else if (target === 'config') {
          setConfig({ ...config, logoUrl: result });
        } else if (target === 'bgImage') {
          setConfig({ ...config, bgImageUrl: result });
        } else if (target === 'headerBgImage') {
          setConfig({ ...config, headerBgImageUrl: result });
        } else {
          setPlayerForm(prev => ({ ...prev, portraitUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const closePlayerModal = () => {
    stopCamera();
    setShowPlayerModal(false);
    setPlayerForm({ name: '', teamId: '', role: 'Attaccante', goals: 0, number: 1, portraitUrl: undefined });
    setEditingPlayer(null);
  };

  const closeTeamModal = () => {
    stopCamera();
    setShowTeamModal(false);
    setTeamForm({ name: '', shortName: '', logoUrl: '', group: 'A' });
    setEditingTeam(null);
  };

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchForm, setMatchForm] = useState<Partial<Match>>({
    stage: 'Tappa 1', group: 'A', date: '', time: '', team1Id: '', team2Id: '', status: 'scheduled', pitch: '', team1Score: 0, team2Score: 0
  });

  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueForm, setVenueForm] = useState<Partial<Venue>>({ name: '', location: '', capacity: '', tags: [], imageUrl: '' });
  const [tagInput, setTagInput] = useState('');

  // Searches
  const [teamSearch, setTeamSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [matchSearch, setMatchSearch] = useState('');
  const [venueSearch, setVenueSearch] = useState('');

  // PIN authentication logic
  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === config.adminPin) {
      setIsAuthenticated(true);
      setAuthError('');
      addLog('system', 'Accesso amministratore autorizzato', 'Sessione sbloccata con codice PIN.');
    } else {
      setAuthError('Codice PIN errato! Riprova.');
      setPinInput('');
    }
  };

  const handleKeypadPress = (num: string) => {
    setAuthError('');
    if (pinInput.length < 8) {
      setPinInput(prev => prev + num);
    }
  };

  const handleKeypadClear = () => {
    setPinInput('');
  };

  // Helper: Retrieve team details
  const getTeam = (id: string) => {
    return teams.find((t) => t.id === id) || { name: 'Unknown', shortName: '??', logoUrl: '' };
  };

  // Helper: Push a new activity log
  const addLog = (type: ActivityLog['type'], message: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      type,
      message,
      details,
      timestamp: 'Ora'
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  // --- CRUD TEAMS ---
  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.shortName) {
      alert("Nome e sigla sono obbligatori!");
      return;
    }
    const defaultLogo = "https://lh3.googleusercontent.com/aida-public/AB6AXuAKFuWF_QkpRPDAklc-pyDeRyCUaeNi0O00Gp5FLb12JmduTRvIiWrSZQ3hxXtH4DjBth8xzc-8vliqfR88a8uelw-x2iSVKI4dFfKNg2ztyPNsGP_dSLdRhapPUmw3xXm80Pps9Y0dEUDcFLD2JgcGdR2uwcUYNmd5VuSlkZzO2TFqPGEaI3vRKaBTI4amtkSGkBoczJkB-8Untq82cJyDhF60k1EA61KNQLbBWITSA-U7lM2a8jIUxAExFeX4rRme-SnScQHrTLM";

    if (editingTeam) {
      const updated = teams.map(t => t.id === editingTeam.id ? { ...t, ...teamForm as Team } : t);
      setTeams(updated);
      addLog('maintenance', 'Squadra aggiornata', `Squadra "${teamForm.name}" modificata con successo.`);
    } else {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: teamForm.name,
        shortName: teamForm.shortName.toUpperCase(),
        logoUrl: teamForm.logoUrl || defaultLogo,
        group: teamForm.group || 'A'
      };
      setTeams([...teams, newTeam]);
      addLog('registration', 'Nuova squadra registrata', `Squadra "${newTeam.name}" aggiunta al girone ${newTeam.group}.`);
    }
    setShowTeamModal(false);
    setTeamForm({ name: '', shortName: '', logoUrl: '', group: 'A' });
    setEditingTeam(null);
  };

  const handleDeleteTeam = (id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare la squadra "${name}"? Verranno rimossi anche i relativi incroci.`)) {
      setTeams(teams.filter(t => t.id !== id));
      addLog('maintenance', 'Squadra eliminata', `Squadra "${name}" rimossa dal sistema.`);
    }
  };

  // --- CRUD PLAYERS ---
  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.name || !playerForm.teamId) {
      alert("Nome e Squadra di appartenenza sono obbligatori!");
      return;
    }

    if (editingPlayer) {
      const updated = players.map(p => p.id === editingPlayer.id ? { ...p, ...playerForm as Player } : p);
      setPlayers(updated);
      addLog('maintenance', 'Profilo giocatore aggiornato', `Giocatore "${playerForm.name}" aggiornato.`);
    } else {
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: playerForm.name,
        teamId: playerForm.teamId,
        role: playerForm.role || 'Attaccante',
        goals: playerForm.goals || 0,
        number: playerForm.number || 1,
        portraitUrl: playerForm.portraitUrl
      };
      setPlayers([...players, newPlayer]);
      addLog('registration', 'Nuovo giocatore registrato', `Giocatore "${newPlayer.name}" assegnato a ${getTeam(newPlayer.teamId).name}.`);
    }
    closePlayerModal();
  };

  const handleDeletePlayer = (id: string, name: string) => {
    if (window.confirm(`Sicuro di voler rimuovere il giocatore "${name}"?`)) {
      setPlayers(players.filter(p => p.id !== id));
      addLog('maintenance', 'Giocatore rimosso', `Profilo di "${name}" rimosso dal database.`);
    }
  };

  // --- CRUD MATCHES & SCORING ---
  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchForm.team1Id || !matchForm.team2Id || !matchForm.pitch) {
      alert("Seleziona entrambe le squadre ed il campo di gioco!");
      return;
    }

    if (editingMatch) {
      const updated = matches.map(m => m.id === editingMatch.id ? { ...m, ...matchForm as Match } : m);
      setMatches(updated);
      addLog('result', 'Incontro aggiornato', `${getTeam(matchForm.team1Id).name} vs ${getTeam(matchForm.team2Id).name} (${matchForm.team1Score ?? 0} - ${matchForm.team2Score ?? 0})`);
    } else {
      const newMatch: Match = {
        id: `match-${Date.now()}`,
        stage: matchForm.stage || 'Tappa 1',
        group: matchForm.group || 'A',
        date: matchForm.date || 'Sabato 15 Giugno',
        time: matchForm.time || '18:00',
        team1Id: matchForm.team1Id,
        team2Id: matchForm.team2Id,
        pitch: matchForm.pitch,
        status: matchForm.status || 'scheduled',
        team1Score: matchForm.status !== 'scheduled' ? (matchForm.team1Score || 0) : undefined,
        team2Score: matchForm.status !== 'scheduled' ? (matchForm.team2Score || 0) : undefined
      };
      setMatches([...matches, newMatch]);
      addLog('maintenance', 'Incontro programmato', `${getTeam(newMatch.team1Id).name} vs ${getTeam(newMatch.team2Id).name} aggiunto a calendario.`);
    }
    setShowMatchModal(false);
    setMatchForm({ stage: 'Tappa 1', group: 'A', date: '', time: '', team1Id: '', team2Id: '', status: 'scheduled', pitch: '', team1Score: 0, team2Score: 0 });
    setEditingMatch(null);
  };

  const handleDeleteMatch = (id: string) => {
    if (window.confirm(`Rimuovere questa partita dal calendario?`)) {
      setMatches(matches.filter(m => m.id !== id));
      addLog('maintenance', 'Partita cancellata', 'Un incontro è stato rimosso dal tabellone.');
    }
  };

  // --- CRUD VENUES ---
  const handleSaveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueForm.name || !venueForm.location) {
      alert('Nome e Località sono campi obbligatori!');
      return;
    }

    const tagsArray = tagInput
      ? tagInput.split(',').map((t) => t.trim().toUpperCase()).filter((t) => t !== '')
      : [];

    if (editingVenue) {
      const updated = venues.map(v => v.id === editingVenue.id ? {
        ...v,
        name: venueForm.name!,
        location: venueForm.location!,
        capacity: venueForm.capacity || 'STANDING ONLY',
        tags: tagsArray,
        imageUrl: venueForm.imageUrl || 'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=500'
      } : v);
      setVenues(updated);
      addLog('maintenance', 'Sede modificata', `Struttura "${venueForm.name}" aggiornata.`);
    } else {
      const newV: Venue = {
        id: `venue-${Date.now()}`,
        name: venueForm.name!,
        location: venueForm.location!,
        capacity: venueForm.capacity || 'STANDING ONLY',
        tags: tagsArray,
        imageUrl: venueForm.imageUrl || 'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=500'
      };
      setVenues([...venues, newV]);
      addLog('maintenance', 'Nuova sede aggiunta', `Piscina/campo "${newV.name}" aggiunto.`);
    }
    setShowVenueModal(false);
    setVenueForm({ name: '', location: '', capacity: '', tags: [], imageUrl: '' });
    setTagInput('');
    setEditingVenue(null);
  };

  const handleDeleteVenue = (id: string, name: string) => {
    if (window.confirm(`Eliminare la sede "${name}"?`)) {
      setVenues(venues.filter(v => v.id !== id));
      addLog('maintenance', 'Sede rimossa', `Sede "${name}" rimossa dal circuito.`);
    }
  };

  // --- TOURNAMENT CONFIGURATION ---
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(config);
    addLog('system', 'Configurazione di sistema salvata', 'Le impostazioni del layout e colori sono state sincronizzate.');
    alert("Impostazioni salvate con successo! I colori ed i loghi sono stati aggiornati su tutte le pagine.");
  };

  // Filter listings
  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(teamSearch.toLowerCase()) || 
    t.shortName.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(playerSearch.toLowerCase()) || 
    getTeam(p.teamId).name.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const filteredMatches = matches.filter(m => 
    getTeam(m.team1Id).name.toLowerCase().includes(matchSearch.toLowerCase()) || 
    getTeam(m.team2Id).name.toLowerCase().includes(matchSearch.toLowerCase()) ||
    m.stage.toLowerCase().includes(matchSearch.toLowerCase())
  );

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(venueSearch.toLowerCase()) || 
    v.location.toLowerCase().includes(venueSearch.toLowerCase())
  );

  // --- ACCESS DENIED PIN PAD GATE ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-fade-in" id="auth-pin-pad">
        <div className="bg-surface-low border border-white/10 rounded-xl overflow-hidden shadow-2xl glossy-card">
          <div className="bg-primary/10 border-b border-white/5 p-6 text-center space-y-2">
            <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto text-primary">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-black uppercase tracking-tight text-white italic">Accesso Amministratore</h3>
            <p className="text-xs text-on-surface-variant font-medium">Inserisci il codice PIN per sbloccare le impostazioni.</p>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN DI SICUREZZA"
                  className="w-full bg-background border-b-2 border-white/10 focus:border-primary px-3 py-3 text-center text-xl font-mono tracking-[0.4em] focus:outline-none text-white rounded"
                  maxLength={8}
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-red-500 font-mono text-[11px] text-center font-bold flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {authError}
                </p>
              )}

              {/* Graphical custom numerical keyboard as requested by glossy aesthetic */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-12 bg-surface-high border border-white/5 hover:bg-surface-highest transition-colors font-mono font-bold text-base text-white rounded active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-12 bg-red-950/20 border border-red-500/10 hover:bg-red-900/20 text-red-400 font-display text-[10px] font-black uppercase rounded flex items-center justify-center cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 bg-surface-high border border-white/5 hover:bg-surface-highest font-mono font-bold text-base text-white rounded flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyPin()}
                  className="h-12 bg-primary border border-primary/20 hover:brightness-115 text-white font-display text-[10px] font-black uppercase rounded flex items-center justify-center cursor-pointer"
                >
                  Sblocca
                </button>
              </div>

              
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 md:px-8 pb-12 animate-fade-in" id="admin-view">
      {/* Top Section Nav Bar */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Area Amministrativa Sbloccata
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase italic text-white tracking-tight">
            Pannello Amministratore
          </h2>
        </div>
        
        {/* Sign Out Button */}
        <button
          onClick={() => {
            setIsAuthenticated(false);
            setPinInput('');
          }}
          className="text-xs font-mono font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded uppercase self-start sm:self-auto"
        >
          Blocca Sessione
        </button>
      </section>

      {/* Tabs list for Admin capabilities */}
      <div className="flex pb-1 overflow-x-auto no-scrollbar gap-2 font-display text-xs italic font-bold">
        {[
          { id: 'dashboard', label: 'Home' },
          { id: 'teams', label: 'Squadre' },
          { id: 'players', label: 'Giocatori' },
          { id: 'matches', label: 'Risultati / Gare' },
          { id: 'venues', label: 'Piscine / Campi' },
          { id: 'config', label: 'Personalizzazione Layout' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setAdminSection(sec.id as any)}
            className={`px-4 py-2.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
              adminSection === sec.id ? 'bg-primary text-white' : 'bg-surface-low text-on-surface-variant hover:text-white border border-white/5'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* 1. GENERAL DASHBOARD */}
      {adminSection === 'dashboard' && (
        <div className="space-y-8">
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glossy-card p-4 flex flex-col justify-between h-28 border-l-4 border-l-primary rounded-lg">
              <span className="font-mono text-[9px] uppercase font-bold text-on-surface-variant">Squadre</span>
              <span className="font-display text-2xl font-black text-white">{teams.length}</span>
            </div>
            <div className="glossy-card p-4 flex flex-col justify-between h-28 border-l-4 border-l-secondary rounded-lg">
              <span className="font-mono text-[9px] uppercase font-bold text-on-surface-variant">Giocatori</span>
              <span className="font-display text-2xl font-black text-white">{players.length}</span>
            </div>
            <div className="glossy-card p-4 flex flex-col justify-between h-28 border-l-4 border-l-green-500 rounded-lg">
              <span className="font-mono text-[9px] uppercase font-bold text-on-surface-variant">Partite</span>
              <span className="font-display text-2xl font-black text-white">{matches.length}</span>
            </div>
            <div className="glossy-card p-4 flex flex-col justify-between h-28 border-l-4 border-l-indigo-500 rounded-lg">
              <span className="font-mono text-[9px] uppercase font-bold text-on-surface-variant">Campi</span>
              <span className="font-display text-2xl font-black text-white">{venues.length}</span>
            </div>
            <div className="glossy-card p-4 flex flex-col justify-between h-28 border-l-4 border-l-amber-600 rounded-lg col-span-2 lg:col-span-1">
              <span className="font-mono text-[9px] uppercase font-bold text-on-surface-variant">Fasi Playoff</span>
              <span className="font-display text-xs font-black text-secondary uppercase">
                {matches.some(m => m.group === 'Playoff') ? 'Generati e Attivi' : 'Non ancora Generati'}
              </span>
            </div>
          </section>

          {/* Quick Playoff generation banner */}
          {!matches.some(m => m.group === 'Playoff') && (
            <div className="bg-surface-low border border-secondary/30 p-6 rounded-lg glossy-card flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-display text-sm font-black uppercase text-secondary italic flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-secondary animate-bounce" /> Generazione Automatica Playoff 1°-8° Posto
                </h4>
                <p className="text-xs text-on-surface-variant">Incrocia i migliori piazzamenti del Girone A con il Girone B in tappe ad eliminazione diretta.</p>
              </div>
              <button
                onClick={onGeneratePlayoffs}
                className="btn-primary px-5 py-2.5 font-display text-[10px] font-black uppercase italic text-white rounded cursor-pointer"
              >
                Genera Tabellone Fase Finale
              </button>
            </div>
          )}

          {/* Activity Logs listing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm text-white font-extrabold uppercase italic">Registro Operazioni di Sistema</h3>
            </div>
            <div className="glossy-card rounded-lg divide-y divide-white/5 max-h-72 overflow-y-auto no-scrollbar">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-surface-high/10 transition-colors flex justify-between gap-3 text-xs">
                  <div className="flex gap-2">
                    <Activity className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white uppercase tracking-tight">{log.message}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SQUADRE MANAGEMENT (TEAMS) */}
      {adminSection === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca squadra..."
                value={teamSearch}
                onChange={e => setTeamSearch(e.target.value)}
                className="w-full bg-background border-b border-white/10 pl-9 pr-4 py-2 focus:outline-none text-xs uppercase font-mono text-white"
              />
            </div>
            <button
              onClick={() => {
                setTeamForm({ name: '', shortName: '', logoUrl: '', group: 'A' });
                setEditingTeam(null);
                setShowTeamModal(true);
              }}
              className="btn-primary px-5 py-2.5 font-display text-xs font-black uppercase italic text-white rounded cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Aggiungi Squadra
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div key={team.id} className="glossy-card p-4 rounded-lg flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <img src={team.logoUrl} alt={team.name} className="w-10 h-10 object-contain bg-white/5 p-1 rounded border border-white/10" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-white uppercase italic">{team.name} ({team.shortName})</h4>
                    <span className="text-[9px] font-mono font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded uppercase">Girone {team.group}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingTeam(team);
                      setTeamForm(team);
                      setShowTeamModal(true);
                    }}
                    className="p-1.5 hover:bg-surface-high/50 text-secondary rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="p-1.5 hover:bg-surface-high/50 text-primary rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GIOCATORI MANAGEMENT (PLAYERS) */}
      {adminSection === 'players' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca giocatore o squadra..."
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                className="w-full bg-background border-b border-white/10 pl-9 pr-4 py-2 focus:outline-none text-xs uppercase font-mono text-white"
              />
            </div>
            <button
              onClick={() => {
                setPlayerForm({ name: '', teamId: teams[0]?.id || '', role: 'Attaccante', goals: 0, number: 10, portraitUrl: undefined });
                setEditingPlayer(null);
                setShowPlayerModal(true);
              }}
              className="btn-primary px-5 py-2.5 font-display text-xs font-black uppercase italic text-white rounded cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Aggiungi Giocatore
            </button>
          </div>
 
          <div className="bg-surface-low border border-white/5 rounded-lg overflow-hidden glossy-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background font-mono text-[9px] text-on-surface-variant uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-3.5 text-center w-12">#</th>
                    <th className="p-3.5">Nome Giocatore</th>
                    <th className="p-3.5">Squadra</th>
                    <th className="p-3.5">Ruolo</th>
                    <th className="p-3.5 text-center">Goal</th>
                    <th className="p-3.5 text-center w-24">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans text-xs">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-surface-high/10 transition-colors">
                      <td className="p-3.5 text-center font-mono font-bold text-secondary">
                        {player.number || '--'}
                      </td>
                      <td className="p-3.5 font-bold text-white uppercase">
                        <div className="flex items-center gap-2">
                          {player.portraitUrl ? (
                            <img src={player.portraitUrl} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[9px] text-on-surface-variant font-mono">
                              {player.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span>{player.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-on-surface-variant font-mono uppercase text-[10px]">
                        {getTeam(player.teamId).name}
                      </td>
                      <td className="p-3.5 text-on-surface-variant">
                        {player.role}
                      </td>
                      <td className="p-3.5 text-center font-display font-black text-secondary text-sm">
                        {player.goals}
                      </td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPlayer(player);
                            setPlayerForm(player);
                            setShowPlayerModal(true);
                          }}
                          className="p-1 hover:bg-surface-high text-secondary rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id, player.name)}
                          className="p-1 hover:bg-surface-high text-primary rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. RISULTATI & CALENDARIO (MATCHES) */}
      {adminSection === 'matches' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca gara..."
                value={matchSearch}
                onChange={e => setMatchSearch(e.target.value)}
                className="w-full bg-background border-b border-white/10 pl-9 pr-4 py-2 focus:outline-none text-xs uppercase font-mono text-white"
              />
            </div>
            <button
              onClick={() => {
                setMatchForm({ stage: 'Tappa 1', group: 'A', date: 'Sabato 15 Giugno', time: '18:00', team1Id: teams[0]?.id || '', team2Id: teams[1]?.id || '', status: 'scheduled', pitch: venues[0]?.name || '' });
                setEditingMatch(null);
                setShowMatchModal(true);
              }}
              className="btn-primary px-5 py-2.5 font-display text-xs font-black uppercase italic text-white rounded cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Pianifica Incontro
            </button>
          </div>

          <div className="space-y-3">
            {filteredMatches.map((match) => {
              const team1 = getTeam(match.team1Id);
              const team2 = getTeam(match.team2Id);
              return (
                <div key={match.id} className="glossy-card p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5">
                  <div className="flex flex-col gap-1 sm:w-1/4">
                    <span className="text-[9px] font-mono bg-white/5 text-on-surface-variant px-2 py-0.5 rounded w-max uppercase font-bold">
                      {match.stage} • {match.group === 'Playoff' ? 'Playoff' : `Girone ${match.group}`}
                    </span>
                    <span className="text-xs font-mono font-semibold text-on-surface-variant">
                      {match.date} • {match.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 justify-center flex-1 py-1">
                    <div className="flex items-center gap-2">
                      <img src={team1.logoUrl} alt={team1.name} className="w-6 h-6 object-contain bg-white/5 p-0.5 rounded" referrerPolicy="no-referrer" />
                      <span className="text-xs uppercase font-bold text-white max-w-[100px] sm:max-w-none line-clamp-1">{team1.name}</span>
                    </div>

                    <div className="px-3 py-1 bg-background border border-white/10 rounded font-display text-sm font-black italic text-secondary">
                      {match.status !== 'scheduled' ? `${match.team1Score} - ${match.team2Score}` : 'VS'}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-white max-w-[100px] sm:max-w-none line-clamp-1">{team2.name}</span>
                      <img src={team2.logoUrl} alt={team2.name} className="w-6 h-6 object-contain bg-white/5 p-0.5 rounded" referrerPolicy="no-referrer" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase tracking-wider ${
                      match.status === 'live' 
                        ? 'bg-primary text-white animate-pulse' 
                        : match.status === 'completed'
                        ? 'bg-surface-highest text-on-surface-variant'
                        : 'bg-background border border-white/10 text-on-surface-variant'
                    }`}>
                      {match.status === 'live' ? 'Live' : match.status === 'completed' ? 'Terminata' : 'Programmata'}
                    </span>
                    
                    <button
                      onClick={() => {
                        setEditingMatch(match);
                        setMatchForm(match);
                        setShowMatchModal(true);
                      }}
                      className="p-1.5 bg-surface-high hover:bg-surface-highest text-white transition-colors border border-white/5 rounded cursor-pointer flex items-center gap-1 text-[10px]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-secondary" /> Modifica
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="p-1.5 bg-surface-high hover:bg-surface-highest text-primary transition-colors border border-white/5 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. VESTIGES OF ARENAS (VENUES) */}
      {adminSection === 'venues' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca campi..."
                value={venueSearch}
                onChange={e => setVenueSearch(e.target.value)}
                className="w-full bg-background border-b border-white/10 pl-9 pr-4 py-2 focus:outline-none text-xs uppercase font-mono text-white"
              />
            </div>
            <button
              onClick={() => {
                setVenueForm({ name: '', location: '', capacity: '', tags: [], imageUrl: '' });
                setTagInput('');
                setEditingVenue(null);
                setShowVenueModal(true);
              }}
              className="btn-primary px-5 py-2.5 font-display text-xs font-black uppercase italic text-white rounded cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Aggiungi Campo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="glossy-card rounded-lg overflow-hidden flex flex-col justify-between">
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${venue.imageUrl})` }} />
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white uppercase italic">{venue.name}</h4>
                    <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {venue.location}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingVenue(venue);
                        setVenueForm(venue);
                        setTagInput(venue.tags.join(', '));
                        setShowVenueModal(true);
                      }}
                      className="btn-secondary-phoenix flex-1 py-1 text-[10px] uppercase font-bold italic text-white rounded"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDeleteVenue(venue.id, venue.name)}
                      className="btn-secondary-phoenix flex-1 py-1 text-[10px] uppercase font-bold italic text-primary rounded"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TOURNAMENT SETTINGS & DYNAMIC COLORS CONFIG */}
      {adminSection === 'config' && (
        <form onSubmit={handleSaveConfig} className="bg-surface-low p-6 rounded-lg border border-white/5 space-y-6 glossy-card max-w-2xl">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-display text-base font-black text-white uppercase italic flex items-center gap-2">
              <Palette className="w-5 h-5 text-secondary" /> Personalizzazione e Branding Torneo
            </h3>
            <p className="text-xs text-on-surface-variant font-sans">Configura i colori sociali, l'intestazione generale e i loghi per personalizzare l'applicazione.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Titolo Torneo</label>
              <input
                type="text"
                value={config.title}
                onChange={e => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Sottotitolo / Edizione</label>
              <input
                type="text"
                value={config.subtitle}
                onChange={e => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold flex items-center gap-1.5">Colore Primario (Hex) <span className="w-3.5 h-3.5 rounded border border-white/15" style={{ backgroundColor: config.primaryColor }} /></label>
              <input
                type="color"
                value={config.primaryColor}
                onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                className="w-full h-9 bg-background border border-white/10 p-1 focus:outline-none rounded"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold flex items-center gap-1.5">Colore Secondario (Hex) <span className="w-3.5 h-3.5 rounded border border-white/15" style={{ backgroundColor: config.secondaryColor }} /></label>
              <input
                type="color"
                value={config.secondaryColor}
                onChange={e => setConfig({ ...config, secondaryColor: e.target.value })}
                className="w-full h-9 bg-background border border-white/10 p-1 focus:outline-none rounded"
              />
            </div>
          </div>

          {/* Tappa Number & Tappa Name Configuration */}
          <div className="bg-surface-high/20 border border-white/5 p-4 rounded-lg space-y-4">
            <h4 className="font-display text-xs font-bold text-secondary uppercase tracking-widest border-b border-white/5 pb-1">
              Impostazioni Tappe
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Numero Tappa Attuale</label>
                <input
                  type="number"
                  min="1"
                  value={config.tappaNumber !== undefined ? config.tappaNumber : 1}
                  onChange={e => setConfig({ ...config, tappaNumber: parseInt(e.target.value) || 1 })}
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Nome Tappa Attuale</label>
                <input
                  type="text"
                  value={config.tappaName || ''}
                  onChange={e => setConfig({ ...config, tappaName: e.target.value })}
                  placeholder="es. Tappa 1 - Gironi"
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Logo Sport Project Bari Upload & Camera */}
          <div className="space-y-2 border border-white/5 p-4 rounded-lg bg-surface-high/30">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Logo Ufficiale Sport Project Bari
            </label>
            
            {cameraActive && photoTarget === 'config' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border border-primary/30 bg-black">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover transform -scale-x-100" 
                    autoPlay 
                    playsInline 
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Scatta Foto
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 py-1.5 bg-surface-high border border-white/10 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Current Photo Preview */}
                <div className="relative w-16 h-16 rounded overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  {config.logoUrl ? (
                    <img 
                      src={config.logoUrl} 
                      alt="Anteprima" 
                      className="w-full h-full object-contain p-1" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Trophy className="w-6 h-6 text-white/20" />
                  )}
                  {config.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, logoUrl: '' })}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 text-[9px] font-bold uppercase transition-opacity cursor-pointer"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    {/* Camera Trigger */}
                    <button
                      type="button"
                      onClick={() => startCamera('config')}
                      className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-secondary" />
                      <span>Scatta</span>
                    </button>

                    {/* File Upload Trigger */}
                    <label className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer text-center">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Carica</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'config')} 
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-on-surface-variant font-mono leading-tight">
                    Scatta col web o carica dal PC/Smartphone.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">O incolla URL alternativo</label>
            <input
              type="text"
              value={config.logoUrl || ''}
              onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
              placeholder="Incolla un link o usa i pulsanti sopra"
              className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
            />
          </div>

          {/* Background Image Home Upload & Camera */}
          <div className="space-y-2 border border-white/5 p-4 rounded-lg bg-surface-high/30">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Immagine di Sfondo (Home)
            </label>
            
            {cameraActive && photoTarget === 'bgImage' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-full max-w-[200px] aspect-video rounded-lg overflow-hidden border border-primary/30 bg-black">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover transform -scale-x-100" 
                    autoPlay 
                    playsInline 
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Scatta Foto
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 py-1.5 bg-surface-high border border-white/10 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Current Photo Preview */}
                <div className="relative w-24 h-16 rounded overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  {config.bgImageUrl ? (
                    <img 
                      src={config.bgImageUrl} 
                      alt="Anteprima" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Image className="w-6 h-6 text-white/20" />
                  )}
                  {config.bgImageUrl && (
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, bgImageUrl: '' })}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 text-[9px] font-bold uppercase transition-opacity cursor-pointer"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    {/* Camera Trigger */}
                    <button
                      type="button"
                      onClick={() => startCamera('bgImage')}
                      className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-secondary" />
                      <span>Scatta</span>
                    </button>

                    {/* File Upload Trigger */}
                    <label className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer text-center">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Carica</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'bgImage')} 
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-on-surface-variant font-mono leading-tight">
                    Scatta col web o carica un'immagine dal PC/Smartphone.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">O incolla URL alternativo background Home</label>
            <input
              type="text"
              value={config.bgImageUrl || ''}
              onChange={e => setConfig({ ...config, bgImageUrl: e.target.value })}
              placeholder="Incolla un link o usa i pulsanti sopra"
              className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
            />
          </div>

          {/* Background Image Header Upload & Camera */}
          <div className="space-y-2 border border-white/5 p-4 rounded-lg bg-surface-high/30">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Immagine di Sfondo (Header)
            </label>
            
            {cameraActive && photoTarget === 'headerBgImage' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-full max-w-[200px] aspect-video rounded-lg overflow-hidden border border-primary/30 bg-black">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover transform -scale-x-100" 
                    autoPlay 
                    playsInline 
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Scatta Foto
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 py-1.5 bg-surface-high border border-white/10 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Current Photo Preview */}
                <div className="relative w-24 h-16 rounded overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  {config.headerBgImageUrl ? (
                    <img 
                      src={config.headerBgImageUrl} 
                      alt="Anteprima" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Image className="w-6 h-6 text-white/20" />
                  )}
                  {config.headerBgImageUrl && (
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, headerBgImageUrl: '' })}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 text-[9px] font-bold uppercase transition-opacity cursor-pointer"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    {/* Camera Trigger */}
                    <button
                      type="button"
                      onClick={() => startCamera('headerBgImage')}
                      className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-secondary" />
                      <span>Scatta</span>
                    </button>

                    {/* File Upload Trigger */}
                    <label className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer text-center">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Carica</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'headerBgImage')} 
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-on-surface-variant font-mono leading-tight">
                    Scatta col web o carica un'immagine dal PC/Smartphone.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">O incolla URL alternativo background Header</label>
            <input
              type="text"
              value={config.headerBgImageUrl || ''}
              onChange={e => setConfig({ ...config, headerBgImageUrl: e.target.value })}
              placeholder="Incolla un link o usa i pulsanti sopra"
              className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">PIN di Accesso Amministratore (Attuale: <strong className="text-secondary">{config.adminPin}</strong>)</label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-on-surface-variant absolute left-3" />
              <input
                type="text"
                value={config.adminPin}
                onChange={e => setConfig({ ...config, adminPin: e.target.value })}
                className="w-full bg-background border-b border-white/10 focus:border-primary pl-9 pr-3 py-2 text-xs focus:outline-none text-white font-mono"
                required
              />
            </div>
          </div>

          {/* Supabase Integration Dashboard & Instructions */}
          <div className="bg-surface-high/30 border border-white/5 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-secondary" />
                <h4 className="font-display text-xs font-bold text-white uppercase tracking-widest">
                  Integrazione Database Supabase
                </h4>
              </div>
              <button
                type="button"
                onClick={fetchSupabaseStatus}
                disabled={loadingSupabaseStatus}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-on-surface-variant hover:text-white cursor-pointer"
                title="Ricarica Stato Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSupabaseStatus ? 'animate-spin text-secondary' : ''}`} />
              </button>
            </div>

            {loadingSupabaseStatus ? (
              <div className="flex items-center gap-2 py-4 justify-center">
                <RefreshCw className="w-4 h-4 text-secondary animate-spin" />
                <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Verifica stato connessione...</span>
              </div>
            ) : supabaseStatus ? (
              <div className="space-y-3">
                {/* Status bar */}
                <div className="flex items-center gap-2.5 p-3 rounded bg-background/50 border border-white/5">
                  <div className="relative flex h-2.5 w-2.5">
                    {supabaseStatus.configured && supabaseStatus.connected && supabaseStatus.error !== 'table_missing' ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </>
                    ) : supabaseStatus.configured && supabaseStatus.connected && supabaseStatus.error === 'table_missing' ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white/30"></span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      {supabaseStatus.configured && supabaseStatus.connected && supabaseStatus.error !== 'table_missing' && (
                        <span className="text-emerald-400">Database Supabase Attivo</span>
                      )}
                      {supabaseStatus.configured && supabaseStatus.connected && supabaseStatus.error === 'table_missing' && (
                        <span className="text-amber-400">Connesso (Tabella Mancante)</span>
                      )}
                      {!supabaseStatus.configured && (
                        <span className="text-on-surface-variant">Non Configurato (Modalità in memoria)</span>
                      )}
                      {supabaseStatus.configured && !supabaseStatus.connected && (
                        <span className="text-red-400">Errore di Connessione</span>
                      )}
                    </div>
                    <div className="text-[9px] text-on-surface-variant font-mono mt-0.5 leading-tight">
                      {supabaseStatus.configured && supabaseStatus.connected && supabaseStatus.error !== 'table_missing' && (
                        <span>Tutte le immagini, le password e i dati sono archiviati in modo sicuro sul cloud! URL: {supabaseStatus.supabaseUrl}</span>
                      )}
                      {supabaseStatus.configured && supabaseStatus.connected && supabaseStatus.error === 'table_missing' && (
                        <span>Connessione a Supabase riuscita, ma la tabella "sport_project_bari_db" non esiste nel tuo database. Esegui lo script SQL qui sotto.</span>
                      )}
                      {!supabaseStatus.configured && (
                        <span>Stai usando la memoria temporanea. I dati inseriti andranno persi al riavvio del server. Segui la guida sotto per abilitare l'archiviazione cloud persistente con Supabase.</span>
                      )}
                      {supabaseStatus.configured && !supabaseStatus.connected && (
                        <span className="text-red-300/80">Errore: {supabaseStatus.error}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Local browser credentials configuration */}
                <div className="p-3.5 rounded bg-background/50 border border-white/5 space-y-2.5">
                  <h5 className="text-[10px] font-mono font-bold uppercase text-secondary tracking-widest">
                    Collegamento Browser Locale a Supabase
                  </h5>
                  <p className="text-[9px] font-mono text-on-surface-variant leading-relaxed">
                    Se apri il sito da un browser esterno o dal link pubblico di condivisione (Shared App URL), le chiavi segrete di AI Studio non sono disponibili sul server pubblico per motivi di sicurezza. Puoi inserire temporaneamente le tue chiavi Supabase qui sotto per connettere questo dispositivo al database cloud in tempo reale:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">URL Progetto Supabase</label>
                      <input
                        type="text"
                        value={localSupabaseUrl}
                        onChange={e => {
                          setLocalSupabaseUrl(e.target.value);
                          handleSaveLocalSupabase(e.target.value, localSupabaseKey);
                        }}
                        placeholder="https://xxxx.supabase.co"
                        className="w-full bg-black/45 border border-white/10 rounded px-2.5 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-primary placeholder-white/25"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Chiave Anon / Service Role</label>
                      <input
                        type="password"
                        value={localSupabaseKey}
                        onChange={e => {
                          setLocalSupabaseKey(e.target.value);
                          handleSaveLocalSupabase(localSupabaseUrl, e.target.value);
                        }}
                        placeholder="eyJhbGciOi..."
                        className="w-full bg-black/45 border border-white/10 rounded px-2.5 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-primary placeholder-white/25"
                      />
                    </div>
                  </div>
                  {(localSupabaseUrl || localSupabaseKey) && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLocalSupabaseUrl('');
                          setLocalSupabaseKey('');
                          localStorage.removeItem('spb_supabase_url');
                          localStorage.removeItem('spb_supabase_key');
                          setTimeout(() => fetchSupabaseStatus(), 100);
                        }}
                        className="text-[9px] font-mono text-red-400 hover:underline cursor-pointer"
                      >
                        Scollega e Rimuovi Chiavi Locali
                      </button>
                    </div>
                  )}
                </div>

                {/* Guide panel */}
                {(!supabaseStatus.configured || supabaseStatus.error === 'table_missing' || !supabaseStatus.connected) && (
                  <div className="space-y-3 pt-1 border-t border-white/5">
                    <h5 className="text-[10px] font-mono font-bold uppercase text-secondary tracking-widest">
                      Come configurare Supabase in 4 Passaggi:
                    </h5>
                    
                    <div className="space-y-2 text-[10px] font-mono text-on-surface-variant leading-relaxed">
                      <p>
                        <strong className="text-white">1. Crea il Database:</strong> Accedi a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>, crea un account ed un nuovo progetto.
                      </p>
                      <p>
                        <strong className="text-white">2. Copia i parametri API:</strong> Nella dashboard di Supabase, vai in <strong className="text-white">Settings &gt; API</strong> e copia la <strong className="text-white">Project URL</strong> e la chiave <strong className="text-white">anon public</strong> (o <strong className="text-white">service_role</strong>).
                      </p>
                      <p>
                        <strong className="text-white">3. Inserisci i Segreti in AI Studio:</strong> Apri il menu di configurazione di AI Studio (l'ingranaggio in alto/Settings &gt; Secrets) ed inserisci:
                        <br />
                        <code className="text-secondary select-all bg-black/40 px-1 py-0.5 rounded">SUPABASE_URL</code> = <span className="text-white/60">la tua URL di Supabase</span>
                        <br />
                        <code className="text-secondary select-all bg-black/40 px-1 py-0.5 rounded">SUPABASE_KEY</code> = <span className="text-white/60">la tua API key</span>
                      </p>
                      <div className="space-y-1">
                        <strong className="text-white">4. Inizializza lo Schema SQL:</strong> Vai all'editor SQL di Supabase (<strong className="text-white">SQL Editor</strong> in barra laterale), crea una nuova query, incolla il codice sottostante e clicca <strong className="text-white">Run</strong>:
                        
                        <div className="relative mt-1 bg-black/60 p-2.5 rounded border border-white/5 font-mono text-[9px] text-white overflow-x-auto max-h-36">
                          <pre>{supabaseStatus.sqlSetupScript}</pre>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(supabaseStatus.sqlSetupScript);
                              setCopiedSql(true);
                              setTimeout(() => setCopiedSql(false), 2000);
                            }}
                            className="absolute top-2 right-2 p-1 bg-surface-high hover:bg-surface-highest border border-white/10 rounded cursor-pointer transition-colors text-white"
                            title="Copia codice SQL"
                          >
                            {copiedSql ? (
                              <span className="text-[8px] uppercase font-bold text-emerald-400 px-1">Copiato!</span>
                            ) : (
                              <Copy className="w-3 h-3 text-secondary" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[10px] font-mono text-on-surface-variant text-center py-2">
                Nessuna informazione di stato disponibile. Clicca sul pulsante di ricarica.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 font-display text-xs font-black uppercase italic text-white rounded cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Salva Impostazioni
          </button>
        </form>
      )}


      {/* TEAM MODAL DIALOG */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-low border border-white/10 max-w-md w-full rounded-xl overflow-hidden shadow-2xl relative">
            <div className="bg-primary text-white p-4 font-display italic font-extrabold flex justify-between items-center">
              <span>{editingTeam ? 'Modifica Squadra' : 'Nuova Squadra'}</span>
              <button onClick={closeTeamModal} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveTeam} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Nome Squadra</label>
                <input
                  type="text"
                  value={teamForm.name || ''}
                  onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="es. Taranto Sharks"
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white uppercase font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Sigla</label>
                  <input
                    type="text"
                    value={teamForm.shortName || ''}
                    onChange={e => setTeamForm({ ...teamForm, shortName: e.target.value })}
                    placeholder="es. TA"
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white uppercase font-mono"
                    maxLength={3}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Girone</label>
                  <select
                    value={teamForm.group || 'A'}
                    onChange={e => setTeamForm({ ...teamForm, group: e.target.value as any })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  >
                    <option value="A">Girone A</option>
                    <option value="B">Girone B</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload & Camera Integration Section */}
              <div className="space-y-2 border border-white/5 p-4 rounded-lg bg-surface-high/30">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">
                  Logo Squadra
                </label>
                
                {cameraActive && photoTarget === 'team' ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border border-primary/30 bg-black">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover transform -scale-x-100" 
                        autoPlay 
                        playsInline 
                      />
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" /> Scatta Foto
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex-1 py-1.5 bg-surface-high border border-white/10 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* Current Photo Preview */}
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {teamForm.logoUrl ? (
                        <img 
                          src={teamForm.logoUrl} 
                          alt="Anteprima" 
                          className="w-full h-full object-contain p-1" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Shield className="w-6 h-6 text-white/20" />
                      )}
                      {teamForm.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setTeamForm(prev => ({ ...prev, logoUrl: '' }))}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 text-[9px] font-bold uppercase transition-opacity cursor-pointer"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        {/* Camera Trigger */}
                        <button
                          type="button"
                          onClick={() => startCamera('team')}
                          className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-secondary" />
                          <span>Scatta</span>
                        </button>

                        {/* File Upload Trigger */}
                        <label className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer text-center">
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>Carica</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, 'team')} 
                          />
                        </label>
                      </div>
                      <p className="text-[9px] text-on-surface-variant font-mono leading-tight">
                        Scatta col web o carica dal PC/Smartphone.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">O incolla URL alternativo</label>
                <input
                  type="text"
                  value={teamForm.logoUrl || ''}
                  onChange={e => setTeamForm({ ...teamForm, logoUrl: e.target.value })}
                  placeholder="Incolla un link o usa i pulsanti sopra"
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-[10px] focus:outline-none text-white font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeTeamModal} className="flex-1 py-2.5 bg-surface-high border border-white/10 text-white text-xs font-bold uppercase rounded">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white text-xs font-black uppercase rounded">Salva Squadra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAYER MODAL DIALOG */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-low border border-white/10 max-w-md w-full rounded-xl overflow-hidden shadow-2xl relative">
            <div className="bg-primary text-white p-4 font-display italic font-extrabold flex justify-between items-center">
              <span>{editingPlayer ? 'Modifica Giocatore' : 'Registra Giocatore'}</span>
              <button onClick={closePlayerModal} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSavePlayer} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Nome e Cognome</label>
                <input
                  type="text"
                  value={playerForm.name || ''}
                  onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })}
                  placeholder="es. Luca Moretti"
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white uppercase font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Squadra di appartenenza</label>
                <select
                  value={playerForm.teamId || ''}
                  onChange={e => setPlayerForm({ ...playerForm, teamId: e.target.value })}
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  required
                >
                  <option value="" disabled>Seleziona squadra...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Girone {t.group})</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload & Camera Integration Section */}
              <div className="space-y-2 border border-white/5 p-4 rounded-lg bg-surface-high/30">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">
                  Foto Giocatore
                </label>
                
                {cameraActive ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border border-primary/30 bg-black">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover transform -scale-x-100" 
                        autoPlay 
                        playsInline 
                      />
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" /> Scatta Foto
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex-1 py-1.5 bg-surface-high border border-white/10 text-white text-[10px] font-bold uppercase rounded cursor-pointer"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* Current Photo Preview */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {playerForm.portraitUrl ? (
                        <img 
                          src={playerForm.portraitUrl} 
                          alt="Anteprima" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-white/20" />
                      )}
                      {playerForm.portraitUrl && (
                        <button
                          type="button"
                          onClick={() => setPlayerForm(prev => ({ ...prev, portraitUrl: undefined }))}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 text-[9px] font-bold uppercase transition-opacity cursor-pointer"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        {/* Camera Trigger */}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-secondary" />
                          <span>Scatta</span>
                        </button>

                        {/* File Upload Trigger */}
                        <label className="flex-1 py-1.5 px-2 bg-surface-high hover:bg-surface-highest text-white border border-white/5 text-[9px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer text-center">
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>Carica</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange} 
                          />
                        </label>
                      </div>
                      <p className="text-[9px] text-on-surface-variant font-mono leading-tight">
                        Usa la webcam o seleziona un'immagine da PC/Smartphone.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Ruolo</label>
                  <select
                    value={playerForm.role || 'Attaccante'}
                    onChange={e => setPlayerForm({ ...playerForm, role: e.target.value as any })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  >
                    <option value="Portiere">Portiere</option>
                    <option value="Difensore">Difensore</option>
                    <option value="Attaccante">Attaccante</option>
                    <option value="Centroboa">Centroboa</option>
                    <option value="Misto">Misto</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Num. Cap</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={playerForm.number || 10}
                    onChange={e => setPlayerForm({ ...playerForm, number: parseInt(e.target.value) || 1 })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Goal segnati</label>
                  <input
                    type="number"
                    min="0"
                    value={playerForm.goals || 0}
                    onChange={e => setPlayerForm({ ...playerForm, goals: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closePlayerModal} className="flex-1 py-2.5 bg-surface-high border border-white/10 text-white text-xs font-bold uppercase rounded">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white text-xs font-black uppercase rounded">Salva Giocatore</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATCH SCORING & DETAILS MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-low border border-white/10 max-w-md w-full rounded-xl overflow-hidden shadow-2xl relative">
            <div className="bg-primary text-white p-4 font-display italic font-extrabold flex justify-between items-center">
              <span>{editingMatch ? 'Modifica Gara / Risultato' : 'Incontra Nuova Gara'}</span>
              <button onClick={() => setShowMatchModal(false)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Fase / Tappa</label>
                  <select
                    value={matchForm.stage || 'Tappa 1'}
                    onChange={e => setMatchForm({ ...matchForm, stage: e.target.value as any })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  >
                    <option value="Tappa 1">Tappa 1</option>
                    <option value="Tappa 2">Tappa 2</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Girone</label>
                  <select
                    value={matchForm.group || 'A'}
                    onChange={e => setMatchForm({ ...matchForm, group: e.target.value as any })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  >
                    <option value="A">Girone A</option>
                    <option value="B">Girone B</option>
                    <option value="Playoff">Playoff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Squadra Casa (Team 1)</label>
                  <select
                    value={matchForm.team1Id || ''}
                    onChange={e => setMatchForm({ ...matchForm, team1Id: e.target.value })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                    required
                  >
                    <option value="" disabled>Seleziona...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Girone {t.group})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Squadra Ospiti (Team 2)</label>
                  <select
                    value={matchForm.team2Id || ''}
                    onChange={e => setMatchForm({ ...matchForm, team2Id: e.target.value })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                    required
                  >
                    <option value="" disabled>Seleziona...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Girone {t.group})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Giorno / Data</label>
                  <input
                    type="text"
                    value={matchForm.date || ''}
                    onChange={e => setMatchForm({ ...matchForm, date: e.target.value })}
                    placeholder="es. Sabato 15 Giugno"
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Orario</label>
                  <input
                    type="text"
                    value={matchForm.time || ''}
                    onChange={e => setMatchForm({ ...matchForm, time: e.target.value })}
                    placeholder="es. 18:30"
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Stato</label>
                  <select
                    value={matchForm.status || 'scheduled'}
                    onChange={e => setMatchForm({ ...matchForm, status: e.target.value as any })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  >
                    <option value="scheduled">Programmata</option>
                    <option value="live">In Corso</option>
                    <option value="completed">Terminata</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Score T1</label>
                  <input
                    type="number"
                    min="0"
                    value={matchForm.team1Score || 0}
                    onChange={e => setMatchForm({ ...matchForm, team1Score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                    disabled={matchForm.status === 'scheduled'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Score T2</label>
                  <input
                    type="number"
                    min="0"
                    value={matchForm.team2Score || 0}
                    onChange={e => setMatchForm({ ...matchForm, team2Score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                    disabled={matchForm.status === 'scheduled'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Sede / Campo</label>
                <select
                  value={matchForm.pitch || ''}
                  onChange={e => setMatchForm({ ...matchForm, pitch: e.target.value })}
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  required
                >
                  <option value="" disabled>Seleziona sede...</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowMatchModal(false)} className="flex-1 py-2.5 bg-surface-high border border-white/10 text-white text-xs font-bold uppercase rounded">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white text-xs font-black uppercase rounded">Salva Partita</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENUE MODAL DIALOG */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-low border border-white/10 max-w-md w-full rounded-xl overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="bg-primary text-white p-4 font-display italic font-extrabold flex justify-between items-center">
              <span>{editingVenue ? 'Modifica Campo/Stadio' : 'Aggiungi Nuovo Campo'}</span>
              <button onClick={() => setShowVenueModal(false)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveVenue} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Nome Arena / Campo</label>
                <input
                  type="text"
                  value={venueForm.name || ''}
                  onChange={e => setVenueForm({ ...venueForm, name: e.target.value })}
                  placeholder="es. Stadio del Nuoto Bari"
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white uppercase font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Località / Indirizzo</label>
                <input
                  type="text"
                  value={venueForm.location || ''}
                  onChange={e => setVenueForm({ ...venueForm, location: e.target.value })}
                  placeholder="es. Via Maratona, Bari"
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Capienza</label>
                  <input
                    type="text"
                    value={venueForm.capacity || ''}
                    onChange={e => setVenueForm({ ...venueForm, capacity: e.target.value })}
                    placeholder="es. 1500 POSTI"
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white uppercase font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">Tags (separati da virgola)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="es. OUTDOOR, OLIMPICA"
                    className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-xs focus:outline-none text-white uppercase font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] text-on-surface-variant uppercase font-bold">URL Immagine</label>
                <input
                  type="text"
                  value={venueForm.imageUrl || ''}
                  onChange={e => setVenueForm({ ...venueForm, imageUrl: e.target.value })}
                  placeholder="Lascia vuoto per default"
                  className="w-full bg-background border-b border-white/10 focus:border-primary px-3 py-2 text-[10px] focus:outline-none text-white font-mono"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowVenueModal(false)} className="flex-1 py-2.5 bg-surface-high border border-white/10 text-white text-xs font-bold uppercase rounded">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white text-xs font-black uppercase rounded">Salva Sede</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
