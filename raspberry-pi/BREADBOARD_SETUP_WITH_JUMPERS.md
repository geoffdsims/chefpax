# ChefPax Breadboard Setup Guide (With Female-to-Male Jumpers)

## 🎯 Overview
Now that you have the female-to-male jumper wires, we can properly connect multiple sensors to the GPIO Extension Board using the breadboard as a power distribution hub.

---

## 📦 What You Have
- ✅ Raspberry Pi 4 with GPIO Extension Board (male pins)
- ✅ Breadboard (3x from your kits)
- ✅ Female-to-Male jumper wires (NEW!)
- ✅ Male-to-Male jumper wires (for breadboard connections)
- ✅ 6x DHT22 sensors (3 pins each)
- ✅ 3x BH1750 light sensors (I2C)
- ✅ 8x HC-SR04 ultrasonic sensors (water level)
- ✅ 1x MH-Z19C CO2 sensor

---

## 🔌 Step 1: Power Distribution Setup

### Connect GPIO Extension Board to Breadboard

**Purpose:** Create a "power bus" on the breadboard so all sensors can share 3.3V and GND

**Connections (Female-to-Male wires):**

1. **3.3V Power Rail:**
   - Female end → GPIO Extension Board **Pin 1** (3.3V)
   - Male end → Breadboard **positive (+) rail** (red line)

2. **Ground Rail:**
   - Female end → GPIO Extension Board **Pin 6** (GND)
   - Male end → Breadboard **negative (-) rail** (blue/black line)

**Result:** The breadboard now has 3.3V and GND available all along the power rails

---

## 🌡️ Step 2: Connect DHT22 Sensors (Temperature/Humidity)

You can connect multiple DHT22 sensors, each to a different GPIO data pin.

### DHT22 #1 (Tier 1)
- **Red wire** → Breadboard **positive rail** (3.3V)
- **Yellow wire (DATA)** → Female-to-Male jumper → **GPIO Pin 7** (GPIO 4)
- **Brown wire** → Breadboard **negative rail** (GND)

### DHT22 #2 (Tier 2)
- **Red wire** → Breadboard **positive rail** (3.3V)
- **Yellow wire (DATA)** → Female-to-Male jumper → **GPIO Pin 11** (GPIO 17)
- **Brown wire** → Breadboard **negative rail** (GND)

### DHT22 #3 (Tier 3)
- **Red wire** → Breadboard **positive rail** (3.3V)
- **Yellow wire (DATA)** → Female-to-Male jumper → **GPIO Pin 13** (GPIO 27)
- **Brown wire** → Breadboard **negative rail** (GND)

### DHT22 #4 (Tier 4)
- **Red wire** → Breadboard **positive rail** (3.3V)
- **Yellow wire (DATA)** → Female-to-Male jumper → **GPIO Pin 15** (GPIO 22)
- **Brown wire** → Breadboard **negative rail** (GND)

### DHT22 #5 (Tier 5)
- **Red wire** → Breadboard **positive rail** (3.3V)
- **Yellow wire (DATA)** → Female-to-Male jumper → **GPIO Pin 16** (GPIO 23)
- **Brown wire** → Breadboard **negative rail** (GND)

**Note:** DHT22 #6 is a spare - save it for replacements

---

## 💡 Step 3: Connect BH1750 Light Sensors (I2C)

All I2C devices share the same SDA/SCL pins but need different addresses.

### BH1750 Sensor Wiring (all 3 use same pins):
- **VCC** → Breadboard **positive rail** (3.3V)
- **GND** → Breadboard **negative rail** (GND)
- **SDA** → Female-to-Male jumper → **GPIO Pin 3** (SDA / GPIO 2)
- **SCL** → Female-to-Male jumper → **GPIO Pin 5** (SCL / GPIO 3)
- **ADDR** → GND (for address 0x23) or VCC (for address 0x5C)

**Address Configuration:**
- Sensor 1: ADDR → GND (address 0x23)
- Sensor 2: ADDR → VCC (address 0x5C)
- Sensor 3: Only connect if you add an I2C multiplexer

**Note:** You can only have 2 BH1750 sensors on the same I2C bus without a multiplexer

---

## 📏 Step 4: Connect HC-SR04 Ultrasonic Sensors (Water Level)

Each HC-SR04 needs 2 GPIO pins (TRIG and ECHO).

### HC-SR04 #1 (Tier 1 Water Level)
- **VCC** → Breadboard **positive rail** (5V - use Pin 2 or Pin 4)
- **TRIG** → Female-to-Male jumper → **GPIO Pin 18** (GPIO 24)
- **ECHO** → Female-to-Male jumper → **GPIO Pin 22** (GPIO 25)
- **GND** → Breadboard **negative rail**

### HC-SR04 #2 (Tier 2)
- **VCC** → Breadboard **positive rail** (5V)
- **TRIG** → Female-to-Male jumper → **GPIO Pin 29** (GPIO 5)
- **ECHO** → Female-to-Male jumper → **GPIO Pin 31** (GPIO 6)
- **GND** → Breadboard **negative rail**

### HC-SR04 #3 (Tier 3)
- **VCC** → Breadboard **positive rail** (5V)
- **TRIG** → Female-to-Male jumper → **GPIO Pin 32** (GPIO 12)
- **ECHO** → Female-to-Male jumper → **GPIO Pin 33** (GPIO 13)
- **GND** → Breadboard **negative rail**

### HC-SR04 #4 (Tier 4)
- **VCC** → Breadboard **positive rail** (5V)
- **TRIG** → Female-to-Male jumper → **GPIO Pin 35** (GPIO 19)
- **ECHO** → Female-to-Male jumper → **GPIO Pin 36** (GPIO 16)
- **GND** → Breadboard **negative rail**

