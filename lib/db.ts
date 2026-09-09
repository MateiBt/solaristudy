import { supabase } from './supabase';
import {
  ChatSession,
  LeaderboardEntry,
  MessageStatus,
  SearchResult,
  SessionFilters,
  SessionMode,
  SolveStage,
  StudyFolder,
  UserProfile
} from './types';

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([{ id: user.user.id }])
      .select()
      .single();
      
    if (insertError) throw insertError;
    return newProfile;
  }

  return data;
}

export async function logDailyActivity() {
  const profile = await getUserProfile();
  if (!profile) return;

  const today = new Date().toISOString().split('T')[0];
  const lastActive = profile.last_active_date;

  if (lastActive === today) return;

  let newStreak = profile.streak_count;
  
  if (lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ streak_count: newStreak, last_active_date: today })
    .eq('id', profile.id);

  if (error) throw error;
}

export async function getDashboardMetrics() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data: sessions, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select('actual_focus_seconds, problem_count, mode')
    .eq('user_id', user.user.id)
    .eq('is_archived', false);

  if (sessionsError) throw sessionsError;

  let totalFocusSeconds = 0;
  let totalProblems = 0;

  sessions?.forEach(s => {
    totalFocusSeconds += (s.actual_focus_seconds || 0);
    totalProblems += (s.problem_count || 0);
  });

  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('score_earned, score_possible')
    .eq('user_id', user.user.id)
    .eq('include_in_accuracy', true)
    .not('score_earned', 'is', null)
    .not('score_possible', 'is', null);

  if (messagesError) throw messagesError;

  let totalEarned = 0;
  let totalPossible = 0;

  messages?.forEach(m => {
    totalEarned += (m.score_earned || 0);
    totalPossible += (m.score_possible || 0);
  });

  const globalAccuracy = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

  return {
    totalFocusHours: (totalFocusSeconds / 3600).toFixed(1),
    totalProblems,
    globalAccuracy: Math.round(globalAccuracy),
  };
}

export async function toggleMessageAccuracy(messageId: string, include: boolean) {
  const { error } = await supabase
    .from('chat_messages')
    .update({ include_in_accuracy: include })
    .eq('id', messageId);

  if (error) throw error;
}

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

export async function deleteFolder(folderId: string) {
  const { error } = await supabase
    .from('study_folders')
    .delete()
    .eq('id', folderId);

  if (error) throw error;
}

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

