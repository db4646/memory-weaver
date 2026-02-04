import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddPaperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPaperModal({ open, onOpenChange, onSuccess }: AddPaperModalProps) {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [abstract, setAbstract] = useState("");
  const [doi, setDoi] = useState("");
  const [url, setUrl] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter the paper title");
      return;
    }

    setIsLoading(true);
    
    try {
      const authorsList = authors.split(",").map(a => a.trim()).filter(Boolean);
      const keywordsList = keywords.split(",").map(k => k.trim()).filter(Boolean);

      const { error } = await supabase
        .from("research_papers")
        .insert({
          title: title.trim(),
          authors: authorsList.length > 0 ? authorsList : null,
          abstract: abstract.trim() || null,
          doi: doi.trim() || null,
          url: url.trim() || null,
          field_of_study: fieldOfStudy.trim() || null,
          keywords: keywordsList.length > 0 ? keywordsList : null,
          importance_score: 0.7,
        });

      if (error) throw error;

      toast.success("Paper added successfully!");
      // Reset form
      setTitle("");
      setAuthors("");
      setAbstract("");
      setDoi("");
      setUrl("");
      setFieldOfStudy("");
      setKeywords("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding paper:", error);
      toast.error("Failed to add paper");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Research Paper</DialogTitle>
          <DialogDescription>
            Add a paper to your library. Key concepts will be extracted into your knowledge base.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Attention Is All You Need"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authors">Authors (comma-separated)</Label>
            <Input
              id="authors"
              placeholder="e.g., Vaswani, Shazeer, Parmar"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              placeholder="Paper abstract..."
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="min-h-[80px] bg-muted/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                placeholder="10.1234/example"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://arxiv.org/abs/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                placeholder="e.g., Natural Language Processing"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="e.g., attention, transformers, NLP"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="bg-muted/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Paper"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
