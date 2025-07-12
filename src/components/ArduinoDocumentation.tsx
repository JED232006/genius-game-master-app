import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Microchip, Bluetooth, Lightbulb, Hash } from "lucide-react";

export function ArduinoDocumentation() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Arduino Setup Guide</h2>
        <p className="text-muted-foreground">Complete setup instructions for your quiz device</p>
      </div>

      {/* Hardware Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microchip className="h-5 w-5" />
            Hardware Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Required Components:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Arduino Uno/Nano/ESP32</li>
                <li>• HC-05 or HC-06 Bluetooth module</li>
                <li>• 4x Push buttons</li>
                <li>• 4x LEDs (bulbs)</li>
                <li>• 4x 7-segment displays</li>
                <li>• Resistors (220Ω for LEDs, 10kΩ for buttons)</li>
                <li>• Breadboard and jumper wires</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pin Configuration:</h4>
              <div className="text-sm space-y-1">
                <div><Badge variant="outline">D2-D5</Badge> Push buttons</div>
                <div><Badge variant="outline">D6-D9</Badge> LED bulbs</div>
                <div><Badge variant="outline">D10-D13</Badge> 7-segment data</div>
                <div><Badge variant="outline">A0-A3</Badge> 7-segment control</div>
                <div><Badge variant="outline">D0,D1</Badge> Bluetooth (RX/TX)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arduino Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Arduino Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`#include <SoftwareSerial.h>

// Bluetooth module pins
SoftwareSerial bluetooth(0, 1); // RX, TX

// Button pins
const int buttonPins[4] = {2, 3, 4, 5};
// LED pins
const int ledPins[4] = {6, 7, 8, 9};
// 7-segment display pins
const int segmentPins[4] = {10, 11, 12, 13};
const int digitPins[4] = {A0, A1, A2, A3};

// Game state
int playerScores[4] = {0, 0, 0, 0};
bool buttonPressed[4] = {false, false, false, false};
bool gameActive = false;
int activePlayer = -1;
unsigned long timerStart = 0;
const unsigned long TIMER_DURATION = 5000; // 5 seconds

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  
  // Initialize pins
  for(int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
    pinMode(ledPins[i], OUTPUT);
    pinMode(segmentPins[i], OUTPUT);
    pinMode(digitPins[i], OUTPUT);
    
    digitalWrite(ledPins[i], LOW);
    digitalWrite(segmentPins[i], LOW);
    digitalWrite(digitPins[i], HIGH);
  }
  
  // Display initial scores
  updateAllDisplays();
}

void loop() {
  // Check for button presses (only if game not active)
  if(!gameActive) {
    for(int i = 0; i < 4; i++) {
      if(digitalRead(buttonPins[i]) == LOW && !buttonPressed[i]) {
        buttonPressed[i] = true;
        activatePlayer(i + 1);
        break; // Only first press counts
      }
    }
  }
  
  // Handle timer
  if(gameActive && (millis() - timerStart) >= TIMER_DURATION) {
    deactivatePlayer();
  }
  
  // Reset button states when released
  for(int i = 0; i < 4; i++) {
    if(digitalRead(buttonPins[i]) == HIGH) {
      buttonPressed[i] = false;
    }
  }
  
  // Handle Bluetooth messages
  handleBluetoothMessages();
  
  // Update displays
  updateAllDisplays();
  
  delay(50);
}

void activatePlayer(int playerId) {
  activePlayer = playerId - 1;
  gameActive = true;
  timerStart = millis();
  
  // Turn on player's LED
  digitalWrite(ledPins[activePlayer], HIGH);
  
  // Send message to app
  bluetooth.print("{\\"type\\":\\"BUTTON_PRESS\\",\\"playerId\\":");
  bluetooth.print(playerId);
  bluetooth.println("}");
}

void deactivatePlayer() {
  if(activePlayer >= 0) {
    digitalWrite(ledPins[activePlayer], LOW);
  }
  
  activePlayer = -1;
  gameActive = false;
}

void handleBluetoothMessages() {
  if(bluetooth.available()) {
    String message = bluetooth.readStringUntil('\\n');
    message.trim();
    
    // Parse JSON-like message
    if(message.indexOf("SCORE_UPDATE") > 0) {
      int playerIdStart = message.indexOf("playerId") + 11;
      int playerIdEnd = message.indexOf(",", playerIdStart);
      int playerId = message.substring(playerIdStart, playerIdEnd).toInt();
      
      int scoreStart = message.indexOf("score") + 8;
      int scoreEnd = message.indexOf("}", scoreStart);
      int score = message.substring(scoreStart, scoreEnd).toInt();
      
      if(playerId >= 1 && playerId <= 4) {
        playerScores[playerId - 1] = constrain(score, 0, 9);
      }
    }
    else if(message.indexOf("BULB_CONTROL") > 0) {
      int playerIdStart = message.indexOf("playerId") + 11;
      int playerIdEnd = message.indexOf(",", playerIdStart);
      int playerId = message.substring(playerIdStart, playerIdEnd).toInt();
      
      bool isOn = message.indexOf("true") > 0;
      
      if(playerId >= 1 && playerId <= 4) {
        digitalWrite(ledPins[playerId - 1], isOn ? HIGH : LOW);
      }
    }
  }
}

void updateAllDisplays() {
  for(int i = 0; i < 4; i++) {
    displayDigit(i, playerScores[i]);
  }
}

void displayDigit(int display, int digit) {
  // 7-segment patterns for digits 0-9
  const byte patterns[10] = {
    0b11111100, // 0
    0b01100000, // 1
    0b11011010, // 2
    0b11110010, // 3
    0b01100110, // 4
    0b10110110, // 5
    0b10111110, // 6
    0b11100000, // 7
    0b11111110, // 8
    0b11110110  // 9
  };
  
  if(digit >= 0 && digit <= 9) {
    // Activate the display
    digitalWrite(digitPins[display], LOW);
    
    // Send pattern to segments
    byte pattern = patterns[digit];
    for(int seg = 0; seg < 8; seg++) {
      digitalWrite(segmentPins[display], (pattern >> (7-seg)) & 0x01);
    }
    
    delay(5); // Brief display time
    digitalWrite(digitPins[display], HIGH);
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Bluetooth Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Bluetooth Communication Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Messages from Arduino to App:</h4>
            <div className="bg-muted p-3 rounded text-sm">
              <code>{"{"}"type":"BUTTON_PRESS","playerId":1{"}"}</code>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Messages from App to Arduino:</h4>
            <div className="space-y-2">
              <div className="bg-muted p-3 rounded text-sm">
                <div><strong>Score Update:</strong></div>
                <code>{"{"}"type":"SCORE_UPDATE","playerId":1,"data":{"{"}"score":5{"}"}{"}"}</code>
              </div>
              <div className="bg-muted p-3 rounded text-sm">
                <div><strong>Bulb Control:</strong></div>
                <code>{"{"}"type":"BULB_CONTROL","playerId":1,"data":{"{"}"isOn":true{"}"}{"}"}</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Hardware Assembly</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Connect buttons to digital pins 2-5 with pull-up resistors</li>
                <li>• Connect LEDs to digital pins 6-9 with current-limiting resistors</li>
                <li>• Wire 7-segment displays to pins 10-13 (data) and A0-A3 (control)</li>
                <li>• Connect HC-05 module: VCC to 5V, GND to GND, RX to D1, TX to D0</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Arduino Programming</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Upload the provided code to your Arduino</li>
                <li>• Ensure the Bluetooth module is properly configured</li>
                <li>• Test button presses and LED responses</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Mobile App Connection</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Open the Budding Geniuses app on your mobile device</li>
                <li>• Tap "Connect" in the Bluetooth section</li>
                <li>• Select your Arduino device from the list</li>
                <li>• Test the connection using the manual test buttons</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}