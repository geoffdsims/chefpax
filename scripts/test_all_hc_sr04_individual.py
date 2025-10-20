import RPi.GPIO as GPIO
import time

# GPIO pins for each sensor (individual pins per sensor)
sensors = {
    'shelf_1': {'trig': 5, 'echo': 6},
    'shelf_2': {'trig': 12, 'echo': 13},
    'shelf_3': {'trig': 16, 'echo': 20},
    'shelf_4': {'trig': 21, 'echo': 24},
    'shelf_5': {'trig': 25, 'echo': 26}
}

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

def measure_distance(trig_pin, echo_pin):
    """Measure distance using HC-SR04 ultrasonic sensor"""
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
        print(f"Error measuring distance: {e}")
        return None

def main():
    print("🔊 Testing All 5 HC-SR04 Sensors (Individual Pins)")
    print("=" * 60)
    
    # Setup all sensors
    for sensor_name, pins in sensors.items():
        GPIO.setup(pins['trig'], GPIO.OUT)
        GPIO.setup(pins['echo'], GPIO.IN)
    
    print("\nReading all sensors every 2 seconds. Press Ctrl+C to stop.\n")
    
    try:
        while True:
            print(f"📊 Sensor Reading - {time.strftime('%H:%M:%S')}")
            
            for sensor_name, pins in sensors.items():
                distance = measure_distance(pins['trig'], pins['echo'])
                
                if distance:
                    print(f"  ✅ {sensor_name}: {distance['cm']} cm ({distance['inches']} inches)")
                else:
                    print(f"  ❌ {sensor_name}: No reading (timeout)")
            
            print("-" * 60)
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\n🛑 Test stopped")
        GPIO.cleanup()

if __name__ == "__main__":
    main()

