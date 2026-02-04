import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Paper {
  id: string;
  title: string;
  authors: string[] | null;
  abstract: string | null;
  doi: string | null;
  url: string | null;
  file_url: string | null;
  file_type: string | null;
  field_of_study: string | null;
  keywords: string[] | null;
  importance_score: number | null;
  read_count: number | null;
  created_at: string;
  updated_at: string;
}

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPapers = async () => {
    if (!user) {
      setPapers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("research_papers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPapers(data || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [user]);

  return { papers, loading, refetch: fetchPapers };
}
