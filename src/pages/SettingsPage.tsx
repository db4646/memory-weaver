import { Settings, User, Bell, Shield, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();

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
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Consolidation Now
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
