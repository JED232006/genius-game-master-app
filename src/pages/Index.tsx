import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, RotateCcw, Trophy, Zap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { PlayerCard } from "@/components/PlayerCard";
import { BluetoothStatus } from "@/components/BluetoothStatus";
import { GameTimer } from "@/components/GameTimer";
import { useBluetoothConnection } from "@/hooks/useBluetoothConnection";
import { useGameState } from "@/hooks/useGameState";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const bluetooth = useBluetoothConnection();
  const { gameState, updateScore, handleTimerEnd, resetGame, manualActivatePlayer } = useGameState();
  const { toast } = useToast();

  // Send score updates to Arduino when scores change
  useEffect(() => {
    if (bluetooth.isConnected) {
      gameState.players.forEach(player => {
        bluetooth.sendScoreUpdate(player.id, player.score);
      });
    }
  }, [gameState.players, bluetooth.isConnected, bluetooth.sendScoreUpdate]);

  // Send bulb control to Arduino when active player changes
  useEffect(() => {
    if (bluetooth.isConnected) {
      gameState.players.forEach(player => {
        bluetooth.sendBulbControl(player.id, player.isActive);
      });
    }
  }, [gameState.players, bluetooth.isConnected, bluetooth.sendBulbControl]);

  const handleScoreChange = (playerId: number, delta: number) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    const newScore = player.score + delta;
    if (newScore < 0 || newScore > 9) {
      toast({
        title: "Score Limit",
        description: `Player ${playerId} score must be between 0 and 9`,
        variant: "destructive",
      });
      return;
    }

    updateScore(playerId, delta);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-gradient-game rounded-full">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-game bg-clip-text text-transparent">
              Budding Geniuses Quiz Controller
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Control your quiz game with 4 players. Connect via Bluetooth to manage scores, 
            detect button presses, and control the game flow.
          </p>
          <div className="flex justify-center">
            <Link to="/docs">
              <Button variant="outline" size="lg" className="shadow-lg">
                <BookOpen className="h-5 w-5" />
                Arduino Setup Guide
              </Button>
            </Link>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bluetooth Connection */}
          <BluetoothStatus
            isConnected={bluetooth.isConnected}
            isConnecting={bluetooth.isConnecting}
            deviceName={bluetooth.deviceName}
            onConnect={bluetooth.connect}
            onDisconnect={bluetooth.disconnect}
          />

          {/* Game Timer */}
          <GameTimer
            isActive={gameState.timerActive}
            duration={5}
            onTimerEnd={handleTimerEnd}
          />

          {/* Game Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Game Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={resetGame}
                variant="game"
                size="lg"
                className="w-full shadow-lg"
              >
                <RotateCcw className="h-5 w-5" />
                Reset Game
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Manual Test</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(playerId => (
                    <Button
                      key={playerId}
                      onClick={() => manualActivatePlayer(playerId)}
                      variant="outline"
                      size="sm"
                      disabled={gameState.timerActive}
                      className="flex-1"
                    >
                      P{playerId}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {gameState.players.map((player) => (
            <PlayerCard
              key={player.id}
              playerId={player.id}
              score={player.score}
              isActive={player.isActive}
              isConnected={bluetooth.isConnected}
              onScoreChange={handleScoreChange}
              className="h-full"
            />
          ))}
        </div>

        {/* Game Status */}
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={`h-6 w-6 ${gameState.gameStatus === 'active' ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                <div>
                  <h3 className="font-semibold">Game Status</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {gameState.gameStatus === 'waiting' && 'Waiting for button press'}
                    {gameState.gameStatus === 'active' && `Player ${gameState.activePlayer} is answering`}
                    {gameState.gameStatus === 'finished' && 'Round finished'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Connection</p>
                <p className="font-semibold">
                  {bluetooth.isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-primary">How to Use</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">1. Connect Bluetooth</h4>
                <p className="text-muted-foreground">
                  Click "Connect" to pair with your Arduino quiz device. Make sure the device is powered on.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Player Interaction</h4>
                <p className="text-muted-foreground">
                  When a player presses their button, their bulb lights up for 5 seconds and they can answer.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Manage Scores</h4>
                <p className="text-muted-foreground">
                  Use the +/- buttons to update each player's score. Scores are displayed on their 7-segment displays.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
