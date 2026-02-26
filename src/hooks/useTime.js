import { useState, useEffect } from 'react';

export function useTime() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getUTCTime = () => {
        return {
            hours: time.getUTCHours(),
            minutes: time.getUTCMinutes(),
            seconds: time.getUTCSeconds(),
            totalHours: time.getUTCHours() + time.getUTCMinutes() / 60 + time.getUTCSeconds() / 3600
        };
    };

    const getLocalTime = () => {
        return {
            hours: time.getHours(),
            minutes: time.getMinutes(),
            seconds: time.getSeconds(),
            totalHours: time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    };

    return { time, getUTCTime, getLocalTime };
}
