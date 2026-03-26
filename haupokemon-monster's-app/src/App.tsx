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
import { cn } from './lib/utils';
import { authApi, monsterApi, serverApi } from './services/api';

// --- Types ---
type Tab = 'HUNT' | 'LOG' | 'CENTER' | 'RANKS' | 'GEAR' | 'MAP';

interface Hunter {
  id: string;
  name: string;
  monsters: number;
  rank: number;
  avatar?: string;
}

// --- Components ---

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
    { id: 'RANKS', icon: Trophy, label: 'RANKS' },
    { id: 'GEAR', icon: Shield, label: 'GEAR' },
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
  const [hunterId, setHunterId] = useState('HQ-8829-X');
  const [accessKey, setAccessKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (isRegistering) {
        await authApi.register({ username: hunterId, password: accessKey, player_name: hunterId });
        alert("Registration Successful via Paris Server!");
      } else {
        await authApi.login(hunterId, accessKey);
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
              <input type="checkbox" className="rounded border-journal-border text-journal-green focus:ring-journal-green" />
              Automatic Login
            </label>
          </div>

          {errorMsg && <p className="text-red-500 text-xs font-bold text-center mt-2">{errorMsg}</p>}

          <button disabled={isLoading} className="btn-primary w-full mt-4">
            {isLoading ? "Connecting to AWS..." : isRegistering ? "Register New Hunter" : "Authorize Entry"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
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

const HuntScreen = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [coords, setCoords] = useState({ lat: '34.0522° N', lng: '118.2437° W' });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({
          lat: `${pos.coords.latitude.toFixed(4)}° N`,
          lng: `${pos.coords.longitude.toFixed(4)}° W`
        });
      });
    }
  }, []);

  return (
    <div className="space-y-8 pb-24">
      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-journal-muted">Current Coordinates</p>
        <h2 className="text-4xl font-journal-mono font-bold text-journal-green leading-tight">
          {coords.lat}<br />{coords.lng}
        </h2>
      </div>

      <div className="flex justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-journal-green/5 rounded-3xl animate-pulse" />
          <div className="absolute inset-4 bg-journal-green/10 rounded-3xl" />
          <button 
            onClick={() => setIsDetecting(!isDetecting)}
            className={cn(
              "relative w-48 h-48 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-500 shadow-2xl",
              isDetecting ? "bg-journal-green scale-95" : "bg-journal-green"
            )}
          >
            <Radar className={cn("w-10 h-10 text-white", isDetecting && "animate-spin")} />
            <span className="text-white font-bold tracking-tight">
              {isDetecting ? "Scanning..." : "Detect Monsters"}
            </span>
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-4 flex items-center gap-4 bg-journal-green-light/30"
      >
        <div className="w-12 h-12 rounded-xl bg-journal-green-light flex items-center justify-center">
          <Bell className="w-6 h-6 text-journal-green" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-journal-ink">Monster detected near you!</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-journal-muted">Greater Forest Strider</span>
            <span className="text-xs font-bold text-journal-green">240m away</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Elevation</p>
          <p className="text-2xl font-bold">1,240 <span className="text-xs font-normal text-journal-muted">FT</span></p>
        </div>
        <div className="glass-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Humidity</p>
          <p className="text-2xl font-bold">64 <span className="text-xs font-normal text-journal-muted">%</span></p>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Signal Strength</p>
          <p className="text-lg font-bold text-journal-green">Strong Satellite Link</p>
        </div>
        <div className="flex gap-1 items-end h-8">
          {[0.4, 0.6, 0.8, 1.0].map((h, i) => (
            <div key={i} className="w-1.5 bg-journal-green rounded-full" style={{ height: `${h * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const LogScreen = () => {
  const [pin, setPin] = useState<{x: number, y: number} | null>(null);

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">New Encounter</p>
        <h2 className="text-3xl font-bold text-journal-ink">Log Pokemon</h2>
        <p className="text-sm text-journal-muted">Record your findings to the central database. Ensure all environmental data is accurate for high-rank rewards.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-journal-green-light transition-colors cursor-pointer">
          <input type="file" accept="image/*" capture="environment" className="hidden" />
          <Camera className="w-8 h-8 text-journal-green" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center">Capture Photo</span>
        </label>
        <label className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-journal-green-light transition-colors cursor-pointer">
          <input type="file" accept="image/*" className="hidden" />
          <ImageIcon className="w-8 h-8 text-journal-green" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center">From Gallery</span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-journal-muted ml-1">Pokemon Identity</label>
          <input type="text" className="input-field" placeholder="e.g. Pikachu" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-journal-muted ml-1">Pokemon Type</label>
          <div className="relative">
            <select className="input-field appearance-none">
              <option>Select elemental type</option>
              <option>Electric</option>
              <option>Fire</option>
              <option>Water</option>
              <option>Grass</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-journal-muted pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Sighting Location</label>
            <span className="text-[8px] font-bold text-journal-green">Tap map to drop pin</span>
          </div>
          <div 
            className="relative h-48 rounded-2xl overflow-hidden border border-journal-border cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setPin({ x, y });
            }}
          >
            <iframe 
              src="https://www.openstreetmap.org/export/embed.html?bbox=-118.3,34.0,-118.2,34.1&layer=mapnik" 
              className="w-full h-full border-none opacity-80 pointer-events-none"
            />
            {!pin && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-journal-border flex items-center gap-2 shadow-lg">
                  <MapPin className="w-3 h-3 text-journal-green animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tap to Pin</span>
                </div>
              </div>
            )}
            {pin && (
              <div 
                className="absolute w-6 h-6 -ml-3 -mt-6 pointer-events-none transition-all duration-300"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <div className="relative">
                  <MapPin className="w-6 h-6 text-red-500 relative z-10" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-1 bg-black/20 rounded-full blur-[1px]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="btn-primary w-full py-4 text-lg">
        Register Pokemon
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
        // Simulate delay
        setTimeout(() => setStatus('ONLINE'), 3000);
      } catch {
        // Fallback for visual demo
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
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Server className="w-32 h-32" />
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-journal-green" />
            <h3 className="font-bold text-lg tracking-tight">AWS Core Link</h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">EC2 Automation Node</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-journal-border">
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === 'ONLINE' ? "bg-journal-green animate-pulse" : 
            status === 'OFFLINE' ? "bg-red-500" : "bg-yellow-500 animate-ping"
          )} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-journal-ink">{status}</span>
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        <button 
          onClick={handleToggle}
          disabled={status === 'BOOTING' || status === 'SHUTTING_DOWN'}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all",
            status === 'ONLINE' 
              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
              : status === 'OFFLINE'
                ? "bg-journal-green text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                : "bg-journal-muted/20 text-journal-muted cursor-not-allowed"
          )}
        >
          <Power className={cn("w-4 h-4", (status === 'BOOTING' || status === 'SHUTTING_DOWN') && "animate-pulse")} />
          {status === 'ONLINE' ? 'Cut Power' : status === 'OFFLINE' ? 'Initialize Link' : 'Processing...'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="space-y-1">
          <p className="text-[8px] font-bold uppercase tracking-widest text-journal-muted">Database Node</p>
          <p className="text-xs font-mono font-medium text-journal-ink">us-east-1 (N.VA)</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] font-bold uppercase tracking-widest text-journal-muted">API Node</p>
          <p className="text-xs font-mono font-medium text-journal-ink">eu-west-3 (PARIS)</p>
        </div>
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
    { icon: Plus, label: 'Add', sub: 'Register a new discovery', color: 'bg-journal-green text-white', action: () => onNavigate('LOG') },
    { icon: Target, label: 'Catch', sub: 'Initiate containment protocols', action: () => onNavigate('HUNT') },
    { icon: Edit3, label: 'Edit', sub: 'Update field observations', action: () => onNavigate('LOG') },
    { icon: Trash2, label: 'Delete', sub: 'Purge inaccurate data', action: () => onNavigate('LOG') },
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
            className={cn(
              "w-full glass-card p-6 flex items-center gap-6 text-left group hover:scale-[1.02] transition-all",
              action.color || "bg-white"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              action.color ? "bg-white/20" : "bg-journal-green-light"
            )}>
              <action.icon className={cn("w-6 h-6", action.color ? "text-white" : "text-journal-green")} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{action.label}</h3>
                <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Action 0{i+1}</span>
              </div>
              <p className={cn("text-sm", action.color ? "text-white/70" : "text-journal-muted")}>{action.sub}</p>
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

const MonsterMapScreen = () => {
  const [markers] = useState([
    { id: 1, x: 25, y: 30, type: 'electric', name: 'Unknown Signal' },
    { id: 2, x: 75, y: 60, type: 'fire', name: 'Heat Signature' },
    { id: 3, x: 45, y: 80, type: 'water', name: 'Aquatic Movement' },
    { id: 4, x: 80, y: 20, type: 'grass', name: 'Foliage Disturbance' },
  ]);

  return (
    <div className="space-y-6 pb-24 h-[80vh] flex flex-col">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Global Radar</p>
        <h2 className="text-4xl font-bold text-journal-ink">Monster Map</h2>
        <p className="text-sm text-journal-muted">Live geospatial tracking of potential habitats and active encounters.</p>
      </div>

      <div className="relative flex-1 rounded-3xl overflow-hidden border border-journal-border shadow-inner bg-journal-green/5">
        <img 
          src="https://picsum.photos/seed/worldmap/800/1200" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-30 grayscale mix-blend-multiply"
        />
        
        {/* Radar Sweep Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -ml-[100%] -mt-[100%] rounded-full border border-journal-green/20 animate-[spin_10s_linear_infinite]"
               style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(34, 197, 94, 0.1) 100%)' }} />
        </div>

        {/* Map Markers */}
        {markers.map(marker => (
          <div 
            key={marker.id}
            className="absolute rounded-full cursor-pointer group"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            <div className="relative -ml-3 -mt-3">
              <div className="absolute inset-0 bg-journal-green rounded-full animate-ping opacity-20" />
              <div className="w-6 h-6 bg-white border border-journal-border rounded-full shadow-lg flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                <Radar className="w-3 h-3 text-journal-green" />
              </div>
              
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-journal-ink text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                {marker.name}
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-journal-border shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-journal-green animate-pulse" />
            <p className="text-xs font-bold text-journal-ink flex-1">4 targets detected in your sector</p>
            <Compass className="w-4 h-4 text-journal-muted animate-[spin_4s_linear_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};

const RanksScreen = () => {
  const [hunters, setHunters] = useState<Hunter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await monsterApi.getLeaderboard();
        // Assuming API returns array of hunters
        setHunters(res.data || [
          { id: '1', name: 'Valerius Grey', monsters: 1204, rank: 1 },
          { id: '2', name: 'Elias Thorne', monsters: 842, rank: 2 },
          { id: '3', name: 'Sarah K.', monsters: 791, rank: 3 },
          { id: '4', name: 'Marcus Vane', monsters: 654, rank: 4 },
          { id: '5', name: 'Elena Rossi', monsters: 612, rank: 5 },
          { id: '6', name: 'Julian Black', monsters: 598, rank: 6 },
        ]);
      } catch (err) {
        // Fallback mock data
        setHunters([
          { id: '1', name: 'Valerius Grey', monsters: 1204, rank: 1 },
          { id: '2', name: 'Elias Thorne', monsters: 842, rank: 2 },
          { id: '3', name: 'Sarah K.', monsters: 791, rank: 3 },
          { id: '4', name: 'Marcus Vane', monsters: 654, rank: 4 },
          { id: '5', name: 'Elena Rossi', monsters: 612, rank: 5 },
          { id: '6', name: 'Julian Black', monsters: 598, rank: 6 },
        ]);
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
              "glass-card p-4 flex items-center gap-4",
              hunter.rank === 1 && "bg-journal-green text-white border-none shadow-xl scale-[1.02]"
            )}
          >
            <div className="text-2xl font-bold opacity-20 w-8">0{hunter.rank}</div>
            <div className="relative">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${hunter.name}`} 
                alt={hunter.name} 
                className="w-12 h-12 rounded-xl bg-white/20"
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
        <button className="bg-journal-green text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">
          View My Stats
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('HUNT');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<'OFFLINE' | 'BOOTING' | 'ONLINE' | 'SHUTTING_DOWN'>('OFFLINE');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'HUNT': return <HuntScreen />;
      case 'LOG': return <LogScreen />;
      case 'CENTER': return <CenterScreen onNavigate={setActiveTab} serverStatus={serverStatus} setServerStatus={setServerStatus} />;
      case 'RANKS': return <RanksScreen />;
      case 'MAP': return <MonsterMapScreen />;
      case 'GEAR': return <div className="flex items-center justify-center h-[60vh] text-journal-muted">Gear Management Offline</div>;
      default: return <HuntScreen />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'HUNT': return 'HAUPokemon Pokedex';
      case 'LOG': return 'Log Pokemon';
      case 'CENTER': return 'Monster Control';
      case 'RANKS': return 'Elite Ranks';
      case 'MAP': return 'Global Radar';
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
                <div className="w-12 h-12 rounded-xl bg-journal-green flex items-center justify-center text-white font-bold text-xl">H</div>
                <div>
                  <h2 className="font-bold text-lg">HQ-8829-X</h2>
                  <p className="text-xs text-journal-muted">Elite Hunter Class</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-journal-muted">Menu</p>
                <div className="space-y-1">
                  {[
                    { icon: User, label: 'Profile' },
                    { icon: Shield, label: 'Security' },
                    { icon: Bell, label: 'Notifications' },
                    { icon: BookOpen, label: 'Archives' },
                  ].map((item) => (
                    <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-journal-green-light text-journal-ink transition-colors">
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
