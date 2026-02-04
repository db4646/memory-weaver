import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, ExternalLink, FileText, Image, FileSpreadsheet, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Paper } from "@/hooks/usePapers";

export default function PaperViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("research_papers")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPaper(data);
      } catch (error) {
        console.error("Error fetching paper:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-8 w-8 text-muted-foreground" />;
    if (fileType.includes("pdf")) return <FileText className="h-8 w-8 text-destructive" />;
    if (fileType.includes("image")) return <Image className="h-8 w-8 text-primary" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) 
      return <FileSpreadsheet className="h-8 w-8 text-accent-foreground" />;
    return <FileText className="h-8 w-8 text-primary" />;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Paper not found</p>
        <Button variant="outline" onClick={() => navigate("/memory")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Memory
        </Button>
      </div>
    );
  }

  const isImage = paper.file_type?.includes("image");
  const isPdf = paper.file_type?.includes("pdf");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate("/memory")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {paper.title}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Added {new Date(paper.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {paper.authors && paper.authors.length > 0 && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-4 w-4" />
                {paper.authors.join(", ")}
              </span>
            )}
          </div>
        </div>
        {paper.file_url && (
          <Button variant="outline" asChild>
            <a href={paper.file_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </a>
          </Button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Preview */}
        <div className="flex-1 p-6 overflow-auto">
          {paper.file_url ? (
            <div className="h-full">
              {isImage ? (
                <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg border border-border">
                  <img 
                    src={paper.file_url} 
                    alt={paper.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : isPdf ? (
                <iframe
                  src={paper.file_url}
                  className="w-full h-full rounded-lg border border-border"
                  title={paper.title}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    {getFileIcon(paper.file_type)}
                    <p className="mt-4 text-lg font-medium">{paper.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{paper.file_type}</p>
                    <Button className="mt-6" asChild>
                      <a href={paper.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Download File
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <p className="mt-4 text-muted-foreground">No file attached to this paper</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with details */}
        <div className="w-[300px] border-l border-border p-6 overflow-auto">
          <div className="space-y-6">
            {/* Date */}
            <div>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Date Added</h3>
              <p className="text-sm">
                {new Date(paper.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Field of Study */}
            {paper.field_of_study && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Field of Study</h3>
                <span className="text-xs font-mono px-2 py-1 rounded bg-accent/20 text-accent-foreground">
                  {paper.field_of_study}
                </span>
              </div>
            )}

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Keywords</h3>
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
              </div>
            )}

            {/* Abstract */}
            {paper.abstract && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Abstract</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{paper.abstract}</p>
              </div>
            )}

            {/* Links */}
            {(paper.doi || paper.url) && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Links</h3>
                <div className="space-y-2">
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
        </div>
      </div>
    </div>
  );
}
