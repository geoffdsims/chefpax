import time
import json
import requests
import smbus2
import board
import adafruit_dht
import RPi.GPIO as GPIO
import serial
from datetime import datetime

# I2C bus for BH1750
bus = smbus2.SMBus(1)

# BH1750 configuration
BH1750_ADDR_1 = 0x23  # First sensor (ADDR to GND)
BH1750_ADDR_2 = 0x5C  # Second sensor (ADDR to VCC)
POWER_ON = 0x01
CONTINUOUS_HIGH_RES_MODE = 0x10

# DHT22 sensors (GPIO pins) - disable pulseio
dht_sensors = {
    'shelf_1': adafruit_dht.DHT22(board.D4, use_pulseio=False),   # GPIO 4
    'shelf_2': adafruit_dht.DHT22(board.D17, use_pulseio=False),  # GPIO 17
    'shelf_3': adafruit_dht.DHT22(board.D27, use_pulseio=False),  # GPIO 27
    'shelf_4': adafruit_dht.DHT22(board.D22, use_pulseio=False),  # GPIO 22
    'shelf_5': adafruit_dht.DHT22(board.D23, use_pulseio=False),  # GPIO 23
}

# HC-SR04 sensors (individual GPIO pins)
hc_sr04_sensors = {
    'shelf_1': {'trig': 5, 'echo': 6},
    'shelf_2': {'trig': 12, 'echo': 13},
    'shelf_3': {'trig': 16, 'echo': 20},
    'shelf_4': {'trig': 21, 'echo': 24},
    'shelf_5': {'trig': 25, 'echo': 26}
}

# Website API endpoint
API_URL = "https://www.chefpax.com/api/iot/sensors"

def read_bh1750(address):
    """Read light sensor data"""
    try:
        bus.write_byte(address, POWER_ON)
        time.sleep(0.1)
        bus.write_byte(address, CONTINUOUS_HIGH_RES_MODE)
        time.sleep(0.1)
        data = bus.read_i2c_block_data(address, CONTINUOUS_HIGH_RES_MODE, 2)
        lux = (data[0] << 8 | data[1]) / 1.2
        return round(lux, 1)
    except Exception as e:
        print(f"BH1750 error: {e}")
        return None

def read_all_bh1750_sensors():
    """Read all 4 BH1750 sensors sequentially"""
    sensors = {
        'shelf_1': BH1750_ADDR_1,  # 0x23
        'shelf_2': BH1750_ADDR_2,  # 0x5C
        'shelf_4': BH1750_ADDR_1,  # 0x23 (same address)
        'shelf_5': BH1750_ADDR_2,  # 0x5C (same address)
    }
    
    light_data = {}
    for shelf, address in sensors.items():
        lux = read_bh1750(address)
        light_data[shelf] = lux
        time.sleep(0.1)  # Small delay between readings
    
    return light_data

def read_dht22(sensor, name):
    """Read temperature and humidity"""
    try:
        temp_c = sensor.temperature
        humidity = sensor.humidity
        
        # Convert Celsius to Fahrenheit
        temp_f = (temp_c * 9/5) + 32 if temp_c else None
        
        return {
            'temperature': round(temp_f, 1) if temp_f else None,  # Fahrenheit
            'humidity': round(humidity, 1) if humidity else None
        }
    except Exception as e:
        print(f"DHT22 {name} error: {e}")
        return {'temperature': None, 'humidity': None}

def read_hc_sr04(trig_pin, echo_pin):
    """Read water level using HC-SR04 ultrasonic sensor"""
    try:
        # Send trigger pulse
        GPIO.output(trig_pin, False)
        time.sleep(0.000002)
        GPIO.output(trig_pin, True)
        time.sleep(0.00001)
        GPIO.output(trig_pin, False)
        
        # Wait for echo start
        pulse_start = time.time()
        timeout_start = time.time()
        
        while GPIO.input(echo_pin) == 0:
            pulse_start = time.time()
            if time.time() - timeout_start > 1:
                return None
        
        # Wait for echo end
        pulse_end = time.time()
        timeout_start = time.time()
        
        while GPIO.input(echo_pin) == 1:
            pulse_end = time.time()
            if time.time() - timeout_start > 1:
                return None
        
        # Calculate distance
        pulse_duration = pulse_end - pulse_start
        distance_cm = pulse_duration * 17150
        distance_inches = distance_cm / 2.54
        
        return {
            'cm': round(distance_cm, 2),
            'inches': round(distance_inches, 2)
        }
        
    except Exception as e:
        print(f"HC-SR04 error: {e}")
        return None

def read_co2():
    """Read CO2 from MH-Z19C sensor"""
    try:
        ser = serial.Serial('/dev/serial0', 9600, timeout=2)
        time.sleep(0.1)
        
        # CO2 read command
        cmd = b'\xFF\x01\x86\x00\x00\x00\x00\x00\x79'
        ser.write(cmd)
        time.sleep(0.1)
        
        response = ser.read(9)
        ser.close()
        
        if len(response) == 9 and response[0] == 0xFF and response[1] == 0x86:
            co2 = response[2] * 256 + response[3]
            return co2
        return None
        
    except Exception as e:
        print(f"CO2 error: {e}")
        return None

