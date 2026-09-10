#include "wifi_manager.h"
#include "led_manager.h"

void setup() {
  // Initialize Serial communication for debugging
  Serial.begin(115200);
  
  // Setup Modules
  setupWiFiAP();
  setupLEDs();
}

void loop() {
  // Main execution loop - waiting for Web Server implementation
}