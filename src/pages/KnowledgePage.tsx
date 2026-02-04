import { useState } from "react";
import { Database, Plus, Search, Network, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddConceptModal } from "@/components/modals/AddConceptModal";
import { usePapers, Paper } from "@/hooks/usePapers";
import { PaperCard } from "@/components/papers/PaperCard";
import { PaperPreviewPanel } from "@/components/papers/PaperPreviewPanel";

export default function KnowledgePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { papers, loading: papersLoading } = usePapers();
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPapers = papers.filter(paper => 
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
    paper.field_of_study?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Knowledge Graph
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore connections between concepts in your knowledge base
            </p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Concept
          </Button>
        </header>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search papers by title, author, or keywords..."
              className="pl-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden">
          {/* Knowledge Graph Placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md border-border/50 bg-card/50">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                  <Network className="h-8 w-8 text-primary/60" />
                </div>
                <CardTitle>Knowledge Graph</CardTitle>
                <CardDescription>
                  As you interact with the assistant and add papers, your knowledge graph
                  will grow. Concepts will be automatically linked based on their relationships.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    NLP
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-secondary/10 text-secondary border border-secondary/20">
                    Transformers
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
                    Memory
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Start chatting or adding papers to build connections
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Research Papers List */}
          <Card className="w-[350px] border-border/50 flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-accent-foreground" />
                Research Papers
              </CardTitle>
              <CardDescription>Click to preview files</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-6 pb-6">
                {papersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : filteredPapers.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-8 w-8 text-accent-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No papers match your search" : "No papers yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery ? "Try a different search term" : "Add papers from the Papers page"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPapers.map((paper) => (
                      <PaperCard
                        key={paper.id}
                        paper={paper}
                        isSelected={selectedPaper?.id === paper.id}
                        onClick={() => setSelectedPaper(paper)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Add Concept Modal */}
        <AddConceptModal 
          open={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen} 
        />
      </div>

      {/* Preview Panel */}
      {selectedPaper && (
        <PaperPreviewPanel
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </div>
  );
}
