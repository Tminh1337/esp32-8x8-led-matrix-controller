# ESP32 8x8 Web-based LED Matrix Controller

A minimalist, standalone web controller for an 8x8 WS2812B LED matrix[cite: 8]. The ESP32 hosts its own Access Point and serves a terminal-styled web interface to draw and deploy pixel art in real-time[cite: 8].

## Tech Stack
* **Hardware**: ESP32 WROOM-32, 8x8 WS2812B LED Matrix[cite: 8].
* **Firmware**: C++ (Arduino IDE 2.x), FastLED library[cite: 8].
* **Web Server**: WebServer.h, LittleFS for file storage[cite: 8].
* **Frontend**: Vanilla HTML, CSS, JavaScript (No external frameworks or JSON libraries)[cite: 8].

## FastLED Calibration & Hardware Quirks

Due to the physical characteristics of WS2812B chips, a few essential software calibrations have been applied in `led_manager.h`:

* **Red Ghosting at Low Brightness**: The red diode requires a lower forward voltage (~2.0V) compared to the green and blue diodes (~3.0V). To prevent the matrix from displaying a dim red ghosting effect instead of white at low power, the minimum brightness floor is safely hardcoded to `5` and temporal dithering is explicitly disabled (`FastLED.setDither(0)`).
* **Pinkish White Tint Calibration**: Default WS2812B matrices often display a pinkish/magenta tint when attempting to output pure white (`#FFFFFF`). This is mitigated in the code using `TypicalSMD5050` color correction combined with a custom color temperature constraint of `CRGB(210, 255, 255)`.
* **CUSTOM HARDWARE TWEAKS**: LED manufacturing batches vary wildly. The provided `CRGB(210, 255, 255)` temperature profile is a baseline. **You should tweak this based on your specific hardware:**
  * If your pure white still looks slightly **pink**, lower the red channel further (e.g., `CRGB(190, 255, 255)`).
  * If your pure white looks too **blue/cool**, increase the red channel (e.g., `CRGB(235, 255, 255)`).

## Important Notes & Configuration

If you are cloning this repository to flash onto your own board, please read the following notes:

* **LittleFS is Required**: The frontend files (`index.html`, `style.css`, `script.js`) are located in the `data/` folder[cite: 8]. You MUST upload this folder to the ESP32's flash memory using the LittleFS Upload Plugin in Arduino IDE[cite: 8]. If you skip this, the web interface will not load[cite: 8].
* **Changing Wi-Fi Credentials**: By default, the ESP32 creates an Access Point named `ESP32_LED_Matrix` with the password `password123`[cite: 8]. You can modify these credentials inside `wifi_manager.h`[cite: 8].
* **Changing the Data Pin**: The default LED data pin is set to GPIO 4[cite: 8]. You can change this in `led_manager.h`[cite: 8].
* **Pins to Avoid**: If you decide to change the data pin, do NOT use[cite: 8]:
  * **Input-only pins**: GPIO 34, 35, 36, 39[cite: 8]. They cannot output data to the LEDs[cite: 8].
  * **Strapping pins**: GPIO 0, 2, 5, 12, 15[cite: 8]. Connecting the matrix to these pins can prevent the ESP32 from booting up properly or entering flashing mode[cite: 8].
* **Power Supply Warning**: An 8x8 WS2812B matrix (64 LEDs) can draw up to ~3.8A at maximum white brightness[cite: 8]. Do NOT power this directly from the ESP32's 5V/VIN pin if you plan to use high brightness, as it will damage the board or your PC's USB port[cite: 8]. Use an external 5V power supply, or keep the `BRIGHTNESS` setting in `led_manager.h` very low (e.g., 50 or below) if testing via USB[cite: 8].
* **Matrix Routing (Index Mapping)**: This code expects a specific physical LED routing: a zig-zag pattern starting from the top-right corner[cite: 8]. If your matrix uses a different layout (e.g., progressive left-to-right, or starts at bottom-left), your drawings will appear scrambled[cite: 8]. You will need to modify the `getLedIndex()` function inside `led_manager.h` to match your specific hardware layout[cite: 8].
* **Logic Level Voltage**: The ESP32 outputs 3.3V logic, while WS2812B LEDs expect 5V logic[cite: 8]. In most short-wire setups, this works perfectly[cite: 8]. However, if you experience LED flickering or random colors, you may need to add a 3.3V to 5V logic level shifter on the data line[cite: 8].