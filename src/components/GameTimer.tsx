import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface GameTimerProps {
  isActive: boolean;
  duration: number; // in seconds
  onTimerEnd: () => void;
  className?: string;
}

export function GameTimer({ isActive, duration, onTimerEnd, className }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isActive, timeLeft, onTimerEnd]);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
    }
  }, [isActive, duration]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className={cn(
            "h-5 w-5",
            isActive ? "text-orange-500 animate-pulse" : "text-muted-foreground"
          )} />
          Answer Timer
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Timer display */}
          <div className="text-center">
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold border-4 transition-all duration-200",
              isActive 
                ? "bg-orange-500 text-white border-orange-400 animate-glow" 
                : "bg-muted text-muted-foreground border-border"
            )}>
              {timeLeft}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute top-0 left-0 h-full transition-all duration-1000 ease-linear",
                isActive ? "bg-orange-500" : "bg-muted-foreground"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-center">
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "flex items-center gap-2",
                isActive && "bg-orange-500 animate-pulse-slow"
              )}
            >
              {isActive ? (
                <>
                  <Play className="h-3 w-3" />
                  Active - {timeLeft}s remaining
                </>
              ) : timeLeft === 0 ? (
                <>
                  <Square className="h-3 w-3" />
                  Time's up!
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3" />
                  Waiting for button press
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}