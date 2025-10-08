# ChefPax IoT Hardware Setup Guide - Raspberry Pi Edition

## What You Purchased

Perfect choices! Here's what you have:

✅ **Raspberry Pi 4 (2GB) Starter Kit** - Main controller with case, power supply, SD card  
✅ **Arducam 5MP Camera Module** - For monitoring plant growth visually  
✅ **6x DHT22 Temperature/Humidity Sensors** - Environmental monitoring  
✅ **8x HC-SR04 Ultrasonic Sensors** - Water level and distance measurement  
✅ **MH-Z19C CO2 Sensor** - Air quality monitoring  
✅ **3x BH1750 Light Sensors** - Digital light intensity measurement  
✅ **Breadboards + Jumper Wires** - For connecting everything  
✅ **GPIO Expansion Board** - Makes wiring easier  
✅ **Waterproof Enclosure** - Protect from moisture  

**Total Investment: ~$250-300** - Excellent setup!

---

## Step 1: Prepare Your Raspberry Pi

### A. Initial Raspberry Pi Setup

1. **Insert the SD card** (already has Raspberry Pi OS from the kit)
2. **Connect keyboard, mouse, and monitor** via HDMI
3. **Plug in the power supply**
4. **Wait for first boot** (will take 2-3 minutes)
5. **Complete the setup wizard:**
   - Select your country/language
   - Connect to WiFi
   - Update software when prompted (this takes 10-15 minutes)
   - Reboot when done

### B. Enable Required Interfaces

After reboot, we need to enable I2C, UART, and Camera:

1. Open Terminal (black icon in top left)
2. Type: `sudo raspi-config`
3. Navigate to **Interface Options**
4. Enable these one by one:
   - **I2C** → Yes (for BH1750 light sensor)
   - **Serial Port** → Login shell: No, Serial hardware: Yes (for CO2 sensor)
   - **Camera** → Yes (for Arducam)
5. Select **Finish** and **Reboot**

---

## Step 2: Install Required Software

Open Terminal and run these commands one at a time:

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Python libraries
sudo apt install -y python3-pip python3-gpiozero

# Install sensor libraries
sudo pip3 install adafruit-circuitpython-dht
sudo pip3 install smbus2
sudo pip3 install pyserial
sudo pip3 install requests
sudo pip3 install RPi.GPIO

# Install camera libraries
sudo apt install -y python3-picamera2
```

This will take about 5-10 minutes.

---

## Step 3: Wire Up Your First Sensor (DHT22)

Let's start simple with just ONE sensor to make sure everything works.

### DHT22 Wiring:

The DHT22 has 4 pins (left to right when facing the grid side):

```
DHT22 Pin 1 (VCC)  →  Raspberry Pi Pin 1 (3.3V)
DHT22 Pin 2 (DATA) →  Raspberry Pi Pin 7 (GPIO 4)
DHT22 Pin 3 (NC)   →  Not connected
DHT22 Pin 4 (GND)  →  Raspberry Pi Pin 6 (GND)
```

**Visual Guide:**
```
Raspberry Pi (looking at the board, USB ports facing you):

     3.3V  [1] [2]  5V
GPIO  2  [3] [4]  5V
GPIO  3  [5] [6]  GND  ← DHT22 GND here
GPIO  4  [7] [8]  GPIO 14
      GND [9] [10] GPIO 15
```

### Steps:
1. **POWER OFF** the Raspberry Pi
2. Connect the DHT22 using female-to-female jumper wires
3. Double-check connections
4. Power ON the Raspberry Pi

---

## Step 4: Test the DHT22 Sensor

1. Create a test directory:
```bash
mkdir -p ~/chefpax-iot
cd ~/chefpax-iot
```

2. Create a simple test file:
```bash
nano test_dht22.py
```

3. Paste this code:
```python
import time
import board
import adafruit_dht

dht = adafruit_dht.DHT22(board.D4)

print("Testing DHT22 sensor...")
print("Reading every 2 seconds. Press Ctrl+C to stop.\n")

try:
    while True:
        try:
            temperature = dht.temperature
            humidity = dht.humidity
            print(f"🌡️  Temp: {temperature:.1f}°C  💧 Humidity: {humidity:.1f}%")
        except RuntimeError as e:
            print(f"Reading error (normal, will retry): {e}")
        
        time.sleep(2)
except KeyboardInterrupt:
    print("\nTest stopped")
    dht.exit()
```

4. Save and exit: `Ctrl+X`, then `Y`, then `Enter`

5. Run the test:
```bash
python3 test_dht22.py
```

**You should see:**
```
Testing DHT22 sensor...
Reading every 2 seconds. Press Ctrl+C to stop.

🌡️  Temp: 22.3°C  💧 Humidity: 65.2%
🌡️  Temp: 22.4°C  💧 Humidity: 65.1%
```

✅ **If you see readings, PERFECT! The DHT22 works!**

Press `Ctrl+C` to stop.

---

## Where Are You At Right Now?

**Tell me which step you're on:**

1. [ ] Raspberry Pi is powered on and updated
2. [ ] Interfaces (I2C, UART, Camera) are enabled
3. [ ] Python libraries are installed
4. [ ] DHT22 is wired up
5. [ ] DHT22 test shows temperature/humidity

**Let me know where you are and I'll walk you through the next step!**
