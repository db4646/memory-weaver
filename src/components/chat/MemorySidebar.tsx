import { useState } from "react";
import { Brain, Clock, ChevronRight, Sparkles, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemories } from "@/hooks/useMemories";

export function MemorySidebar() {
  const [expanded, setExpanded] = useState(true);
  const { semanticMemories, episodicMemories, loading } = useMemories();

  const getDecayColor = (decay: number) => {
    if (decay >= 0.7) return "text-decay-high";
    if (decay >= 0.4) return "text-decay-medium";
    return "text-decay-low";
  };

  const getDecayWidth = (decay: number) => {
    return `${decay * 100}%`;
  };

  return (
    <aside
      className={cn(
        "border-l border-border bg-card/50 transition-all duration-300 flex flex-col",
        expanded ? "w-80" : "w-12"
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setExpanded(!expanded)}
        className="self-start m-2"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </Button>

      {expanded && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 pb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Active Memories
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Memories influencing this conversation
            </p>
          </div>

          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {/* Semantic Memories */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Brain className="h-3 w-3 text-primary" />
                    SEMANTIC ({semanticMemories.length})
                  </h3>
                  <div className="space-y-2">
                    {semanticMemories.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No semantic memories yet
                      </p>
                    ) : (
                      semanticMemories.slice(0, 5).map((memory) => (
                        <div
                          key={memory.id}
                          className="p-3 rounded-lg semantic-node"
                        >
                          <p className="text-xs font-medium line-clamp-2 mb-2">
                            {memory.content}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-mono">
                              {memory.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <TrendingDown className={cn("h-3 w-3", getDecayColor(memory.decay_factor))} />
                              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", {
                                    "bg-decay-high": memory.decay_factor >= 0.7,
                                    "bg-decay-medium": memory.decay_factor >= 0.4 && memory.decay_factor < 0.7,
                                    "bg-decay-low": memory.decay_factor < 0.4,
                                  })}
                                  style={{ width: getDecayWidth(memory.decay_factor) }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Episodic Memories */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-secondary" />
                    EPISODIC ({episodicMemories.length})
                  </h3>
                  <div className="space-y-2">
                    {episodicMemories.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No episodic memories yet
                      </p>
                    ) : (
                      episodicMemories.slice(0, 5).map((memory) => (
                        <div
                          key={memory.id}
                          className="p-3 rounded-lg episodic-node"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">
                              {memory.event_type}
                            </span>
                          </div>
                          <p className="text-xs font-medium line-clamp-2 mb-2">
                            {memory.event_summary}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-mono">
                              {new Date(memory.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <TrendingDown className={cn("h-3 w-3", getDecayColor(memory.decay_factor))} />
                              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", {
                                    "bg-decay-high": memory.decay_factor >= 0.7,
                                    "bg-decay-medium": memory.decay_factor >= 0.4 && memory.decay_factor < 0.7,
                                    "bg-decay-low": memory.decay_factor < 0.4,
                                  })}
                                  style={{ width: getDecayWidth(memory.decay_factor) }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Footer stats */}
          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-primary">{semanticMemories.length}</p>
                <p className="text-[10px] text-muted-foreground font-mono">FACTS</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-secondary">{episodicMemories.length}</p>
                <p className="text-[10px] text-muted-foreground font-mono">EVENTS</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
