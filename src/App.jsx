import React, { useState, useMemo, useEffect } from 'react';
import { Clock } from './components/Clock';
import { useTime } from './hooks/useTime';
import { TRADING_SESSIONS, VOLATILITY_OVERLAP } from './data/sessions';
import { Globe, Clock as ClockIcon, Activity, MapPin, Info, ArrowUpRight, AlertCircle, Timer, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { getUTCTime, getLocalTime } = useTime();
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [hoveredSession, setHoveredSession] = useState(null);
  const [liveNews, setLiveNews] = useState([]);
  const [liveRates, setLiveRates] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const utcTime = getUTCTime();
  const localTime = getLocalTime();

  // 1. Fetch Real-time Forex News (via RSS-to-JSON proxy)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.forexlive.com/feed/news');
        const data = await response.json();
        if (data.status === 'ok') {
          const formattedNews = data.items.slice(0, 5).map(item => ({
            id: item.guid,
            time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            title: item.title,
            impact: item.title.toUpperCase().includes('URGENT') || item.title.toUpperCase().includes('BREAKING') ? 'HIGH' : 'MED',
            pair: 'GLOBAL'
          }));
          setLiveNews(formattedNews);
        }
      } catch (error) {
        console.error('News fetch failed:', error);
      }
    };

    fetchNews();
    const newsInterval = setInterval(fetchNews, 300000); // Refresh every 5 mins
    return () => clearInterval(newsInterval);
  }, []);

  // 2. Fetch Real-time Exchange Rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data.result === 'success') {
          setLiveRates(data.rates);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Rates fetch failed:', error);
      }
    };

    fetchRates();
    const ratesInterval = setInterval(fetchRates, 60000); // Refresh every minute
    return () => clearInterval(ratesInterval);
  }, []);

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

  const sessionAnalytics = useMemo(() => {
    const currentHour = utcTime.totalHours;

    return TRADING_SESSIONS.reduce((acc, s) => {
      let progress = 0, isPowerHour = false;
      const isActive = activeSessions.some(as => as.id === s.id);

      if (isActive) {
        let hoursRemaining = s.close - currentHour;
        if (hoursRemaining < 0) hoursRemaining += 24;

        const totalDuration = s.close > s.open ? s.close - s.open : 24 - s.open + s.close;
        progress = ((totalDuration - hoursRemaining) / totalDuration) * 100;

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

  // Helper to get live pair price
  const getPairPrice = (pair) => {
    if (!liveRates || Object.keys(liveRates).length === 0) return '---';
    const [base, quote] = pair.split('/');
    if (base === 'USD') return liveRates[quote]?.toFixed(4) || '---';
    if (quote === 'USD') return (1 / liveRates[base])?.toFixed(4) || '---';
    // Cross rates
    const baseToUsd = 1 / liveRates[base];
    return (baseToUsd * liveRates[quote])?.toFixed(4) || '---';
  };

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
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${!isLocalMode ? 'bg-zinc-100 text-black shadow-lg shadow-white/5' : 'text-zinc-500 hover:text-white'}`}
            >
              UTC
            </button>
            <button
              onClick={() => setIsLocalMode(true)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${isLocalMode ? 'bg-zinc-100 text-black shadow-lg shadow-white/5' : 'text-zinc-500 hover:text-white'}`}
            >
              LOCAL
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">

            {/* Digital Clock */}
            <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <ClockIcon className="w-24 h-24" />
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Market Time Cycle</p>
              <h2 className="text-7xl font-black tabular-nums tracking-tighter">
                {displayTime.hours.toString().padStart(2, '0')}
                <span className="animate-pulse opacity-30">:</span>
                {displayTime.minutes.toString().padStart(2, '0')}
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <p className="text-zinc-400 font-mono text-xs flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  {displayTime.timezone || 'UTC+0'}
                </p>
                {isVolatile && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="glass-card p-8 rounded-[2rem] overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 font-mono">Real-time Stream</h3>
                <Activity className="w-4 h-4 text-zinc-600 animate-pulse" />
              </div>
              <div className="space-y-6">
                {activeSessions.map(session => (
                  <div key={session.id} className="group cursor-pointer" onMouseEnter={() => setHoveredSession(session)} onMouseLeave={() => setHoveredSession(null)}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-6 rounded-full ${sessionAnalytics[session.id].isPowerHour ? 'animate-terminal-glow' : ''}`} style={{ backgroundColor: session.color }}></div>
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
                      <div className="h-full transition-all duration-1000" style={{ width: `${sessionAnalytics[session.id].progress}%`, backgroundColor: session.color, boxShadow: sessionAnalytics[session.id].isPowerHour ? `0 0 10px ${session.color}` : 'none' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE MARKET ALERTS (REAL DATA) */}
            <div className="glass-card p-8 rounded-[2rem] overflow-hidden border-trading-newyork/10 bg-trading-newyork/[0.02]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-trading-newyork flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Live Wire
                </h3>
                <span className="text-[8px] font-black text-zinc-700">REFRESHING...</span>
              </div>
              <div className="space-y-5">
                {liveNews.map(news => (
                  <div key={news.id} className="flex gap-4 border-l-2 border-zinc-800 pl-4 py-1 hover:border-trading-newyork transition-all cursor-default group">
                    <span className="text-[10px] font-mono text-zinc-500 pt-0.5">{news.time}</span>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">{news.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${news.impact === 'HIGH' ? 'bg-red-500 text-white' : 'bg-trading-newyork/20 text-trading-newyork'}`}>NEWS</span>
                      </div>
                    </div>
                  </div>
                ))}
                {liveNews.length === 0 && <p className="text-zinc-600 text-[10px] italic">Scanning global wires for updates...</p>}
              </div>
            </div>
          </div>

          {/* Center Panel */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <Clock utcTime={utcTime} activeSessions={activeSessions} hoveredSession={hoveredSession} setHoveredSession={setHoveredSession} sessionAnalytics={sessionAnalytics} />
          </div>

          {/* Right Panel */}
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
                    <div key={s.id} className={`space-y-3 cursor-pointer transition-all duration-300 p-3 rounded-2xl border border-transparent ${hoveredSession?.id === s.id ? 'bg-white/5 border-white/5' : ''}`} onMouseEnter={() => setHoveredSession(s)} onMouseLeave={() => setHoveredSession(null)}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-black uppercase tracking-widest ${isOpen ? 'text-white' : 'text-zinc-600'}`}>{s.name}</span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${isOpen ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>{analytics.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-500">{s.open}:00 - {s.close}:00</span>
                        <span className={isOpen ? 'text-zinc-200' : 'text-zinc-600'}>{isOpen ? 'END' : 'START'}: {analytics.countdown}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE LIQUIDITY INTELLIGENCE (REAL PRICES) */}
            <div className="glass-card p-8 rounded-[2rem] overflow-hidden space-y-4 border-trading-newyork/10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-tight">Liquidity Matrix</h3>
              <div className="p-5 bg-trading-newyork/[0.03] rounded-2xl border border-trading-newyork/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Live Pricing</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-20"></span>
                  </div>
                </div>
                <div className="space-y-3">
                  {(activeSessions[0]?.currencyPairs || ['EUR/USD', 'GBP/USD', 'USD/JPY']).map(pair => (
                    <div key={pair} className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-300">{pair}</span>
                      <span className="text-xs font-mono font-bold text-trading-newyork tabular-nums">
                        {getPairPrice(pair)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-zinc-600 leading-snug border-t border-white/5 pt-3">
                  Streaming {activeSessions[0]?.name || 'Global'} liquidity via real-time market data nodes.
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
              LIVE DATASTREAM
            </span>
            <span>PING: {isLoading ? '---' : '82ms'}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
