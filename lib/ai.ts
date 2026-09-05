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

const EDGE_FUNCTION_URL = 'https://wyivhhhhosokazyrovti.supabase.co/functions/v1/chat-completion';

export async function generateAIResponse(
  prompt: string,
  options: AIRequestOptions,
  onUpdate?: (fullText: string) => void 
): Promise<string> {
  const { mode, model_id = 'gemini-3.5-flash-lite', conversationHistory = [], folderContext = '', attachment } = options;

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('You must be authenticated to interact with the AI.');
  }

  const payload = {
    prompt,
    history: conversationHistory,
    mode,
    model_id,
    solve_phase: options.solvePhase,
    folder_context: folderContext,
    attachment,
  };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', EDGE_FUNCTION_URL, true);
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);

    let fullText = '';
    let processedLength = 0;
    let buffer = '';

    xhr.onprogress = () => {
      const newText = xhr.responseText.substring(processedLength);
      processedLength = xhr.responseText.length;
      buffer += newText;

      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; 

      for (const line of lines) {
        if (line.trim().startsWith('data:')) {
          const dataStr = line.replace(/^data:/, '').trim();
          if (dataStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(dataStr);
            const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            fullText += chunkText;
            if (onUpdate) onUpdate(fullText); 
          } catch (e) {
            
          }
        }
      }
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