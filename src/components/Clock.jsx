import React from 'react';
import { TRADING_SESSIONS } from '../data/sessions';

const ClockArc = ({ session, isActive, onHover, radius = 160 }) => {
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
        <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={isActive ? 20 : 16}
            strokeLinecap="round"
            className={`clock-arc transition-all duration-300 ${isActive ? 'animate-pulse-active' : ''}`}
            onMouseEnter={() => onHover(session)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: 'pointer', pointerEvents: 'visibleStroke' }}
        />
    );
};

export const Clock = ({ utcTime, activeSessions, hoveredSession, setHoveredSession }) => {
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
        london: 156,
        newyork: 144
    };

    return (
        <div className="relative w-full aspect-square max-w-[550px] mx-auto scale-90 md:scale-100" style={{ isolation: 'isolate' }}>
            <svg viewBox="0 0 460 460" className="w-full h-full drop-shadow-2xl overflow-visible" style={{ pointerEvents: 'none' }}>
                <g transform="translate(30, 30)">
                    {/* Background circle */}
                    <circle cx={cx} cy={cy} r="180" fill="#18181b" stroke="#3f3f46" strokeWidth="1" style={{ pointerEvents: 'none' }} />

                    {/* Minute Ticks */}
                    {minuteTicks.map((m, i) => (
                        <line
                            key={`m-${i}`}
                            x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
                            stroke={i % 5 === 0 ? "#52525b" : "#27272a"}
                            strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
                            style={{ pointerEvents: 'none' }}
                        />
                    ))}

                    {/* Hour Markings & Numbers */}
                    {hourMarkings.map((m, i) => (
                        <g key={`h-${i}`} style={{ pointerEvents: 'none' }}>
                            <line
                                x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
                                stroke={i % 6 === 0 ? "#71717a" : "#3f3f46"}
                                strokeWidth={i % 6 === 0 ? 2 : 1}
                            />
                            <text
                                x={m.tx} y={m.ty}
                                fill={i % 6 === 0 ? "#e4e4e7" : "#71717a"}
                                fontSize={i % 6 === 0 ? "14" : "11"}
                                fontWeight={i % 6 === 0 ? "bold" : "normal"}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="font-mono transition-colors duration-300"
                            >
                                {m.label}
                            </text>
                        </g>
                    ))}

                    {/* Overlap Highlight */}
                    <ClockArc
                        radius={150}
                        session={{ open: 13, close: 17, color: 'rgba(255,165,0,0.05)' }}
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
                            onHover={setHoveredSession}
                        />
                    ))}

                    {/* Hands - with pointer-events-none to let hover pass through to arcs */}
                    <g style={{ pointerEvents: 'none' }}>
                        {/* Minute Hand */}
                        <line
                            x1={cx} y1={cy} x2={minuteHand.x} y2={minuteHand.y}
                            stroke="#a1a1aa"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_4px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out"
                        />

                        {/* Hour Hand */}
                        <line
                            x1={cx} y1={cy} x2={hourHand.x} y2={hourHand.y}
                            stroke="white"
                            strokeWidth="5"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        />

                        {/* Second Hand */}
                        <g className="transition-all duration-300 ease-in-out">
                            <line
                                x1={cx} y1={cy} x2={secondHand.x} y2={secondHand.y}
                                stroke="#10b981"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            />
                            <circle cx={cx} cy={cy} r="3" fill="#10b981" />
                        </g>

                        {/* Center Cap */}
                        <circle cx={cx} cy={cy} r="6" fill="white" />
                        <circle cx={cx} cy={cy} r="2" fill="#18181b" />
                    </g>
                </g>
            </svg>

            {/* Tooltip Overlay */}
            {hoveredSession && (
                <div
                    className="absolute z-50 glass-card p-4 rounded-2xl w-64 pointer-events-none transition-all duration-200"
                    style={{
                        top: '50.5%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        border: `1px solid ${hoveredSession.color}44`,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredSession.color }}></div>
                        <h3 className="font-bold text-white uppercase tracking-wider">{hoveredSession.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm text-zinc-400">
                        <p className="flex justify-between">
                            <span>Open</span>
                            <span className="text-zinc-100 font-mono">{hoveredSession.open.toString().padStart(2, '0')}:00 UTC</span>
                        </p>
                        <p className="flex justify-between">
                            <span>Close</span>
                            <span className="text-zinc-100 font-mono">{hoveredSession.close.toString().padStart(2, '0')}:00 UTC</span>
                        </p>
                        <div className="mt-3 pt-3 border-t border-zinc-800">
                            <p className="mb-1 text-xs opacity-50 uppercase font-semibold text-zinc-500">Major Pairs</p>
                            <div className="flex flex-wrap gap-1">
                                {hoveredSession.currencyPairs?.map(cp => (
                                    <span key={cp} className="px-2 py-0.5 bg-zinc-800/50 rounded text-xs text-zinc-300 border border-zinc-700">
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
