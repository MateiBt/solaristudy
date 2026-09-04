import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized request.')

    
    const { prompt, history, mode, model_id, folder_context } = await req.json()

    
    let systemInstruction = 'You are SolariStudy, a helpful physics and math assistant.'
    if (mode === 'SolariLearn') {
      systemInstruction = 'You are a strict Socratic tutor. Do not give direct answers. Guide the student through derivations and physical intuition using targeted probing questions. Use markdown and LaTeX.'
    } else if (mode === 'SolariSolve') {
      systemInstruction = 'You are a strict grading engine. Evaluate the user submission against the original problems, identify errors step-by-step, and provide a final score. Use markdown and LaTeX.'
    }

    
    const geminiHistory = history.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    let finalPrompt = prompt;
    if (folder_context) {
       finalPrompt = `[PREVIOUS FOLDER CONTEXT MEMORY]\n${folder_context}\n\n[NEW USER INPUT]\n${prompt}`
    }

    geminiHistory.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    })

    const geminiPayload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: geminiHistory,
    }

    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error("Gemini API key is missing on the server.")
    
    
    const geminiUrl = `https:

    const response = await fetch(geminiUrl + '&key=' + geminiApiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    })

    if (!response.ok) {
       const err = await response.text();
       throw new Error(`Gemini API Error: ${err}`)
    }

    
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})