import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ResumeStatus = "pending" | "parsing" | "parsed" | "failed";

export type Resume = {
  id: string;
  filename: string;
  uploadDate: string;
  status: ResumeStatus;
  fileSize: string;
  format: "pdf" | "docx";
  skills: string[];
};

type ResumeContextType = {
  resumes: Resume[];
  addResume: (filename: string, format: "pdf" | "docx") => void;
  deleteResume: (id: string) => Promise<void>;
  getResume: (id: string) => Resume | undefined;
};

const ResumeContext = createContext<ResumeContextType | null>(null);
const RESUMES_KEY = "@qlue_resumes";

const SAMPLE_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "SQL",
  "AWS",
  "Docker",
  "REST APIs",
  "GraphQL",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Agile",
  "Git",
  "Machine Learning",
];

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RESUMES_KEY).then((raw) => {
      if (raw) setResumes(JSON.parse(raw));
    });
  }, []);

  const persist = useCallback((items: Resume[]) => {
    setResumes(items);
    AsyncStorage.setItem(RESUMES_KEY, JSON.stringify(items));
  }, []);

  const addResume = useCallback(
    (filename: string, format: "pdf" | "docx") => {
      const newResume: Resume = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        filename,
        uploadDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "parsing",
        fileSize: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
        format,
        skills: [],
      };
      const updated = [newResume, ...resumes];
      persist(updated);

      setTimeout(() => {
        const shuffled = [...SAMPLE_SKILLS].sort(() => Math.random() - 0.5);
        const skills = shuffled.slice(0, Math.floor(Math.random() * 8) + 5);
        setResumes((prev) => {
          const next = prev.map((r) =>
            r.id === newResume.id ? { ...r, status: "parsed" as const, skills } : r
          );
          AsyncStorage.setItem(RESUMES_KEY, JSON.stringify(next));
          return next;
        });
      }, 2500);
    },
    [resumes, persist]
  );

  const deleteResume = useCallback(
    async (id: string) => {
      const next = resumes.filter((r) => r.id !== id);
      persist(next);
    },
    [resumes, persist]
  );

  const getResume = useCallback(
    (id: string) => resumes.find((r) => r.id === id),
    [resumes]
  );

  return (
    <ResumeContext.Provider value={{ resumes, addResume, deleteResume, getResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumes() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResumes must be used within ResumeProvider");
  return ctx;
}
