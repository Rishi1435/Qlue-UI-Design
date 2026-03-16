import { Router, type Request, type Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db, resumesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { generateId } from "../lib/jwt.js";

const router = Router();
router.use(requireAuth);

const SAMPLE_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "SQL", "AWS", "Docker",
  "REST APIs", "GraphQL", "Leadership", "Communication", "Problem Solving",
  "Agile", "Git", "Machine Learning", "React Native", "Next.js", "Redis",
  "PostgreSQL", "MongoDB", "Kubernetes", "CI/CD", "System Design",
];

const SAMPLE_EXPERIENCE = [
  [
    { role: "Senior Software Engineer", company: "Stripe", years: "2021 – Present", description: "Led payment infrastructure serving 10M+ transactions/day." },
    { role: "Software Engineer", company: "Shopify", years: "2018 – 2021", description: "Built e-commerce features used by 1M+ merchants." },
  ],
  [
    { role: "Product Manager", company: "Notion", years: "2020 – Present", description: "Owned core editor; drove 40% engagement increase." },
    { role: "Associate PM", company: "Atlassian", years: "2018 – 2020", description: "Managed Jira Cloud roadmap with 5M+ DAU." },
  ],
  [
    { role: "Data Scientist", company: "Netflix", years: "2019 – Present", description: "Built recommendation models for 200M+ subscribers." },
    { role: "ML Engineer", company: "Spotify", years: "2017 – 2019", description: "Audio classification models for podcast recommendations." },
  ],
];

const SAMPLE_EDUCATION = [
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
  "Strategic product manager with track record of launching high-impact features. Expert at aligning cross-functional teams.",
  "Data scientist with deep expertise in ML and statistical modeling. Skilled at translating insights into business outcomes.",
];

const CreateResumeSchema = z.object({
  filename: z.string().min(1).max(255),
  fileSize: z.string(),
  format: z.enum(["pdf", "docx"]),
});

// GET /api/resumes
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const resumes = await db
      .select()
      .from(resumesTable)
      .where(eq(resumesTable.userId, userId))
      .orderBy(desc(resumesTable.createdAt));

    res.json({ resumes });
  } catch (err) {
    console.error("List resumes error:", err);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// POST /api/resumes
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const body = CreateResumeSchema.parse(req.body);

    const id = generateId();
    const uploadDate = new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

    await db.insert(resumesTable).values({
      id,
      userId,
      filename: body.filename,
      fileSize: body.fileSize,
      format: body.format,
      status: "parsing",
      skills: [],
      experience: [],
      education: [],
      uploadDate,
    });

    // Simulate async parsing
    setTimeout(async () => {
      try {
        const shuffled = [...SAMPLE_SKILLS].sort(() => Math.random() - 0.5);
        const skills = shuffled.slice(0, Math.floor(Math.random() * 8) + 6);
        const expIdx = Math.floor(Math.random() * SAMPLE_EXPERIENCE.length);
        const eduIdx = Math.floor(Math.random() * SAMPLE_EDUCATION.length);
        const sumIdx = Math.floor(Math.random() * SAMPLE_SUMMARIES.length);

        await db
          .update(resumesTable)
          .set({
            status: "parsed",
            skills,
            experience: SAMPLE_EXPERIENCE[expIdx],
            education: SAMPLE_EDUCATION[eduIdx],
            summary: SAMPLE_SUMMARIES[sumIdx],
          })
          .where(and(eq(resumesTable.id, id), eq(resumesTable.userId, userId)));
      } catch (e) {
        console.error("Async parse error:", e);
      }
    }, 3000);

    const [resume] = await db
      .select()
      .from(resumesTable)
      .where(eq(resumesTable.id, id))
      .limit(1);

    res.status(201).json({ resume });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    console.error("Create resume error:", err);
    res.status(500).json({ error: "Failed to create resume" });
  }
});

// GET /api/resumes/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const [resume] = await db
      .select()
      .from(resumesTable)
      .where(and(eq(resumesTable.id, req.params.id), eq(resumesTable.userId, userId)))
      .limit(1);

    if (!resume) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    res.json({ resume });
  } catch (err) {
    console.error("Get resume error:", err);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

// DELETE /api/resumes/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    await db
      .delete(resumesTable)
      .where(and(eq(resumesTable.id, req.params.id), eq(resumesTable.userId, userId)));

    res.json({ success: true });
  } catch (err) {
    console.error("Delete resume error:", err);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

export default router;
