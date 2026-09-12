#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include <ESPmDNS.h>

// Access Point credentials
const char* ssid = "ESP32_LED_Matrix"; // You can change the Wi-Fi name and password here
const char* password = "password123";
const char* mdns_hostname = "8x8ledmatrix"; // Accessible via http://8x8ledmatrix.local

// Network configuration optimization
IPAddress local_IP(192, 168, 4, 1);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

void setupWiFiAP() {
  Serial.println("Configuring Access Point...");
  
  // Set explicit IP configuration to avoid network negotiation overhead
  WiFi.softAPConfig(local_IP, gateway, subnet);
  
  // Parameters: ssid, password, channel (1), hidden (0), max_connection (4)
  if (WiFi.softAP(ssid, password, 1, 0, 4)) {
    Serial.println("Wi-Fi AP initialized successfully!");
  } else {
    Serial.println("Wi-Fi AP initialization failed!");
  }
  
  // Print IP Address
  IPAddress IP = WiFi.softAPIP();
  Serial.print("Web Server IP Address: ");
  Serial.println(IP);

  // Initialize mDNS responder
  if (MDNS.begin(mdns_hostname)) {
    Serial.print("mDNS responder started: http://");
    Serial.print(mdns_hostname);
    Serial.println(".local");
  } else {
    Serial.println("Error setting up mDNS responder!");
  }
}

#endif