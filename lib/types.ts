// lib/types.ts

export type SessionMode = 'SolariLearn' | 'SolariSolve';
export type SolveStage = 'ingest_problems' | 'focus_timer' | 'grading_and_review';
export type MessageStatus = 'pending' | 'streaming' | 'completed' | 'failed';

export interface StudyFolder {
  id: string;
  user_id: string;
  subject_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  subject_id: string;
  folder_id: string | null;
  title: string;
  mode: SessionMode;
  model_id: string;
  solve_stage: SolveStage | null;
  focus_duration_seconds: number | null;
  focus_started_at: string | null;
  focus_completed_at: string | null;
  problem_count: number;
  is_favorited: boolean;
  is_archived: boolean;
  title_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  sender: 'user' | 'ai';
  content: string;
  status: MessageStatus;
  ocr_content: string | null;
  media_url: string | null;
  created_at: string;
}