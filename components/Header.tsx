import React from 'react';
import { Sparkles, Activity, LogOut } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, username, onLogout }) => {
  return (
    <header className="fixed w-full top-0 z-40 bg-void/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="relative">
            <div className="absolute inset-0 bg-neon-cyan blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <Sparkles size={24} className="text-neon-cyan relative z-10" />
          </div>
          <div>
            <h1 className="font-mystic text-2xl font-bold tracking-wider text-white text-glow-white">
              DIGIT<span className="text-neon-cyan text-glow-cyan">READER</span>
            </h1>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-6">
          
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-xs font-tech text-neon-green tracking-widest border border-neon-green/30 px-3 py-1 rounded bg-neon-green/5">
            <Activity size={12} className="animate-pulse" />
            <span>SYSTEM_ONLINE</span>
          </div>

          {/* User Profile / Logout */}
          {isLoggedIn && (
            <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-tech">Operator</span>
                <span className="text-sm font-bold text-neon-cyan font-tech">{username}</span>
              </div>
              
              <button
                onClick={onLogout}
                className="group relative p-2 overflow-hidden rounded border border-white/10 hover:border-neon-pink/50 transition-colors"
                title="Disconnect"
              >
                <div className="absolute inset-0 bg-neon-pink/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                <LogOut size={18} className="text-slate-400 group-hover:text-neon-pink relative z-10 transition-colors" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};