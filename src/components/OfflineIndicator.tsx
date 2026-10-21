import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-lg border border-amber-400">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Офлайн-режим — данные сохраняются локально</span>
    </div>
  );
};
