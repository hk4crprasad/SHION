'use client';

import { useEffect, useState } from 'react';

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch('/api/subscription/status');
      const data = await res.json();
      setIsPremium(data.isPremium ?? false);
    } catch {
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { isPremium, loading, refresh };
};
