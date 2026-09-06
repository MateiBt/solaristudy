// supabase/functions/chat-gemini/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, mode, solvePhase, conversationHistory, attachment, model_id } = await req.json();

    // Initialize Gemini SDK with Edge Environment Variable
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: model_id || 'gemini-1.5-flash' });

    let systemPrompt = '';

    // Route logic based on mode
    if (mode === 'SolariLearn') {
      systemPrompt = `You are Solari, an expert Socratic tutor. 
1. DO NOT give direct answers to problems. Instead, guide the user with thought-provoking questions.
2. Provide conceptual hints and break down complex problems.
3. ALWAYS format mathematical equations using KaTeX. Use single $ for inline math (e.g., $E=mc^2$) and double $$ for display equations.`;
    } else if (mode === 'SolariSolve') {
      if (solvePhase === 'ingest_problems') {
        systemPrompt = `You are an OCR and problem extraction assistant. Extract all problems from the uploaded text/image cleanly, format math using KaTeX ($ and $$). Do not solve them yet.`;
      } else {
        systemPrompt = `You are a strict, step-by-step grading engine.
1. Evaluate the user's proof or answer against the correct mathematical solution.
2. Give actionable feedback on mistakes.
3. Format math using KaTeX ($ and $$).
4. STRICTLY end your response with the grade in this exact format: SCORE:[earned/possible] (e.g. SCORE:[8/10]).`;
      }
    }

    // Format history for the GenAI SDK
    const history = (conversationHistory || []).map((msg: any) => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history,
      systemInstruction: systemPrompt,
    });

    const parts = [];
    if (attachment && attachment.base64) {
      parts.push({
        inlineData: {
          data: attachment.base64,
          mimeType: attachment.mimeType
        }
      });
    }
    if (prompt) {
      parts.push({ text: prompt });
    }

    // Initiate the streaming model call
    const result = await chat.sendMessageStream(parts);

    // Pipe the response stream back to the React Native client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(new TextEncoder().encode(text));
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});