import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/memory";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in",
        isUser && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isUser
            ? "bg-muted"
            : "bg-gradient-to-br from-primary/20 to-secondary/20"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
      </div>
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          isUser && "flex justify-end"
        )}
      >
        <div
          className={cn(
            "rounded-xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border/50"
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 pl-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ className, children }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                        {children}
                      </code>
                    ) : (
                      <code className="block p-3 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
