// src/routes/generateLessons.ts
import { Hono } from "hono";
import { db } from "../services/firebase";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const generateRoutes = new Hono();

generateRoutes.post("/", async (c) => {
  const { topics } = await c.req.json<{ topics: string[] }>();
  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    return c.json({ error: "topics[] required" }, 400);
  }

  const model = google("gemini-2.5-flash");
  const results: Record<string, any[]> = {};

  for (const topic of topics) {
    // Find or create the topicId
    const topicRef = await db
      .collection("topics")
      .where("name", "==", topic)
      .limit(1)
      .get();
    let topicId: string;
    if (topicRef.empty) {
      const doc = await db.collection("topics").add({ name: topic });
      topicId = doc.id;
    } else {
      topicId = topicRef.docs[0].id;
    }

    // UPDATED: The new, more efficient prompt
    const prompt = `You are an expert instructional designer. For the topic "${topic}", generate a JSON array of 3 unique lessons. Respond ONLY with a raw JSON array.

Each object in the array must match this schema:
{
  "title": "string",
  "xp": 100,
  "estimatedMinutes": 5,
  "difficulty": "easy",
  "tags": "string[]",
  "content": [{ "type": "string", "text": "string" }],
  "assessment": {
    "passingScore": 80,
    "questions": [
      {
        "id": "string (e.g., 'q1')",
        "questionText": "string",
        "quizType": "multiple-choice",
        "tags": "string[]",
        "options": [{ "id": "string", "text": "string" }],
        "correctAnswerId": "string",
        "explanation": "string"
      }
    ]
  }
}`;

    try {
      // UPDATED: A single API call per topic
      const { text } = await generateText({ model, prompt, temperature: 0.4 });
      const clean = text.replace(/```json|```/g, "").trim();
      let lessons: any[];
      try {
        const parsed = JSON.parse(clean);
        lessons = Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        throw new Error(`Invalid JSON from model: ${String(parseError)}`);
      }

      // Basic shape validation & normalization to match frontend gating (easy/medium/hard)
      const normalizedLessons = lessons
        .filter(
          (lesson) =>
            lesson &&
            typeof lesson.title === "string" &&
            Array.isArray(lesson.content) &&
            lesson.assessment?.questions
        )
        .map((lesson) => ({
          ...lesson,
          difficulty:
            lesson.difficulty === "medium" || lesson.difficulty === "hard"
              ? lesson.difficulty
              : "easy",
        }));

      const batch = db.batch();
      const generatedLessons = [];

      // UPDATED: Loop through the array of lessons returned by the AI
      for (const [index, lesson] of normalizedLessons.entries()) {
        // Use .entries() to get the index
        const lessonRef = db.collection("lessons").doc();
        batch.set(lessonRef, {
          ...lesson,
          topicId,
          phase: lesson.phase || "life_skills",
          order: index + 1, // <-- ADD THIS LINE (e.g., 1, 2, 3, 4, 5)
          createdAt: new Date(),
        });
        generatedLessons.push({ id: lessonRef.id, ...lesson });
      }

      await batch.commit(); // Commit all lessons to Firestore at once
      results[topic] = generatedLessons;
    } catch (error) {
      console.error(
        `Failed to generate lessons for topic "${topic}". Error:`,
        error
      );
      results[topic] = []; // Add an empty array for failed topics
    }
  }

  return c.json({ status: "ok", results });
});

export default generateRoutes;
