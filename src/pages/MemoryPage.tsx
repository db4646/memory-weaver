import { Brain, Clock, Sparkles, TrendingDown, Plus, BookOpen, FileText, Image, FileSpreadsheet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemories } from "@/hooks/useMemories";
import { usePapers } from "@/hooks/usePapers";
import { cn } from "@/lib/utils";

export default function MemoryPage() {
  const { semanticMemories, episodicMemories, loading } = useMemories();
  const { papers, loading: papersLoading } = usePapers();

  const getDecayColor = (decay: number) => {
    if (decay >= 0.7) return "text-decay-high";
    if (decay >= 0.4) return "text-decay-medium";
    return "text-decay-low";
  };

  const getDecayBg = (decay: number) => {
    if (decay >= 0.7) return "bg-decay-high";
    if (decay >= 0.4) return "bg-decay-medium";
    return "bg-decay-low";
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-4 w-4 text-muted-foreground" />;
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-destructive" />;
    if (fileType.includes("image")) return <Image className="h-4 w-4 text-primary" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) 
      return <FileSpreadsheet className="h-4 w-4 text-accent-foreground" />;
    return <FileText className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Memory Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your hybrid memory system
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Memory
        </Button>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Semantic Memories</CardDescription>
            <CardTitle className="text-3xl text-primary">{semanticMemories.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Facts and concepts</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Episodic Memories</CardDescription>
            <CardTitle className="text-3xl text-secondary">{episodicMemories.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Events and interactions</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Research Papers</CardDescription>
            <CardTitle className="text-3xl text-accent-foreground">{papers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Uploaded documents</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Avg. Semantic Decay</CardDescription>
            <CardTitle className="text-3xl">
              {semanticMemories.length > 0
                ? (semanticMemories.reduce((acc, m) => acc + m.decay_factor, 0) / semanticMemories.length * 100).toFixed(0)
                : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Memory freshness</p>
          </CardContent>
        </Card>
      </div>

      {/* Memory lists */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6 overflow-hidden">
        {/* Semantic Memories */}
        <Card className="border-border/50 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              Semantic Memories
            </CardTitle>
            <CardDescription>Factual knowledge and concepts</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : semanticMemories.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                  <Sparkles className="h-8 w-8 text-primary/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No semantic memories yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chat with the assistant to start building knowledge
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {semanticMemories.map((memory) => (
                    <div
                      key={memory.id}
                      className="p-4 rounded-lg semantic-node hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          {memory.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <TrendingDown className={cn("h-3 w-3", getDecayColor(memory.decay_factor))} />
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", getDecayBg(memory.decay_factor))}
                              style={{ width: `${memory.decay_factor * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {(memory.decay_factor * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{memory.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono">Accessed {memory.access_count}x</span>
                        <span className="font-mono">
                          Created {new Date(memory.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Episodic Memories */}
        <Card className="border-border/50 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-secondary" />
              Episodic Memories
            </CardTitle>
            <CardDescription>Events and interactions timeline</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : episodicMemories.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                  <Clock className="h-8 w-8 text-secondary/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No episodic memories yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your interactions will be recorded here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {episodicMemories.map((memory) => (
                    <div
                      key={memory.id}
                      className="p-4 rounded-lg episodic-node hover:border-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/20 text-secondary uppercase">
                          {memory.event_type}
                        </span>
                        <div className="flex items-center gap-1">
                          <TrendingDown className={cn("h-3 w-3", getDecayColor(memory.decay_factor))} />
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", getDecayBg(memory.decay_factor))}
                              style={{ width: `${memory.decay_factor * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {(memory.decay_factor * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{memory.event_summary}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono">
                          {new Date(memory.created_at).toLocaleDateString()} at{" "}
                          {new Date(memory.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Research Papers */}
        <Card className="border-border/50 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-accent-foreground" />
              Research Papers
            </CardTitle>
            <CardDescription>Uploaded documents and files</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-6">
              {papersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : papers.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                  <BookOpen className="h-8 w-8 text-accent-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No papers yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add papers from the Papers page
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {papers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:border-accent-foreground/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(paper.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{paper.title}</h4>
                          {paper.authors && paper.authors.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              {paper.authors.join(", ")}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {paper.field_of_study && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground">
                                {paper.field_of_study}
                              </span>
                            )}
                            {paper.file_url && (
                              <a
                                href={paper.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] flex items-center gap-1 text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                                View file
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="font-mono">
                          Added {new Date(paper.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
