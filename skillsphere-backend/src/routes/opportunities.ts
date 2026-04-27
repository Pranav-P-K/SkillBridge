import { Hono } from "hono";
import { db } from "../services/firebase";
import { Phase } from "../types/models";

const oppRoutes = new Hono<{ Variables: { user: any } }>();

oppRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const roadmapSnap = await db.collection("roadmaps").doc(user.uid).get();
  const readiness = roadmapSnap.exists ? roadmapSnap.data()?.readinessScore || 0 : 0;
  const currentPhase = roadmapSnap.exists
    ? (roadmapSnap.data()?.currentPhase as Phase) || "life_skills"
    : "life_skills";

  const snap = await db.collection("opportunities").orderBy("createdAt", "desc").limit(50).get();
  const gigs = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .map((g) => {
      const eligible = readiness >= (g.minScore || 0);
      return {
        ...g,
        locked: !eligible,
        lockedReason: eligible ? undefined : `Need readiness ${g.minScore || 0}+`,
        currentPhase,
      };
    });

  return c.json(gigs);
});

oppRoutes.post("/:id/apply", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { id } = c.req.param();

  const gigRef = db.collection("opportunities").doc(id);
  const gigSnap = await gigRef.get();
  if (!gigSnap.exists) return c.json({ error: "Not found" }, 404);

  const roadmapSnap = await db.collection("roadmaps").doc(user.uid).get();
  const readiness = roadmapSnap.exists ? roadmapSnap.data()?.readinessScore || 0 : 0;
  const minScore = gigSnap.data()?.minScore || 0;
  if (readiness < minScore) {
    return c.json({ error: `Need readiness ${minScore}+ to apply` }, 403);
  }

  await gigRef.collection("applications").doc(user.uid).set({
    userId: user.uid,
    appliedAt: new Date(),
    status: "applied",
  });

  return c.json({ status: "applied" });
});

export default oppRoutes;

