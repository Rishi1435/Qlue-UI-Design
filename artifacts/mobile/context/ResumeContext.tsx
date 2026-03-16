import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ResumeStatus = "pending" | "parsing" | "parsed" | "failed";

export type WorkExperience = {
  role: string;
  company: string;
  years: string;
  description?: string;
};

export type Education = {
  degree: string;
  institution: string;
  year: string;
};

export type Resume = {
  id: string;
  filename: string;
  uploadDate: string;
  status: ResumeStatus;
  fileSize: string;
  format: "pdf" | "docx";
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  summary?: string;
};

type ResumeContextType = {
  resumes: Resume[];
  addResume: (filename: string, format: "pdf" | "docx") => void;
  deleteResume: (id: string) => Promise<void>;
  getResume: (id: string) => Resume | undefined;
};

const ResumeContext = createContext<ResumeContextType | null>(null);
const RESUMES_KEY = "@qlue_resumes_v2";

const SAMPLE_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "SQL", "AWS", "Docker",
  "REST APIs", "GraphQL", "Leadership", "Communication", "Problem Solving",
  "Agile", "Git", "Machine Learning", "React Native", "Next.js", "Redis",
  "PostgreSQL", "MongoDB", "Kubernetes", "CI/CD", "System Design",
];

const SAMPLE_EXPERIENCE: WorkExperience[][] = [
  [
    { role: "Senior Software Engineer", company: "Stripe", years: "2021 – Present", description: "Led development of payment infrastructure serving 10M+ transactions/day." },
    { role: "Software Engineer", company: "Shopify", years: "2018 – 2021", description: "Built e-commerce platform features used by 1M+ merchants worldwide." },
    { role: "Junior Developer", company: "StartupCo", years: "2016 – 2018", description: "Full-stack development for consumer-facing web application." },
  ],
  [
    { role: "Product Manager", company: "Notion", years: "2020 – Present", description: "Owned core editor experience; drove 40% engagement increase." },
    { role: "Associate PM", company: "Atlassian", years: "2018 – 2020", description: "Managed roadmap for Jira Cloud with 5M+ daily active users." },
  ],
  [
    { role: "Data Scientist", company: "Netflix", years: "2019 – Present", description: "Built recommendation models impacting 200M+ subscribers." },
    { role: "ML Engineer", company: "Spotify", years: "2017 – 2019", description: "Developed audio classification models for podcast recommendations." },
  ],
];

const SAMPLE_EDUCATION: Education[][] = [
  [
    { degree: "B.S. Computer Science", institution: "UC Berkeley", year: "2016" },
    { degree: "AWS Solutions Architect", institution: "Amazon Web Services", year: "2020" },
  ],
  [
    { degree: "M.S. Computer Science", institution: "Stanford University", year: "2018" },
    { degree: "B.S. Mathematics", institution: "UCLA", year: "2016" },
  ],
];

const SAMPLE_SUMMARIES = [
  "Results-driven software engineer with 7+ years building scalable systems. Passionate about clean code and developer experience.",
  "Strategic product manager with track record of launching high-impact features. Expert at aligning cross-functional teams around user-centric goals.",
  "Data scientist with deep expertise in machine learning and statistical modeling. Skilled at translating complex insights into business outcomes.",
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
          month: "short", day: "numeric", year: "numeric",
        }),
        status: "parsing",
        fileSize: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
        format,
        skills: [],
        experience: [],
        education: [],
      };
      const updated = [newResume, ...resumes];
      persist(updated);

      setTimeout(() => {
        const shuffled = [...SAMPLE_SKILLS].sort(() => Math.random() - 0.5);
        const skills = shuffled.slice(0, Math.floor(Math.random() * 8) + 6);
        const expIdx = Math.floor(Math.random() * SAMPLE_EXPERIENCE.length);
        const eduIdx = Math.floor(Math.random() * SAMPLE_EDUCATION.length);
        const summaryIdx = Math.floor(Math.random() * SAMPLE_SUMMARIES.length);
        setResumes((prev) => {
          const next = prev.map((r) =>
            r.id === newResume.id
              ? {
                  ...r,
                  status: "parsed" as const,
                  skills,
                  experience: SAMPLE_EXPERIENCE[expIdx],
                  education: SAMPLE_EDUCATION[eduIdx],
                  summary: SAMPLE_SUMMARIES[summaryIdx],
                }
              : r
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
