import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Upload, ScanLine, Clock, AlertTriangle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    setValidationError(null);
    setPreview(null);

    // 1. Check for Empty/Corrupted File
    if (file.size === 0) {
      setValidationError("ARTIFACT CORRUPTED (0 BYTES).");
      return;
    }

    // 2. Check File Type (Strict MIME check)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("INVALID FORMAT. JPEG OR PNG REQUIRED.");
      return;
    }

    // 3. Check File Size (Max 5MB)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setValidationError(`ARTIFACT TOO MASSIVE (${sizeMB}MB). MAX 5MB.`);
      return;
    }
    
    // Preview Generation
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.onerror = () => {
      setValidationError("READ ERROR. UNABLE TO PARSE IMAGE DATA.");
    };
    reader.readAsDataURL(file);
    
    // Pass to parent
    onImageSelected(file);
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  // Loading Overlay Component
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl border border-neon-cyan/20">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-neon-cyan blur-xl opacity-20 animate-pulse"></div>
        <ScanLine className="h-12 w-12 text-neon-cyan animate-bounce relative z-10" />
      </div>
      
      <h3 className="text-neon-cyan font-tech font-bold tracking-[0.2em] text-sm animate-pulse mb-2">
        DECRYPTING RUNES...
      </h3>

      {/* Progress Bar Visual */}
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-neon-cyan animate-[shimmer_1s_infinite] w-full origin-left scale-x-50"></div>
      </div>
      
      <div className="flex items-center space-x-2 text-slate-500 font-tech text-xs">
        <Clock size={12} />
        <span>{elapsedTime.toFixed(1)}s elapsed</span>
      </div>
    </div>
  );

  return (
    <div className="w-full perspective-1000 space-y-4 relative">
      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-red-950/50 border border-red-500/50 p-3 rounded-lg flex items-center space-x-3 animate-fade-in text-red-200 font-tech text-xs mb-4">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <span className="uppercase tracking-wide font-bold">{validationError}</span>
        </div>
      )}

      {/* GLOBAL LOADING OVERLAY: Renders on top of everything if isLoading is true */}
      {isLoading && <LoadingOverlay />}

      {preview ? (
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-neon-cyan/30 bg-black box-glow-cyan animate-pulse-glow">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-64 object-contain opacity-80" 
          />
          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-xl p-12
            transition-all duration-500 ease-in-out
            flex flex-col items-center justify-center text-center
            bg-black/40 backdrop-blur-sm
            ${isDragging 
              ? 'border-neon-cyan bg-neon-cyan/10 scale-[1.02] shadow-[0_0_30px_rgba(34,211,238,0.2)]' 
              : 'border-white/20 hover:border-neon-cyan/60 hover:bg-white/5'
            }
          `}
        >
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            onChange={handleFileInput}
            disabled={isLoading}
          />
          
          <div className="mb-6 relative group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-neon-cyan blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
            <div className="border border-neon-cyan/50 p-4 rounded-full relative bg-black/50">
              <Upload className="w-8 h-8 text-neon-cyan" />
            </div>
          </div>
          
          <h3 className="font-mystic text-xl font-bold text-white mb-2 text-glow-white tracking-wide">
            Open the Spirit Gate
          </h3>
          <p className="font-tech text-xs text-slate-400 max-w-xs leading-relaxed uppercase tracking-wide">
            Imbue your artifact here <br/>
            <span className="text-neon-cyan/50">(JPEG, PNG • MAX 5MB)</span>
          </p>

          <button className="mt-6 px-6 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-tech text-xs font-bold uppercase rounded tracking-widest group-hover:bg-neon-cyan group-hover:text-black transition-all">
            Initiate Ritual
          </button>
        </div>
      )}
    </div>
  );
};
