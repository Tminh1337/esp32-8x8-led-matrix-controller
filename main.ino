#include "wifi_manager.h"
#include "led_manager.h"
#include "web_manager.h"

void setup() {
  // Initialize Serial communication for debugging
  Serial.begin(115200);
  
  // Setup system modules
  setupWiFiAP();     // Initialize Wi-Fi Access Point
  setupLEDs();       // Initialize FastLED matrix
  setupWebServer();  // Mount LittleFS and start HTTP server
}

void loop() {
  // Handle incoming HTTP web server requests continuously
  handleWebServer();
}