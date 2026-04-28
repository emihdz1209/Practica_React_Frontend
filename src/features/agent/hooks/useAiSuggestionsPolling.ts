import { useEffect, useState } from "react";

interface UseAiSuggestionsPollingOptions {
  suggestionsCount: number;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
  pollingIntervalMs?: number;
}

export const useAiSuggestionsPolling = ({
  suggestionsCount,
  isFetching,
  isError,
  refetch,
  pollingIntervalMs = 2500,
}: UseAiSuggestionsPollingOptions) => {
  const [isWaitingForSuggestions, setIsWaitingForSuggestions] = useState(true);

  useEffect(() => {
    if (isError) {
      setIsWaitingForSuggestions(false);
      return;
    }

    if (suggestionsCount > 0) {
      setIsWaitingForSuggestions(false);
      return;
    }

    setIsWaitingForSuggestions(true);
  }, [isError, suggestionsCount]);

  useEffect(() => {
    if (!isWaitingForSuggestions || isError) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!isFetching) {
        refetch();
      }
    }, pollingIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isWaitingForSuggestions, isError, isFetching, pollingIntervalMs, refetch]);

  return { isWaitingForSuggestions };
};
