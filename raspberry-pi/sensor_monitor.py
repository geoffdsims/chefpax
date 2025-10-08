#!/usr/bin/env python3
"""
ChefPax IoT Sensor Monitor - Raspberry Pi
Monitors temperature, humidity, light, CO2, and water levels
Sends data to ChefPax API endpoint

Hardware Components:
- Raspberry Pi 4 (2GB)
- DHT22 (Temperature & Humidity) -> GPIO 4
- BH1750 (Light Sensor) -> I2C (SDA: GPIO 2, SCL: GPIO 3)
- MH-Z19C (CO2 Sensor) -> UART (TX: GPIO 14, RX: GPIO 15)
- HC-SR04 (Ultrasonic Water Level) -> Trig: GPIO 23, Echo: GPIO 24
- Arducam 5MP Camera -> CSI port
"""

import time
import board
import adafruit_dht
import smbus2
import serial
import RPi.GPIO as GPIO
import requests
import json
from datetime import datetime

# ===== CONFIGURATION - UPDATE THESE =====
API_ENDPOINT = "http://localhost:3000/api/iot/sensors"  # Change to your server
DEVICE_ID = "grow_room_main"  # Options: grow_room_main, tray_monitor_1, water_system
LOCATION = "grow_room"  # Options: grow_room, tray_1, water_reservoir
READING_INTERVAL = 30  # seconds between readings

# ===== PIN DEFINITIONS =====
DHT_PIN = board.D4  # GPIO 4
ULTRASONIC_TRIG = 23  # GPIO 23
ULTRASONIC_ECHO = 24  # GPIO 24

# ===== I2C ADDRESS FOR BH1750 LIGHT SENSOR =====
BH1750_ADDRESS = 0x23
BH1750_CONTINUOUS_HIGH_RES = 0x10

# ===== UART FOR CO2 SENSOR =====
CO2_SERIAL_PORT = "/dev/serial0"  # Raspberry Pi UART
CO2_BAUDRATE = 9600

