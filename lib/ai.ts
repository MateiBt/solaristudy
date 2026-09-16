import { supabase } from './supabase';

export type SolariMode = 'SolariLearn' | 'SolariSolve';
export type SolariSolvePhase = 'ingest_problems' | 'focus_timer' | 'grading_and_review';

export interface AIRequestOptions {
  mode: SolariMode;
  model_id?: string;
  solvePhase?: SolariSolvePhase;
  conversationHistory?: { sender: 'user' | 'ai'; content: string }[];
  folderContext?: string;
  attachment?: { base64: string; mimeType: string };
}

const EDGE_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wyivhhhhosokazyrovti.supabase.co'}/functions/v1/chat-gemini`;

export async function generateAIResponse(
  prompt: string,
  options: AIRequestOptions,
  onUpdate?: (fullText: string) => void 
): Promise<string> {
  const { mode, model_id = 'gemini-3.5-flash', conversationHistory = [], attachment, solvePhase } = options;

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('You must be authenticated to interact with the AI.');
  }

  const payload = {
    prompt,
    conversationHistory,
    mode,
    model_id,
    solvePhase,
    attachment,
  };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', EDGE_FUNCTION_URL, true);
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);

    let fullText = '';
    let processedLength = 0;

    xhr.onprogress = () => {
      const chunk = xhr.responseText.substring(processedLength);
      processedLength = xhr.responseText.length;
      fullText += chunk;
      
      if (onUpdate) onUpdate(fullText);
    };

    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(new Error(`Backend Error: ${xhr.responseText}`));
      } else {
        resolve(fullText);
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error connecting to the secure AI backend.'));

    xhr.send(JSON.stringify(payload));
  });
}