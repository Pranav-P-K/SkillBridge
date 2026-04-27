import { Hono } from "hono";
import { db } from "../services/firebase";

const podsRoutes = new Hono<{ Variables: { user: any } }>();

podsRoutes.get("/", async (c) => {
  const snap = await db.collection("problemPods").orderBy("createdAt", "desc").limit(50).get();
  const pods = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return c.json(pods);
});

podsRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { title, description, category } = await c.req.json();
  if (!title || !description) return c.json({ error: "title and description required" }, 400);
  const doc = await db.collection("problemPods").add({
    userId: user.uid,
    title,
    description,
    category: category || "general",
    createdAt: new Date(),
    replies: 0,
  });
  return c.json({ id: doc.id });
});

podsRoutes.post("/:id/respond", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { id } = c.req.param();
  const { message } = await c.req.json();
  if (!message) return c.json({ error: "message required" }, 400);

  const podRef = db.collection("problemPods").doc(id);
  const replyRef = podRef.collection("responses").doc();

  await Promise.all([
    replyRef.set({
      userId: user.uid,
      message,
      createdAt: new Date(),
    }),
    podRef.update({
      replies: (await podRef.get()).data()?.replies ? (await podRef.get()).data()!.replies + 1 : 1,
    }),
  ]);

  return c.json({ success: true });
});

export default podsRoutes;

