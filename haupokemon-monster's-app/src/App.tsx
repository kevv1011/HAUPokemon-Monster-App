import React, { useState, useEffect } from 'react';
import {
  Radar,
  BookOpen,
  LayoutGrid,
  Trophy,
  Shield,
  Menu,
  Bell,
  MapPin,
  Compass,
  CloudRain,
  Signal,
  Camera,
  Image as ImageIcon,
  ChevronDown,
  ArrowRight,
  Lock,
  User,
  LogOut,
  Plus,
  Target,
  Edit3,
  Trash2,
  Map as MapIcon,
  CheckCircle2,
  Power,
  Server,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Geolocation } from '@capacitor/geolocation';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from './lib/utils';
import { authApi, monsterApi, serverApi } from './services/api';

// --- Types ---
type Tab = 'HUNT' | 'LOG' | 'CENTER' | 'RANKS' | 'GEAR' | 'MAP' | 'POKEDEX' | 'PROFILE' | 'COMING_SOON';

interface Hunter {
  id: string;
  name: string;
  monsters: number;
  rank: number;
  avatar?: string;
}

// --- Leaflet Helpers ---
const createMonsterIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-3 h-3 bg-red-500 rounded-full animate-ping shadow"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const createRadarIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative"><div class="absolute inset-0 bg-journal-green rounded-full animate-ping opacity-30"></div><div class="w-6 h-6 bg-white border border-journal-border rounded-full shadow-lg flex flex-shrink-0 items-center justify-center relative"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><path d="M15 15h.01"/><path d="M11.2 12a2 2 0 1 0 2.59 2.59"/></svg></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const RecenterMap = ({ coords, zoom }: { coords: { lat: number, lng: number }, zoom?: number }) => {
  const map = useMap();
  useEffect(() => { map.setView([coords.lat, coords.lng], zoom || map.getZoom()); }, [coords, map, zoom]);
  return null;
};

const LocationTracker = ({ setCoords }: { setCoords: (c: {lat: number, lng: number}) => void }) => {
  const map = useMap();
  useEffect(() => {
    map.on('move', () => {
      const c = map.getCenter();
      setCoords({ lat: c.lat, lng: c.lng });
    });
  }, [map, setCoords]);
  return null;
};

// --- Helper ---
export const getHunterClass = (monsters: number) => {
  if (monsters < 5) return 'Novice Tracker';
  if (monsters < 10) return 'Bronze Hunter';
  if (monsters < 20) return 'Silver Operative';
  if (monsters < 30) return 'Gold Ranger';
  if (monsters < 40) return 'Platinum Ranger';
  if (monsters < 50) return 'Diamond Elite';
  return 'Elite Master Class';
};

export const fixUrl = (url?: string) => {
  if (!url) return undefined;
  let fixedUrl = url;
  if (!fixedUrl.startsWith('http')) {
    fixedUrl = fixedUrl.startsWith('/') ? `http://100.109.14.85${fixedUrl}` : `http://100.109.14.85/${fixedUrl}`;
  }
  return fixedUrl.replace(/(https?:\/\/)(.*)/, (_, proto, path) => proto + path.replace(/\/\/+/g, '/'));
};

// --- Components ---


const ComingSoonScreen = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] bg-white">
    <p className="text-journal-muted text-sm tracking-widest uppercase">next update</p>
  </div>
);

const Navbar = ({ title, onMenuClick }: { title: string; onMenuClick: () => void }) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-journal-bg/80 backdrop-blur-md border-b border-journal-border z-50 px-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <button onClick={onMenuClick} className="p-2 hover:bg-journal-green-light rounded-lg transition-colors">
        <Menu className="w-6 h-6 text-journal-green" />
      </button>
      <h1 className="font-semibold text-lg tracking-tight">{title}</h1>
    </div>
    <div className="w-10 h-10 rounded-full bg-journal-green-light flex items-center justify-center overflow-hidden border border-journal-green/20">
      <User className="w-6 h-6 text-journal-green" />
    </div>
  </header>
);

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) => {
  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'HUNT', icon: Compass, label: 'HUNT' },
    { id: 'LOG', icon: BookOpen, label: 'LOG' },
    { id: 'CENTER', icon: LayoutGrid, label: 'CENTER' },
    { id: 'RANKS', icon: Trophy, label: 'RANKS' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-journal-border z-50 flex items-center justify-around px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-300",
            activeTab === tab.id ? "text-journal-green scale-110" : "text-journal-muted"
          )}
        >
          <tab.icon className={cn("w-6 h-6", activeTab === tab.id && "fill-journal-green/10")} />
          <span className="text-[10px] font-bold tracking-widest">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div layoutId="activeTab" className="w-1 h-1 rounded-full bg-journal-green" />
          )}
        </button>
      ))}
    </nav>
  );
};

// --- Screens ---

