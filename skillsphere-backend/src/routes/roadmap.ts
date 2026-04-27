import { Hono } from "hono";
import { db } from "../services/firebase";
import { Roadmap, Phase, DailyTask } from "../types/models";

const phaseOrder: Phase[] = [
  "life_skills",
  "money_skills",
  "practice",
  "earn",
  "mentor",
];

const unlockThreshold: Record<Phase, number> = {
  life_skills: 0,
  money_skills: 80,
  practice: 85,
  earn: 90,
  mentor: 95,
};

function phaseRank(phase?: Phase) {
  const idx = phaseOrder.indexOf(phase || "life_skills");
  return idx === -1 ? 0 : idx;
}

async function ensureRoadmap(userId: string): Promise<Roadmap> {
  const ref = db.collection("roadmaps").doc(userId);
  const snap = await ref.get();
  if (!snap.exists) {
    const baseline: Roadmap = {
      userId,
      currentPhase: "life_skills",
      readinessScore: 0,
      credits: 0,
      skillCredits: 0,
      unlockedTracks: [],
    };
    await ref.set(baseline);
    return baseline;
  }
  return snap.data() as Roadmap;
}

const roadmapRoutes = new Hono<{ Variables: { user: any } }>();

// GET /roadmap → ensure + return
roadmapRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const roadmap = await ensureRoadmap(user.uid);
  return c.json(roadmap);
});

// POST /roadmap/score → update readinessScore, maybe advance
roadmapRoutes.post("/score", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { score, phase }: { score: number; phase?: Phase } = await c.req.json();
  if (typeof score !== "number" || Number.isNaN(score)) {
    return c.json({ error: "score required" }, 400);
  }

  const ref = db.collection("roadmaps").doc(user.uid);
  const current = await ensureRoadmap(user.uid);
  const nextReadiness = Math.max(current.readinessScore || 0, score);
  let nextPhase = current.currentPhase;

  // Auto-advance if readiness crosses thresholds
  const currentIdx = phaseRank(current.currentPhase);
  const maybeNext = phaseOrder[currentIdx + 1];
  if (maybeNext && nextReadiness >= unlockThreshold[maybeNext]) {
    nextPhase = maybeNext;
  }

  await ref.set(
    {
      readinessScore: nextReadiness,
      currentPhase: nextPhase,
      lastUpdatedAt: new Date(),
      lastPhaseContext: phase || current.currentPhase,
    },
    { merge: true }
  );

  return c.json({ currentPhase: nextPhase, readinessScore: nextReadiness });
});

// POST /roadmap/advance → manual advance (only one step)
roadmapRoutes.post("/advance", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { targetPhase }: { targetPhase: Phase } = await c.req.json();
  const current = await ensureRoadmap(user.uid);
  const currentIdx = phaseRank(current.currentPhase);
  const targetIdx = phaseRank(targetPhase);

  if (targetIdx !== currentIdx + 1) {
    return c.json({ error: "Can only advance one phase at a time" }, 400);
  }

  if (current.readinessScore < unlockThreshold[targetPhase]) {
    return c.json(
      { error: `Need readiness ${unlockThreshold[targetPhase]} to unlock ${targetPhase}` },
      403
    );
  }

  await db.collection("roadmaps").doc(user.uid).set(
    {
      currentPhase: targetPhase,
      lastUpdatedAt: new Date(),
    },
    { merge: true }
  );

  return c.json({ currentPhase: targetPhase });
});

// GET /roadmap/tasks → lightweight daily tasks per phase
roadmapRoutes.get("/tasks", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const roadmap = await ensureRoadmap(user.uid);
  const phase = roadmap.currentPhase;

  const catalog: Record<Phase, DailyTask[]> = {
    life_skills: [
      { id: "ls-comm", title: "Complete a communication micro-lesson", phase, rewardCredits: 5 },
      { id: "ls-time", title: "Plan your day (time management)", phase, rewardCredits: 5 },
      { id: "ls-budget", title: "Log expenses for today", phase, rewardCredits: 5 },
    ],
    money_skills: [
      { id: "ms-excel", title: "Finish an Excel mini-task", phase, rewardCredits: 8 },
      { id: "ms-portfolio", title: "Add 1 artifact to your portfolio", phase, rewardCredits: 8 },
      { id: "ms-quiz", title: "Pass one money-skill quiz", phase, rewardCredits: 8 },
    ],
    practice: [
      { id: "pr-skill", title: "Do a SkillSwap session", phase, rewardCredits: 10 },
      { id: "pr-pod", title: "Solve a Problem Pod request", phase, rewardCredits: 10 },
      { id: "pr-sim", title: "Run one simulation lab", phase, rewardCredits: 10 },
    ],
    earn: [
      { id: "er-apply", title: "Apply to a micro-gig", phase, rewardCredits: 12 },
      { id: "er-sim", title: "Complete a client scenario", phase, rewardCredits: 12 },
      { id: "er-refine", title: "Update your portfolio", phase, rewardCredits: 12 },
    ],
    mentor: [
      { id: "mt-session", title: "Host a mentor session", phase, rewardCredits: 15 },
      { id: "mt-review", title: "Review a learner portfolio", phase, rewardCredits: 15 },
      { id: "mt-create", title: "Upload a mentor resource", phase, rewardCredits: 15 },
    ],
  };

  const tasks = catalog[phase] || catalog["life_skills"];
  return c.json(tasks);
});

// GET /roadmap/portfolio → basic aggregation
roadmapRoutes.get("/portfolio", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const userId = user.uid;

  const [profileSnap, simSnap, contentSnap, swapSnap, podSnap] = await Promise.all([
    db.collection("userProfiles").doc(userId).get(),
    db.collection("simulationAttempts").where("userId", "==", userId).get(),
    db.collection("mentorContent").where("mentorId", "==", userId).get(),
    db.collection("skillSwaps").where("userId", "==", userId).get(),
    db.collection("problemPods").where("userId", "==", userId).get(),
  ]);

  const profile = profileSnap.exists ? profileSnap.data() : {};
  const simulations = simSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const uploads = contentSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return c.json({
    totalXp: profile?.totalXp || 0,
    completedLessons: profile?.completedLessons || [],
    simulations,
    uploads,
    credits: profile?.credits || 0,
    skillSwaps: swapSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    problemPods: podSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
});

export default roadmapRoutes;

