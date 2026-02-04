import { Database, Plus, Search, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function KnowledgePage() {
  return (
    <div className="h-full flex flex-col">
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
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Concept
        </Button>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search concepts..."
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Empty state / Graph placeholder */}
      <div className="flex-1 flex items-center justify-center p-6">
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
    </div>
  );
}
