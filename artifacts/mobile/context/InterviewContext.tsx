import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type InterviewModule = "resume" | "hr" | "website";

export type InterviewSession = {
  id: string;
  module: InterviewModule;
  date: string;
  duration: number;
  score: number;
  totalQuestions: number;
  answeredQuestions: number;
  topic: string;
};

type InterviewContextType = {
  sessions: InterviewSession[];
  addSession: (session: Omit<InterviewSession, "id">) => void;
  clearSessions: () => Promise<void>;
};

const InterviewContext = createContext<InterviewContextType | null>(null);
const SESSIONS_KEY = "@qlue_sessions";

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SESSIONS_KEY).then((raw) => {
      if (raw) setSessions(JSON.parse(raw));
    });
  }, []);

  const persist = (items: InterviewSession[]) => {
    setSessions(items);
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(items));
  };

  const addSession = useCallback(
    (session: Omit<InterviewSession, "id">) => {
      const newSession: InterviewSession = {
        ...session,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      persist([newSession, ...sessions]);
    },
    [sessions]
  );

  const clearSessions = useCallback(async () => {
    persist([]);
  }, []);

  return (
    <InterviewContext.Provider value={{ sessions, addSession, clearSessions }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterviews() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterviews must be used within InterviewProvider");
  return ctx;
}
