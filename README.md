# Global Trading Session Clock

A professional-grade, high-precision web application designed for forex traders to track global market rhythms in real-time. Built with a "Terminal" aesthetic, this tool visualizes market liquidity, session overlaps, and economic event markers.

## Core Features

- **24-Hour Circular Dial**: A high-fidelity SVG analog clock representing the full 00-23 UTC cycle with precision hour and minute markings.
- **Dynamic Hub Visualization**: Visual arcs for major trading hubs:
    - **Sydney** (Cyan)
    - **Tokyo** (Purple)
    - **Singapore** (Pink) - *New*
    - **Frankfurt** (Indigo) - *New*
    - **London** (Amber)
    - **New York** (Emerald)
- **Live Terminal Analytics**:
    - **Session Countdowns**: Real-time "Closes In" and "Opens In" timers for every global hub.
    - **Real-time Progress Bars**: Visual flow indicators for active markets.
    - **"Power Hour" Intelligence**: Automated "Glow & Pulse" effects during the first and last hours of a session to highlight peak volatility.
- **Economic Intelligence**:
    - **Market Alerts Feed**: A Bloomberg-style news ticker showing high-impact economic releases (NFP, CPI, etc.).
    - **News Event Markers**: Visual dots on the clock periphery indicating the exact hour of major data drops.
    - **Liquidity Focus**: Dynamic pair highlighting (e.g., EUR/USD, AUD/JPY) based on the current active session.
- **Precision Timekeeping**:
    - Custom synchronized Hour, Minute, and Second hands.
    - Seamless toggle between Coordinated Universal Time (UTC) and Local Time zones.
- **Professional Fintech UI**: High-contrast dark mode with glassmorphism, tailored for 24/7 monitoring.

## Trading Session Times (UTC)

- Sydney: 22:00 - 07:00
- Tokyo: 00:00 - 09:00
- Singapore: 01:00 - 10:00
- Frankfurt: 07:00 - 16:00
- London: 08:00 - 17:00
- New York: 13:00 - 22:00

## Technical Requirements

- **Framework**: React (JSX)
- **Styling**: Tailwind CSS with custom terminal-glow animations
- **Icons**: Lucide React
- **Rendering**: Scalable Vector Graphics (SVG) for the core clock engine

## Development

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Design Philosophy

The application follows the **Terminal Intelligence** philosophy: 
1. **No Placeholders**: Every data point is live or mathematically calculated.
2. **Visual Hierarchy**: Critical volatility events (Power Hours, Overlaps) are prioritized through motion and glow.
3. **Low Latency**: Optimized SVG rendering for a smooth 1Hz (per second) update cycle.
