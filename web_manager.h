#ifndef WEB_MANAGER_H
#define WEB_MANAGER_H

#include <WebServer.h>
#include <LittleFS.h>
#include "led_manager.h" // Required to call updateMatrixFromWeb()

// Initialize WebServer on port 80
WebServer server(80);

// Initialize LittleFS to read files from the 'data' folder
void setupLittleFS() {
  if (!LittleFS.begin()) {
    Serial.println("Error: Failed to mount LittleFS!");
    return;
  }
  Serial.println("LittleFS mounted successfully.");
}

// Helper function to serve files from LittleFS to the client
void serveFile(const char* path, const char* contentType) {
  if (LittleFS.exists(path)) {
    File file = LittleFS.open(path, "r");
    server.streamFile(file, contentType);
    file.close();
  } else {
    Serial.print("File not found: ");
    Serial.println(path);
    server.send(404, "text/plain", "404: File Not Found");
  }
}

// Setup all Web Server routes and start the server
void setupWebServer() {
  // 1. Mount the file system
  setupLittleFS();

  // 2. Define routes for static frontend files
  server.on("/", HTTP_GET, []() { 
    serveFile("/index.html", "text/html"); 
  });
  
  server.on("/style.css", HTTP_GET, []() { 
    serveFile("/style.css", "text/css"); 
  });
  
  server.on("/script.js", HTTP_GET, []() { 
    serveFile("/script.js", "application/javascript"); 
  });

  // 3. Define the API route for the Deploy button
  server.on("/deploy", HTTP_POST, []() {
    // Check if the request contains the raw text body
    if (server.hasArg("plain")) {
      String payload = server.arg("plain");
      
      // Pass the comma-separated hex string to the LED manager
      updateMatrixFromWeb(payload); 
      
      // Respond to the frontend that the deployment was successful
      server.send(200, "text/plain", "OK");
    } else {
      server.send(400, "text/plain", "Bad Request: Empty Payload");
    }
  });

  // --- Define the API route for Brightness control ---
  server.on("/brightness", HTTP_POST, []() {
    if (server.hasArg("plain")) {
      String payload = server.arg("plain"); // This will be a string like "50" or "100"
      updateBrightnessFromWeb(payload); 
      server.send(200, "text/plain", "Brightness updated");
    } else {
      server.send(400, "text/plain", "Bad Request: Empty Brightness Payload");
    }
  });

  // 4. Start the server
  server.begin();
  Serial.println("HTTP Web Server started.");
}

// Handle incoming client requests (must be called in the main loop)
void handleWebServer() {
  server.handleClient();
}

#endif