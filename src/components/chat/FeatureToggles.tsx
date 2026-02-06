import { useState } from "react";
import { Brain, Search, BarChart3, MessageSquare, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: "semantic" | "episodic" | "accent" | "primary";
}

const features: FeatureToggle[] = [
  {
    id: "consolidation",
    label: "Memory Consolidation",
    description: "Automatic decay and consolidation of older memories",
    icon: <Brain className="h-4 w-4" />,
    color: "semantic",
  },
  {
    id: "similarity",
    label: "Semantic Similarity",
    description: "Find related memories using semantic search",
    icon: <Search className="h-4 w-4" />,
    color: "episodic",
  },
  {
    id: "performance",
    label: "Performance Comparison",
    description: "Compare retrieval performance across memory types",
    icon: <BarChart3 className="h-4 w-4" />,
    color: "accent",
  },
  {
    id: "aiMemory",
    label: "AI Memory Response",
    description: "AI responses grounded in your memory context",
    icon: <MessageSquare className="h-4 w-4" />,
    color: "primary",
  },
];

const colorClasses = {
  semantic: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    glow: "shadow-[0_0_20px_hsl(38_92%_55%/0.2)]",
  },
  episodic: {
    bg: "bg-secondary/10",
    border: "border-secondary/30",
    text: "text-secondary",
    glow: "shadow-[0_0_20px_hsl(187_85%_50%/0.2)]",
  },
  accent: {
    bg: "bg-accent/10",
    border: "border-accent/30",
    text: "text-accent",
    glow: "shadow-[0_0_20px_hsl(265_60%_60%/0.2)]",
  },
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    glow: "shadow-[0_0_20px_hsl(38_92%_55%/0.2)]",
  },
};

interface FeatureTogglesProps {
  onFeaturesChange?: (features: Record<string, boolean>) => void;
}

export function FeatureToggles({ onFeaturesChange }: FeatureTogglesProps) {
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    consolidation: true,
    similarity: true,
    performance: true,
    aiMemory: true,
  });

  const handleToggle = (featureId: string) => {
    const newFeatures = {
      ...enabledFeatures,
      [featureId]: !enabledFeatures[featureId],
    };
    setEnabledFeatures(newFeatures);
    onFeaturesChange?.(newFeatures);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
      {features.map((feature) => {
        const isEnabled = enabledFeatures[feature.id];
        const colors = colorClasses[feature.color];

        return (
          <div
            key={feature.id}
            className={cn(
              "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-300",
              "bg-card/50 hover:bg-card",
              isEnabled ? [colors.border, colors.glow] : "border-border/30",
              isEnabled && "ring-1 ring-inset",
              isEnabled && feature.color === "semantic" && "ring-primary/20",
              isEnabled && feature.color === "episodic" && "ring-secondary/20",
              isEnabled && feature.color === "accent" && "ring-accent/20",
              isEnabled && feature.color === "primary" && "ring-primary/20"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                isEnabled ? colors.bg : "bg-muted/50",
                isEnabled ? colors.text : "text-muted-foreground"
              )}
            >
              {feature.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-medium text-sm transition-colors",
                    isEnabled ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {feature.label}
                </span>
                {isEnabled && (
                  <Check className={cn("h-3.5 w-3.5", colors.text)} />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {feature.description}
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={() => handleToggle(feature.id)}
              className="flex-shrink-0"
            />
          </div>
        );
      })}
    </div>
  );
}
