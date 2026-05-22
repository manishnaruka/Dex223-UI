import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const computeRemaining = (endsAt: number): Countdown => {
  const diff = Math.max(0, endsAt - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

export function useEpochCountdown(endsAt: number): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(() => computeRemaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(computeRemaining(endsAt));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return countdown;
}
