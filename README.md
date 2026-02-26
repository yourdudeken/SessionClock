# Global Trading Session Clock

A professional, high-precision web application for tracking global forex trading sessions in real-time. This tool provides a visual representation of market activity across the four major sessions: Sydney, Tokyo, London, and New York.

## Core Features

- 24-Hour Circular Clock: A custom SVG analog-style dial representing a full day cycle.
- Dynamic Session Arcs: Visual representation of trading hours with distinct colors and radius separation for clarity.
- Interactive Tooltips: Real-time information on session hours and major currency pairs traded.
- Market Volatility Indicator: Specialized highlighting for the high-liquidity London-New York overlap.
- Multi-Timezone Support: Toggle between Coordinated Universal Time (UTC) and Local Time.
- Responsive Design: Optimized for both desktop dashboards and mobile devices.
- Modern Fintech UI: Dark theme with glassmorphism effects and smooth animations.

## Trading Session Times (UTC)

- Sydney: 22:00 - 07:00
- Tokyo: 00:00 - 09:00
- London: 08:00 - 17:00
- New York: 13:00 - 22:00

## Technical Requirements

- React (JSX)
- Tailwind CSS
- Lucide React Icons
- SVG-based rendering
- No external UI frameworks

## Development

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

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

The application is built with a minimal, data-focused approach. It prioritizes clarity and visual hierarchy to help traders quickly identify market overlaps and current session status at a glance.
