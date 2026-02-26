import React, { useState, useMemo, useEffect } from 'react';
import { Clock } from './components/Clock';
import { useTime } from './hooks/useTime';
import { TRADING_SESSIONS, VOLATILITY_OVERLAP } from './data/sessions';
import { Globe, Clock as ClockIcon, Activity, MapPin, Info, ArrowUpRight, AlertCircle, Timer } from 'lucide-react';

// Simulated News Feed to mimic Bloomberg terminal
const MOCK_NEWS = [
  { id: 1, time: '13:00', impact: 'HIGH', title: 'US Non-Farm Payrolls (NFP)', pair: 'USD' },
  { id: 2, time: '14:30', impact: 'MED', title: 'Existing Home Sales', pair: 'USD' },
  { id: 3, time: '08:00', impact: 'HIGH', title: 'UK CPI (Year-on-Year)', pair: 'GBP' },
  { id: 4, time: '01:30', impact: 'MED', title: 'AU Unemployment Rate', pair: 'AUD' },
];

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
        return hour >= s.open || hour < s.close;
      }
    });
  }, [utcTime.totalHours]);

  const isVolatile = useMemo(() => {
    const hour = utcTime.totalHours;
    return hour >= VOLATILITY_OVERLAP.start && hour < VOLATILITY_OVERLAP.end;
  }, [utcTime.totalHours]);

  // Calculate countdowns and progress for each session
  const sessionAnalytics = useMemo(() => {
    const currentHour = utcTime.totalHours;

    return TRADING_SESSIONS.reduce((acc, s) => {
      let timeLeft, progress = 0, isPowerHour = false;
      const isActive = activeSessions.some(as => as.id === s.id);

      if (isActive) {
        // Time until close
        let hoursRemaining = s.close - currentHour;
        if (hoursRemaining < 0) hoursRemaining += 24;

        const totalDuration = s.close > s.open ? s.close - s.open : 24 - s.open + s.close;
        progress = ((totalDuration - hoursRemaining) / totalDuration) * 100;

        // Power Hour: First 60 mins or Last 60 mins
        const minutesSinceOpen = (currentHour - s.open + 24) % 24 * 60;
        const minutesUntilClose = hoursRemaining * 60;
        isPowerHour = minutesSinceOpen <= 60 || minutesUntilClose <= 60;

        acc[s.id] = {
          status: 'OPEN',
          countdown: `${Math.floor(hoursRemaining)}h ${Math.floor((hoursRemaining % 1) * 60)}m`,
          progress,
          isPowerHour
        };
      } else {
        // Time until open
        let hoursUntilOpen = s.open - currentHour;
        if (hoursUntilOpen < 0) hoursUntilOpen += 24;

        acc[s.id] = {
          status: 'CLOSED',
          countdown: `${Math.floor(hoursUntilOpen)}h ${Math.floor((hoursUntilOpen % 1) * 60)}m`,
          progress: 0,
          isPowerHour: false
        };
      }
      return acc;
    }, {});
  }, [utcTime.totalHours, activeSessions]);

  const displayTime = isLocalMode ? localTime : utcTime;

  return (
    <div className="min-h-screen bg-trading-background text-zinc-100 p-4 md:p-8 font-sans selection:bg-trading-newyork selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Activity className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                SESSION CLOCK
              </h1>
              <p className="text-zinc-500 font-medium flex items-center gap-2 text-sm">
                <Globe className="w-3 h-3 text-trading-newyork" />
                Global Forex Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setIsLocalMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${!isLocalMode ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              UTC
            </button>
            <button
              onClick={() => setIsLocalMode(true)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${isLocalMode ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              LOCAL
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Digital Clock & Market Flow */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">

            {/* Digital Clock Card */}
            <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <ClockIcon className="w-24 h-24" />
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                {isLocalMode ? 'Your Local Time' : 'Coordinated Universal Time'}
              </p>
              <h2 className="text-7xl font-black tabular-nums tracking-tighter shadow-sm">
                {displayTime.hours.toString().padStart(2, '0')}
                <span className="animate-pulse opacity-30">:</span>
                {displayTime.minutes.toString().padStart(2, '0')}
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <p className="text-zinc-400 font-mono text-xs flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  {displayTime.timezone || 'UTC+0'}
                </p>
                {isVolatile && (
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
            </div>

            {/* Active Sessions with Countdowns & Progress */}
            <div className="glass-card p-8 rounded-[2rem] overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Live Session Flow</h3>
                <Activity className="w-4 h-4 text-zinc-600" />
              </div>

              <div className="space-y-6">
                {activeSessions.map(session => (
                  <div
                    key={session.id}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredSession(session)}
                    onMouseLeave={() => setHoveredSession(null)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-6 rounded-full ${sessionAnalytics[session.id].isPowerHour ? 'animate-pulse' : ''}`} style={{ backgroundColor: session.color }}></div>
                        <div>
                          <p className="font-bold text-sm text-white">{session.name}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{session.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-500 uppercase">Closes In</p>
                        <p className="text-xs font-mono text-zinc-200">{sessionAnalytics[session.id].countdown}</p>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full transition-all duration-1000"
                        style={{
                          width: `${sessionAnalytics[session.id].progress}%`,
                          backgroundColor: session.color,
                          boxShadow: sessionAnalytics[session.id].isPowerHour ? `0 0 10px ${session.color}` : 'none'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                {activeSessions.length === 0 && <p className="text-zinc-600 text-xs italic">Global markets in dormant state.</p>}
              </div>
            </div>

            {/* Economic News Feed (Bloomberg Style) */}
            <div className="glass-card p-8 rounded-[2rem] overflow-hidden border-red-500/10 bg-red-500/[0.02]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Market Alerts
                </h3>
              </div>
              <div className="space-y-4">
                {MOCK_NEWS.map(news => (
                  <div key={news.id} className="flex gap-4 border-l-2 border-zinc-800 pl-4 py-1 hover:border-red-500 transition-all cursor-default group">
                    <span className="text-[10px] font-mono text-zinc-500 pt-0.5">{news.time}</span>
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-200 group-hover:text-white transition-colors">{news.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black px-1.5 rounded ${news.impact === 'HIGH' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>
                          {news.impact}
                        </span>
                        <span className="text-[9px] font-black text-zinc-600 tracking-tighter">{news.pair} IMPACT</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel: Interactive Map & Analog Display */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative group">
              <Clock
                utcTime={utcTime}
                activeSessions={activeSessions}
                hoveredSession={hoveredSession}
                setHoveredSession={setHoveredSession}
                sessionAnalytics={sessionAnalytics}
              />
            </div>
          </div>

          {/* Right Panel: Terminal Data & Legend */}
          <div className="lg:col-span-3 space-y-6 order-3">
            <div className="glass-card p-8 rounded-[2rem] overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                <Timer className="w-3 h-3" />
                Session Queue
              </h3>
              <div className="space-y-6">
                {TRADING_SESSIONS.map(s => {
                  const analytics = sessionAnalytics[s.id];
                  const isOpen = analytics.status === 'OPEN';

                  return (
                    <div
                      key={s.id}
                      className={`space-y-3 cursor-pointer transition-all duration-300 p-3 rounded-2xl border border-transparent ${hoveredSession?.id === s.id ? 'bg-white/5 border-white/5' : ''}`}
                      onMouseEnter={() => setHoveredSession(s)}
                      onMouseLeave={() => setHoveredSession(null)}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-black uppercase tracking-widest ${isOpen ? 'text-white' : 'text-zinc-600'}`}>
                          {s.name}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${isOpen ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                          {analytics.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-500">{s.open}:00 - {s.close}:00</span>
                        <span className={isOpen ? 'text-zinc-200' : 'text-zinc-600'}>
                          {isOpen ? 'END' : 'START'}: {analytics.countdown}
                        </span>
                      </div>
                      <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden opacity-50">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            backgroundColor: s.color,
                            width: isOpen ? `${analytics.progress}%` : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2rem] overflow-hidden space-y-4 border-trading-newyork/10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-tight">Liquidity Intelligence</h3>
              <div className="p-4 bg-trading-newyork/[0.03] rounded-2xl border border-trading-newyork/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Hot Pairs</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-50"></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeSessions[0]?.currencyPairs?.map(pair => (
                    <span key={pair} className="text-[10px] font-black px-2 py-1 bg-trading-newyork/10 text-trading-newyork rounded-lg">
                      {pair}
                    </span>
                  ))}
                  {activeSessions.length === 0 && <span className="text-[10px] text-zinc-600">Waiting for liquidity...</span>}
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">
                  Currently prioritizing {activeSessions[0]?.name || 'next major session'} volume flow.
                </p>
              </div>
            </div>
          </div>

        </main>

        <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">
          <p>© 2026 GLOBAL TRADING SYSTEMS | LAYER 1 TERMINAL</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
              LIVE CONNECTED
            </span>
            <span>DATA REFRESH: 1000MS</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
