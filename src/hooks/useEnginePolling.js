import { useState, useCallback, useEffect, useRef } from "react";
import { fetchDecisions } from "../api/decisionsApi";
import { INIT_CARDS } from "../data";

const POLL_INTERVAL = 30_000;

/**
 * Engine'den karar listesini çeker, 30s'de bir polling yapar.
 * App.jsx'i temiz tutar.
 *
 * Returns: { cards, setCards, autoCount, setAutoCount, loadingCards, engineError, refresh }
 */
export function useEnginePolling() {
  const [cards, setCards]           = useState(INIT_CARDS);
  const [autoCount, setAutoCount]   = useState(14);
  const [loadingCards, setLoadingCards] = useState(false);
  const [engineError, setEngineError]   = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoadingCards(true);
    setEngineError(null);
    try {
      const decisions = await fetchDecisions();
      if (decisions.length > 0) {
        setCards(decisions);
        setAutoCount(decisions.filter(d => d.status === "AUTO_APPROVED").length);
      }
    } catch (err) {
      setEngineError(err.message);
      // Fallback: INIT_CARDS zaten state'te
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [load]);

  return {
    cards,
    setCards,
    autoCount,
    setAutoCount,
    loadingCards,
    engineError,
    refresh: () => load(),
  };
}