def collect_all_sensor_data():
    """Collect data from all sensors"""
    timestamp = datetime.now().isoformat()
    
    # Read DHT22 sensors
    dht_data = {}
    for shelf, sensor in dht_sensors.items():
        dht_data[shelf] = read_dht22(sensor, shelf)
    
    # Read all BH1750 sensors
    light_data = read_all_bh1750_sensors()
    
    # Read HC-SR04 sensors
    water_level_data = {}
    for shelf, pins in hc_sr04_sensors.items():
        water_level = read_hc_sr04(pins['trig'], pins['echo'])
        water_level_data[shelf] = water_level
    
    # Read CO2 sensor
    co2_reading = read_co2()
    
    # Convert to readings format expected by the API
    readings = []
    
    # Add temperature and humidity readings
    for shelf, data in dht_data.items():
        if data['temperature'] is not None:
            readings.append({
                'id': f'temp_{shelf}_{timestamp}',
                'deviceId': f'shelf_{shelf.split("_")[1]}',
                'timestamp': timestamp,
                'sensorType': 'temperature',
                'value': data['temperature'],
                'unit': '°F',
                'location': shelf,
                'status': 'normal'
            })
        if data['humidity'] is not None:
            readings.append({
                'id': f'humidity_{shelf}_{timestamp}',
                'deviceId': f'shelf_{shelf.split("_")[1]}',
                'timestamp': timestamp,
                'sensorType': 'humidity',
                'value': data['humidity'],
                'unit': '%',
                'location': shelf,
                'status': 'normal'
            })
    
    # Add light readings
    for shelf, lux in light_data.items():
        if lux is not None:
            readings.append({
                'id': f'light_{shelf}_{timestamp}',
                'deviceId': f'shelf_{shelf.split("_")[1]}',
                'timestamp': timestamp,
                'sensorType': 'light',
                'value': lux,
                'unit': 'lux',
                'location': shelf,
                'status': 'normal'
            })
    
    # Add water level readings
    for shelf, water in water_level_data.items():
        if water is not None:
            readings.append({
                'id': f'water_{shelf}_{timestamp}',
                'deviceId': f'shelf_{shelf.split("_")[1]}',
                'timestamp': timestamp,
                'sensorType': 'water_level',
                'value': water['cm'],
                'unit': 'cm',
                'location': shelf,
                'status': 'normal'
            })
    
    # Add CO2 reading
    if co2_reading is not None:
        readings.append({
            'id': f'co2_room_{timestamp}',
            'deviceId': 'room_main',
            'timestamp': timestamp,
            'sensorType': 'co2',
            'value': co2_reading,
            'unit': 'ppm',
            'location': 'grow_room',
            'status': 'normal'
        })
    
    # Combine all data in the format expected by the API
    sensor_data = {
        'timestamp': timestamp,
        'readings': readings,
        'source': 'raspberry_pi'
    }
    
    return sensor_data

def send_to_website(data):
    """Send sensor data to website API"""
    try:
        # Add proper headers for JSON content
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ChefPax-IoT-Monitor/1.0'
        }
        
        response = requests.post(API_URL, json=data, headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Data sent to website successfully")
            return True
        else:
            print(f"❌ Website API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Failed to send to website: {e}")
        return False

def main():
    print("🌱 ChefPax Comprehensive IoT Monitoring System Started")
    print("Reading all sensors every 30 seconds...")
    print("Press Ctrl+C to stop\n")
    
    # Setup GPIO for HC-SR04 sensors
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    
    for shelf, pins in hc_sr04_sensors.items():
        GPIO.setup(pins['trig'], GPIO.OUT)
        GPIO.setup(pins['echo'], GPIO.IN)
    
    try:
        while True:
            # Collect sensor data
            data = collect_all_sensor_data()
            
            # Print to console
            print(f"📊 Sensor Reading - {data['timestamp']}")
            print(f"📈 Total readings: {len(data['readings'])}")
            
            # Group readings by location for display
            readings_by_location = {}
            for reading in data['readings']:
                location = reading['location']
                if location not in readings_by_location:
                    readings_by_location[location] = {}
                readings_by_location[location][reading['sensorType']] = reading['value']
            
            # Print readings by location
            for location, sensors in readings_by_location.items():
                sensor_values = []
                if 'temperature' in sensors:
                    sensor_values.append(f"{sensors['temperature']}°F")
                if 'humidity' in sensors:
                    sensor_values.append(f"{sensors['humidity']}%")
                if 'light' in sensors:
                    sensor_values.append(f"{sensors['light']} lux")
                if 'water_level' in sensors:
                    sensor_values.append(f"{sensors['water_level']} cm")
                if 'co2' in sensors:
                    sensor_values.append(f"{sensors['co2']} ppm")
                
                print(f"  {location}: {', '.join(sensor_values)}")
            
            print("-" * 50)
            
            # Send to website
            send_to_website(data)
            
            time.sleep(30)  # Wait 30 seconds
            
    except KeyboardInterrupt:
        print("\n🛑 Monitoring stopped")
        GPIO.cleanup()
        bus.close()

if __name__ == "__main__":
    main()
