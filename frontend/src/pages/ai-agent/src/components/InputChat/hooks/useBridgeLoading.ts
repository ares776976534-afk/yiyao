import { useState, useCallback } from "react";

export const useBridgeLoading = () => {
  const [bridgeLoading, setBridgeLoading] = useState(false);

  const withBridgeLoading = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    setBridgeLoading(true);
    try {
      return await task();
    } finally {
      setBridgeLoading(false);
    }
  }, []);

  return { bridgeLoading, withBridgeLoading } as const;
};


