// lib/db.ts
import { supabase } from './supabase';
import { ChatSession, MessageStatus, SessionMode, SolveStage, StudyFolder } from './types';

// ==========================================
// FOLDERS
// ==========================================

export async function getFolders(subjectId: string, parentId: string | null = null): Promise<StudyFolder[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  let query = supabase
    .from('study_folders')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: true });

  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createFolder(subjectId: string, name: string, parentId: string | null = null) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('study_folders')
    .insert([
      { user_id: user.user.id, subject_id: subjectId, name, parent_id: parentId }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// SESSIONS (LIFECYCLE & WORKFLOW)
// ==========================================

export async function getSessions(subjectId: string, folderId: string | null = null): Promise<ChatSession[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  let query = supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('subject_id', subjectId)
    .order('updated_at', { ascending: false });

  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Updated to lock in the mode and model from the start
export async function createSession(
  subjectId: string, 
  folderId: string | null = null, 
  mode: SessionMode = 'SolariLearn',
  modelId: string = 'gemini-3.5-flash-lite',
  customTitle?: string
) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const title = customTitle && customTitle.trim() !== '' ? customTitle : 'New Session';
  const title_confirmed = !!customTitle;

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([
      { 
        user_id: user.user.id, 
        subject_id: subjectId, 
        folder_id: folderId, 
        title,
        title_confirmed,
        mode,
        model_id: modelId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionState(sessionId: string, updates: Partial<ChatSession>) {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw error;
}

export async function deleteSession(sessionId: string) {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

// ==========================================
// SOLARISOLVE & AI PIPELINE EXTENSIONS
// ==========================================

export async function updateSolveStage(
  sessionId: string, 
  stage: SolveStage, 
  timerMetadata?: { duration?: number; startedAt?: string; completedAt?: string }
) {
  const updates: Partial<ChatSession> = { solve_stage: stage };
  if (timerMetadata?.duration !== undefined) updates.focus_duration_seconds = timerMetadata.duration;
  if (timerMetadata?.startedAt !== undefined) updates.focus_started_at = timerMetadata.startedAt;
  if (timerMetadata?.completedAt !== undefined) updates.focus_completed_at = timerMetadata.completedAt;

  await updateSessionState(sessionId, updates);
}

export async function markMessageStatus(messageId: string, status: MessageStatus) {
  const { error } = await supabase
    .from('chat_messages')
    .update({ status })
    .eq('id', messageId);

  if (error) throw error;
}

export async function saveOcrExtraction(messageId: string, ocrContent: string, mediaUrl?: string) {
  const updates: any = { ocr_content: ocrContent };
  if (mediaUrl) updates.media_url = mediaUrl;

  const { error } = await supabase
    .from('chat_messages')
    .update(updates)
    .eq('id', messageId);

  if (error) throw error;
}

// Memory retriever for Edge Functions to pull past context from the same folder
export async function getFolderContext(folderId: string, excludeSessionId: string): Promise<string> {
  const { data: pastSessions, error } = await supabase
    .from('chat_sessions')
    .select('id, title, chat_messages(sender, content, ocr_content)')
    .eq('folder_id', folderId)
    .neq('id', excludeSessionId)
    .order('updated_at', { ascending: false })
    .limit(3);

  if (error || !pastSessions || pastSessions.length === 0) return '';

  return pastSessions.map((s: any) => {
    const messages = s.chat_messages || [];
    const summary = messages.slice(0, 4).map((m: any) => `${m.sender}: ${m.content}`).join('\n');
    return `[Past Folder Session: ${s.title}]\n${summary}`;
  }).join('\n\n');
}