### HC-SR04 #5 (Tier 5)
- **VCC** → Breadboard **positive rail** (5V)
- **TRIG** → Female-to-Male jumper → **GPIO Pin 37** (GPIO 26)
- **ECHO** → Female-to-Male jumper → **GPIO Pin 38** (GPIO 20)
- **GND** → Breadboard **negative rail**

**Note:** HC-SR04 uses 5V, not 3.3V! Use Pin 2 or Pin 4 for 5V power.

---

## 🌫️ Step 5: Connect MH-Z19C CO2 Sensor (UART)

### MH-Z19C Wiring:
- **VIN** → Female-to-Male jumper → **GPIO Pin 4** (5V)
- **GND** → Breadboard **negative rail**
- **TX** → Female-to-Male jumper → **GPIO Pin 10** (RXD / GPIO 15)
- **RX** → Female-to-Male jumper → **GPIO Pin 8** (TXD / GPIO 14)

**Note:** CO2 sensor uses UART serial communication

---

## 📊 GPIO Pin Assignment Summary

| Sensor | Type | GPIO Pin | Physical Pin | Notes |
|--------|------|----------|--------------|-------|
| DHT22 #1 | Temp/Humidity | GPIO 4 | Pin 7 | Tier 1 |
| DHT22 #2 | Temp/Humidity | GPIO 17 | Pin 11 | Tier 2 |
| DHT22 #3 | Temp/Humidity | GPIO 27 | Pin 13 | Tier 3 |
| DHT22 #4 | Temp/Humidity | GPIO 22 | Pin 15 | Tier 4 |
| DHT22 #5 | Temp/Humidity | GPIO 23 | Pin 16 | Tier 5 |
| BH1750 #1 | Light | I2C (SDA/SCL) | Pin 3 & 5 | Address 0x23 |
| BH1750 #2 | Light | I2C (SDA/SCL) | Pin 3 & 5 | Address 0x5C |
| HC-SR04 #1 | Water | GPIO 24/25 | Pin 18 & 22 | Tier 1 |
| HC-SR04 #2 | Water | GPIO 5/6 | Pin 29 & 31 | Tier 2 |
| HC-SR04 #3 | Water | GPIO 12/13 | Pin 32 & 33 | Tier 3 |
| HC-SR04 #4 | Water | GPIO 19/16 | Pin 35 & 36 | Tier 4 |
| HC-SR04 #5 | Water | GPIO 26/20 | Pin 37 & 38 | Tier 5 |
| MH-Z19C | CO2 | UART (TX/RX) | Pin 8 & 10 | Room-wide |

---

## 🔧 Step-by-Step Connection Process

### Phase 1: Power Distribution (5 minutes)
1. Place breadboard near Raspberry Pi
2. Connect GPIO Pin 1 (3.3V) to breadboard + rail with female-to-male wire
3. Connect GPIO Pin 6 (GND) to breadboard - rail with female-to-male wire
4. Connect GPIO Pin 4 (5V) to a separate row for 5V devices

### Phase 2: DHT22 Sensors (10 minutes)
1. Insert DHT22 sensors into breadboard
2. Use male-to-male wires on breadboard to connect red to + rail
3. Use male-to-male wires on breadboard to connect brown to - rail
4. Use female-to-male wires to connect yellow (DATA) to GPIO pins
5. Repeat for all 5 DHT22 sensors

### Phase 3: Light Sensors (5 minutes)
1. Insert BH1750 sensors into breadboard
2. Connect VCC to + rail, GND to - rail (male-to-male)
3. Connect SDA to Pin 3, SCL to Pin 5 (female-to-male)
4. Set ADDR pin (GND for 0x23, VCC for 0x5C)

### Phase 4: Water Level Sensors (15 minutes)
1. HC-SR04 sensors need 5V power
2. Connect VCC to 5V row, GND to - rail
3. Connect TRIG and ECHO to assigned GPIO pins

### Phase 5: CO2 Sensor (5 minutes)
1. Connect MH-Z19C to 5V and GND
2. Connect TX/RX to UART pins

---

## 💻 Test Script

Once connected, run this test script:

```python
# test_all_sensors.py
import time
import board
import adafruit_dht
import smbus2
import RPi.GPIO as GPIO

# Initialize GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# DHT22 sensors
dht_pins = [4, 17, 27, 22, 23]  # GPIO numbers
dhts = [adafruit_dht.DHT22(getattr(board, f'D{pin}')) for pin in dht_pins]

# BH1750 light sensors
bus = smbus2.SMBus(1)
light_addresses = [0x23, 0x5C]

print("🌱 ChefPax Sensor Test - All Sensors")
print("=" * 50)

while True:
    try:
        # Test DHT22 sensors
        for i, dht in enumerate(dhts, 1):
            try:
                temp_c = dht.temperature
                humidity = dht.humidity
                temp_f = temp_c * 9/5 + 32
                print(f"Tier {i}: {temp_f:.1f}°F, {humidity:.1f}% RH")
            except:
                print(f"Tier {i}: Reading error")
        
        # Test light sensors
        for addr in light_addresses:
            try:
                data = bus.read_i2c_block_data(addr, 0x10, 2)
                lux = (data[1] + (256 * data[0])) / 1.2
                print(f"Light (0x{addr:02x}): {lux:.0f} lux")
            except:
                print(f"Light (0x{addr:02x}): Not connected")
        
        print("-" * 50)
        time.sleep(5)
        
    except KeyboardInterrupt:
        print("\nStopping...")
        break

GPIO.cleanup()
```

---

## 🚀 Ready to Connect?

**Start with Phase 1 (Power Distribution) and let me know when that's done!**

We'll go through each phase systematically to ensure everything works before moving to the next.

