import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Safe path resolution for ES modules (dev) and CommonJS (prod)
let resolvedFilename = '';
let resolvedDirname = '';

try {
  // @ts-ignore
  if (typeof __filename !== 'undefined' && __filename) {
    // @ts-ignore
    resolvedFilename = __filename;
  } else {
    resolvedFilename = fileURLToPath(import.meta.url);
  }
} catch (e) {
  // Safe fallback
}

try {
  // @ts-ignore
  if (typeof __dirname !== 'undefined' && __dirname) {
    // @ts-ignore
    resolvedDirname = __dirname;
  } else {
    resolvedDirname = path.dirname(resolvedFilename);
  }
} catch (e) {
  // Safe fallback
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initial default configuration
const DEFAULT_CONFIG = {
  title: "Sport Project Bari",
  subtitle: "Waterpolo Summer Cup",
  primaryColor: "#ef4444", // Red theme as requested by "Red Block Header" / custom layouts
  secondaryColor: "#f59e0b", // Amber/Gold
  logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKFuWF_QkpRPDAklc-pyDeRyCUaeNi0O00Gp5FLb12JmduTRvIiWrSZQ3hxXtH4DjBth8xzc-8vliqfR88a8uelw-x2iSVKI4dFfKNg2ztyPNsGP_dSLdRhapPUmw3xXm80Pps9Y0dEUDcFLD2JgcGdR2uwcUYNmd5VuSlkZzO2TFqPGEaI3vRKaBTI4amtkSGkBoczJkB-8Untq82cJyDhF60k1EA61KNQLbBWITSA-U7lM2a8jIUxAExFeX4rRme-SnScQHrTLM",
  bgImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARlFFel2gkPzHSH9gz2hC3p3pLp9NQiyVk4LNDiW4ibzL8unl5XxYzTdjBywDvpAKxjDNLJ4gGYUMSENImeVrN9ogJGIuPQco29J7ycos9VgnG9YAwnP_6avcY5Me1XheyPbFyat3w4wpvADHWKw8yoo-NIgs06NJyLCucyOLJ0DMfMibGPUyG16GrNeJ7AsmKh9cfVXeKYOqhVZPmg_bEU0BZmzJ-49L-_YUfoeb0beE_gogXYLw3EbXoYiLl-HLqtNDfaSeRSSs",
  adminPin: "SPB2026"
};

// Seed values from data.ts
const INITIAL_PLAYERS = [
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

// In-memory fallback database state (no local file reads/writes)
let inMemoryDb: any = {
  teams: [],
  matches: [],
  scorers: [],
  venues: [],
  activityLogs: [],
  players: INITIAL_PLAYERS,
  config: DEFAULT_CONFIG
};

// Initialize Supabase client if secrets are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase: any = null;
let supabaseError: string | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase Client initialized successfully with URL:", supabaseUrl);
  } catch (err: any) {
    supabaseError = err?.message || String(err);
    console.error("Failed to initialize Supabase Client:", err);
  }
} else {
  console.log("Supabase environment variables (SUPABASE_URL / SUPABASE_KEY) are not set. Running in pure in-memory mode.");
}

// Dynamically retrieves Supabase client based on request headers (for browser-level override) or global client
function getSupabaseClient(req?: any) {
  const customUrl = req?.headers?.['x-supabase-url'] || req?.headers?.['X-Supabase-Url'];
  const customKey = req?.headers?.['x-supabase-key'] || req?.headers?.['X-Supabase-Key'];

  if (customUrl && customKey) {
    try {
      return createClient(customUrl as string, customKey as string);
    } catch (err: any) {
      console.error("Failed to initialize custom request-based Supabase Client:", err);
    }
  }
  return supabase;
}

// Asynchronous reader: Queries Supabase if configured, otherwise falls back to memory
async function getDatabase(req?: any) {
  const client = getSupabaseClient(req);
  if (client) {
    try {
      const { data, error } = await client
        .from('sport_project_bari_db')
        .select('data')
        .eq('id', 'primary')
        .maybeSingle();
      
      if (error) {
        console.warn("Could not fetch from Supabase table 'sport_project_bari_db' (it might not be created yet):", error.message);
        return inMemoryDb;
      }
      
      if (data && data.data && Object.keys(data.data).length > 0) {
        // Cache it in memory for safety but always trust Supabase
        inMemoryDb = data.data;
        return data.data;
      } else {
        // Table exists but record 'primary' doesn't exist, let's seed it with inMemoryDb
        console.log("Supabase record empty, seeding with default in-memory state...");
        await saveDatabase(inMemoryDb, req);
        return inMemoryDb;
      }
    } catch (err: any) {
      console.error("Error reading from Supabase, falling back to memory:", err);
      return inMemoryDb;
    }
  }
  return inMemoryDb;
}

