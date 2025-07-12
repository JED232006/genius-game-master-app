import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Lightbulb, LightbulbOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  playerId: number;
  score: number;
  isActive: boolean;
  isConnected: boolean;
  onScoreChange: (playerId: number, delta: number) => void;
  className?: string;
}

const playerVariants = {
  1: { variant: "player1" as const, color: "bg-player-1", lightColor: "bg-player-1-light", name: "Player 1" },
  2: { variant: "player2" as const, color: "bg-player-2", lightColor: "bg-player-2-light", name: "Player 2" },
  3: { variant: "player3" as const, color: "bg-player-3", lightColor: "bg-player-3-light", name: "Player 3" },
  4: { variant: "player4" as const, color: "bg-player-4", lightColor: "bg-player-4-light", name: "Player 4" },
};

export function PlayerCard({ 
  playerId, 
  score, 
  isActive, 
  isConnected, 
  onScoreChange, 
  className 
}: PlayerCardProps) {
  const player = playerVariants[playerId as keyof typeof playerVariants];
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isActive && "ring-4 ring-primary animate-glow",
      !isConnected && "opacity-50",
      className
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        player.color
      )} />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{player.name}</CardTitle>
          <div className="flex items-center gap-2">
            {isActive ? (
              <Lightbulb className={cn("h-6 w-6 animate-pulse", "text-yellow-400")} />
            ) : (
              <LightbulbOff className="h-6 w-6 text-muted-foreground" />
            )}
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className="text-xs"
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {/* Score Display */}
        <div className="text-center mb-4">
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl font-bold text-white border-4",
            player.color,
            isActive && "animate-pulse"
          )}>
            {score}
          </div>
        </div>
        
        {/* Score Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={player.variant}
            size="iconLg"
            onClick={() => onScoreChange(playerId, -1)}
            disabled={!isConnected || score <= 0}
            className="shadow-lg"
          >
            <Minus className="h-6 w-6" />
          </Button>
          
          <Button
            variant={player.variant}
            size="iconLg"
            onClick={() => onScoreChange(playerId, 1)}
            disabled={!isConnected || score >= 9}
            className="shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}