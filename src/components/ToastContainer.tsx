import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Trophy, Flame } from 'lucide-react';

export interface ToastNotification {
  id: string;
  matchId: string;
  team1Name: string;
  team2Name: string;
  team1Logo: string;
  team2Logo: string;
  oldScore: string;
  newScore: string;
  status: 'live' | 'completed' | 'scheduled';
  period?: string;
  type: 'score_update' | 'status_change';
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none md:right-8">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastNotification; onDismiss: () => void; key?: string }) {
  // Auto-dismiss after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isScoreUpdate = toast.type === 'score_update';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="w-full bg-surface-low border border-primary/20 hover:border-primary/40 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col glossy-card"
    >
      {/* Visual highlight top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${isScoreUpdate ? 'from-primary to-secondary' : 'from-secondary to-blue-500'}`} />

      <div className="p-4 relative">
        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-white/40 hover:text-white hover:bg-white/5 p-1 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2.5">
          {isScoreUpdate ? (
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-mono font-black text-primary tracking-widest uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-primary" /> AGGIORNAMENTO GOAL!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-secondary tracking-widest uppercase flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-secondary animate-bounce" /> STATO PARTITA MODIFICATO
              </span>
            </div>
          )}
          {toast.period && (
            <span className="px-2 py-0.5 bg-surface-highest text-white/70 text-[9px] font-mono font-bold rounded">
              {toast.period}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex items-center justify-between gap-3 py-1">
          {/* Team 1 */}
          <div className="flex flex-col items-center flex-1 text-center min-w-0">
            {toast.team1Logo && (
              <img
                src={toast.team1Logo}
                alt={toast.team1Name}
                className="w-10 h-10 object-contain bg-white/5 p-1 rounded-lg border border-white/10 mb-1"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-xs font-display font-bold text-white uppercase italic truncate w-full">
              {toast.team1Name}
            </span>
          </div>

          {/* Central score update */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[9px] font-mono text-white/50 uppercase font-black tracking-widest">
              {isScoreUpdate ? 'Punteggio' : 'Stato'}
            </span>
            <div className="flex items-center gap-2 my-1">
              {isScoreUpdate && (
                <>
                  <span className="text-xs font-mono text-white/30 line-through">
                    {toast.oldScore}
                  </span>
                  <span className="text-sm text-white/40">→</span>
                </>
              )}
              <span className="font-display font-black text-2xl text-secondary italic tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse">
                {toast.newScore}
              </span>
            </div>
            {toast.status === 'completed' && (
              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-mono uppercase font-extrabold border border-green-500/20 rounded">
                Finale
              </span>
            )}
            {toast.status === 'live' && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-mono uppercase font-extrabold border border-primary/20 rounded">
                In Corso
              </span>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center flex-1 text-center min-w-0">
            {toast.team2Logo && (
              <img
                src={toast.team2Logo}
                alt={toast.team2Name}
                className="w-10 h-10 object-contain bg-white/5 p-1 rounded-lg border border-white/10 mb-1"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-xs font-display font-bold text-white uppercase italic truncate w-full">
              {toast.team2Name}
            </span>
          </div>
        </div>
      </div>

      {/* Remaining duration animated progress bar */}
      <div className="w-full h-1 bg-surface-highest/50">
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 7, ease: 'linear' }}
          className="h-full bg-secondary origin-left"
        />
      </div>
    </motion.div>
  );
}
