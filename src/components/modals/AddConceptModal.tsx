import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddConceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Machine Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Reinforcement Learning",
  "Neural Networks",
  "Data Science",
  "Mathematics",
  "Research Methodology",
  "Other"
];

export function AddConceptModal({ open, onOpenChange, onSuccess }: AddConceptModalProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please enter the concept content");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("semantic_memories")
        .insert({
          content: content.trim(),
          category: category || null,
          source_reference: sourceReference.trim() || null,
          source_type: "manual",
          importance_score: 0.7,
          decay_factor: 1.0,
        });

      if (error) throw error;

      toast.success("Concept added successfully!");
      setContent("");
      setCategory("");
      setSourceReference("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding concept:", error);
      toast.error("Failed to add concept");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Concept</DialogTitle>
          <DialogDescription>
            Add a piece of knowledge to your semantic memory. This will be available for the AI to reference.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Concept / Knowledge *</Label>
            <Textarea
              id="content"
              placeholder="e.g., Transformers use self-attention mechanisms to process sequential data in parallel..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source Reference</Label>
            <Input
              id="source"
              placeholder="e.g., Attention Is All You Need (2017)"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Concept"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
