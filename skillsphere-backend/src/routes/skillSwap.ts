import { Hono } from "hono";
import { db } from "../services/firebase";

const skillSwapRoutes = new Hono<{ Variables: { user: any } }>();

// GET /skillswap -> list active swaps
skillSwapRoutes.get("/", async (c) => {
  const snap = await db
    .collection("skillSwaps")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  const swaps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return c.json(swaps);
});

// POST /skillswap -> create a swap request
skillSwapRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { offerSkill, wantSkill, note } = await c.req.json();
  if (!offerSkill || !wantSkill) {
    return c.json({ error: "offerSkill and wantSkill required" }, 400);
  }
  const doc = await db.collection("skillSwaps").add({
    userId: user.uid,
    offerSkill,
    wantSkill,
    note: note || "",
    status: "open",
    escrowCredits: 10,
    createdAt: new Date(),
  });
  return c.json({ id: doc.id, status: "open" });
});

// POST /skillswap/:id/accept -> accept a swap
skillSwapRoutes.post("/:id/accept", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { id } = c.req.param();
  const ref = db.collection("skillSwaps").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return c.json({ error: "Not found" }, 404);
  const data = snap.data() || {};
  if (data.status !== "open") return c.json({ error: "Already matched" }, 400);
  await ref.update({
    status: "matched",
    partnerId: user.uid,
    matchedAt: new Date(),
  });
  return c.json({ status: "matched" });
});

export default skillSwapRoutes;

