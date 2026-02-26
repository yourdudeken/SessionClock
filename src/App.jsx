import React, { useState, useMemo } from 'react';
import { Clock } from './components/Clock';
import { useTime } from './hooks/useTime';
import { TRADING_SESSIONS, VOLATILITY_OVERLAP } from './data/sessions';
import { Globe, Clock as ClockIcon, Activity, MapPin, Info, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { getUTCTime, getLocalTime } = useTime();
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [hoveredSession, setHoveredSession] = useState(null);

  const utcTime = getUTCTime();
  const localTime = getLocalTime();

  const activeSessions = useMemo(() => {
    const hour = utcTime.totalHours;
    return TRADING_SESSIONS.filter(s => {
      if (s.close > s.open) {
        return hour >= s.open && hour < s.close;
      } else {
        // Spans midnight
        return hour >= s.open || hour < s.close;
      }
    });
  }, [utcTime.totalHours]);

  const isVolatile = useMemo(() => {
    const hour = utcTime.totalHours;
    return hour >= VOLATILITY_OVERLAP.start && hour < VOLATILITY_OVERLAP.end;
  }, [utcTime.totalHours]);

  const displayTime = isLocalMode ? localTime : utcTime;

  return (
    <div className="min-h-screen bg-trading-background text-zinc-100 p-4 md:p-8 font-sans selection:bg-trading-newyork selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              SESSION CLOCK
            </h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-trading-newyork" />
              Global Forex Trading Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setIsLocalMode(false)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!isLocalMode ? 'bg-zinc-100 text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
            >
              UTC
            </button>
            <button
              onClick={() => setIsLocalMode(true)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isLocalMode ? 'bg-zinc-100 text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
            >
              LOCAL
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Digital Clock & Status */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">

            {/* Digital Clock Card */}
            <div className="glass-card p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <ClockIcon className="w-24 h-24" />
              </div>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] mb-4">
                {isLocalMode ? 'Your Local Time' : 'Coordinated Universal Time'}
              </p>
              <h2 className="text-6xl font-black tabular-nums tracking-tighter">
                {displayTime.hours.toString().padStart(2, '0')}
                <span className="animate-pulse opacity-50">:</span>
                {displayTime.minutes.toString().padStart(2, '0')}
              </h2>
              <p className="text-zinc-500 mt-2 font-mono flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {displayTime.timezone || 'UTC (+00:00)'}
              </p>
            </div>

            {/* Market Status Card */}
            <div className="glass-card p-8 rounded-[2rem] border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Active Sessions</h3>
                {isVolatile && (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    High Volatility
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activeSessions.length > 0 ? (
                  activeSessions.map(session => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between group cursor-pointer transition-all duration-300 p-2 rounded-xl ${hoveredSession?.id === session.id ? 'bg-white/5' : ''}`}
                      onMouseEnter={() => setHoveredSession(session)}
                      onMouseLeave={() => setHoveredSession(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: session.color }}></div>
                        <div>
                          <p className="font-bold text-white group-hover:translate-x-1 transition-transform">{session.name}</p>
                          <p className="text-xs text-zinc-500">{session.region}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-sm">
                        <p className="text-zinc-300">OPEN</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{session.open}:00 UTC</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm italic">No major markets currently open.</p>
                )}
              </div>
            </div>

            {/* Volatility Indicator */}
            {isVolatile && (
              <div className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/10 rounded-[2rem] space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <Activity className="w-5 h-5" />
                  <span className="font-black uppercase text-xs tracking-widest">Volatility Core Active</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  The <span className="text-white font-bold">London–New York</span> overlap is currently active.
                  Expect maximum liquidity and movement across all major USD and EUR pairs.
                </p>
              </div>
            )}
          </div>

          {/* Center Panel: Analog Clock */}
          <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2 py-4">
            <Clock
              utcTime={utcTime}
              activeSessions={activeSessions}
              hoveredSession={hoveredSession}
              setHoveredSession={setHoveredSession}
            />
          </div>

          {/* Right Panel: Legend & Meta */}
          <div className="lg:col-span-3 space-y-6 order-3">
            <div className="glass-card p-6 rounded-[2rem] border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Market Guide
              </h3>
              <div className="space-y-6">
                {TRADING_SESSIONS.map(s => (
                  <div
                    key={s.id}
                    className={`space-y-2 cursor-pointer transition-all duration-300 p-2 rounded-xl ${hoveredSession?.id === s.id ? 'bg-white/5' : ''}`}
                    onMouseEnter={() => setHoveredSession(s)}
                    onMouseLeave={() => setHoveredSession(null)}
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-300" style={{ color: s.color }}>{s.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{s.open}:00 - {s.close}:00</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full opacity-50"
                        style={{
                          backgroundColor: s.color,
                          width: `${((s.close > s.open ? s.close - s.open : 24 - s.open + s.close) / 24) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-white/5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Trade Ideas</h3>
              <div className="p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Focus Pair</span>
                  <span className="text-xs font-black text-trading-newyork">EUR/USD</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Highest volume occurs when Europe and New York trading hours overlap (13:00 - 17:00 UTC).
                </p>
                <ArrowUpRight className="w-4 h-4 text-zinc-700 ml-auto" />
              </div>
            </div>
          </div>

        </main>

        <footer className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
          <p>© 2026 GLOBAL TRADING SYSTEMS</p>
          <div className="flex gap-8">
            <span>Server Time: {utcTime.hours}:{utcTime.minutes} UTC</span>
            <span>API Status: Operational</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
