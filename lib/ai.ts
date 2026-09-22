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

// Helper function to pause execution during backoff
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateAIResponse(
  prompt: string,
  options: AIRequestOptions,
  onUpdate?: (fullText: string) => void 
): Promise<string> {
  const { mode, model_id = 'gemini-3.5-flash-lite', conversationHistory = [], attachment, solvePhase } = options;

  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY in environment variables.');
  }

  // 1. Build the system instruction based on the mode
  let systemInstruction = "You are SolariStudy, a helpful AI tutor.";
  if (mode === 'SolariSolve') {
    if (solvePhase === 'ingest_problems') {
      systemInstruction = "You are SolariSolve. Extract problems from the provided image/text and prepare them for solving.";
    } else if (solvePhase === 'grading_and_review') {
      systemInstruction = "You are SolariSolve. Grade the user's answers. You MUST output the final score exactly in the format SCORE:[earned/possible] at the very end.";
    }
  } else {
    // CORRECTED: Added spaces around $$ and $ so math parses correctly     systemInstruction = "You are SolariLearn. Provide Socratic tutoring, concept breakdowns, and step-by-step mastery using LaTeX for math equations. Enclose block equations in $$and inline math in$.";
  }

  // 2. Format the conversation history for Gemini
  const contents: any[] = [];
  conversationHistory.forEach(msg => {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });

  // 3. Format the current prompt and attachment
  const currentParts: any[] = [];
  if (prompt) {
    currentParts.push({ text: prompt });
  }
  if (attachment) {
    currentParts.push({
      inline_data: {
        mime_type: attachment.mimeType,
        data: attachment.base64
      }
    });
  }
  if (currentParts.length > 0) {
    contents.push({ role: 'user', parts: currentParts });
  }

  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents
  };

  const maxRetries = 4;
  let attempt = 0;
  let activeModel = model_id;

  while (attempt < maxRetries) {
    try {
      // URL must be calculated inside the loop so the fallback model ID takes effect
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:streamGenerateContent?alt=sse&key=${API_KEY}`;

      const result = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        let fullText = '';
        let processedLength = 0;
        let buffer = '';

        xhr.onprogress = () => {
          const chunk = xhr.responseText.substring(processedLength);
          processedLength = xhr.responseText.length;
          buffer += chunk;
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; 
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr && dataStr !== '[DONE]') {
                try {
                  const parsed = JSON.parse(dataStr);
                  const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textPart) {
                    fullText += textPart;
                    if (onUpdate) onUpdate(fullText);
                  }
                } catch (e) {
                  console.warn("Failed to parse Gemini chunk", e);
                }
              }
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 400) {
            reject(new Error(`[${xhr.status}] Gemini API Error: ${xhr.responseText}`));
          } else {
            resolve(fullText);
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error connecting to the Gemini API.'));

        xhr.send(JSON.stringify(payload));
      });

      return result;

    } catch (error: any) {
      attempt++;
      const isOverloaded = error.message?.includes('503') || error.message?.includes('429');
      
      if (isOverloaded && attempt < maxRetries) {
        // Fallback Logic: If flash-lite fails multiple times, switch to standard flash
        if (attempt >= 2 && activeModel === 'gemini-3.5-flash-lite') {
          console.warn('Switching to standard flash fallback due to persistent server load.');
          activeModel = 'gemini-3.6-flash'; // Updated from the deprecated 2.5 model
        }

        // Exponential backoff + randomized jitter (2s, 4s, 8s base + up to 800ms)
        const waitTime = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 800);
        console.warn(`Gemini API busy (503/429). Retrying in ${waitTime}ms... (Attempt ${attempt}/${maxRetries})`);
        
        if (onUpdate) onUpdate('');
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate AI response after retries.");
}