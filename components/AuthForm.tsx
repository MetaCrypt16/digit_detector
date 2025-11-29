import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AuthFormProps {
  onLoginSuccess: (username: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleModeToggle = () => {
    setIsSignup(!isSignup);
    setError(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('digitreader_users') || '{}');

        if (isSignup) {
          if (users[email]) {
            throw new Error("Identity already registered in the archives.");
          }
          
          users[email] = { name, password };
          localStorage.setItem('digitreader_users', JSON.stringify(users));
          
          setIsSignup(false);
          setPassword('');
          setSuccessMessage("Identity encoded. Proceed to authentication.");
          setIsLoading(false);

        } else {
          const user = users[email];
          
          if (!user) {
            throw new Error("Identity not found in the void.");
          }
          
          if (user.password !== password) {
            throw new Error("Access Code Invalid.");
          }

          onLoginSuccess(user.name);
        }
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : "Access Denied");
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto relative group">
      {/* Glow Effect behind form */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="font-mystic text-3xl font-bold text-white mb-2 tracking-wide">
            {isSignup ? 'Initialize Soul' : 'Access Gate'}
          </h2>
          <p className="font-tech text-xs text-neon-cyan/70 tracking-widest uppercase">
            {isSignup 
              ? 'Encode your signature into the matrix' 
              : 'Decipher the ancients'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/50 border border-red-500/30 rounded flex items-start space-x-2 text-xs text-red-400 font-tech">
            <AlertTriangle size={14} className="mt-0.5" />
            <span>ERROR: {error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 bg-emerald-950/50 border border-emerald-500/30 rounded flex items-start space-x-2 text-xs text-emerald-400 font-tech">
            <ShieldCheck size={14} className="mt-0.5" />
            <span>SUCCESS: {successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div className="space-y-1 group/input">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-tech group-focus-within/input:text-neon-cyan transition-colors">Designation</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-neon-cyan transition-colors" size={16} />
                <input 
                  type="text" 
                  required={isSignup}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white font-tech focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
                  placeholder="USER_01"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 group/input">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-tech group-focus-within/input:text-neon-cyan transition-colors">Neural Link (Email)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-neon-cyan transition-colors" size={16} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white font-tech focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
                placeholder="link@net.com"
              />
            </div>
          </div>

          <div className="space-y-1 group/input">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-tech group-focus-within/input:text-neon-cyan transition-colors">Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-neon-cyan transition-colors" size={16} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white font-tech focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 py-3 rounded-lg font-bold font-tech tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 mt-8 group-hover:box-glow-cyan"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isSignup ? 'Init_Protocol' : 'Connect'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={handleModeToggle}
            className="text-xs font-tech text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            {isSignup ? ":: Return to Login ::" : ":: Initialize New User ::"}
          </button>
        </div>
      </div>
    </div>
  );
};