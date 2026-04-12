import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useProgress, useCardNotes } from "../hooks/useProgress";
import { useUnlock } from "../hooks/useUnlock";

type ProgressContextType = ReturnType<typeof useProgress> &
  ReturnType<typeof useCardNotes> &
  ReturnType<typeof useUnlock>;

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const progressHook = useProgress();
  const notesHook = useCardNotes();
  const unlockHook = useUnlock(progressHook.learnedCount);

  useEffect(() => {
    progressHook.recordDailyVisit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ProgressContext.Provider value={{ ...progressHook, ...notesHook, ...unlockHook }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgressContext must be used within ProgressProvider");
  return ctx;
}