const LoginScreen = ({ onLogin }: { onLogin: (id: string) => void }) => {
  const [hunterId, setHunterId] = useState(() => localStorage.getItem('rememberedHunter') || '');
  const [accessKey, setAccessKey] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberedHunter'));
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (isRegistering) {
        await authApi.register(hunterId, accessKey);
        alert("Registration Successful via Paris Server!");
      } else {
        await authApi.login(hunterId, accessKey);
      }

      if (rememberMe) {
        localStorage.setItem('rememberedHunter', hunterId);
      } else {
        localStorage.removeItem('rememberedHunter');
      }

      onLogin(hunterId);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Database connection failed. Are the AWS Servers Online?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-journal-bg flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-journal-green tracking-tight">HAUPokemon Pokedex</h1>
          <p className="text-journal-muted text-sm">Enter your credentials to access the archives.</p>
        </div>

        <form onSubmit={handleAuthorize} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-journal-muted ml-1">Hunter ID</label>
            <div className="relative">
              <input
                type="text"
                value={hunterId}
                onChange={(e) => setHunterId(e.target.value)}
                className="input-field pr-10"
                placeholder="HQ-0000-X"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-journal-muted/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-journal-muted ml-1">Access Key</label>
            <div className="relative">
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-journal-muted/50" />
            </div>
          </div>

          <div className="flex items-center justify-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-journal-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-journal-border text-journal-green focus:ring-journal-green"
              />
              Remember Me
            </label>
          </div>

          {errorMsg && <p className="text-red-500 text-xs font-bold text-center mt-2">{errorMsg}</p>}

          <div className="space-y-3 mt-4">
            <button disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Syncing Pokedex..." : isRegistering ? "Register New Trainer" : "Access Pokedex"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => onLogin("ADMIN-OVERRIDE")}
              className="w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-widest text-journal-green border border-journal-green/30 hover:bg-journal-green/10 transition-colors"
            >
              Force Offline Entry (Admin)
            </button>
          </div>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-journal-muted">
            {isRegistering ? "Already have an account?" : "New naturalist?"}
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}
              className="text-journal-green font-bold ml-1 hover:underline cursor-pointer"
            >
              {isRegistering ? "Return to Login" : "Register for the Field"}
            </button>
          </p>

          <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-journal-muted/60">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Node</span>
            <span className="flex items-center gap-1"><Signal className="w-3 h-3" /> Global Sync</span>
          </div>

          <p className="text-[10px] text-journal-muted/40 uppercase tracking-tighter">
            © 2024 HAUPOKEMON POKEDEX • PROTOCOL 4.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const f1 = lat1 * Math.PI / 180;
  const f2 = lat2 * Math.PI / 180;
  const df = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const HuntScreen = ({ onNavigate, monsters, hunterId, refreshMonsters, onCaptureNavigate }: { onNavigate: (tab: Tab) => void, monsters: any[], hunterId: string, refreshMonsters: () => void, onCaptureNavigate: (m: any) => void }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedMonster, setDetectedMonster] = useState<any | null>(null);
  const [coords, setCoords] = useState<{ lat: number, lng: number }>({ lat: 14.5562, lng: 121.0298 });
  const [isCatching, setIsCatching] = useState(false);
  const [elevation, setElevation] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  useEffect(() => {
    let watchId: string | null = null;
    const initTracking = async () => {
      try {
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') perm = await Geolocation.requestPermissions();
        if (perm.location === 'granted') {
          watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
            if (pos) {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setElevation(pos.coords.altitude ? pos.coords.altitude * 3.28084 : 0);
              setAccuracy(pos.coords.accuracy);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    initTracking();
    return () => { if (watchId) Geolocation.clearWatch({ id: watchId }); };
  }, []);

  const getSignalStrength = () => {
    if (accuracy < 20) return { text: 'Strong Satellite Link', bars: [0.4, 0.6, 0.8, 1.0] };
    if (accuracy < 50) return { text: 'Stable Connection', bars: [0.4, 0.6, 0.8, 0.2] };
    if (accuracy < 150) return { text: 'Weak Signal', bars: [0.4, 0.6, 0.2, 0.2] };
    return { text: 'Poor GPS Lock', bars: [0.4, 0.2, 0.2, 0.2] };
  };
  const signal = getSignalStrength();

  return (
    <div className="space-y-8 pb-24">
      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-journal-muted">Current Coordinates</p>
        <h2 className="text-4xl font-journal-mono font-bold text-journal-green leading-tight">
          {coords.lat.toFixed(4)}° N<br />{Math.abs(coords.lng).toFixed(4)}° {coords.lng < 0 ? 'W' : 'E'}
        </h2>
      </div>

      <div className="relative h-48 rounded-3xl overflow-hidden border border-journal-border shadow-inner bg-journal-green/10 mb-4 z-0">
        <MapContainer center={[coords.lat, coords.lng]} zoom={15} className="w-full h-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="grayscale opacity-60" />
          <RecenterMap coords={coords} zoom={15} />
          <Marker position={[coords.lat, coords.lng]} icon={createRadarIcon()} />
          
          {monsters.map(m => {
             const mLat = parseFloat(m.spawn_latitude);
             const mLng = parseFloat(m.spawn_longitude);
             const dist = getDistance(coords.lat, coords.lng, mLat, mLng);
             if (dist > 1500) return null; // Only render nearby on minimap
             return <Marker key={m.monster_id} position={[mLat, mLng]} icon={createMonsterIcon()} />;
          })}
        </MapContainer>

        <button onClick={refreshMonsters} className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-full border border-journal-border shadow-md z-[1000] hover:scale-105 active:scale-95 transition-all text-journal-green flex items-center gap-1 px-3">
          <Radar className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase tracking-widest">Refresh</span>
        </button>
      </div>

      <div className="flex justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-journal-green/5 rounded-3xl animate-pulse" />
          <div className="absolute inset-4 bg-journal-green/10 rounded-3xl" />
          <button
            disabled={isDetecting}
            onClick={() => {
              setIsDetecting(true);
              setDetectedMonster(null);
              setTimeout(() => {
                let found = null;
                let minDistance = Infinity;
                monsters.forEach(m => {
                  const mLat = parseFloat(m.spawn_latitude);
                  const mLng = parseFloat(m.spawn_longitude);
                  const r = parseFloat(m.spawn_radius_meters) || 100;
                  const dist = getDistance(coords.lat, coords.lng, mLat, mLng);
                  if (dist <= r && dist < minDistance) {
                    found = { ...m, distance: Math.round(dist) };
                    minDistance = dist;
                  }
                });

                if (found) {
                  setDetectedMonster(found);
                  // Trigger Flash and Audio
                  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = ctx.createOscillator();
                  osc.connect(ctx.destination);
                  osc.frequency.setValueAtTime(800, ctx.currentTime);
                  osc.start();
                  setTimeout(() => osc.stop(), 500);

                  const flashDiv = document.createElement('div');
                  flashDiv.className = 'fixed inset-0 bg-white z-[9999] pointer-events-none animate-[pulse_0.2s_ease-in-out_infinite] opacity-60';
                  document.body.appendChild(flashDiv);
                  setTimeout(() => flashDiv.remove(), 5000);
                } else {
                  alert("No signatures detected within operational radius!");
                }
                setIsDetecting(false);
              }, 2500);
            }}
            className={cn(
              "relative w-48 h-48 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-500 shadow-2xl",
              isDetecting ? "bg-journal-green scale-95" : "bg-journal-green hover:scale-105"
            )}
          >
            <Radar className={cn("w-10 h-10 text-white", isDetecting && "animate-spin")} />
            <span className="text-white font-bold tracking-tight">
              {isDetecting ? "Scanning..." : "Detect Monsters"}
            </span>
          </button>
        </div>
      </div>

      {detectedMonster && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4 flex flex-col gap-4 bg-journal-green-light/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-journal-green flex flex-shrink-0 items-center justify-center overflow-hidden">
              {detectedMonster.picture_url ? (
                <img src={fixUrl(detectedMonster.picture_url)} className="w-full h-full object-cover mix-blend-multiply opacity-80" />
              ) : (
                <Bell className="w-6 h-6 text-white animate-bounce" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-journal-ink">Monster detected near you!</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-journal-muted">{detectedMonster.monster_name}</span>
                <span className="text-xs font-bold text-journal-green animate-pulse">{detectedMonster.distance}m away</span>
              </div>
            </div>
          </div>
          <button
            disabled={isCatching}
            onClick={() => {
              setIsCatching(true);
              setTimeout(() => {
                alert('Monster successfully contained! Transferring to Log Analysis...');
                onCaptureNavigate(detectedMonster);
                setIsCatching(false);
              }, 1500);
            }}
            className="w-full bg-journal-green text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-journal-ink transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Target className={cn("w-4 h-4", isCatching && "animate-spin")} />
            {isCatching ? "Containing..." : "INITIALIZE CATCH SEQUENCE"}
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Elevation</p>
          <p className="text-2xl font-bold">{Math.round(elevation)} <span className="text-xs font-normal text-journal-muted">FT</span></p>
        </div>
        <div className="glass-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Accuracy</p>
          <p className="text-2xl font-bold">{Math.round(accuracy)} <span className="text-xs font-normal text-journal-muted">Meters</span></p>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Signal Strength</p>
          <p className="text-lg font-bold text-journal-green">{signal.text}</p>
        </div>
        <div className="flex gap-1 items-end h-8">
          {signal.bars.map((h, i) => (
            <div key={i} className="w-1.5 bg-journal-green rounded-full" style={{ height: `${h * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const LogScreen = ({ playerId, capturedMonster, onCapture, onCancel }: { playerId: string|number, capturedMonster?: any, onCapture: () => void, onCancel?: () => void }) => {
  const [coords, setCoords] = useState<{ lat: number, lng: number }>({ lat: 14.5995, lng: 120.9842 });
  const [isLocating, setIsLocating] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [clearedInitial, setClearedInitial] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pokemonName, setPokemonName] = useState(capturedMonster?.monster_name || '');
  const [pokemonType, setPokemonType] = useState(capturedMonster?.monster_type || 'Unknown');
  const [spawnRadius, setSpawnRadius] = useState<number>(capturedMonster?.spawn_radius_meters || 100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = !!capturedMonster;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  useEffect(() => {
    if (capturedMonster) {
      setCoords({ lat: parseFloat(capturedMonster.spawn_latitude), lng: parseFloat(capturedMonster.spawn_longitude) });
    } else {
      const getPos = async () => {
        try {
          let perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') perm = await Geolocation.requestPermissions();
          if (perm.location === 'granted') {
            const current = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
            setCoords({ lat: current.coords.latitude, lng: current.coords.longitude });
          }
        } catch(e) {}
      };
      getPos();
    }
  }, [capturedMonster]);

  const handleCapture = async () => {
    if (!pokemonName || pokemonName.trim() === '') { alert("Please enter the Pokemon Identity!"); return; }

    setIsSubmitting(true);
    try {
      let uploadedUrl = "";
      if (imageFile) {
        try {
          const res = await monsterApi.uploadImage(imageFile);
          if (res.data.success) {
            uploadedUrl = res.data.image_url;
          }
        } catch (uploadErr) {
          console.error("Image upload failed", uploadErr);
          // if upload fails, we may still proceed with an empty picture_url or handle error
        }
      }

      if (capturedMonster) {
        // Edit existing monster
        await monsterApi.updateMonster({
          monster_id: capturedMonster.monster_id,
          monster_name: pokemonName,
          monster_type: pokemonType,
          spawn_latitude: coords.lat,
          spawn_longitude: coords.lng,
          spawn_radius_meters: spawnRadius,
          picture_url: uploadedUrl || (clearedInitial ? "" : capturedMonster.picture_url)
        });
        
        // Ensure user gets catch credit!
        try {
          await monsterApi.logSpecimen({
            player_id: playerId, // Replaced hardcoded fallback
            monster_id: capturedMonster.monster_id,
            location_id: 1,
            latitude: coords.lat,
            longitude: coords.lng
          });
        } catch (e) {
          console.error("Warning: specimen already logged or failed", e);
        }
      } else {
        // Create brand new monster
        await monsterApi.addMonster({
          monster_name: pokemonName,
          monster_type: pokemonType,
          spawn_latitude: coords.lat,
          spawn_longitude: coords.lng,
          spawn_radius_meters: spawnRadius,
          picture_url: uploadedUrl
        });
      }
      alert("Monster field data securely logged to central AWS servers!");
      setImage(null);
      setImageFile(null);
      setPokemonName('');
      setPokemonType('Unknown');
      onCapture();
    } catch (e) {
      alert("Failed to reach API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 relative">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">{isLocked ? "Identity Registration" : "New Discovery"}</p>
          <h2 className="text-3xl font-bold text-journal-ink">{isLocked ? "Log Detected Monster" : "Log New Pokemon"}</h2>
          <p className="text-sm text-journal-muted">{isLocked ? "You contained an unknown signature! Complete its field registration." : "Register a newly discovered species to the global central database."}</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-200">
            Cancel
          </button>
        )}
      </div>

      {/* Photo Capture UI removed to streamline field registration */}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-journal-muted ml-1">Pokemon Identity</label>
          <input type="text" value={pokemonName} onChange={(e) => setPokemonName(e.target.value)} className="input-field" placeholder="e.g. Pikachu" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-journal-muted ml-1">Pokemon Type {isLocked && "(Locked)"}</label>
          <div className="relative">
            <select disabled={isLocked} value={pokemonType} onChange={(e) => setPokemonType(e.target.value)} className={cn("input-field appearance-none", isLocked && "opacity-50 bg-gray-100")}>
              <option value="Unknown">Select elemental type</option>
              <option value="Normal">Normal</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Grass">Grass</option>
              <option value="Electric">Electric</option>
              <option value="Ice">Ice</option>
              <option value="Fighting">Fighting</option>
              <option value="Poison">Poison</option>
              <option value="Ground">Ground</option>
              <option value="Flying">Flying</option>
              <option value="Psychic">Psychic</option>
              <option value="Bug">Bug</option>
              <option value="Rock">Rock</option>
              <option value="Ghost">Ghost</option>
              <option value="Dragon">Dragon</option>
              <option value="Dark">Dark</option>
              <option value="Steel">Steel</option>
              <option value="Fairy">Fairy</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-journal-muted pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-journal-muted ml-1">Spawn Radius ({isLocked ? "Locked" : "Meters"})</label>
          <input disabled={isLocked} type="number" value={spawnRadius} onChange={(e) => setSpawnRadius(parseFloat(e.target.value) || 0)} className={cn("input-field", isLocked && "opacity-50 bg-gray-100 pointer-events-none")} placeholder="100" />
        </div>

        <div className="space-y-2 relative">
          {isLocked && <div className="absolute inset-0 z-40 bg-white/40 backdrop-blur-[1px] rounded-2xl" />}
          <div className="flex justify-between items-center ml-1 z-50 relative">
            <label className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Sighting Location</label>
            <span className="text-[8px] font-bold text-journal-green">Drag map to position pin</span>
          </div>
          <div className="relative h-64 rounded-2xl overflow-hidden border border-journal-border bg-journal-green-light/20 shadow-inner z-0">
            <MapContainer center={[coords.lat, coords.lng]} zoom={15} className="w-full h-full" zoomControl={false} dragging={!isLocked} scrollWheelZoom={!isLocked} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="grayscale-[0.2]" />
              {!isLocked && <LocationTracker setCoords={setCoords} />}
              <RecenterMap coords={coords} />
            </MapContainer>

            {/* Locate Me Button */}
            <button
              type="button"
              onClick={async () => {
                setIsLocating(true);
                try {
                  let perm = await Geolocation.checkPermissions();
                  if (perm.location !== 'granted') perm = await Geolocation.requestPermissions();
                  if (perm.location === 'granted') {
                    const current = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
                    setCoords({ lat: current.coords.latitude, lng: current.coords.longitude });
                  }
                } catch(e) {}
                setIsLocating(false);
              }}
              className="absolute top-3 right-3 bg-white p-2 rounded-full border border-journal-border shadow-md text-journal-green hover:bg-journal-green-light transition-colors z-20 flex items-center justify-center cursor-pointer pointer-events-auto"
            >
              <Compass className={cn("w-5 h-5", isLocating && "animate-spin")} />
            </button>

            {/* Center Fixed Pin overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
              <div className="relative -mt-8 pt-2">
                <MapPin className="w-8 h-8 text-red-500 relative z-10 drop-shadow-xl animate-bounce" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-1.5 bg-black/40 rounded-full blur-[2px]" />
              </div>
            </div>

            {/* Small UI instructions overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-journal-border shadow-lg pointer-events-none">
              <span className="text-[10px] font-bold uppercase tracking-widest text-journal-ink flex items-center gap-2">
                <Compass className="w-3 h-3 text-journal-green animate-[spin_4s_linear_infinite]" />
                Drag to Aim
              </span>
            </div>
          </div>
        </div>
      </div>

      <button disabled={isSubmitting} onClick={handleCapture} className="btn-primary w-full py-4 text-lg">
        {isSubmitting ? "Syncing..." : "Register Pokemon"}
      </button>

      <p className="text-center text-[8px] font-bold uppercase tracking-[0.2em] text-journal-muted">
        Entry will be validated by the local guild master
      </p>
    </div>
  );
};

const ServerControl = ({
  status,
  setStatus
}: {
  status: 'OFFLINE' | 'BOOTING' | 'ONLINE' | 'SHUTTING_DOWN',
  setStatus: (s: 'OFFLINE' | 'BOOTING' | 'ONLINE' | 'SHUTTING_DOWN') => void
}) => {
  const handleToggle = async () => {
    if (status === 'OFFLINE') {
      setStatus('BOOTING');
      try {
        await serverApi.startServer();
        setTimeout(() => setStatus('ONLINE'), 3000);
      } catch {
        setTimeout(() => setStatus('ONLINE'), 3000);
      }
    } else if (status === 'ONLINE') {
      setStatus('SHUTTING_DOWN');
      try {
        await serverApi.stopServer();
        setTimeout(() => setStatus('OFFLINE'), 3000);
      } catch {
        setTimeout(() => setStatus('OFFLINE'), 3000);
      }
    }
  };

  return (
    <div className="glass-card p-6 space-y-5 border-journal-green/20 relative overflow-hidden">
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-journal-green" />
            <h3 className="font-bold text-lg tracking-tight">AWS Core Link</h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">EC2 Automation Node</p>
        </div>

        <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-journal-border">
          <div className={cn("w-2 h-2 rounded-full", status === 'ONLINE' ? "bg-journal-green animate-pulse" : status === 'OFFLINE' ? "bg-red-500" : "bg-yellow-500 animate-ping")} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-journal-ink">{status}</span>
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        <button
          onClick={handleToggle}
          disabled={status === 'BOOTING' || status === 'SHUTTING_DOWN'}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all",
            status === 'ONLINE' ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : status === 'OFFLINE' ? "bg-journal-green text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5" : "bg-journal-muted/20 text-journal-muted cursor-not-allowed"
          )}
        >
          <Power className={cn("w-4 h-4", (status === 'BOOTING' || status === 'SHUTTING_DOWN') && "animate-pulse")} />
          {status === 'ONLINE' ? 'Cut Power' : status === 'OFFLINE' ? 'Initialize Link' : 'Processing...'}
        </button>
      </div>
    </div>
  );
};

const CenterScreen = ({
  onNavigate,
  serverStatus,
  setServerStatus
}: {
  onNavigate: (tab: Tab) => void,
  serverStatus: 'OFFLINE' | 'BOOTING' | 'ONLINE' | 'SHUTTING_DOWN',
  setServerStatus: (s: 'OFFLINE' | 'BOOTING' | 'ONLINE' | 'SHUTTING_DOWN') => void
}) => {
  const actions = [
    { icon: Target, label: 'Catch', sub: 'Initiate containment protocols', action: () => onNavigate('HUNT') },
    { icon: Edit3, label: 'Edit', sub: 'Update field observations', action: () => onNavigate('POKEDEX') },
    { icon: Trash2, label: 'Delete', sub: 'Purge inaccurate data', action: () => onNavigate('POKEDEX') },
    { icon: Trophy, label: 'Top Hunters', sub: 'Leaderboard rankings', action: () => onNavigate('RANKS') },
    { icon: MapIcon, label: 'Monster Map', sub: 'Geospatial tracking view', action: () => onNavigate('MAP') },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Central Hub</p>
        <h2 className="text-4xl font-bold text-journal-ink">Monster Control</h2>
      </div>

      <ServerControl status={serverStatus} setStatus={setServerStatus} />

      <div className="space-y-4">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            onClick={action.action}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full glass-card p-6 flex items-center gap-6 text-left group hover:scale-[1.02] transition-all bg-white"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-journal-green-light">
              <action.icon className="w-6 h-6 text-journal-green" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{action.label}</h3>
                <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Action 0{i + 1}</span>
              </div>
              <p className="text-sm text-journal-muted">{action.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="aspect-video rounded-xl overflow-hidden">
          <img
            src="https://picsum.photos/seed/monster/800/600"
            alt="Monster"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">System Integrity</h3>
          <p className="text-sm text-journal-muted leading-relaxed">
            All containment protocols are currently active. The HAUPokemon Pokedex synchronizes real-time data from 12 regional hubs. Please ensure all field notes are finalized before submission to the central archive.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold text-journal-green">428</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-journal-muted">Active Hunts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-journal-green">12k+</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-journal-muted">Specimens Logged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonsterMapScreen = ({ monsters }: { monsters: any[] }) => {
  const [coords, setCoords] = useState<{ lat: number, lng: number }>({ lat: 14.5562, lng: 121.0298 });

  useEffect(() => {
    const getPos = async () => {
      try {
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') perm = await Geolocation.requestPermissions();
        if (perm.location === 'granted') {
          const current = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
          setCoords({ lat: current.coords.latitude, lng: current.coords.longitude });
        }
      } catch(e) {}
    };
    getPos();
  }, []);

  return (
    <div className="space-y-6 pb-24 h-[80vh] flex flex-col">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Global Radar</p>
        <h2 className="text-4xl font-bold text-journal-ink">Monster Map</h2>
        <p className="text-sm text-journal-muted">Live geospatial tracking of potential habitats and active encounters.</p>
      </div>

      <div className="relative flex-1 rounded-3xl overflow-hidden border border-journal-border shadow-inner bg-journal-green/10 z-0">
        <MapContainer center={[coords.lat, coords.lng]} zoom={13} className="w-full h-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="grayscale opacity-40" />
          <RecenterMap coords={coords} />
          
          <Marker position={[coords.lat, coords.lng]} icon={createRadarIcon()} />

          {monsters.map((marker: any) => (
            <Marker key={marker.monster_id} position={[parseFloat(marker.spawn_latitude), parseFloat(marker.spawn_longitude)]} icon={createRadarIcon()}>
              <Popup className="font-journal-mono font-bold text-xs uppercase tracking-widest text-journal-ink">
                {marker.monster_name} ({marker.monster_type})
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Radar Sweep Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[400]">
          <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -ml-[100%] -mt-[100%] rounded-full border border-journal-green/20 animate-[spin_10s_linear_infinite]"
            style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(34, 197, 94, 0.1) 100%)' }} />
        </div>

        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-journal-border shadow-lg z-[1000]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-journal-green animate-pulse" />
            <p className="text-xs font-bold text-journal-ink flex-1">{monsters.length} targets detected in your sector</p>
            <Compass className="w-4 h-4 text-journal-muted animate-[spin_4s_linear_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PokedexScreen = ({ onNavigate, monsters, refreshMonsters, hunterId }: { onNavigate: (tab: Tab) => void, monsters: any[], refreshMonsters: () => void, hunterId: string }) => {
  const [editingMonster, setEditingMonster] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', type: '', lat: 0, lng: 0, radius: 100 });
  const [isUpdating, setIsUpdating] = useState(false);
  const [captures, setCaptures] = useState<any[]>([]);

  useEffect(() => {
    authApi.getProfile(hunterId).then(res => {
      if (res.data?.success) setCaptures(res.data.captures || []);
    }).catch(console.error);
  }, [hunterId]);

  const openEdit = (monster: any) => {
    setEditingMonster(monster);
    setEditForm({
      name: monster.monster_name,
      type: monster.monster_type,
      lat: monster.spawn_latitude,
      lng: monster.spawn_longitude,
      radius: monster.spawn_radius_meters
    });
  };

  const submitEdit = async () => {
    setIsUpdating(true);
    try {
      await monsterApi.updateMonster({
        monster_id: editingMonster.monster_id,
        monster_name: editForm.name,
        monster_type: editForm.type,
        spawn_latitude: editForm.lat,
        spawn_longitude: editForm.lng,
        spawn_radius_meters: editForm.radius,
        picture_url: editingMonster.picture_url || ""
      });
      refreshMonsters();
      setEditingMonster(null);
    } catch (err: any) {
      alert("Failed to update. " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-start space-y-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Central Archives</p>
          <h2 className="text-4xl font-bold text-journal-ink">Pokedex</h2>
          <p className="text-sm text-journal-muted">Index of registered Pokemon across the application. Select an entry to edit or delete.</p>
        </div>
        <button 
          onClick={() => {
            refreshMonsters();
            authApi.getProfile(hunterId).then(res => {
              if (res.data?.success) setCaptures(res.data.captures || []);
            }).catch(console.error);
          }} 
          className="p-3 bg-white rounded-xl shadow border border-journal-border text-journal-green hover:bg-journal-green hover:text-white transition-colors flex flex-col items-center gap-1"
        >
          <Radar className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate('LOG')} className="glass-card p-4 space-y-3 flex flex-col items-center justify-center hover:bg-journal-green-light transition-colors border-dashed border-2 border-journal-green/30 min-h-[160px]">
          <div className="w-12 h-12 rounded-full bg-journal-green/10 flex items-center justify-center mb-2">
            <Plus className="w-6 h-6 text-journal-green" />
          </div>
          <span className="text-xs font-bold text-journal-green uppercase tracking-widest text-center">Add<br />Monsters</span>
        </button>
        {monsters.map((monster: any) => {
          const isCaught = captures.some((c: any) => String(c.monster_id) === String(monster.monster_id));
          return (
          <div key={monster.monster_id} className="glass-card p-4 space-y-3 relative group">
            <div className="aspect-square bg-journal-green-light rounded-xl overflow-hidden relative border border-journal-border">
              {monster.picture_url ? (
                <img src={fixUrl(monster.picture_url)} className={cn("w-full h-full object-cover mix-blend-multiply opacity-80", !isCaught && "brightness-0 opacity-40 grayscale")} />
              ) : (
                <ImageIcon className={cn("w-8 h-8 text-journal-green/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", !isCaught && "grayscale")} />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">#{monster.monster_id}</p>
              <p className="font-bold text-journal-ink truncate">{isCaught ? monster.monster_name : '???'}</p>
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              <button
                onClick={() => openEdit(monster)}
                className="p-2 bg-white rounded-full shadow border border-journal-border text-journal-green hover:bg-journal-green hover:text-white transition-colors"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={async () => {
                  if (confirm("Permanently delete " + monster.monster_name + "?")) {
                    try {
                      await monsterApi.deleteMonster(monster.monster_id);
                      refreshMonsters();
                    } catch (err: any) { alert("Failed to delete. " + (err.response?.data?.message || err.message)); }
                  }
                }}
                className="p-2 bg-white rounded-full shadow border border-journal-border text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )})}
      </div>
      {editingMonster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-journal-ink/60 backdrop-blur-sm">
          <div className="glass-card bg-white p-6 w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold">Edit Entry</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-journal-muted ml-1">Identity</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-journal-muted ml-1">Type</label>
              <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="input-field appearance-none">
                <option value="Unknown">Unknown</option>
                <option value="Normal">Normal</option>
                <option value="Fire">Fire</option>
                <option value="Water">Water</option>
                <option value="Grass">Grass</option>
                <option value="Electric">Electric</option>
                <option value="Ice">Ice</option>
                <option value="Fighting">Fighting</option>
                <option value="Poison">Poison</option>
                <option value="Ground">Ground</option>
                <option value="Flying">Flying</option>
                <option value="Psychic">Psychic</option>
                <option value="Bug">Bug</option>
                <option value="Rock">Rock</option>
                <option value="Ghost">Ghost</option>
                <option value="Dragon">Dragon</option>
                <option value="Dark">Dark</option>
                <option value="Steel">Steel</option>
                <option value="Fairy">Fairy</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-journal-muted ml-1">Latitude</label>
                <input type="number" step="any" value={editForm.lat} onChange={e => setEditForm({ ...editForm, lat: parseFloat(e.target.value) })} className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-journal-muted ml-1">Longitude</label>
                <input type="number" step="any" value={editForm.lng} onChange={e => setEditForm({ ...editForm, lng: parseFloat(e.target.value) })} className="input-field" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-journal-muted ml-1">Spawn Radius (Meters)</label>
              <input type="number" step="any" value={editForm.radius} onChange={e => setEditForm({ ...editForm, radius: parseFloat(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="flex gap-3 pt-2">
              <button disabled={isUpdating} onClick={submitEdit} className="btn-primary flex-1">{isUpdating ? "Saving..." : "Save Changes"}</button>
              <button disabled={isUpdating} onClick={() => setEditingMonster(null)} className="px-5 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest border border-journal-border text-journal-muted hover:bg-journal-muted/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileScreen = ({ hunterId, monsters }: { hunterId: string, monsters: any[] }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [captures, setCaptures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile(hunterId);
        if (res.data?.success) {
          setProfileData(res.data.player);
          setCaptures(res.data.captures || []);
        } else {
          setProfileData({ username: hunterId, profile_url: null });
        }
      } catch {
        setProfileData({ username: hunterId, profile_url: null });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [hunterId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarUploading(true);
      try {
        const res = await authApi.uploadAvatar(hunterId, e.target.files[0]);
        if (res.data?.success) {
          setProfileData({ ...profileData, profile_url: res.data.profile_url });
        } else {
          alert("Failed to update avatar: " + (res.data?.message || "Unknown error"));
        }
      } catch (err: any) {
        alert("Upload failed. " + (err.response?.data?.message || err.message));
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  const capturedCount = captures.length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh] text-journal-green animate-pulse font-bold text-xs tracking-widest uppercase">LOADING DOSSIER...</div>;
  }

  return (
    <div className="space-y-6 pb-24 text-center mt-8">
      <div className="relative w-32 h-32 mx-auto">
        <div className="w-full h-full rounded-full bg-journal-green flex items-center justify-center text-white text-5xl font-bold shadow-2xl relative overflow-hidden border-4 border-white">
          {profileData?.profile_url ? (
            <img src={fixUrl(profileData.profile_url)} className="w-full h-full object-cover" alt="Profile" />
          ) : (
            hunterId.charAt(0).toUpperCase()
          )}
        </div>
        <label className="absolute bottom-0 right-0 p-3 bg-white text-journal-green border border-journal-border rounded-full shadow-lg cursor-pointer hover:bg-journal-green-light transition-colors z-10">
          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={avatarUploading} />
          {avatarUploading ? <Compass className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
        </label>
      </div>

      <div className="space-y-1 mt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Active Operative</p>
        <h2 className="text-3xl font-bold text-journal-ink">{profileData?.player_name || hunterId}</h2>
        <p className="text-sm text-journal-green font-bold">{getHunterClass(capturedCount)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-left mt-8">
        <div className="glass-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Captures</p>
          <p className="text-2xl font-bold">{capturedCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Global Rank</p>
          <p className="text-2xl font-bold">{capturedCount < 5 ? 'Unranked' : `#${Math.max(1, 4092 - capturedCount * 12)}`}</p>
        </div>
      </div>

      <div className="mt-8 text-left space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted text-center pt-4 border-t border-journal-border">Your Confirmed Captures</p>
        {captures.length === 0 ? (
          <div className="glass-card bg-journal-green-light/20 border-dotted border-2 text-center py-6 text-journal-muted text-xs">
            No field operations conducted.<br />Initiate a Hunt sequence to log your first target.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {captures.map((c: any) => (
              <div key={c.catch_id} 
                   onClick={async () => {
                     if (confirm(`Do you want to release ${c.monster_name}? This will permanently remove it from your captures and adjust your global rank.`)) {
                       try {
                         await monsterApi.deleteMonster(c.monster_id);
                         window.location.reload();
                       } catch(e) {
                         alert('Release failed.');
                       }
                     }
                   }}
                   className="glass-card p-2 space-y-2 relative group flex flex-col items-center hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer border-journal-green/10">
                <div className="w-16 h-16 rounded-full bg-journal-green-light/50 border border-journal-green/20 overflow-hidden shrink-0 relative flex items-center justify-center">
                  {c.picture_url ? (
                    <img src={fixUrl(c.picture_url)} className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-journal-green/50" />
                  )}
                  <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-[9px] font-bold text-journal-ink truncate w-full text-center group-hover:text-red-700">{c.monster_name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RanksScreen = ({ onNavigate }: { onNavigate: (tab: Tab) => void }) => {
  const [hunters, setHunters] = useState<Hunter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await monsterApi.getLeaderboard();
        const fetched = res.data?.data || res.data || [];

        let fetchedHunters = fetched.map((h: any, i: number) => ({
          id: String(i),
          name: h.name || h.player_name || h.username,
          monsters: parseInt(h.monsters || h.total_catches || h.catch_count || h.catches || 0, 10),
          rank: 0,
          avatar: h.avatar || h.profile_url
        }));

        let combined = [...fetchedHunters];
        combined.sort((a, b) => b.monsters - a.monsters);

        let finalHunters = combined.slice(0, 10).map((h, i) => ({
          ...h,
          rank: i + 1
        }));

        setHunters(finalHunters);

      } catch (err) {
        setHunters([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Global Recognition</p>
        <h2 className="text-4xl font-bold text-journal-ink">Elite Ranks</h2>
        <div className="bg-journal-green-light/50 px-3 py-1 rounded-full inline-flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-journal-green animate-pulse" />
          <span className="text-[10px] font-bold text-journal-green">Updated 2m ago</span>
        </div>
      </div>

      <div className="space-y-4">
        {hunters.map((hunter, i) => (
          <motion.div
            key={hunter.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-4 flex items-center gap-4 rounded-2xl transition-all",
              hunter.rank === 1 ? "bg-journal-green text-white shadow-xl scale-[1.02]" : "glass-card hover:bg-journal-green-light"
            )}
          >
            <div className="text-2xl font-bold opacity-20 w-8">0{hunter.rank}</div>
            <div className="relative">
              <img
                src={fixUrl(hunter.avatar) ? fixUrl(hunter.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${hunter.name}`}
                alt={hunter.name}
                className="w-12 h-12 rounded-xl bg-white/20 object-cover"
              />
              {hunter.rank <= 3 && (
                <div className="absolute -top-2 -right-2">
                  <Trophy className={cn("w-5 h-5", hunter.rank === 1 ? "text-yellow-400" : "text-journal-muted")} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{hunter.name}</h3>
              <p className={cn("text-xs", hunter.rank === 1 ? "text-white/70" : "text-journal-muted")}>
                {hunter.monsters} Monsters
              </p>
            </div>
            {hunter.rank > 3 && (
              <div className="text-right">
                <p className="text-lg font-bold">{hunter.monsters}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Confirmed</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4 bg-journal-green-light/30 border-journal-green/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" alt="You" className="w-10 h-10 rounded-lg bg-white" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Your Current Position</p>
            <p className="font-bold text-journal-green">Rank #142 <span className="text-xs font-normal text-journal-muted">(Top 5%)</span></p>
          </div>
        </div>
        <button onClick={() => onNavigate('PROFILE')} className="bg-journal-green text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-journal-ink transition-colors">
          View My Stats
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hunterId, setHunterId] = useState('HQ-8829-X');
  const [playerId, setPlayerId] = useState<number | string>(1);
  const [caughtMonsterIds, setCaughtMonsterIds] = useState<number[]>([]);
  const [globalCaughtIds, setGlobalCaughtIds] = useState<number[]>([]);
  const [monsters, setMonsters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('HUNT');
  const [capturedMonster, setCapturedMonster] = useState<any | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<'OFFLINE' | 'BOOTING' | 'ONLINE' | 'SHUTTING_DOWN'>('OFFLINE');

  const fetchMonsters = async () => {
    try {
      const res = await monsterApi.getMonsters();
      if (res.data && res.data.data) {
        setMonsters(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch monsters:", err);
    }
  };

  const fetchProfileAndID = async (uId: string) => {
    try {
      const res = await authApi.getProfile(uId);
      if (res.data?.success) {
        if (res.data.player?.player_id) {
          setPlayerId(res.data.player.player_id);
        }
        if (Array.isArray(res.data.captures)) {
          setCaughtMonsterIds(res.data.captures.map((c: any) => parseInt(c.monster_id)));
        }
      }
    } catch(e) {}
  };

  const fetchGlobalCaughtIds = async () => {
    try {
      const res = await monsterApi.getLeaderboard();
      const users = res.data?.data || res.data || [];
      const caughtSet = new Set<number>();
      for (const u of users) {
        try {
           const p = await authApi.getProfile(u.player_name || u.username || u.name);
           p.data?.captures?.forEach((c: any) => caughtSet.add(parseInt(c.monster_id)));
        } catch(e) {}
      }
      setGlobalCaughtIds(Array.from(caughtSet));
    } catch(e) {}
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMonsters();
      fetchProfileAndID(hunterId);
      fetchGlobalCaughtIds();
    }
  }, [isLoggedIn, hunterId]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(id) => { setHunterId(id); setIsLoggedIn(true); }} />;
  }

  const renderScreen = () => {
    const uncaughtMonsters = monsters.filter(m => !globalCaughtIds.includes(parseInt(m.monster_id)) && !caughtMonsterIds.includes(parseInt(m.monster_id)));

    switch (activeTab) {
      case 'HUNT': return <HuntScreen onNavigate={setActiveTab} monsters={uncaughtMonsters} hunterId={hunterId} refreshMonsters={fetchMonsters} onCaptureNavigate={(m) => { setCapturedMonster(m); setActiveTab('LOG'); }} />;
      case 'LOG': return <LogScreen playerId={playerId} capturedMonster={capturedMonster} onCapture={() => { setCapturedMonster(null); fetchMonsters(); fetchProfileAndID(hunterId); fetchGlobalCaughtIds(); setActiveTab('POKEDEX'); }} onCancel={capturedMonster ? () => { setCapturedMonster(null); setActiveTab('HUNT'); } : undefined} />;
      case 'CENTER': return <CenterScreen onNavigate={setActiveTab} serverStatus={serverStatus} setServerStatus={setServerStatus} />;
      case 'RANKS': return <RanksScreen onNavigate={setActiveTab} />;
      case 'MAP': return <MonsterMapScreen monsters={uncaughtMonsters} />;
      case 'POKEDEX': return <PokedexScreen onNavigate={setActiveTab} monsters={monsters} refreshMonsters={fetchMonsters} hunterId={hunterId} />;
      case 'PROFILE': return <ProfileScreen hunterId={hunterId} monsters={monsters} />;
      case 'COMING_SOON': return <ComingSoonScreen />;
      default: return <HuntScreen onNavigate={setActiveTab} monsters={uncaughtMonsters} hunterId={hunterId} refreshMonsters={fetchMonsters} onCaptureNavigate={(m) => { setCapturedMonster(m); setActiveTab('LOG'); }} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'HUNT': return 'HAUPokemon Pokedex';
      case 'LOG': return 'Log Pokemon';
      case 'CENTER': return 'Monster Control';
      case 'RANKS': return 'Elite Ranks';
      case 'MAP': return 'Global Radar';
      case 'POKEDEX': return 'Pokedex Archives';
      case 'PROFILE': return 'Hunter Profile';
      case 'COMING_SOON': return 'Out of Range';
      case 'GEAR': return 'Hunter Gear';
    }
  };

  return (
    <div className="min-h-screen bg-journal-bg">
      <Navbar title={getTitle()} onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-journal-ink/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[70] p-8 space-y-8 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-journal-green flex items-center justify-center text-white font-bold text-xl">{hunterId.charAt(0).toUpperCase()}</div>
                <div>
                  <h2 className="font-bold text-lg">{hunterId}</h2>
                  <p className="text-xs text-journal-muted">{getHunterClass(monsters.length)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Menu</p>
                <div className="space-y-1">
                  {[
                    { icon: User, label: 'Profile', id: 'PROFILE' as Tab },
                    { icon: Shield, label: 'Security', id: 'COMING_SOON' as Tab },
                    { icon: Bell, label: 'Notifications', id: 'COMING_SOON' as Tab },
                    { icon: BookOpen, label: 'Pokedex', id: 'POKEDEX' as Tab },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-journal-green-light text-journal-ink transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-journal-green" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-journal-border">
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