export async function getScopedSubjectSessions(
  subjectId: string, 
  folderId: string | null, 
  filters: SessionFilters
): Promise<ChatSession[]> {
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

  if (filters.mode && filters.mode !== 'All') {
    query = query.eq('mode', filters.mode);
  }

  if (filters.status === 'Favorited') {
    query = query.eq('is_favorited', true).eq('is_archived', false);
  } else if (filters.status === 'Archived') {
    query = query.eq('is_archived', true);
  } else {
    query = query.eq('is_archived', false);
  }

  if (filters.topic && filters.topic !== 'All') {
    query = query.eq('topic', filters.topic);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createSession(
  subjectId: string, 
  folderId: string | null = null, 
  mode: SessionMode = 'SolariLearn',
  modelId: string = 'gemini-3.5-flash-lite',
  customTitle?: string,
  topic?: string | null
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
        model_id: modelId,
        topic: topic || null
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

export async function updateSolveStage(
  sessionId: string, 
  stage: SolveStage, 
  timerMetadata?: { duration?: number; startedAt?: string; completedAt?: string; actualFocusSeconds?: number }
) {
  const updates: Partial<ChatSession> = { solve_stage: stage };
  
  if (timerMetadata?.duration !== undefined) updates.focus_duration_seconds = timerMetadata.duration;
  if (timerMetadata?.startedAt !== undefined) updates.focus_started_at = timerMetadata.startedAt;
  if (timerMetadata?.completedAt !== undefined) updates.focus_completed_at = timerMetadata.completedAt;
  
  if (timerMetadata?.actualFocusSeconds !== undefined) {
      updates.actual_focus_seconds = timerMetadata.actualFocusSeconds;
  }

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

export async function globalSearch(searchQuery: string): Promise<SearchResult[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  if (!searchQuery || searchQuery.trim() === '') return [];

  const term = `%${searchQuery.trim()}%`;

  const { data: sessions, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id, title, subject_id, folder_id')
    .eq('user_id', user.user.id)
    .ilike('title', term)
    .limit(5);

  if (sessionError) throw sessionError;

  const { data: folders, error: folderError } = await supabase
    .from('study_folders')
    .select('id, name, subject_id')
    .eq('user_id', user.user.id)
    .ilike('name', term)
    .limit(5);

  if (folderError) throw folderError;

  const results: SearchResult[] = [];

  folders?.forEach(f => {
    results.push({
      id: f.id,
      type: 'folder',
      title: f.name,
      subject_id: f.subject_id
    });
  });

  sessions?.forEach(s => {
    results.push({
      id: s.id,
      type: 'session',
      title: s.title,
      subject_id: s.subject_id,
      folder_id: s.folder_id
    });
  });

  return results;
}

export async function getSubjectHubMetrics() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const [foldersRes, sessionsRes, messagesRes] = await Promise.all([
    supabase.from('study_folders').select('subject_id').eq('user_id', user.user.id),
    supabase.from('chat_sessions').select('id, subject_id, actual_focus_seconds').eq('user_id', user.user.id).eq('is_archived', false),
    supabase.from('chat_messages').select('session_id, score_earned, score_possible').eq('user_id', user.user.id).eq('include_in_accuracy', true).not('score_earned', 'is', null).not('score_possible', 'is', null)
  ]);

  if (foldersRes.error) throw foldersRes.error;
  if (sessionsRes.error) throw sessionsRes.error;
  if (messagesRes.error) throw messagesRes.error;

  const metrics: Record<string, { hours: string; chats: number; folders: number; score: string | null }> = {};
  let totalGlobalSeconds = 0;

  const sessionSubjectMap = new Map<string, string>();

  sessionsRes.data.forEach(s => {
    const sub = s.subject_id;
    sessionSubjectMap.set(s.id, sub);
    if (!metrics[sub]) metrics[sub] = { hours: '0.0h', chats: 0, folders: 0, score: null };
    
    metrics[sub].chats += 1;
    
    const secs = s.actual_focus_seconds || 0;
    totalGlobalSeconds += secs;
    
    const currentHours = parseFloat(metrics[sub].hours.replace('h', ''));
    metrics[sub].hours = (currentHours + (secs / 3600)).toFixed(1) + 'h';
  });

  foldersRes.data.forEach(f => {
    const sub = f.subject_id;
    if (!metrics[sub]) metrics[sub] = { hours: '0.0h', chats: 0, folders: 0, score: null };
    metrics[sub].folders += 1;
  });

  const scores: Record<string, { earned: number; possible: number }> = {};
  
  messagesRes.data.forEach(m => {
    const sub = sessionSubjectMap.get(m.session_id);
    if (sub) {
      if (!scores[sub]) scores[sub] = { earned: 0, possible: 0 };
      scores[sub].earned += (m.score_earned || 0);
      scores[sub].possible += (m.score_possible || 0);
    }
  });

  Object.keys(scores).forEach(sub => {
    if (scores[sub].possible > 0) {
      if (!metrics[sub]) metrics[sub] = { hours: '0.0h', chats: 0, folders: 0, score: null };
      metrics[sub].score = Math.round((scores[sub].earned / scores[sub].possible) * 100) + '%';
    }
  });

  return {
    subjectMetrics: metrics,
    totalGlobalHours: (totalGlobalSeconds / 3600).toFixed(1) + 'h'
  };
}

export async function getGlobalLeaderboard(limit: number = 50, subjectId: string = 'global'): Promise<LeaderboardEntry[]> {
  try {
    let data;
    let error;

    if (subjectId === 'global') {
      const res = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, total_problems_solved, global_accuracy')
        .order('total_problems_solved', { ascending: false })
        .order('global_accuracy', { ascending: false })
        .limit(limit);
      
      data = res.data;
      error = res.error;
    } else {
      const res = await supabase.rpc('get_subject_leaderboard', {
        target_subject_id: subjectId,
        row_limit: limit
      });
      
      data = res.data;
      error = res.error;
    }

    if (error) throw error;

    return (data || []).map((profile: any, index: number) => ({
      id: profile.id,
      rank: index + 1,
      display_name: profile.display_name || 'Anonymous Scholar',
      avatar_url: profile.avatar_url,
      total_problems_solved: profile.total_problems_solved || 0,
      global_accuracy: profile.global_accuracy || 0
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}