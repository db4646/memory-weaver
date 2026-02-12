import { useState } from "react";
import { Sparkles, Brain, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        await resetPassword(email);
      } else if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch {
      // Error is handled in useAuth
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-secondary animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">MNEMON</h1>
              <p className="text-muted-foreground font-mono text-sm">Hybrid Memory Research Assistant</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Your knowledge,
            <br />
            <span className="text-primary">never forgotten.</span>
          </h2>

          <p className="text-muted-foreground text-lg mb-12 max-w-md">
            A novel hybrid memory system that combines episodic and semantic memory 
            to help you research smarter over months of study.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl semantic-node flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Semantic Memory</h3>
                <p className="text-sm text-muted-foreground">Factual knowledge that grows with you</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl episodic-node flex items-center justify-center">
                <Database className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Episodic Memory</h3>
                <p className="text-sm text-muted-foreground">Time-indexed events and interactions</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Consolidation</h3>
                <p className="text-sm text-muted-foreground">Time-based decay keeps knowledge fresh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border/50 shadow-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Sign in to access your research memories"
                : mode === "signup"
                ? "Start building your knowledge base"
                : "Enter your email to receive a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="researcher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-muted/50"
                  />
                </div>
              )}
              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {mode === "login" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending reset link..."}
                  </div>
                ) : (
                  mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === "forgot" ? (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to <span className="text-primary font-medium">Sign in</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mode === "login" ? (
                    <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
                  )}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
