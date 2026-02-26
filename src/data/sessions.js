export const TRADING_SESSIONS = [
    {
        id: 'sydney',
        name: 'Sydney',
        open: 22,
        close: 7,
        color: '#00f2ff', // Cyan
        currencyPairs: ['AUD/USD', 'NZD/USD', 'AUD/JPY'],
        region: 'Asia-Pacific'
    },
    {
        id: 'tokyo',
        name: 'Tokyo',
        open: 0,
        close: 9,
        color: '#8b5cf6', // Purple
        currencyPairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
        region: 'Asia'
    },
    {
        id: 'singapore',
        name: 'Singapore',
        open: 1,
        close: 10,
        color: '#ec4899', // Pink
        currencyPairs: ['USD/SGD', 'USD/JPY', 'AUD/JPY'],
        region: 'Asia'
    },
    {
        id: 'frankfurt',
        name: 'Frankfurt',
        open: 7,
        close: 16,
        color: '#6366f1', // Indigo
        currencyPairs: ['EUR/USD', 'EUR/GBP', 'EUR/JPY'],
        region: 'Europe'
    },
    {
        id: 'london',
        name: 'London',
        open: 8,
        close: 17,
        color: '#f59e0b', // Amber
        currencyPairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP'],
        region: 'Europe'
    },
    {
        id: 'newyork',
        name: 'New York',
        open: 13,
        close: 22,
        color: '#10b981', // Emerald
        currencyPairs: ['USD/CAD', 'EUR/USD', 'GBP/USD'],
        region: 'North America'
    }
];

export const VOLATILITY_OVERLAP = {
    start: 13,
    end: 17,
    name: 'London-NY Overlap',
    description: 'Highest volatility period'
};
