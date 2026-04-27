import { Hono } from "hono";
import { db } from "../services/firebase";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { Phase } from "../types/models";

const simulationsRoutes = new Hono<{ Variables: { user: any } }>();

// POST /simulations/generate
simulationsRoutes.post("/generate", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { topicName, phase }: { topicName?: string; phase?: Phase } = await c.req.json();
  const model = google("gemini-1.5-flash");
  const prompt = `
You are creating a scenario-based simulation for a learner.
Phase: ${phase || "life_skills"}
Topic: ${topicName || "communication basics"}
Return STRICT JSON only, no markdown, matching:
{
  "title": "string",
  "scenario": "short story the learner must navigate",
  "tasks": [
    { "id": "t1", "prompt": "question or decision point" },
    { "id": "t2", "prompt": "question or decision point" }
  ],
  "rubric": [
    { "criterion": "what good looks like", "weight": 0.5 },
    { "criterion": "what to avoid", "weight": 0.5 }
  ],
  "idealAnswer": "brief guidance"
}
`;

  try {
    const { text } = await generateText({ model, prompt, temperature: 0.5 });
    const clean = text.replace(/```json|```/g, "").trim();
    const simulation = JSON.parse(clean);
    return c.json({ simulation });
  } catch (error) {
    console.error("Simulation generation failed", error);
    return c.json({ error: "Failed to generate simulation" }, 500);
  }
});

// POST /simulations/submit
simulationsRoutes.post("/submit", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const {
    prompt,
    response,
    phase,
    topicId,
    topicName,
  }: { prompt: string; response: string; phase?: Phase; topicId?: string; topicName?: string } =
    await c.req.json();

  if (!prompt || !response) {
    return c.json({ error: "prompt and response required" }, 400);
  }

  const model = google("gemini-1.5-flash");
  const gradingPrompt = `
You are grading a learner's response to a scenario.
Provide JSON only:
{
  "score": number (0-100),
  "feedback": "brief feedback",
  "strengths": ["..."],
  "gaps": ["..."]
}
Scenario: ${prompt}
Response: ${response}
`;

  try {
    const { text } = await generateText({ model, prompt: gradingPrompt, temperature: 0.3 });
    const clean = text.replace(/```json|```/g, "").trim();
    const graded = JSON.parse(clean);
    const score = Math.max(0, Math.min(100, graded.score || 0));

    const attemptRef = db.collection("simulationAttempts").doc();
    await attemptRef.set({
      userId: user.uid,
      phase: phase || "life_skills",
      topicId,
      topicName,
      score,
      prompt,
      response,
      feedback: graded.feedback,
      strengths: graded.strengths,
      gaps: graded.gaps,
      createdAt: new Date(),
    });

    // Nudge roadmap readiness
    const roadmapRef = db.collection("roadmaps").doc(user.uid);
    await roadmapRef.set(
      {
        readinessScore: score,
        lastUpdatedAt: new Date(),
      },
      { merge: true }
    );

    return c.json({
      score,
      feedback: graded.feedback,
      strengths: graded.strengths,
      gaps: graded.gaps,
    });
  } catch (error) {
    console.error("Simulation grading failed", error);
    return c.json({ error: "Failed to grade simulation" }, 500);
  }
});

export default simulationsRoutes;

