import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from './firebase';

export const API_URL = 'https://skillbridge-backend-2-gq5c.onrender.com';

export async function fetchWithAuth(endpoint: string, method = 'GET', body?: object) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const token = await user.getIdToken();
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${res.status}`);
  }

  return res.json();
}  
// Helper to call a callable function by name. If Firebase Functions aren't configured, we return a simulated response.
export async function callGradeQuiz(payload: any) {
  try {
    const functions = getFunctions();
    const grade = httpsCallable(functions as any, 'gradeQuiz');
    const res = await grade(payload);
    return res.data;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log('gradeQuiz callable failed, simulating', e.message);
    } else {
      console.log('gradeQuiz callable failed, simulating', e);
    }
    // Simulate grading locally (dangerous: for demo only)
    let earned = 0;
    let total = 0;
    const quiz = payload.quiz; // expecting quiz content
    quiz.questions.forEach((q: any) => {
      total += q.xp || 10;
    });
    payload.answers.forEach((a: any) => {
      const q = quiz.questions.find((x: any) => x.id === a.questionId);
      if (q && q.answerIndex === a.selectedIndex) earned += q.xp || 10;
    });
    return { earned, total };
  }
}

export async function callGeneratePersonalizedContent(payload: any) {
  try {
    const functions = getFunctions();
    const gen = httpsCallable(functions as any, 'generatePersonalizedContent');
    const res = await gen(payload);
    return res.data;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log('generatePersonalizedContent failed, returning mock', e.message);
    } else {
      console.log('generatePersonalizedContent failed, returning mock', e);
    }
    return { created: false };
  }
}

// Roadmap helpers
export async function getRoadmap() {
  return fetchWithAuth('/roadmap');
}

export async function getRoadmapTasks() {
  return fetchWithAuth('/roadmap/tasks');
}

export async function submitRoadmapScore(payload: { score: number; phase?: string }) {
  return fetchWithAuth('/roadmap/score', 'POST', payload);
}

// Simulation helpers
export async function generateSimulation(payload: { topicName?: string; phase?: string }) {
  return fetchWithAuth('/simulations/generate', 'POST', payload);
}

export async function submitSimulation(payload: {
  prompt: string;
  response: string;
  phase?: string;
  topicId?: string;
  topicName?: string;
}) {
  return fetchWithAuth('/simulations/submit', 'POST', payload);
}

// SkillSwap
export async function listSkillSwaps() {
  return fetchWithAuth('/skillswap');
}
export async function createSkillSwap(payload: { offerSkill: string; wantSkill: string; note?: string }) {
  return fetchWithAuth('/skillswap', 'POST', payload);
}
export async function acceptSkillSwap(id: string) {
  return fetchWithAuth(`/skillswap/${id}/accept`, 'POST', {});
}

// Problem Pods
export async function listProblemPods() {
  return fetchWithAuth('/pods');
}
export async function createProblemPod(payload: { title: string; description: string; category?: string }) {
  return fetchWithAuth('/pods', 'POST', payload);
}
export async function respondProblemPod(id: string, message: string) {
  return fetchWithAuth(`/pods/${id}/respond`, 'POST', { message });
}

// Opportunities
export async function listOpportunities() {
  return fetchWithAuth('/opportunities');
}
export async function applyOpportunity(id: string) {
  return fetchWithAuth(`/opportunities/${id}/apply`, 'POST', {});
}

// Portfolio
export async function getPortfolio() {
  return fetchWithAuth('/roadmap/portfolio');
}