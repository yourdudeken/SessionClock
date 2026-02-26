import React, { useState } from 'react';
import { TRADING_SESSIONS } from '../data/sessions';

const ClockArc = ({ session, isActive, onHover, radius = 160 }) => {
    const { open, close, color, name } = session;
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
            className={`clock-arc opacity-70 hover:opacity-100 transition-all duration-300 ${isActive ? 'animate-pulse-active opacity-100' : ''}`}
            onMouseEnter={() => onHover(session)}
            onMouseLeave={() => onHover(null)}
            style={{ strokeDasharray: isActive ? 'none' : 'none' }}
        />
    );
};

export const Clock = ({ utcTime, activeSessions, hoveredSession, setHoveredSession }) => {
    const cx = 200;
    const cy = 200;

    const hourMarkings = Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const rOuter = 185;
        const rInner = 175;
        const rText = 195;

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

    const hourHandAngle = (utcTime.totalHours / 24) * 360 - 90;
    const rad = (hourHandAngle * Math.PI) / 180;
    const handLength = 140;
    const handX = cx + handLength * Math.cos(rad);
    const handY = cy + handLength * Math.sin(rad);

    // Define radius for each session for visual separation
    const sessionRadii = {
        sydney: 164,
        tokyo: 154,
        london: 164,
        newyork: 154
    };

    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                {/* Background circle */}
                <circle cx={cx} cy={cy} r="180" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

                {/* Hour Markings */}
                {hourMarkings.map((m, i) => (
                    <g key={i}>
                        <line
                            x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
                            stroke={i % 6 === 0 ? "#71717a" : "#3f3f46"}
                            strokeWidth={i % 6 === 0 ? 2 : 1}
                        />
                        {i % 3 === 0 && (
                            <text
                                x={m.tx} y={m.ty}
                                fill="#a1a1aa"
                                fontSize="12"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="font-medium"
                            >
                                {m.label}
                            </text>
                        )}
                    </g>
                ))}

                {/* London-NY Overlap Highlight (Static Background) */}
                <ClockArc
                    radius={159}
                    session={{ open: 13, close: 17, color: 'rgba(255,165,0,0.05)', name: 'Volatility Core' }}
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

                {/* Smooth Hand */}
                <g className="transition-transform duration-1000 ease-linear">
                    <line
                        x1={cx} y1={cy} x2={handX} y2={handY}
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    />
                    <circle cx={cx} cy={cy} r="6" fill="white" />
                    <circle cx={cx} cy={cy} r="2" fill="#18181b" />
                </g>
            </svg>

            {/* Tooltip Overlay */}
            {hoveredSession && (
                <div
                    className="absolute z-50 glass-card p-4 rounded-2xl w-64 pointer-events-none transition-all duration-200"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        border: `1px solid ${hoveredSession.color}44`
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