// Asynchronous writer: Saves to memory and Supabase if configured
async function saveDatabase(dbData: any, req?: any) {
  // Update in-memory state
  inMemoryDb = dbData;
  
  const client = getSupabaseClient(req);
  if (client) {
    try {
      const { error } = await client
        .from('sport_project_bari_db')
        .upsert({ id: 'primary', data: dbData, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error("Error writing to Supabase:", error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error("Error writing to Supabase (exception):", err);
      return false;
    }
  }
  return true;
}

// REST API Routes

// Supabase Connection Status
app.get('/api/supabase/status', async (req, res) => {
  try {
    const customUrl = req.headers['x-supabase-url'] as string || req.headers['X-Supabase-Url'] as string;
    const customKey = req.headers['x-supabase-key'] as string || req.headers['X-Supabase-Key'] as string;

    const hasEnvConfig = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY));
    const isConfigured = hasEnvConfig || !!(customUrl && customKey);
    
    let isConnected = false;
    let connectionError: string | null = null;
    let activeUrl = customUrl || supabaseUrl || null;
    
    const client = getSupabaseClient(req);
    
    if (client) {
      try {
        const { error } = await client
          .from('sport_project_bari_db')
          .select('id')
          .eq('id', 'primary')
          .maybeSingle();
        
        if (error) {
          connectionError = error.message;
          // If it fails with "relation does not exist", the DB connection is working but table is missing
          if (error.code === 'PGRST116' || error.message.includes('relation "sport_project_bari_db" does not exist')) {
            isConnected = true;
            connectionError = "table_missing";
          }
        } else {
          isConnected = true;
        }
      } catch (err: any) {
        connectionError = err?.message || String(err);
      }
    } else if (isConfigured) {
      connectionError = "Impossibile inizializzare il client Supabase. Controlla le credenziali.";
    }
    
    res.json({
      configured: isConfigured,
      connected: isConnected,
      supabaseUrl: activeUrl ? `${activeUrl.substring(0, 18)}...` : null,
      error: connectionError,
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
  } catch (routeErr: any) {
    console.error("Error in /api/supabase/status route:", routeErr);
    res.json({
      configured: false,
      connected: false,
      supabaseUrl: null,
      error: routeErr?.message || String(routeErr),
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
  }
});

// Get complete database state
app.get('/api/db', async (req, res) => {
  const db = await getDatabase(req);
  res.json(db);
});

// Update database components or whole state
app.post('/api/db', async (req, res) => {
  const newDb = req.body;
  const currentDb = await getDatabase(req);
  
  // Merge safely
  const updatedDb = {
    ...currentDb,
    ...newDb,
    config: { ...currentDb.config, ...newDb.config }
  };
  
  if (await saveDatabase(updatedDb, req)) {
    res.json({ success: true, db: updatedDb });
  } else {
    res.status(500).json({ error: "Failed to write database" });
  }
});

// Update specific fields
app.post('/api/teams', async (req, res) => {
  const db = await getDatabase(req);
  db.teams = req.body;
  await saveDatabase(db, req);
  res.json({ success: true, teams: db.teams });
});

app.post('/api/matches', async (req, res) => {
  const db = await getDatabase(req);
  db.matches = req.body;
  await saveDatabase(db, req);
  res.json({ success: true, matches: db.matches });
});

app.post('/api/players', async (req, res) => {
  const db = await getDatabase(req);
  db.players = req.body;
  await saveDatabase(db, req);
  res.json({ success: true, players: db.players });
});

app.post('/api/scorers', async (req, res) => {
  const db = await getDatabase(req);
  db.scorers = req.body;
  await saveDatabase(db, req);
  res.json({ success: true, scorers: db.scorers });
});

app.post('/api/venues', async (req, res) => {
  const db = await getDatabase(req);
  db.venues = req.body;
  await saveDatabase(db, req);
  res.json({ success: true, venues: db.venues });
});

app.post('/api/activity-logs', async (req, res) => {
  const db = await getDatabase(req);
  db.activityLogs = req.body;
  await saveDatabase(db, req);
  res.json({ success: true, activityLogs: db.activityLogs });
});

app.post('/api/config', async (req, res) => {
  const db = await getDatabase(req);
  db.config = { ...db.config, ...req.body };
  await saveDatabase(db, req);
  res.json({ success: true, config: db.config });
});

// Admin pin validation
app.post('/api/admin/auth', async (req, res) => {
  const { pin } = req.body;
  const db = await getDatabase(req);
  if (pin === db.config.adminPin) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false, error: "PIN errato!" });
  }
});

// Vite Middleware & Static Fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
