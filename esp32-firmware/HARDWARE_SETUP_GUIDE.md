# ChefPax IoT Hardware Setup Guide

## Hardware You Purchased

Based on the components in `src/lib/iot-hardware.ts`, here's what you should have:

### Controllers
- **2x ESP32 DevKit C** - WiFi-enabled microcontrollers

### Sensors
- **3x DHT22** - Temperature & Humidity sensors
- **4x Photoresistors (GL5528)** - Light level sensors
- **1x Analog pH Sensor Kit (SEN0161)** - Water pH monitoring
- **2x HC-SR04** - Ultrasonic distance sensors (water level)
- **1x MH-Z19** - CO2 sensor
- **2x YF-S201** - Water flow sensors

### Control & Power
- **1x 4-Channel Relay Module** - Control pumps, lights, fans
- **1x 5V 3A Power Supply**

### Accessories
- **2x Breadboards (830 point)**
- **1x Jumper Wire Kit** (120 wires)
- **1x Resistor Kit** (600 resistors)
- **2x Weatherproof Enclosures (IP65)**

**Total Investment: ~$200-300**

---

## Wiring Diagrams

### Device 1: Main Grow Room Monitor

**ESP32 #1 Connections:**

```
DHT22 (Temperature & Humidity):
  VCC  → 3.3V
  GND  → GND
  DATA → GPIO 4

Photoresistor (Light Level):
  One leg → 3.3V
  Other leg → GPIO 34 AND one leg of 10kΩ resistor
  Other leg of resistor → GND

MH-Z19 (CO2 Sensor):
  VIN → 5V
  GND → GND
  TX  → GPIO 16 (ESP32 RX)
  RX  → GPIO 17 (ESP32 TX)
```

### Device 2: Water System Controller

**ESP32 #2 Connections:**

```
pH Sensor:
  VCC → 5V
  GND → GND
  OUT → GPIO 35

HC-SR04 (Water Level):
  VCC  → 5V
  GND  → GND
  TRIG → GPIO 5
  ECHO → GPIO 18

YF-S201 (Water Flow):
  RED   → 5V
  BLACK → GND
  YELLOW → GPIO 21

4-Channel Relay Module:
  VCC → 5V
  GND → GND
  IN1 → GPIO 25 (Pump control)
  IN2 → GPIO 26 (Light control)
  IN3 → GPIO 27 (Fan control)
  IN4 → GPIO 14 (Reserve)
```

---

## Arduino IDE Setup

### 1. Install Arduino IDE
Download from: https://www.arduino.cc/en/software

### 2. Install ESP32 Board Support
1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search for "ESP32"
6. Install "ESP32 by Espressif Systems"

### 3. Install Required Libraries
Go to **Sketch → Include Library → Manage Libraries** and install:
- **DHT sensor library** by Adafruit
- **Adafruit Unified Sensor**
- **ArduinoJson** by Benoit Blanchon

### 4. Select Board
- **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
- **Tools → Port → [Select your COM port]**

---

## Configuration Steps

### Step 1: Update WiFi Credentials

