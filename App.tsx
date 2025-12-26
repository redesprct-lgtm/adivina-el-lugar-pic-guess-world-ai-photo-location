
import React, { useState, useCallback, useEffect } from 'react';
import { Background } from './components/Background';
import { Camera, Upload, RefreshCw, Share2, MapPin, Loader2, Sparkles, XCircle, Map as MapIcon } from 'lucide-react';
import { analyzeImage } from './services/geminiService';
import { GeoResult, AppState } from './types';

const ANALYSIS_PHRASES = [
  "Analizando arquitectura... 🏛️",
  "Buscando señales visuales... 🔍",
  "Comparando con el mundo 🌍...",
  "Revisando vegetación... 🌿",
  "Leyendo carteles lejanos... 🪧",
  "Calculando sombras... ☀️",
  "¡Casi lo tenemos! 🚀"
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<GeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  // Rotate loading phrases
  useEffect(() => {
    let interval: number;
    if (state === 'ANALYZING') {
      interval = window.setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % ANALYSIS_PHRASES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        processImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setState('ANALYZING');
    setError(null);
    try {
      const data = await analyzeImage(base64);
      setResult(data);
      setState('RESULT');
    } catch (err: any) {
      setError(err.message || "Algo salió mal. ¡Reintenta!");
      setState('ERROR');
    }
  };

  const reset = () => {
    setState('IDLE');
    setImage(null);
    setResult(null);
    setError(null);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert("¡Copiado al portapapeles! 📋 Comparte con tus amigos.");
      }).catch(err => {
        console.error('No se pudo copiar:', err);
        alert("No se pudo copiar automáticamente. ¡Copia el texto manualmente!");
      });
    } else {
      alert("Tu navegador no soporta copiado automático.");
    }
  };

  const openInMaps = () => {
    if (result) {
      const query = encodeURIComponent(`${result.city}, ${result.country}`);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank');
    }
  };

  const shareResult = () => {
    if (!result) return;

    const shareText = `¡GeoGuesser AI lo adivinó! 🌍 Subí una foto y la IA dice que es ${result.city}, ${result.country}. ✨`;
    
    let shareUrl: string | undefined = undefined;
    try {
      const url = new URL(window.location.href);
      if (url.protocol.startsWith('http')) {
        shareUrl = url.href;
      }
    } catch (e) {
      console.warn("Invalid URL for sharing", e);
    }

    if (navigator.share) {
      navigator.share({
        title: 'GeoGuesser AI',
        text: shareText,
        url: shareUrl,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
          copyToClipboard(shareText + (shareUrl ? ` ${shareUrl}` : ''));
        }
      });
    } else {
      copyToClipboard(shareText + (shareUrl ? ` ${shareUrl}` : ''));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
      <Background />

      {/* Header */}
      <div className={`transition-all duration-700 text-center mb-8 ${state !== 'IDLE' ? 'scale-90 opacity-60' : 'scale-100 opacity-100'}`}>
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 neon-glow">
          GeoGuesser <span className="text-white">AI</span>
        </h1>
        <p className="text-lg sm:text-xl text-cyan-200 max-w-lg mx-auto leading-relaxed">
          sube una foto de una ciudad y la IA adivinará cual es. ¡Atreve a la IA!
        </p>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-xl relative">
        {state === 'IDLE' && (
          <div className="glass rounded-[2rem] p-8 sm:p-12 text-center border-dashed border-2 border-cyan-400/30 hover:border-cyan-400/60 transition-all cursor-pointer group relative overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-4 py-8 pointer-events-none group-hover:scale-110 transition-transform">
              <div className="bg-cyan-500/20 p-6 rounded-full">
                <Upload className="w-12 h-12 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold">Subir Foto</h2>
              <p className="text-slate-400">Arrastra una imagen o haz clic aquí</p>
            </div>
          </div>
        )}

        {state === 'ANALYZING' && (
          <div className="glass rounded-[2rem] p-12 flex flex-col items-center justify-center text-center animate-pulse min-h-[400px]">
            <div className="relative mb-8">
              <Loader2 className="w-20 h-20 text-cyan-400 animate-spin" />
              <div className="absolute inset-0 blur-xl bg-cyan-400/20 rounded-full animate-ping"></div>
            </div>
            <p className="text-2xl font-medium text-cyan-100 min-h-[3rem]">
              {ANALYSIS_PHRASES[loadingPhraseIndex]}
            </p>
            {image && (
              <img 
                src={image} 
                alt="Analizando..." 
                className="mt-8 w-48 h-48 object-cover rounded-2xl opacity-50 grayscale blur-[2px]"
              />
            )}
          </div>
        )}

        {state === 'RESULT' && result && (
          <div className="glass rounded-[2rem] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
            {image && (
              <div className="h-64 w-full relative">
                <img src={image} alt="Tu foto" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <button 
                  onClick={openInMaps}
                  className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-black/70 hover:border-white/40 active:scale-95 transition-all z-20 group"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold">{result.city}, {result.country}</span>
                </button>
              </div>
            )}
            
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Confianza: {result.confidence}%
                </div>
              </div>
              
              <h3 className="text-4xl font-extrabold text-white mb-2">
                {result.city}
              </h3>
              <p className="text-xl text-cyan-300 font-medium mb-6">
                {result.country}
              </p>
              
              <p className="text-slate-300 italic mb-8 bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                "{result.reasoning}"
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={reset}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-2xl font-bold transition-all active:scale-95"
                  >
                    <RefreshCw className="w-5 h-5" /> Probar otra
                  </button>
                  <button 
                    onClick={shareResult}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                  >
                    <Share2 className="w-5 h-5" /> Compartir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'ERROR' && (
          <div className="glass rounded-[2rem] p-12 text-center animate-in slide-in-from-bottom-4 duration-300">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">¡Ups! Algo falló</h3>
            <p className="text-slate-300 mb-8">{error}</p>
            <button 
              onClick={reset}
              className="bg-white/10 hover:bg-white/20 py-3 px-8 rounded-full font-bold transition-all"
            >
              Volver a intentar
            </button>
          </div>
        )}
      </main>

      {/* Footer / Disclaimer */}
      <footer className="mt-auto pt-12 pb-6 text-center text-slate-500 text-xs sm:text-sm px-4">
        <p className="mb-2">
          Esto es solo una estimación basada en la imagen. No usamos GPS ni datos reales 😅
        </p>
        <p>© 2024 GeoGuesser AI - Viral Labs 🚀</p>
      </footer>
    </div>
  );
};

export default App;
