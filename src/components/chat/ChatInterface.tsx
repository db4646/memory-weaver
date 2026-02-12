import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Brain, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";
import { MemorySidebar } from "./MemorySidebar";
import { useChat } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, streamingContent } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">AI Assistant</h1>
              <p className="text-xs text-muted-foreground font-mono">Hybrid memory active</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="font-mono">Semantic</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="font-mono">Episodic</span>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary/60" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary/20 animate-pulse" />
                <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2">Start Your Research Session</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Ask me about papers, concepts, or ideas. I'll help you understand, 
                remember, and connect knowledge across your research journey.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {[
                  "Explain the transformer architecture",
                  "What papers have I read about NLP?",
                  "Summarize my research on memory systems",
                  "Find connections between my notes",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left px-4 py-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {streamingContent && (
                <div className="animate-fade-in">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
                    </div>
                  </div>
                </div>
              )}
              {isLoading && !streamingContent && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 py-2">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your research, papers, or concepts..."
                className={cn(
                  "min-h-[56px] max-h-32 pr-14 resize-none bg-muted/50 border-border/50 focus:border-primary/50 rounded-xl",
                  "placeholder:text-muted-foreground/50"
                )}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              MNEMON uses semantic and episodic memory to provide contextual responses
            </p>
          </form>
        </div>
      </div>

      {/* Memory sidebar */}
      <MemorySidebar />
    </div>
  );
}
