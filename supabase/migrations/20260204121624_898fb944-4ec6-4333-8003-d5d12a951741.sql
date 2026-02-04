-- Create semantic memories table (factual, conceptual knowledge)
CREATE TABLE public.semantic_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  content TEXT NOT NULL,
  embedding_text TEXT,
  category TEXT DEFAULT 'general',
  importance_score DECIMAL(3,2) DEFAULT 1.0,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  decay_factor DECIMAL(3,2) DEFAULT 1.0,
  source_type TEXT DEFAULT 'manual', -- 'paper', 'note', 'conversation', 'manual'
  source_reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create episodic memories table (specific past events/interactions)
CREATE TABLE public.episodic_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL, -- 'conversation', 'search', 'paper_read', 'note_added'
  event_summary TEXT NOT NULL,
  event_details JSONB DEFAULT '{}',
  context_before TEXT,
  context_after TEXT,
  emotional_valence DECIMAL(3,2) DEFAULT 0.0, -- -1.0 to 1.0
  importance_score DECIMAL(3,2) DEFAULT 1.0,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  decay_factor DECIMAL(3,2) DEFAULT 1.0,
  related_semantic_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table for chat history
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  memories_referenced UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research papers table
CREATE TABLE public.research_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  authors TEXT[],
  abstract TEXT,
  url TEXT,
  doi TEXT,
  publication_date DATE,
  field_of_study TEXT,
  keywords TEXT[],
  notes TEXT,
  importance_score DECIMAL(3,2) DEFAULT 1.0,
  read_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memory consolidation logs
CREATE TABLE public.consolidation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  consolidation_type TEXT NOT NULL, -- 'prune', 'merge', 'summarize', 'decay_update'
  memories_affected INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.semantic_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodic_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consolidation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for semantic_memories
CREATE POLICY "Users can view their own semantic memories" 
  ON public.semantic_memories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own semantic memories" 
  ON public.semantic_memories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own semantic memories" 
  ON public.semantic_memories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own semantic memories" 
  ON public.semantic_memories FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for episodic_memories
CREATE POLICY "Users can view their own episodic memories" 
  ON public.episodic_memories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own episodic memories" 
  ON public.episodic_memories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodic memories" 
  ON public.episodic_memories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodic memories" 
  ON public.episodic_memories FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Create policies for research_papers
CREATE POLICY "Users can view their own papers" 
  ON public.research_papers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own papers" 
  ON public.research_papers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own papers" 
  ON public.research_papers FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own papers" 
  ON public.research_papers FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for consolidation_logs
CREATE POLICY "Users can view their own consolidation logs" 
  ON public.consolidation_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consolidation logs" 
  ON public.consolidation_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_semantic_memories_updated_at
  BEFORE UPDATE ON public.semantic_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_papers_updated_at
  BEFORE UPDATE ON public.research_papers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to apply time-based decay
CREATE OR REPLACE FUNCTION public.apply_memory_decay()
RETURNS void AS $$
BEGIN
  -- Apply exponential decay to semantic memories based on time since last access
  UPDATE public.semantic_memories
  SET decay_factor = GREATEST(0.1, decay_factor * POWER(0.95, EXTRACT(EPOCH FROM (now() - last_accessed_at)) / 86400.0))
  WHERE decay_factor > 0.1;
  
  -- Apply decay to episodic memories
  UPDATE public.episodic_memories
  SET decay_factor = GREATEST(0.1, decay_factor * POWER(0.92, EXTRACT(EPOCH FROM (now() - last_accessed_at)) / 86400.0))
  WHERE decay_factor > 0.1;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create index for faster queries
CREATE INDEX idx_semantic_memories_user_id ON public.semantic_memories(user_id);
CREATE INDEX idx_semantic_memories_category ON public.semantic_memories(category);
CREATE INDEX idx_semantic_memories_decay ON public.semantic_memories(decay_factor DESC);
CREATE INDEX idx_episodic_memories_user_id ON public.episodic_memories(user_id);
CREATE INDEX idx_episodic_memories_event_type ON public.episodic_memories(event_type);
CREATE INDEX idx_episodic_memories_created_at ON public.episodic_memories(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_research_papers_user_id ON public.research_papers(user_id);