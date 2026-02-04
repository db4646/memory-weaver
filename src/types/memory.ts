export interface SemanticMemory {
  id: string;
  user_id: string | null;
  content: string;
  embedding_text: string | null;
  category: string;
  importance_score: number;
  access_count: number;
  last_accessed_at: string;
  decay_factor: number;
  source_type: 'paper' | 'note' | 'conversation' | 'manual';
  source_reference: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EpisodicMemory {
  id: string;
  user_id: string | null;
  event_type: 'conversation' | 'search' | 'paper_read' | 'note_added';
  event_summary: string;
  event_details: Record<string, unknown>;
  context_before: string | null;
  context_after: string | null;
  emotional_valence: number;
  importance_score: number;
  access_count: number;
  last_accessed_at: string;
  decay_factor: number;
  related_semantic_ids: string[];
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  memories_referenced: string[];
  created_at: string;
}

export interface ResearchPaper {
  id: string;
  user_id: string | null;
  title: string;
  authors: string[];
  abstract: string | null;
  url: string | null;
  doi: string | null;
  publication_date: string | null;
  field_of_study: string | null;
  keywords: string[];
  notes: string | null;
  importance_score: number;
  read_count: number;
  last_read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsolidationLog {
  id: string;
  user_id: string | null;
  consolidation_type: 'prune' | 'merge' | 'summarize' | 'decay_update';
  memories_affected: number;
  details: Record<string, unknown>;
  created_at: string;
}

export interface MemoryStats {
  totalSemantic: number;
  totalEpisodic: number;
  avgSemanticDecay: number;
  avgEpisodicDecay: number;
  recentConsolidations: number;
  topCategories: { category: string; count: number }[];
}
