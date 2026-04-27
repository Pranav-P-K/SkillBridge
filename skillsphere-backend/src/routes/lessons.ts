import { Hono } from "hono";
import { db } from "../services/firebase";
import { Lesson, Phase } from "../types/models";

const lessonsRoutes = new Hono();

// GET /lessons/:topicId
const phaseOrder: Phase[] = [
  "life_skills",
  "money_skills",
  "practice",
  "earn",
  "mentor",
];

function phaseRank(phase?: Phase) {
  const idx = phaseOrder.indexOf(phase || "life_skills");
  return idx === -1 ? 0 : idx;
}

lessonsRoutes.get("/:topicId", async (c) => {
  const { topicId } = c.req.param();
  const user = c.get("user");

  try {
    const snapshot = await db
      .collection("lessons")
      .where("topicId", "==", topicId)
      .get();

    if (snapshot.empty) return c.json([]);

    // Fetch roadmap to determine gating
    let currentPhase: Phase = "life_skills";
    if (user?.uid) {
      const roadmapSnap = await db.collection("roadmaps").doc(user.uid).get();
      currentPhase = (roadmapSnap.exists
        ? (roadmapSnap.data()?.currentPhase as Phase)
        : "life_skills") || "life_skills";
    }

    const lessons = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Lesson, "id">;
      // Strip answer keys so list responses never leak solutions
      const sanitizedAssessment =
        data.assessment && data.assessment.questions
          ? {
              ...data.assessment,
              questions: data.assessment.questions.map((q: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { correctAnswerId, explanation, ...rest } = q;
                return rest;
              }),
            }
          : data.assessment;

      return {
        id: doc.id,
        ...data,
        assessment: sanitizedAssessment,
        locked:
          phaseRank(data.phase as Phase) > phaseRank(currentPhase)
            ? true
            : false,
        lockedReason:
          phaseRank(data.phase as Phase) > phaseRank(currentPhase)
            ? `Unlock ${data.phase} by raising readiness score`
            : undefined,
      };
    });

    // Sort by order: 1, 2, 3...
    lessons.sort((a: any, b: any) => a.order - b.order);

    return c.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons list:", error);
    return c.json({ error: "Failed to fetch lessons" }, 500);
  }
});

export default lessonsRoutes;