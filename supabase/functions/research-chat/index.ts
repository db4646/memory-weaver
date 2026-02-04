import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant memories for context
    let memoryContext = "";
    
    if (userId) {
      // Fetch top semantic memories
      const { data: semanticMemories } = await supabase
        .from("semantic_memories")
        .select("content, category, importance_score")
        .eq("user_id", userId)
        .order("decay_factor", { ascending: false })
        .order("importance_score", { ascending: false })
        .limit(10);

      // Fetch recent episodic memories
      const { data: episodicMemories } = await supabase
        .from("episodic_memories")
        .select("event_summary, event_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch research papers
      const { data: papers } = await supabase
        .from("research_papers")
        .select("title, abstract, keywords")
        .eq("user_id", userId)
        .order("importance_score", { ascending: false })
        .limit(5);

      if (semanticMemories?.length) {
        memoryContext += "\n## Known Facts (Semantic Memory):\n";
        semanticMemories.forEach((m, i) => {
          memoryContext += `${i + 1}. [${m.category}] ${m.content}\n`;
        });
      }

      if (episodicMemories?.length) {
        memoryContext += "\n## Recent Interactions (Episodic Memory):\n";
        episodicMemories.forEach((m, i) => {
          memoryContext += `${i + 1}. [${m.event_type}] ${m.event_summary} (${new Date(m.created_at).toLocaleDateString()})\n`;
        });
      }

      if (papers?.length) {
        memoryContext += "\n## Research Papers:\n";
        papers.forEach((p, i) => {
          memoryContext += `${i + 1}. "${p.title}" - Keywords: ${p.keywords?.join(", ") || "N/A"}\n`;
        });
      }
    }

    const systemPrompt = `You are MNEMON, an advanced Personal Research Assistant with a hybrid memory system. You help researchers with long-term study over months, continually learning new papers and facts while consolidating older, less accessed information.

## Your Memory Architecture:
1. **Semantic Memory**: Factual, conceptual knowledge - things you KNOW
2. **Episodic Memory**: Specific past events and interactions - things that HAPPENED
3. **Time-Based Decay**: Older, less-accessed memories naturally fade to keep knowledge fresh

## Current Memory Context:
${memoryContext || "No memories stored yet. Start building your knowledge base!"}

## Your Behavior:
- Reference relevant memories when answering questions
- Identify connections between different pieces of knowledge
- Suggest when information might be getting outdated
- Help consolidate and summarize related memories
- Be conversational but precise, like a knowledgeable research colleague
- Use markdown formatting for clarity (headers, lists, code blocks when appropriate)
- When discussing papers or concepts, cite your sources from memory
- If you notice gaps in knowledge, suggest areas to explore

Remember: You're not just answering questions - you're helping build a living knowledge base that evolves with the researcher's journey.`;

    console.log("Sending request to Lovable AI Gateway");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("research-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
