import React from 'react';
import { TRADING_SESSIONS } from '../data/sessions';

const ClockArc = ({ session, isActive, onHover, radius = 160, isPowerHour = false }) => {
  const { open, close, color } = session;
  const cx = 200;
  const cy = 200;

  const calculatePosition = (hour) => {
    const angleInRadians = ((hour / 24) * 360 - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians)
    };
  };

  const start = calculatePosition(open);
  const end = calculatePosition(close);

  const largeArcFlag = (close < open ? (24 - open + close) : (close - open)) > 12 ? 1 : 0;

  const d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");

  return (
    <g>
      {/* Glow effect for Power Hour */}
      {isActive && isPowerHour && (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={28}
          strokeLinecap="round"
          className="opacity-20 blur-md animate-pulse"
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={isActive ? 20 : 16}
        strokeLinecap="round"
        className={`clock-arc transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
        onMouseEnter={() => onHover(session)}
        onMouseLeave={() => onHover(null)}
        style={{
          cursor: 'pointer',
          pointerEvents: 'visibleStroke',
          filter: isActive && isPowerHour ? `drop-shadow(0 0 8px ${color})` : 'none'
        }}
      />
    </g>
  );
};

export const Clock = ({ utcTime, activeSessions, hoveredSession, setHoveredSession, sessionAnalytics = {} }) => {
  const cx = 200;
  const cy = 200;

  // 24 Hour Markings & Numbers
  const hourMarkings = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const rOuter = 188;
    const rInner = 178;
    const rText = 220;

    return {
      x1: cx + rInner * Math.cos(rad),
      y1: cy + rInner * Math.sin(rad),
      x2: cx + rOuter * Math.cos(rad),
      y2: cy + rOuter * Math.sin(rad),
      tx: cx + rText * Math.cos(rad),
      ty: cy + rText * Math.sin(rad),
      label: i.toString().padStart(2, '0')
    };
  });

  // 60 Minute/Second Ticks
  const minuteTicks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i / 60) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const rOuter = 175;
    const rInner = 170;

    return {
      x1: cx + rInner * Math.cos(rad),
      y1: cy + rInner * Math.sin(rad),
      x2: cx + rOuter * Math.cos(rad),
      y2: cy + rOuter * Math.sin(rad)
    };
  });

  // Mock Economic News Markers (Bloomberg dots)
  const newsHours = [8, 13, 14, 22]; // Hours with news from Dashboard news feed
  const newsMarkers = newsHours.map(h => {
    const angle = (h / 24) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const rNews = 238;
    return {
      x: cx + rNews * Math.cos(rad),
      y: cy + rNews * Math.sin(rad)
    };
  });

  // Hand Angle Calculations
  const hourHandAngle = (utcTime.totalHours / 24) * 360 - 90;
  const minuteHandAngle = (utcTime.minutes / 60) * 360 - 90;
  const secondHandAngle = (utcTime.seconds / 60) * 360 - 90;

  const getHandPos = (angle, length) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + length * Math.cos(rad),
      y: cy + length * Math.sin(rad)
    };
  };

  const hourHand = getHandPos(hourHandAngle, 110);
  const minuteHand = getHandPos(minuteHandAngle, 150);
  const secondHand = getHandPos(secondHandAngle, 165);

  const sessionRadii = {
    sydney: 156,
    tokyo: 144,
    singapore: 132,
    frankfurt: 156,
    london: 144,
    newyork: 132
  };

  return (
    <div className="relative w-full aspect-square max-w-[550px] mx-auto scale-90 md:scale-100" style={{ isolation: 'isolate' }}>
      <svg viewBox="0 0 460 460" className="w-full h-full drop-shadow-2xl overflow-visible" style={{ pointerEvents: 'none' }}>
        <g transform="translate(30, 30)">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r="180" fill="#09090b" stroke="#1f1f23" strokeWidth="1" />

          {/* Minute Ticks */}
          {minuteTicks.map((m, i) => (
            <line
              key={`m-${i}`}
              x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
              stroke={i % 5 === 0 ? "#3f3f46" : "#18181b"}
              strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
            />
          ))}

          {/* Hour Markings & Numbers */}
          {hourMarkings.map((m, i) => (
            <g key={`h-${i}`}>
              <line
                x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
                stroke={i % 6 === 0 ? "#52525b" : "#27272a"}
                strokeWidth={i % 6 === 0 ? 2 : 1}
              />
              <text
                x={m.tx} y={m.ty}
                fill={i % 6 === 0 ? "#a1a1aa" : "#3f3f46"}
                fontSize={i % 6 === 0 ? "13" : "10"}
                fontWeight={i % 6 === 0 ? "900" : "500"}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono transition-colors duration-300"
              >
                {m.label}
              </text>
            </g>
          ))}

          {/* News Markers */}
          {newsMarkers.map((n, i) => (
            <circle key={`news-${i}`} cx={n.x} cy={n.y} r="2.5" fill="#ef4444" className="animate-pulse shadow-[0_0_10px_#ef4444]" />
          ))}

          {/* Overlap Highlight */}
          <ClockArc
            radius={150}
            session={{ open: 13, close: 17, color: 'rgba(255,165,0,0.03)' }}
            isActive={false}
            onHover={() => { }}
          />

          {/* Session Arcs */}
          {TRADING_SESSIONS.map(session => (
            <ClockArc
              key={session.id}
              session={session}
              radius={sessionRadii[session.id] || 160}
              isActive={activeSessions.some(s => s.id === session.id)}
              isPowerHour={sessionAnalytics[session.id]?.isPowerHour}
              onHover={setHoveredSession}
            />
          ))}

          {/* Real-time Hands */}
          <g style={{ pointerEvents: 'none' }}>
            {/* Minute Hand */}
            <line
              x1={cx} y1={cy} x2={minuteHand.x} y2={minuteHand.y}
              stroke="#52525b"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
            />

            {/* Hour Hand */}
            <line
              x1={cx} y1={cy} x2={hourHand.x} y2={hourHand.y}
              stroke="white"
              strokeWidth="4"
              strokeLinecap="square"
            />

            {/* Second Hand */}
            <g>
              <line
                x1={cx} y1={cy} x2={secondHand.x} y2={secondHand.y}
                stroke="#ef4444"
                strokeWidth="1"
              />
              <circle cx={cx} cy={cy} r="2" fill="#ef4444" />
            </g>
          </g>
        </g>
      </svg>

      {/* Tooltip Overlay */}
      {hoveredSession && (
        <div
          className="absolute z-50 glass-card p-6 rounded-[2rem] w-72 pointer-events-none transition-all duration-300 shadow-2xl"
          style={{
            top: '50.5%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderBottom: `2px solid ${hoveredSession.color}`,
            background: 'rgba(9, 9, 11, 0.95)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hoveredSession.color }}></div>
              <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs">{hoveredSession.name}</h3>
            </div>
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{hoveredSession.region}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase">Start</p>
                <p className="text-sm font-mono text-zinc-100">{hoveredSession.open.toString().padStart(2, '0')}:00</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-zinc-500 uppercase">End</p>
                <p className="text-sm font-mono text-zinc-100">{hoveredSession.close.toString().padStart(2, '0')}:00</p>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest text-center">Liquidity Focus</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {hoveredSession.currencyPairs?.map(cp => (
                  <span key={cp} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black text-zinc-400 border border-white/5">
                    {cp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
