import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, BluetoothConnected, BluetoothOff, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BluetoothStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  deviceName?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}

export function BluetoothStatus({
  isConnected,
  isConnecting,
  deviceName,
  onConnect,
  onDisconnect,
  className
}: BluetoothStatusProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isConnected ? (
            <BluetoothConnected className="h-5 w-5 text-blue-500" />
          ) : (
            <Bluetooth className="h-5 w-5 text-muted-foreground" />
          )}
          Bluetooth Connection
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className={cn(
                "transition-all duration-200",
                isConnected && "bg-green-500 animate-pulse-slow"
              )}
            >
              {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
            </Badge>
            
            {deviceName && (
              <span className="text-sm text-muted-foreground">
                {deviceName}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={onConnect}
                disabled={isConnecting}
                variant="game"
                size="sm"
                className="shadow-lg"
              >
                {isConnecting ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onDisconnect}
                variant="destructive"
                size="sm"
                className="shadow-lg"
              >
                <BluetoothOff className="h-4 w-4" />
                Disconnect
              </Button>
            )}
          </div>
        </div>
        
        {!isConnected && !isConnecting && (
          <p className="text-xs text-muted-foreground mt-2">
            Make sure your Arduino device is powered on and in pairing mode
          </p>
        )}
      </CardContent>
    </Card>
  );
}