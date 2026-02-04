import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, FileText, Image, FileSpreadsheet } from "lucide-react";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = ".pdf,.png,.jpg,.jpeg,.gif,.webp,.ppt,.pptx,.doc,.docx";

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-destructive" />;
    if (fileType.includes("image")) return <Image className="h-5 w-5 text-primary" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) 
      return <FileSpreadsheet className="h-5 w-5 text-accent-foreground" />;
    return <FileText className="h-5 w-5 text-primary" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 52428800) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (userId: string): Promise<{ url: string; type: string } | null> => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('paper-files')
      .upload(fileName, selectedFile);

    if (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload file");
    }

    const { data: urlData } = supabase.storage
      .from('paper-files')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      type: selectedFile.type
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter the paper title");
      return;
    }

    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to add papers");
        return;
      }

      let fileData: { url: string; type: string } | null = null;
      
      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        fileData = await uploadFile(user.id);
        setIsUploading(false);
      }

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
          file_url: fileData?.url || null,
          file_type: fileData?.type || null,
          user_id: user.id,
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
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding paper:", error);
      toast.error("Failed to add paper");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Research Paper</DialogTitle>
          <DialogDescription>
            Add a paper to your library. Upload PDF, images, or documents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>Upload File (PDF, Image, PPT, DOC)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 transition-colors hover:border-primary/50">
              {selectedFile ? (
                <div className="flex items-center justify-between gap-3 bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(selectedFile.type)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={removeFile}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF, PNG, JPG, PPT, DOC (max 50MB)
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFileTypes}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

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
            <Button type="submit" disabled={isLoading || isUploading}>
              {isUploading ? "Uploading..." : isLoading ? "Adding..." : "Add Paper"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
