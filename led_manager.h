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

#endif