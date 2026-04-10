import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let memoryContext = "";
    
    if (userId) {
      // Parallel fetch all memory types
      const [semanticRes, episodicRes, papersRes] = await Promise.all([
        supabase
          .from("semantic_memories")
          .select("content, category")
          .eq("user_id", userId)
          .order("decay_factor", { ascending: false })
          .limit(5),
        supabase
          .from("episodic_memories")
          .select("event_summary, event_type")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("research_papers")
          .select("title, keywords")
          .eq("user_id", userId)
          .order("importance_score", { ascending: false })
          .limit(3),
      ]);

      if (semanticRes.data?.length) {
        memoryContext += "\n## Known Facts:\n";
        semanticRes.data.forEach((m, i) => {
          memoryContext += `${i + 1}. [${m.category}] ${m.content}\n`;
        });
      }

      if (episodicRes.data?.length) {
        memoryContext += "\n## Recent Interactions:\n";
        episodicRes.data.forEach((m, i) => {
          memoryContext += `${i + 1}. [${m.event_type}] ${m.event_summary}\n`;
        });
      }

      if (papersRes.data?.length) {
        memoryContext += "\n## Papers:\n";
        papersRes.data.forEach((p, i) => {
          memoryContext += `${i + 1}. "${p.title}" - ${p.keywords?.join(", ") || "N/A"}\n`;
        });
      }
    }

    const systemPrompt = `You are MNEMON, a Personal Research Assistant with hybrid memory (semantic + episodic). You help researchers understand papers, connect concepts, and build knowledge.

## Memory Context
${memoryContext || "_No memories yet._"}

## Guidelines
- Reference specific memories/papers when relevant
- Use markdown formatting
- Be concise but thorough
- Suggest saving important concepts to memory when appropriate`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
