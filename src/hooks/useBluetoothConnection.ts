import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Declare global Bluetooth Web API types
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: {
        filters?: Array<{ name?: string; namePrefix?: string; services?: string[] }>;
        optionalServices?: string[];
      }): Promise<BluetoothDevice>;
    };
  }

  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(type: 'gattserverdisconnected', listener: () => void): void;
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    value?: DataView;
    writeValue(value: BufferSource): Promise<void>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
  }
}

export interface BluetoothMessage {
  type: 'BUTTON_PRESS' | 'SCORE_UPDATE' | 'BULB_CONTROL';
  playerId: number;
  data?: any;
}

export function useBluetoothConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState<string>();
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const { toast } = useToast();

  const sendMessage = useCallback(async (message: BluetoothMessage) => {
    if (!characteristicRef.current || !isConnected) {
      console.warn('Bluetooth not connected, cannot send message:', message);
      return false;
    }

    try {
      const messageString = JSON.stringify(message);
      const encoder = new TextEncoder();
      const data = encoder.encode(messageString);
      
      await characteristicRef.current.writeValue(data);
      console.log('Sent message:', message);
      return true;
    } catch (error) {
      console.error('Failed to send Bluetooth message:', error);
      toast({
        title: "Communication Error",
        description: "Failed to send command to device",
        variant: "destructive",
      });
      return false;
    }
  }, [isConnected, toast]);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Your browser doesn't support Web Bluetooth API",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Request device with quiz game service
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'Budding Geniuses' },
          { namePrefix: 'Quiz' },
          { namePrefix: 'Arduino' }
        ],
        optionalServices: ['12345678-1234-1234-1234-123456789abc'] // Custom service UUID
      });

      setDeviceName(device.name || 'Unknown Device');
      
      // Connect to GATT server
      const server = await device.gatt!.connect();
      
      // Get the quiz game service
      const service = await server.getPrimaryService('12345678-1234-1234-1234-123456789abc');
      
      // Get the characteristic for communication
      const characteristic = await service.getCharacteristic('87654321-4321-4321-4321-cba987654321');
      
      // Listen for messages from Arduino
      characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        const decoder = new TextDecoder();
        const message = decoder.decode(target.value!);
        
        try {
          const data = JSON.parse(message) as BluetoothMessage;
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Failed to parse incoming message:', message);
        }
      });

      // Start notifications
      await characteristic.startNotifications();
      
      deviceRef.current = device;
      characteristicRef.current = characteristic;
      setIsConnected(true);
      
      toast({
        title: "Connected Successfully",
        description: `Connected to ${device.name || 'Quiz Device'}`,
      });

      // Handle disconnect
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setDeviceName(undefined);
        deviceRef.current = null;
        characteristicRef.current = null;
        
        toast({
          title: "Device Disconnected",
          description: "The quiz device has been disconnected",
          variant: "destructive",
        });
      });

    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the quiz device",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    if (deviceRef.current?.gatt?.connected) {
      await deviceRef.current.gatt.disconnect();
    }
    
    setIsConnected(false);
    setDeviceName(undefined);
    deviceRef.current = null;
    characteristicRef.current = null;
    
    toast({
      title: "Disconnected",
      description: "Disconnected from quiz device",
    });
  }, [toast]);

  const handleIncomingMessage = useCallback((message: BluetoothMessage) => {
    console.log('Received message:', message);
    
    // Dispatch custom events that components can listen to
    const event = new CustomEvent('bluetoothMessage', { detail: message });
    window.dispatchEvent(event);
  }, []);

  const sendScoreUpdate = useCallback(async (playerId: number, score: number) => {
    return await sendMessage({
      type: 'SCORE_UPDATE',
      playerId,
      data: { score }
    });
  }, [sendMessage]);

  const sendBulbControl = useCallback(async (playerId: number, isOn: boolean) => {
    return await sendMessage({
      type: 'BULB_CONTROL',
      playerId,
      data: { isOn }
    });
  }, [sendMessage]);

  return {
    isConnected,
    isConnecting,
    deviceName,
    connect,
    disconnect,
    sendScoreUpdate,
    sendBulbControl,
    sendMessage
  };
}