import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Conversation } from "@/types/memory";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-chat`;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const { user } = useAuth();

  // Create or get the current conversation
  useEffect(() => {
    if (!user) return;

    const initConversation = async () => {
      // Get the most recent conversation or create one
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (existingConv) {
        setConversation(existingConv as Conversation);
        // Load messages for this conversation
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", existingConv.id)
          .order("created_at", { ascending: true });

        if (msgs) {
          setMessages(msgs as Message[]);
        }
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title: "New Research Session" })
          .select()
          .single();

        if (!error && newConv) {
          setConversation(newConv as Conversation);
        }
      }
    };

    initConversation();
  }, [user]);

  // Extract semantic memories from chat automatically
  const extractSemanticMemory = useCallback(
    async (userId: string, userQuery: string, assistantResponse: string) => {
      try {
        // Determine category from query content
        const queryLower = userQuery.toLowerCase();
        let category = "general";
        const categoryMap: Record<string, string[]> = {
          "machine learning": ["machine learning", "ml", "deep learning", "neural network", "training", "model"],
          "nlp": ["nlp", "natural language", "text processing", "tokenization", "language model"],
          "programming": ["code", "python", "javascript", "programming", "function", "algorithm"],
          "research": ["paper", "study", "research", "methodology", "experiment"],
          "mathematics": ["math", "equation", "calculus", "statistics", "probability"],
        };

        for (const [cat, keywords] of Object.entries(categoryMap)) {
          if (keywords.some((kw) => queryLower.includes(kw))) {
            category = cat;
            break;
          }
        }

        // Create a concise semantic memory from the conversation
        const summaryContent = `Topic: ${userQuery.slice(0, 150)}. Key points: ${assistantResponse
          .replace(/[#*_]/g, "")
          .slice(0, 300)}`;

        await supabase.from("semantic_memories").insert({
          user_id: userId,
          content: summaryContent,
          category,
          source_type: "conversation",
          source_reference: `chat-${new Date().toISOString()}`,
          importance_score: 0.7,
        });
      } catch (err) {
        console.error("Failed to extract semantic memory:", err);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !conversation) return;

      setIsLoading(true);
      setStreamingContent("");

      // Add user message to UI immediately
      const userMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        role: "user",
        content,
        memories_referenced: [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Save user message to database
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content,
      });

      try {
        // Get the session for auth
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userId: user.id,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            toast.error("Rate limit exceeded. Please try again later.");
            return;
          }
          if (response.status === 402) {
            toast.error("AI credits exhausted. Please add credits.");
            return;
          }
          throw new Error("Failed to get response");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Stream the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          // Process line-by-line
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                assistantContent += deltaContent;
                setStreamingContent(assistantContent);
              }
            } catch {
              // Put back incomplete JSON
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                assistantContent += deltaContent;
              }
            } catch {
              /* ignore */
            }
          }
        }

        // Add assistant message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          conversation_id: conversation.id,
          role: "assistant",
          content: assistantContent,
          memories_referenced: [],
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");

        // Save assistant message to database
        await supabase.from("messages").insert({
          conversation_id: conversation.id,
          role: "assistant",
          content: assistantContent,
        });

        // Create episodic memory for this conversation
        await supabase.from("episodic_memories").insert({
          user_id: user.id,
          event_type: "conversation",
          event_summary: `Discussed: ${content.slice(0, 100)}...`,
          event_details: {
            user_query: content,
            assistant_response_preview: assistantContent.slice(0, 200),
          },
        });

        // Auto-extract semantic memory from the conversation
        extractSemanticMemory(user.id, content, assistantContent);
      } catch (error) {
        console.error("Chat error:", error);
        toast.error("Failed to get response. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [user, conversation, messages]
  );

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    conversation,
  };
}
