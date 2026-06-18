import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message = "Loading...", className }: PageLoaderProps) {
  return (
    <div className={cn("min-h-[50vh] flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse-soft">{message}</p>
    </div>
  );
}
