# ChefPax IoT Hardware Setup - Current Status

## 📦 Hardware Inventory

### ✅ Received & Working
- Raspberry Pi 4 (2GB) Starter Kit
- Arducam 5MP Camera Module
- 6x DHT22 Temperature/Humidity Sensors
- 8x HC-SR04 Ultrasonic Sensors
- MH-Z19C CO2 Sensor
- 3x BH1750 Light Sensors
- Breadboards + Male-to-Male Jumper Wires
- GPIO Extension Board
- Waterproof Enclosure

### ⏳ Ordered - In Transit
- **Female-to-Male Jumper Wires** (needed to connect GPIO Extension Board to breadboard)
- ETA: TBD

---

## ✅ Software Setup Complete

### Raspberry Pi Configuration
- [✅] Raspberry Pi OS installed
- [✅] WiFi connected
- [✅] I2C interface enabled
- [✅] Serial/UART interface enabled
- [✅] Camera interface enabled
- [✅] Python libraries installed:
  - adafruit-circuitpython-dht
  - smbus2
  - pyserial
  - requests
  - RPi.GPIO
  - picamera2

---

## ✅ Sensors Tested

### DHT22 Temperature/Humidity Sensor
- **Status:** WORKING ✅
- **Connection:** GPIO Pin 7 (GPIO 4)
- **Test Results:** Successfully reading temperature (°F) and humidity (%)
- **Wiring:**
  - Red wire → Pin 1 (3.3V)
  - Yellow wire → Pin 7 (GPIO 4 / DATA)
  - Brown wire → Pin 6 (GND)

### BH1750 Light Sensor
- **Status:** WORKING ✅
- **Connection:** I2C (Pins 3 & 5)
- **Test Results:** Successfully reading light levels in lux
- **I2C Address:** 0x23 (confirmed with `i2cdetect -y 1`)

---

## ⏳ Pending Setup (Waiting on Cables)

### HC-SR04 Ultrasonic Sensor (Water Level)
- **Quantity:** 8 sensors (one per shelf)
- **Purpose:** Monitor water reservoir levels
- **Requires:** Female-to-male jumpers to connect to breadboard

### MH-Z19C CO2 Sensor
- **Quantity:** 1 sensor
- **Purpose:** Monitor air quality in grow room
- **Connection:** UART (Serial)
- **Requires:** Female-to-male jumpers

---

## 📁 Code Files

### Working Scripts
- `raspberry-pi/sensor_monitor.py` - Main monitoring script
- `raspberry-pi/RASPBERRY_PI_SETUP_GUIDE.md` - Complete setup instructions

### API Endpoints (To Be Restored)
- `/api/iot/sensors` - Receive sensor data from Raspberry Pi
- `/admin/iot-monitoring` - Admin dashboard for sensor data

**Note:** These were deleted and need to be recreated once hardware is fully connected.

---

## 🎯 Next Steps (When Cables Arrive)

1. **Connect remaining sensors with female-to-male jumpers:**
   - HC-SR04 ultrasonic sensors (8x)
   - MH-Z19C CO2 sensor (1x)

2. **Deploy full monitoring script:**
   - Test all sensors together
   - Configure API endpoint to receive data
   - Set up data logging to MongoDB

3. **Create admin IoT dashboard:**
   - Real-time sensor readings
   - Historical data charts
   - Alert configuration

4. **Set up automated alerts:**
   - Temperature too high/low
   - Humidity too high/low
   - Water level low
   - CO2 levels abnormal
   - Light hours tracking

---

## 📊 Sensor Placement Plan

### 5 Shelves × Sensors Per Shelf:
- **Temperature/Humidity:** 1 DHT22 per shelf (5 total used, 1 spare)
- **Light Level:** 1 BH1750 per shelf (3 sensors for 5 shelves - reuse some)
- **Water Level:** 1 HC-SR04 per shelf (5 used, 3 spare)
- **CO2:** 1 MH-Z19C for entire grow room (shared)

---

## 💰 Investment Summary
- **Hardware Cost:** ~$250-300
- **Status:** Good investment for automated monitoring
- **ROI:** Prevents crop failures, optimizes growing conditions

---

Last verified: October 11, 2025

