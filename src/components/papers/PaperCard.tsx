import { FileText, Image, FileSpreadsheet, ExternalLink } from "lucide-react";
import { Paper } from "@/hooks/usePapers";
import { cn } from "@/lib/utils";

interface PaperCardProps {
  paper: Paper;
  isSelected?: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function PaperCard({ paper, isSelected, onClick, compact = false }: PaperCardProps) {
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-4 w-4 text-muted-foreground" />;
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-destructive" />;
    if (fileType.includes("image")) return <Image className="h-4 w-4 text-primary" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) 
      return <FileSpreadsheet className="h-4 w-4 text-accent-foreground" />;
    return <FileText className="h-4 w-4 text-primary" />;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border border-border/50 bg-muted/30 hover:border-primary/50 transition-colors cursor-pointer",
        isSelected && "border-primary bg-primary/5"
      )}
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
          {!compact && (
            <div className="flex items-center gap-2 mt-2">
              {paper.field_of_study && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground">
                  {paper.field_of_study}
                </span>
              )}
              {paper.file_url && (
                <span className="text-[10px] flex items-center gap-1 text-primary">
                  <ExternalLink className="h-3 w-3" />
                  Has file
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="font-mono">
          Added {new Date(paper.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
