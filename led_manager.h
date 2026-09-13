#ifndef LED_MANAGER_H
#define LED_MANAGER_H

#include <FastLED.h>

// LED Matrix configuration
#define LED_PIN       4          // Data Pin
#define MATRIX_WIDTH  8
#define MATRIX_HEIGHT 8
#define NUM_LEDS      (MATRIX_WIDTH * MATRIX_HEIGHT)
#define BRIGHTNESS    50         
#define LED_TYPE      WS2812B
#define COLOR_ORDER   GRB

// Array to store LED color data
CRGB leds[NUM_LEDS];

void setupLEDs() {
  Serial.println("Initializing LED Matrix...");
  
  // Setup FastLED library
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.setBrightness(BRIGHTNESS);
  
  // Clear all LEDs on startup
  FastLED.clear();
  FastLED.show();
  
  Serial.println("LED Matrix initialized successfully!");
}

// Convert 2D coordinates (X, Y) to 1D index
// Origin (0,0) is Top-Left. 
// Physical routing: Zig-zag starting from Top-Right.
uint16_t getLedIndex(uint8_t x, uint8_t y) {
  // Prevent out of bounds errors
  if (x >= MATRIX_WIDTH || y >= MATRIX_HEIGHT) return 0; 
  
  if (y % 2 == 0) {
    // Even rows (0, 2, 4, 6): physically routed Right to Left
    return (y * MATRIX_WIDTH) + (MATRIX_WIDTH - 1 - x);
  } else {
    // Odd rows (1, 3, 5, 7): physically routed Left to Right
    return (y * MATRIX_WIDTH) + x;
  }
}

// Helper function to draw a single pixel using X, Y coordinates
void drawPixel(uint8_t x, uint8_t y, CRGB color) {
  uint16_t index = getLedIndex(x, y);
  leds[index] = color;
}

// Process the color string received from Web (e.g., "ff0000,000000,...")
void updateMatrixFromWeb(String payload) {
  int index = 0;
  int startPos = 0;
  int commaPos = payload.indexOf(',');
  
  // Scan through the payload and extract each hex color
  while (commaPos != -1 && index < NUM_LEDS) {
    String hexColor = payload.substring(startPos, commaPos);
    uint32_t colorValue = strtol(hexColor.c_str(), NULL, 16); // Convert Hex to INT
    
    // Convert web index (0-63 left-to-right) to X, Y coordinates
    uint8_t x = index % MATRIX_WIDTH;
    uint8_t y = index / MATRIX_WIDTH;
    drawPixel(x, y, colorValue);
    
    startPos = commaPos + 1;
    commaPos = payload.indexOf(',', startPos);
    index++;
  }
  
  // Process the last pixel (64th pixel, no trailing comma)
  if (index < NUM_LEDS) {
    String hexColor = payload.substring(startPos);
    uint32_t colorValue = strtol(hexColor.c_str(), NULL, 16);
    uint8_t x = index % MATRIX_WIDTH;
    uint8_t y = index / MATRIX_WIDTH;
    drawPixel(x, y, colorValue);
  }
  
  // Push changes to the physical matrix
  FastLED.show();
}

// ---Update Brightness Function ---
// Receives brightness value (0-255) from the web interface
void updateBrightnessFromWeb(String payload) {
  int newBrightness = payload.toInt(); // Convert string to integer
  
  // Safety check: Hard limit to 120 to prevent power overload.
  // Developers can change this limit here if using an external power supply.
  if (newBrightness > 120) {
    newBrightness = 120;
  } else if (newBrightness < 0) {
    newBrightness = 0;
  }
  
  FastLED.setBrightness(newBrightness);
  FastLED.show(); // Push the brightness change to the LEDs immediately
  
  Serial.print("Brightness updated to: ");
  Serial.println(newBrightness);
}

#endif