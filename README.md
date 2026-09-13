# ESP32 8x8 Web-based LED Matrix Controller

A minimalist, standalone web controller for an 8x8 WS2812B LED matrix. The ESP32 hosts its own Access Point and serves a terminal-styled web interface to draw and deploy pixel art in real-time.

## Tech Stack
* **Hardware**: ESP32 WROOM-32, 8x8 WS2812B LED Matrix.
* **Firmware**: C++ (Arduino IDE 2.x), FastLED library.
* **Web Server**: WebServer.h, LittleFS for file storage.
* **Frontend**: Vanilla HTML, CSS, JavaScript (No external frameworks or JSON libraries).

## Important Notes & Configuration

If you are cloning this repository to flash onto your own board, please read the following notes:

* **LittleFS is Required**: The frontend files (`index.html`, `style.css`, `script.js`) are located in the `data/` folder. You MUST upload this folder to the ESP32's flash memory using the LittleFS Upload Plugin in Arduino IDE. If you skip this, the web interface will not load.
* **Changing Wi-Fi Credentials**: By default, the ESP32 creates an Access Point named `ESP32_LED_Matrix` with the password `password123`. You can modify these credentials inside `wifi_manager.h`.
* **Changing the Data Pin**: The default LED data pin is set to GPIO 4. You can change this in `led_manager.h`.
* **Pins to Avoid**: If you decide to change the data pin, do NOT use:
  * **Input-only pins**: GPIO 34, 35, 36, 39. They cannot output data to the LEDs.
  * **Strapping pins**: GPIO 0, 2, 5, 12, 15. Connecting the matrix to these pins can prevent the ESP32 from booting up properly or entering flashing mode.
* **Power Supply Warning**: An 8x8 WS2812B matrix (64 LEDs) can draw up to ~3.8A at maximum white brightness. Do NOT power this directly from the ESP32's 5V/VIN pin if you plan to use high brightness, as it will damage the board or your PC's USB port. Use an external 5V power supply, or keep the `BRIGHTNESS` setting in `led_manager.h` very low (e.g., 50 or below) if testing via USB.
* **Matrix Routing (Index Mapping)**: This code expects a specific physical LED routing: a zig-zag pattern starting from the top-right corner. If your matrix uses a different layout (e.g., progressive left-to-right, or starts at bottom-left), your drawings will appear scrambled. You will need to modify the `getLedIndex()` function inside `led_manager.h` to match your specific hardware layout.
* **Logic Level Voltage**: The ESP32 outputs 3.3V logic, while WS2812B LEDs expect 5V logic. In most short-wire setups, this works perfectly. However, if you experience LED flickering or random colors, you may need to add a 3.3V to 5V logic level shifter on the data line.