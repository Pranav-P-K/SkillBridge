// src/types/models.ts

import { Timestamp } from "firebase-admin/firestore";

export interface Question {
  id: string;
  questionText: string;
  quizType: "multiple-choice" | "true-false";
  tags: string[]; // Crucial for linking questions to concepts
  options: { id: string; text: string }[];
  correctAnswerId: string;
  explanation: string;
}

// Update the existing Lesson interface
export interface Lesson {
  id: string;
  topicId: string;
  phase?: Phase; // Optional: life_skills, money_skills, practice, earn, mentor
  title: string;
  xp: number;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "easy" | "medium" | "hard";
  tags: string[];
  content: { type: string; text: string }[];
  createdAt: Timestamp;
  order: number;
  assessment: {
    passingScore: number; // e.g., 80 for 80%
    questions: Question[];
  };
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  status: "not_started" | "completed" | "requires_review";
  score: number;
  quizAttempts: {
    timestamp: Timestamp;
    score: number;
    answers: { questionId: string; selectedOptionId: string }[];
  }[];
}

export interface ContentSnippet {
  tags: string[];
  content: {
    type: string;
    text: string;
  };
}

export interface UserProfile {
  userId: string;
  email?: string;
  name: string;
  totalXp: number;
  completedLessons: string[]; // Unlocks next lessons
  currentStreak: number;
  lastActivityDate: string;
  interests: string[]; // Personalizes Home feed
  isMentor: boolean;
  mentorTopics?: string[]; // Topics they are qualified to teach
  mentorBio?: string;
  mentorRating?: number;
  mentorHourlyRate?: number;
}

export type Phase =
  | "life_skills"
  | "money_skills"
  | "practice"
  | "earn"
  | "mentor";

export interface Roadmap {
  userId: string;
  currentPhase: Phase;
  readinessScore: number; // 0-100 readiness for next unlock
  credits: number; // general credits
  skillCredits: number; // for SkillSwap / mentor tiers
  unlockedTracks: string[]; // topicIds or slugs
}

export interface SimulationAttempt {
  id: string;
  userId: string;
  phase: Phase;
  topicId?: string;
  topicName?: string;
  score: number;
  prompt: string;
  response: string;
  feedback?: string;
  createdAt: Timestamp;
}

export interface DailyTask {
  id: string;
  title: string;
  phase: Phase;
  rewardCredits: number;
  done?: boolean;
}

export interface CommunityPost {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  likes: number;
  replyCount: number;
  createdAt: any; // Timestamp
}

export interface CommunityReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  topicId: string; // The specific topic context
  topicName: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: any;
}

export interface MentorContent {
  id: string;
  mentorId: string;
  mentorName: string;
  topicId: string; // Links content to a topic (e.g., 'finance')
  title: string;
  type: 'video' | 'article' | 'pdf';
  url: string; // YouTube link or Firebase Storage URL
  description: string;
  createdAt: any;
}