class SensorMonitor:
    def __init__(self):
        print("🌱 ChefPax IoT Sensor Monitor Starting...")
        print(f"Device ID: {DEVICE_ID}")
        print(f"Location: {LOCATION}")
        print(f"API Endpoint: {API_ENDPOINT}")
        
        # Initialize GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        
        # Setup DHT22
        try:
            self.dht = adafruit_dht.DHT22(DHT_PIN)
            print("✅ DHT22 initialized")
        except Exception as e:
            print(f"⚠️  DHT22 initialization failed: {e}")
            self.dht = None
        
        # Setup I2C for BH1750
        try:
            self.i2c_bus = smbus2.SMBus(1)
            print("✅ I2C bus initialized for BH1750")
        except Exception as e:
            print(f"⚠️  I2C initialization failed: {e}")
            self.i2c_bus = None
        
        # Setup UART for MH-Z19C
        try:
            self.co2_serial = serial.Serial(CO2_SERIAL_PORT, CO2_BAUDRATE, timeout=1)
            time.sleep(1)  # Wait for sensor to stabilize
            print("✅ MH-Z19C CO2 sensor initialized")
        except Exception as e:
            print(f"⚠️  CO2 sensor initialization failed: {e}")
            self.co2_serial = None
        
        # Setup HC-SR04 Ultrasonic
        try:
            GPIO.setup(ULTRASONIC_TRIG, GPIO.OUT)
            GPIO.setup(ULTRASONIC_ECHO, GPIO.IN)
            GPIO.output(ULTRASONIC_TRIG, False)
            time.sleep(0.1)
            print("✅ HC-SR04 ultrasonic sensor initialized")
        except Exception as e:
            print(f"⚠️  Ultrasonic sensor initialization failed: {e}")
        
        print("\n✨ All sensors initialized successfully!\n")
    
    def read_temperature_humidity(self):
        """Read temperature and humidity from DHT22"""
        if not self.dht:
            return None, None
        
        try:
            temperature = self.dht.temperature  # Celsius
            humidity = self.dht.humidity
            return temperature, humidity
        except RuntimeError as e:
            # DHT sensors sometimes fail to read, this is normal
            print(f"⚠️  DHT22 read error (will retry): {e}")
            return None, None
        except Exception as e:
            print(f"❌ DHT22 error: {e}")
            return None, None
    
    def read_light_level(self):
        """Read light level from BH1750 sensor"""
        if not self.i2c_bus:
            return None
        
        try:
            # Start measurement
            self.i2c_bus.write_byte(BH1750_ADDRESS, BH1750_CONTINUOUS_HIGH_RES)
            time.sleep(0.2)  # Wait for measurement
            
            # Read 2 bytes of data
            data = self.i2c_bus.read_i2c_block_data(BH1750_ADDRESS, BH1750_CONTINUOUS_HIGH_RES, 2)
            
            # Convert to lux
            lux = (data[0] << 8 | data[1]) / 1.2
            return round(lux, 2)
        except Exception as e:
            print(f"❌ BH1750 light sensor error: {e}")
            return None
    
    def read_co2(self):
        """Read CO2 level from MH-Z19C sensor"""
        if not self.co2_serial:
            return None
        
        try:
            # Send read command: FF 01 86 00 00 00 00 00 79
            command = bytearray([0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79])
            self.co2_serial.write(command)
            time.sleep(0.1)
            
            # Read response (9 bytes)
            response = self.co2_serial.read(9)
            
            if len(response) == 9 and response[0] == 0xFF and response[1] == 0x86:
                co2_ppm = (response[2] << 8) | response[3]
                return co2_ppm
            else:
                print(f"⚠️  Invalid CO2 sensor response: {response.hex()}")
                return None
        except Exception as e:
            print(f"❌ CO2 sensor error: {e}")
            return None
    
    def read_water_level(self):
        """Read water level using HC-SR04 ultrasonic sensor"""
        try:
            # Send 10us pulse to trigger
            GPIO.output(ULTRASONIC_TRIG, True)
            time.sleep(0.00001)
            GPIO.output(ULTRASONIC_TRIG, False)
            
            # Wait for echo to start
            timeout = time.time() + 0.1  # 100ms timeout
            while GPIO.input(ULTRASONIC_ECHO) == 0:
                pulse_start = time.time()
                if pulse_start > timeout:
                    print("⚠️  Ultrasonic sensor timeout (no echo start)")
                    return None
            
            # Wait for echo to end
            timeout = time.time() + 0.1
            while GPIO.input(ULTRASONIC_ECHO) == 1:
                pulse_end = time.time()
                if pulse_end > timeout:
                    print("⚠️  Ultrasonic sensor timeout (no echo end)")
                    return None
            
            # Calculate distance
            pulse_duration = pulse_end - pulse_start
            distance_cm = pulse_duration * 17150  # Speed of sound / 2
            distance_cm = round(distance_cm, 2)
            
            # Convert to water level percentage
            # Assuming tank is 25cm tall and sensor is mounted at top
            TANK_HEIGHT = 25.0
            water_level = max(0, min(100, ((TANK_HEIGHT - distance_cm) / TANK_HEIGHT) * 100))
            water_level = round(water_level, 1)
            
            return water_level, distance_cm
        except Exception as e:
            print(f"❌ Ultrasonic sensor error: {e}")
            return None, None
    
    def send_to_api(self, sensor_type, value, unit, raw_value=None):
        """Send sensor reading to ChefPax API"""
        payload = {
            "deviceId": DEVICE_ID,
            "sensorType": sensor_type,
            "value": value,
            "unit": unit,
            "location": LOCATION
        }
        
        if raw_value is not None:
            payload["rawValue"] = raw_value
        
        try:
            response = requests.post(
                API_ENDPOINT,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"  ✅ Sent to API (HTTP {response.status_code})")
                return True
            else:
                print(f"  ⚠️  API returned HTTP {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"  ❌ API error: {e}")
            return False
    
    def take_readings(self):
        """Take readings from all sensors and send to API"""
        print(f"\n{'='*50}")
        print(f"📊 Taking Sensor Readings - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*50}")
        
        # Temperature & Humidity
        temperature, humidity = self.read_temperature_humidity()
        if temperature is not None:
            print(f"🌡️  Temperature: {temperature:.1f}°C")
            self.send_to_api("temperature", temperature, "°C")
            time.sleep(0.5)
        
        if humidity is not None:
            print(f"💧 Humidity: {humidity:.1f}%")
            self.send_to_api("humidity", humidity, "%")
            time.sleep(0.5)
        
        # Light Level
        lux = self.read_light_level()
        if lux is not None:
            print(f"💡 Light Level: {lux:.2f} lux")
            self.send_to_api("light", lux, "lux")
            time.sleep(0.5)
        
        # CO2 Level
        co2 = self.read_co2()
        if co2 is not None:
            print(f"🌫️  CO2 Level: {co2} ppm")
            self.send_to_api("co2", co2, "ppm")
            time.sleep(0.5)
        
        # Water Level
        water_result = self.read_water_level()
        if water_result and water_result[0] is not None:
            water_level, distance = water_result
            print(f"🌊 Water Level: {water_level:.1f}% (Distance: {distance:.1f} cm)")
            self.send_to_api("water_level", water_level, "%", distance)
            time.sleep(0.5)
        
        print(f"{'='*50}\n")
    
    def run(self):
        """Main monitoring loop"""
        print("🚀 Starting continuous monitoring...")
        print(f"📡 Readings every {READING_INTERVAL} seconds")
        print("Press Ctrl+C to stop\n")
        
        try:
            while True:
                self.take_readings()
                time.sleep(READING_INTERVAL)
        except KeyboardInterrupt:
            print("\n\n⏹️  Monitoring stopped by user")
            self.cleanup()
        except Exception as e:
            print(f"\n❌ Fatal error: {e}")
            self.cleanup()
    
    def cleanup(self):
        """Cleanup GPIO and sensors"""
        print("🧹 Cleaning up...")
        
        if self.dht:
            self.dht.exit()
        
        if self.co2_serial and self.co2_serial.is_open:
            self.co2_serial.close()
        
        GPIO.cleanup()
        print("✅ Cleanup complete. Goodbye!")

if __name__ == "__main__":
    monitor = SensorMonitor()
    monitor.run()