Edit `main_sensor_node.ino` lines 18-19:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Your WiFi name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Your WiFi password
```

### Step 2: Set API Endpoint

If running locally (development):
```cpp
const char* API_ENDPOINT = "http://192.168.1.XXX:3000/api/iot/sensors";
```

Replace `192.168.1.XXX` with your computer's local IP address.

If deployed to production:
```cpp
const char* API_ENDPOINT = "https://chefpax.com/api/iot/sensors";
```

### Step 3: Set Device ID

Choose based on which device you're programming:

**For Main Grow Room Monitor:**
```cpp
const char* DEVICE_ID = "grow_room_main";
const char* LOCATION = "grow_room";
```

**For Tray Monitor:**
```cpp
const char* DEVICE_ID = "tray_monitor_1";
const char* LOCATION = "tray_1";
```

**For Water System:**
```cpp
const char* DEVICE_ID = "water_system";
const char* LOCATION = "water_reservoir";
```

---

## Sensor Calibration

### pH Sensor Calibration (IMPORTANT!)

1. **Prepare calibration solutions:**
   - pH 4.0 solution (acidic)
   - pH 7.0 solution (neutral)

2. **Calibrate pH 7.0 (Neutral):**
   - Place pH probe in pH 7.0 solution
   - Upload sketch and open Serial Monitor
   - Note the voltage reading
   - Update line 37 in code:
     ```cpp
     const float PH_NEUTRAL_VOLTAGE = 2.5;  // Use your measured voltage
     ```

3. **Calibrate pH 4.0 (Acid):**
   - Place pH probe in pH 4.0 solution
   - Note the voltage reading
   - Update line 38 in code:
     ```cpp
     const float PH_ACID_VOLTAGE = 3.3;  // Use your measured voltage
     ```

4. **Re-upload** the sketch with updated values

### Light Sensor Calibration (Optional)

The default values should work, but for better accuracy:

1. **Measure in complete darkness:**
   - Cover sensor completely
   - Note the resistance value
   - Update line 44 if needed

2. **Measure in bright light:**
   - Point a bright light at sensor
   - Note the resistance value
   - Update line 45 if needed

---

## Upload & Test

### 1. Upload Code
1. Connect ESP32 to computer via USB
2. Select correct COM port in **Tools → Port**
3. Click **Upload** button (→)
4. Wait for "Done uploading" message

### 2. Monitor Serial Output
1. Open **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   ChefPax IoT Sensor Node Starting...
   Connecting to WiFi...
   WiFi connected!
   IP address: 192.168.1.XXX
   Sensor node initialized successfully!
   Device ID: grow_room_main
   Location: grow_room
   
   ===== Taking Sensor Readings =====
   🌡️  Temperature: 22.5°C
   💧 Humidity: 65.0%
   💡 Light Level: 4500 lux
   ...
   ```

### 3. Verify API Connection
Check the dashboard at:
- **Local:** `http://localhost:3000/admin/iot-monitoring`
- **Production:** `https://chefpax.com/admin/iot-monitoring`

You should see real-time sensor data updating every 30 seconds.

---

## Troubleshooting

### WiFi Won't Connect
- Double-check SSID and password
- Make sure you're on 2.4GHz network (ESP32 doesn't support 5GHz)
- Check if your router has MAC address filtering enabled

### Sensor Reads NaN or 0
- Check wiring connections
- Verify sensor has power (3.3V or 5V as required)
- Try a different GPIO pin if available

### API Upload Fails
- Verify API endpoint URL is correct
- Check that dev server is running (`npm run dev`)
- Make sure firewall isn't blocking the connection
- Check Serial Monitor for HTTP error codes

### pH Readings Seem Wrong
- Sensor needs calibration (see above)
- Probe needs to stay wet - store in pH 4.0 solution
- Clean probe with distilled water between measurements

---

## Power & Deployment

### Bench Testing (USB Power)
- Connect ESP32 via USB to computer
- Good for initial testing and calibration
- Limited to 500mA current

### Production Deployment (Wall Power)
1. Use the 5V 3A power supply
2. Connect to ESP32 VIN and GND pins
3. Place ESP32 in weatherproof enclosure
4. Route sensor cables through cable glands
5. Mount in grow room away from direct water spray

---

## Next Steps

After hardware is configured:

1. ✅ Upload firmware to both ESP32 devices
2. ✅ Verify sensors are reading correctly in Serial Monitor
3. ✅ Check dashboard shows real-time data
4. ✅ Calibrate pH sensor with calibration solutions
5. ✅ Mount devices in grow room and water reservoir
6. ✅ Test alert system (check alerts when values go out of range)
7. ✅ Set up automated controls (relay module for pumps/lights)

---

## Support

If you have issues:
1. Check Serial Monitor output for error messages
2. Verify all wiring connections match diagrams above
3. Test each sensor individually
4. Check API endpoint is accessible from ESP32's network

The monitoring dashboard will show device status, battery levels, and signal strength in real-time.






