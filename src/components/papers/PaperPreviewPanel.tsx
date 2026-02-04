import { X, FileText, Image, FileSpreadsheet, Calendar, User, Tag, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paper } from "@/hooks/usePapers";
import { cn } from "@/lib/utils";

interface PaperPreviewPanelProps {
  paper: Paper | null;
  onClose: () => void;
}

export function PaperPreviewPanel({ paper, onClose }: PaperPreviewPanelProps) {
  if (!paper) return null;

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-6 w-6 text-muted-foreground" />;
    if (fileType.includes("pdf")) return <FileText className="h-6 w-6 text-destructive" />;
    if (fileType.includes("image")) return <Image className="h-6 w-6 text-primary" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) 
      return <FileSpreadsheet className="h-6 w-6 text-accent-foreground" />;
    return <FileText className="h-6 w-6 text-primary" />;
  };

  const isImage = paper.file_type?.includes("image");
  const isPdf = paper.file_type?.includes("pdf");

  return (
    <div className="w-[400px] border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Paper Preview</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg leading-tight">{paper.title}</h3>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Added {new Date(paper.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>

          {/* Authors */}
          {paper.authors && paper.authors.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{paper.authors.join(", ")}</span>
            </div>
          )}

          {/* Field of Study */}
          {paper.field_of_study && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-mono px-2 py-1 rounded bg-accent/20 text-accent-foreground">
                {paper.field_of_study}
              </span>
            </div>
          )}

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {paper.keywords.map((keyword, idx) => (
                <span 
                  key={idx}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Abstract */}
          {paper.abstract && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Abstract</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{paper.abstract}</p>
            </div>
          )}

          {/* File Preview */}
          {paper.file_url && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">File</h4>
              
              {isImage ? (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={paper.file_url} 
                    alt={paper.title}
                    className="w-full h-auto object-contain max-h-[300px]"
                  />
                </div>
              ) : isPdf ? (
                <div className="rounded-lg overflow-hidden border border-border bg-muted/50">
                  <iframe
                    src={paper.file_url}
                    className="w-full h-[400px]"
                    title={paper.title}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  {getFileIcon(paper.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{paper.title}</p>
                    <p className="text-xs text-muted-foreground">{paper.file_type}</p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <a href={paper.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          )}

          {/* DOI / URL */}
          {(paper.doi || paper.url) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Links</h4>
              <div className="space-y-1">
                {paper.doi && (
                  <a 
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    DOI: {paper.doi}
                  </a>
                )}
                {paper.url && (
                  <a 
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    External Link
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
