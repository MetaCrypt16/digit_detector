import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { RotateCcw, Activity, Terminal } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult | null;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!result) return null;

  const isUnknown = result.classification === "unknown";
  const isMultiple = result.classification === "multiple";

  const getConfidenceColor = (conf: string) => {
    const c = conf.toLowerCase();
    if (c === 'high') return 'text-neon-green';
    if (c === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="relative mt-8 group animate-fade-in-up">
      {/* Background Glow */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${isUnknown ? 'from-red-500 to-orange-600' : 'from-neon-pink to-purple-600'} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000`}></div>
      
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-white/10">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-black/40 border-b border-white/5">
          <span className={`font-tech text-[10px] uppercase tracking-widest ${isUnknown ? 'text-red-400' : 'text-neon-pink'}`}>
            {isUnknown ? 'Anomaly Detected' : isMultiple ? 'Multi-Thread Sequence' : 'Decryption Complete'}
          </span>
          <div className="flex items-center space-x-3">
             <button onClick={() => setShowDebug(!showDebug)} className="text-slate-600 hover:text-neon-cyan transition-colors" title="Toggle Debug">
               <Terminal size={12} />
             </button>
             <div className="flex space-x-1">
               <div className={`w-2 h-2 rounded-full ${isUnknown ? 'bg-red-500' : 'bg-neon-pink'} animate-pulse`}></div>
               <div className={`w-2 h-2 rounded-full ${isUnknown ? 'bg-red-500' : 'bg-neon-pink'} opacity-50`}></div>
             </div>
          </div>
        </div>

        <div className="p-8 text-center relative overflow-hidden">
          
          <h3 className="font-mystic text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            {isUnknown ? 'Recognition Failed' : 'Identified Artifact'}
          </h3>
          
          {/* Main Number Display */}
          <div className={`font-tech font-bold relative z-10 transition-all duration-300
             ${isUnknown ? 'text-5xl text-red-500 text-glow-red my-12' : 
               isMultiple ? 'text-7xl md:text-8xl text-white text-glow-pink mb-8 mt-4 tracking-widest' : 
               'text-9xl text-white text-glow-pink mb-6'}
          `}>
            {result.identifiedNumber}
          </div>

          {/* Multiple Digit Breakdown */}
          {isMultiple && result.digits.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {result.digits.map((digit, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded p-2 min-w-[70px] flex flex-col items-center">
                  <div className="text-xl font-tech font-bold text-neon-cyan mb-1">{digit.value}</div>
                  <div className={`text-[9px] uppercase tracking-wider font-bold ${getConfidenceColor(digit.confidence)}`}>
                    {digit.confidence}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Grid (Only if not multiple, to save space, or if unknown) */}
          {!isMultiple && (
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8 font-tech text-xs">
              <div className="bg-white/5 rounded p-2 border border-white/5">
                <div className="text-slate-500 uppercase tracking-wider mb-1">Status</div>
                <div className={isUnknown ? "text-red-400" : "text-neon-cyan font-bold"}>
                  {isUnknown ? 'REJECTED' : 'VERIFIED'}
                </div>
              </div>
              <div className="bg-white/5 rounded p-2 border border-white/5">
                <div className="text-slate-500 uppercase tracking-wider mb-1">Type</div>
                <div className="text-neon-pink font-bold">
                  {isUnknown ? 'NOISE' : 'NUMERIC'}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={onReset}
              className="group/btn relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-transparent border border-white/20 rounded-lg hover:bg-white/5 hover:border-neon-pink/50 hover:shadow-[0_0_20px_rgba(232,121,249,0.4)]"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center space-x-2 font-tech uppercase tracking-widest text-xs">
                <RotateCcw size={14} className="group-hover/btn:-rotate-180 transition-transform duration-500" />
                <span>Re-Engage Protocol</span>
              </span>
            </button>
            
            {showDebug && (
               <div className="mt-4 p-2 bg-black border border-white/10 rounded text-left overflow-auto max-h-32">
                 <p className="text-[10px] font-tech text-slate-500 mb-1">RAW NEURAL OUTPUT:</p>
                 <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap">{result.rawResponse}</pre>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};