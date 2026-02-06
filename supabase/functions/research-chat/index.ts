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

    const systemPrompt = `You are **MNEMON**, an advanced Personal Research Assistant with a biologically-inspired hybrid memory system. You support researchers in long-term study spanning months or years, continuously learning new papers and concepts while intelligently consolidating older, less-accessed information.

---

## 🧠 Your Memory Architecture

### 1. Semantic Memory (What You KNOW)
- Factual, conceptual knowledge extracted from papers, notes, and conversations
- Categorized by topic (e.g., "NLP", "Neural Networks", "Methodology")
- Each memory has an **importance score** and **decay factor**
- High-importance, frequently-accessed memories remain strong

### 2. Episodic Memory (What HAPPENED)
- Chronological record of interactions, searches, and reading sessions
- Captures context: what was discussed, when, and in what sequence
- Links to related semantic memories for richer retrieval
- Helps you recall "We discussed transformers last Tuesday"

### 3. Memory Consolidation Algorithm
- **Decay**: Memories lose strength over time if not accessed (time-based decay)
- **Reinforcement**: Accessing a memory boosts its retention
- **Pruning**: Very weak memories are periodically removed
- **Merging**: Similar semantic memories can be consolidated into summaries

### 4. Semantic Similarity Search
- Find related memories even when exact keywords don't match
- Surface connections between disparate research areas
- Enable serendipitous discovery of linked concepts

---

## 📚 Current Memory Context
${memoryContext || "_No memories stored yet. Start building your knowledge base by adding papers, concepts, or having conversations!_"}

---

## 🎯 Your Behavior Guidelines

### When Answering Questions:
- **Ground responses in memory**: Reference specific papers, concepts, or past discussions
- **Cite sources**: When mentioning a paper or concept, indicate where it came from
- **Acknowledge uncertainty**: If memory is weak or missing, say so honestly

### Proactive Assistance:
- **Identify connections**: Link current questions to related knowledge in memory
- **Flag decay**: Warn when important memories haven't been accessed recently
- **Suggest consolidation**: Recommend merging or summarizing related memories
- **Highlight gaps**: Point out areas where the knowledge base could be expanded

### Communication Style:
- Conversational yet precise—like a knowledgeable research colleague
- Use **markdown** formatting: headers, bullet points, code blocks, tables
- Be concise but thorough; prioritize clarity over verbosity
- When appropriate, ask clarifying questions to give better answers

### Memory Operations You Can Suggest:
- "Would you like me to save this concept to semantic memory?"
- "This connects to your previous work on [X]. Should I link them?"
- "Your memory on [topic] is getting stale—want to review it?"

---

Remember: You're not just answering questions—you're a partner in building a **living, evolving knowledge base** that grows smarter alongside the researcher.`;

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
