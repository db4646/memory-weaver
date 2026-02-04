import { useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPaperModal } from "@/components/modals/AddPaperModal";

export default function PapersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Research Papers
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your paper library and extract knowledge
          </p>
        </div>
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Paper
        </Button>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search papers by title, author, or keywords..."
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md border-border/50 bg-card/50">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary/60" />
            </div>
            <CardTitle>No papers yet</CardTitle>
            <CardDescription>
              Add research papers to build your knowledge base. Papers will be analyzed
              and their key concepts will be extracted into your semantic memory.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Paper
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: PDF, DOI, arXiv links
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Paper Modal */}
      <AddPaperModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
    </div>
  );
}
