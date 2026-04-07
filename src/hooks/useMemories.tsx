import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SemanticMemory, EpisodicMemory } from "@/types/memory";
import { useAuth } from "./useAuth";
import { Json } from "@/integrations/supabase/types";

export function useMemories() {
  const [semanticMemories, setSemanticMemories] = useState<SemanticMemory[]>([]);
  const [episodicMemories, setEpisodicMemories] = useState<EpisodicMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSemanticMemories([]);
      setEpisodicMemories([]);
      setLoading(false);
      return;
    }

    const fetchMemories = async (showLoading = true) => {
      if (showLoading) setLoading(true);

      // Fetch semantic memories ordered by decay factor (most relevant first)
      const { data: semantic } = await supabase
        .from("semantic_memories")
        .select("*")
        .eq("user_id", user.id)
        .order("decay_factor", { ascending: false })
        .order("importance_score", { ascending: false })
        .limit(20);

      // Fetch episodic memories ordered by recency
      const { data: episodic } = await supabase
        .from("episodic_memories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (semantic) {
        setSemanticMemories(semantic as SemanticMemory[]);
      }

      if (episodic) {
        setEpisodicMemories(episodic as EpisodicMemory[]);
      }

      setLoading(false);
    };

    fetchMemories();

    // Debounced realtime updates to prevent excessive re-renders
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchMemories(false), 1000);
    };

    const semanticChannel = supabase
      .channel("semantic_memories_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "semantic_memories",
          filter: `user_id=eq.${user.id}`,
        },
        debouncedFetch
      )
      .subscribe();

    const episodicChannel = supabase
      .channel("episodic_memories_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "episodic_memories",
          filter: `user_id=eq.${user.id}`,
        },
        debouncedFetch
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      semanticChannel.unsubscribe();
      episodicChannel.unsubscribe();
    };
  }, [user]);

  const addSemanticMemory = async (
    content: string,
    category: string = "general",
    sourceType: SemanticMemory["source_type"] = "manual"
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("semantic_memories")
      .insert({
        user_id: user.id,
        content,
        category,
        source_type: sourceType,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding semantic memory:", error);
      return null;
    }

    return data as SemanticMemory;
  };

  const addEpisodicMemory = async (
    eventType: EpisodicMemory["event_type"],
    eventSummary: string,
    eventDetails: Record<string, Json> = {}
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("episodic_memories")
      .insert({
        user_id: user.id,
        event_type: eventType,
        event_summary: eventSummary,
        event_details: eventDetails,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding episodic memory:", error);
      return null;
    }

    return data as EpisodicMemory;
  };

  return {
    semanticMemories,
    episodicMemories,
    loading,
    addSemanticMemory,
    addEpisodicMemory,
  };
}
