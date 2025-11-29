import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultCard } from './components/ResultCard';
import { AuthForm } from './components/AuthForm';
import { identifyHandwrittenNumber } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import { AlertTriangle, Cloud, Check } from 'lucide-react';
import LetterGlitch from './components/LetterGlitch';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const handleLoginSuccess = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    handleReset();
  };

  const handleImageSelected = (file: File) => {
    // 1. Immediately show loading state
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    setResult(null);
    setShowSaveNotification(false);

    // 2. Use setTimeout to allow React to render the loading spinner BEFORE
    // starting the heavy image compression/API work.
    setTimeout(async () => {
      try {
        const data = await identifyHandwrittenNumber(file);
        setResult(data);
        setAppState(AppState.SUCCESS);

        // Simulate Cloud Storage
        setTimeout(() => setShowSaveNotification(true), 800);
        
      } catch (err) {
        console.error(err);
        setErrorMsg(err instanceof Error ? err.message : "An unexpected anomaly occurred");
        setAppState(AppState.ERROR);
      }
    }, 100);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
    setShowSaveNotification(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-slate-200">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <LetterGlitch
          glitchSpeed={50}
          glitchColors={['#22d3ee', '#e879f9', '#ffffff']} // Neon Cyan, Pink, and White
          centerVignette={false} // False ensures the middle is clear for content
          outerVignette={true} // True gives that nice dark edge focus
          smooth={true}
        />
      </div>
      
      <Header 
        isLoggedIn={isLoggedIn} 
        username={username}
        onLogout={handleLogout} 
      />

      <main className="flex-grow container mx-auto px-4 py-24 md:py-32 max-w-3xl relative z-10">
        
        {/* Intro Text */}
        <div className="mb-12 text-center space-y-2">
          <h2 className="font-mystic text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Number <span className="text-neon-cyan text-glow-cyan">Identifier</span>
          </h2>
          <p className="font-tech text-sm md:text-base text-neon-cyan/60 tracking-widest uppercase max-w-lg mx-auto">
            {isLoggedIn 
              ? "Unleash your inner data sorcerer"
              : "Authentication Required for Neural Link"}
          </p>
        </div>

        {/* CONDITION: If NOT logged in, show AuthForm. If Logged In, show App */}
        {!isLoggedIn ? (
          <AuthForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="relative">
            {/* Main Interaction Area */}
            {appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR ? (
              <div className="animate-fade-in-up">
                 <ImageUploader 
                   key={appState === AppState.IDLE ? 'idle' : 'busy'} 
                   onImageSelected={handleImageSelected} 
                   isLoading={appState === AppState.ANALYZING} 
                 />
              </div>
            ) : null}

            {/* Error Message */}
            {appState === AppState.ERROR && (
              <div className="mt-6 p-4 bg-red-950/40 border border-red-500/50 rounded-xl flex items-start space-x-3 animate-fade-in backdrop-blur-md">
                <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-tech font-bold text-red-400 uppercase tracking-wide">Decryption Failed</h4>
                  <p className="font-tech text-xs text-red-300 mt-1">{errorMsg}</p>
                  <button 
                    onClick={handleReset}
                    className="mt-3 text-xs font-bold font-tech text-white hover:text-red-400 underline uppercase tracking-widest"
                  >
                    Retry Protocol
                  </button>
                </div>
              </div>
            )}

            {/* Success Result */}
            {appState === AppState.SUCCESS && (
              <div className="relative">
                 <ResultCard result={result} onReset={handleReset} />
                 
                 {/* Cloud Storage Notification */}
                 {showSaveNotification && (
                   <div className="absolute -top-12 left-0 right-0 mx-auto w-max animate-fade-in-down">
                     <div className="bg-neon-green/10 text-neon-green border border-neon-green/30 px-4 py-2 rounded text-[10px] font-tech font-bold flex items-center shadow-[0_0_15px_rgba(74,222,128,0.2)] tracking-widest uppercase backdrop-blur-md">
                       <Cloud size={12} className="mr-2" />
                       Synced to the Void
                       <Check size={12} className="ml-1" />
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="py-6 text-center text-slate-600 text-[10px] font-tech tracking-[0.2em] relative z-10">
        <p>POWERED BY GEMINI MODEL 2.5 FLASH</p>
      </footer>
    </div>
  );
};

export default App;
