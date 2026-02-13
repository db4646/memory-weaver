import { useState } from "react";
import { Settings, User, Bell, Shield, Zap, RefreshCw, Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { FeatureToggles } from "@/components/chat/FeatureToggles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [consolidating, setConsolidating] = useState(false);

  const handleRunConsolidation = async () => {
    if (!user) {
      toast.error("You must be logged in to run consolidation.");
      return;
    }
    setConsolidating(true);
    try {
      const { error: decayError } = await supabase.rpc("apply_memory_decay");
      if (decayError) throw decayError;

      const { error: logError } = await supabase
        .from("consolidation_logs")
        .insert({
          user_id: user.id,
          consolidation_type: "decay_update",
          memories_affected: 0,
          details: { triggered_by: "manual" },
        });
      if (logError) throw logError;

      toast.success("Memory consolidation completed successfully!");
    } catch (err: any) {
      console.error("Consolidation error:", err);
      toast.error(err.message || "Consolidation failed.");
    } finally {
      setConsolidating(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure your research assistant
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-mono text-sm">{user?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Member since</Label>
              <p className="font-mono text-sm">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Features */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Active Features
            </CardTitle>
            <CardDescription>Toggle system capabilities on or off</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureToggles />
          </CardContent>
        </Card>

        {/* Memory Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Memory Configuration
            </CardTitle>
            <CardDescription>Configure how memories are stored and retrieved</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-extract concepts</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically extract key concepts from conversations
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Track episodic memories</Label>
                <p className="text-xs text-muted-foreground">
                  Record interaction events for context
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-3">
              <div>
                <Label>Decay rate</Label>
                <p className="text-xs text-muted-foreground">
                  How quickly unused memories fade (slower → more retention)
                </p>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fast decay</span>
                <span>Slow decay</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consolidation */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Memory Consolidation
            </CardTitle>
            <CardDescription>
              Manage automatic memory pruning and summarization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-consolidation</Label>
                <p className="text-xs text-muted-foreground">
                  Periodically summarize and prune old memories
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Merge similar memories</Label>
                <p className="text-xs text-muted-foreground">
                  Combine highly similar semantic memories
                </p>
              </div>
              <Switch />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleRunConsolidation}
              disabled={consolidating}
            >
              {consolidating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {consolidating ? "Running..." : "Run Consolidation Now"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Decay alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when important memories are fading
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Connection discoveries</Label>
                <p className="text-xs text-muted-foreground">
                  Alert when new knowledge connections are found
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Export All Data
            </Button>
            <Button variant="destructive" className="w-full">
              Clear All Memories
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
