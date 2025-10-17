#!/usr/bin/env python3
"""
BH1750 Light Sensor Test Script
Tests one or multiple BH1750 light sensors on I2C bus
"""

import smbus2
import time
from datetime import datetime

# BH1750 I2C addresses
BH1750_ADDR_LOW = 0x23   # Default (ADDR pin to GND or floating)
BH1750_ADDR_HIGH = 0x5C  # Alternate (ADDR pin to VCC)

# BH1750 commands
POWER_DOWN = 0x00
POWER_ON = 0x01
RESET = 0x07
CONTINUOUS_HIGH_RES_MODE = 0x10
CONTINUOUS_HIGH_RES_MODE_2 = 0x11
CONTINUOUS_LOW_RES_MODE = 0x13
ONE_TIME_HIGH_RES_MODE = 0x20

def read_light(bus, address=BH1750_ADDR_LOW, mode=CONTINUOUS_HIGH_RES_MODE):
    """
    Read light level from BH1750 in lux
    
    Args:
        bus: SMBus instance
        address: I2C address (0x23 or 0x5C)
        mode: Measurement mode (default: CONTINUOUS_HIGH_RES_MODE)
    
    Returns:
        Light level in lux (float)
    """
    try:
        # Power on
        bus.write_byte(address, POWER_ON)
        time.sleep(0.01)
        
        # Start measurement
        bus.write_byte(address, mode)
        
        # Wait for measurement to complete
        # High-res mode takes ~120ms, high-res mode 2 takes ~120ms
        time.sleep(0.18)
        
        # Read 2 bytes of data
        data = bus.read_i2c_block_data(address, mode, 2)
        
        # Convert to lux
        # Formula: (HIGH_BYTE << 8 | LOW_BYTE) / 1.2
        raw_value = (data[0] << 8) | data[1]
        lux = raw_value / 1.2
        
        return lux
    
    except Exception as e:
        print(f"❌ Error reading BH1750 at 0x{address:02x}: {e}")
        return None

def get_light_status(lux):
    """Get descriptive status based on lux value"""
    if lux is None:
        return "Error", "❌"
    elif lux < 1:
        return "Dark (Blackout)", "🌑"
    elif lux < 10:
        return "Very Dim", "🌙"
    elif lux < 100:
        return "Dim Light", "💡"
    elif lux < 500:
        return "Indoor Light", "🏠"
    elif lux < 1000:
        return "Office/Bright Indoor", "💼"
    elif lux < 5000:
        return "Bright (Good for greens)", "🌿"
    elif lux < 10000:
        return "Very Bright (Optimal)", "🌱"
    elif lux < 25000:
        return "Full Daylight", "🌤️"
    else:
        return "Direct Sunlight", "☀️"

def scan_i2c_devices(bus):
    """Scan I2C bus for BH1750 sensors"""
    print("\n🔍 Scanning I2C bus for BH1750 sensors...")
    print("-" * 50)
    
    found_sensors = []
    
    # Check both possible addresses
    for addr in [BH1750_ADDR_LOW, BH1750_ADDR_HIGH]:
        try:
            bus.write_byte(addr, POWER_ON)
            print(f"✅ Found BH1750 at address 0x{addr:02x}")
            found_sensors.append(addr)
        except:
            print(f"   No sensor at address 0x{addr:02x}")
    
    return found_sensors

def test_single_sensor(address=BH1750_ADDR_LOW, duration=10):
    """Test a single BH1750 sensor"""
    bus = smbus2.SMBus(1)
    
    print(f"\n🔆 BH1750 Light Sensor Test (Address: 0x{address:02x})")
    print("=" * 60)
    print(f"Reading light levels for {duration} seconds...")
    print("💡 TIP: Try covering/uncovering the sensor to see changes\n")
    
    try:
        start_time = time.time()
        readings = []
        
        while (time.time() - start_time) < duration:
            lux = read_light(bus, address)
            status, emoji = get_light_status(lux)
            timestamp = datetime.now().strftime("%H:%M:%S")
            
            if lux is not None:
                print(f"[{timestamp}] {emoji} {lux:>8.1f} lux - {status}")
                readings.append(lux)
            
            time.sleep(1)
        
        # Summary
        if readings:
            print("\n" + "=" * 60)
            print("📊 Summary:")
            print(f"   Average: {sum(readings)/len(readings):.1f} lux")
            print(f"   Min: {min(readings):.1f} lux")
            print(f"   Max: {max(readings):.1f} lux")
            print(f"   Readings: {len(readings)}")
    
    except KeyboardInterrupt:
        print("\n⏹️  Test stopped by user")
    
    finally:
        bus.close()

def test_multiple_sensors(addresses, duration=10):
    """Test multiple BH1750 sensors"""
    bus = smbus2.SMBus(1)
    
    print(f"\n🔆 Testing {len(addresses)} BH1750 Sensors")
    print("=" * 60)
    print(f"Reading light levels for {duration} seconds...\n")
    
    try:
        start_time = time.time()
        
        while (time.time() - start_time) < duration:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}]")
            
            for i, addr in enumerate(addresses, 1):
                lux = read_light(bus, addr)
                status, emoji = get_light_status(lux)
                
                if lux is not None:
                    print(f"  Sensor {i} (0x{addr:02x}): {emoji} {lux:>8.1f} lux - {status}")
            
            print()
            time.sleep(2)
    
    except KeyboardInterrupt:
        print("\n⏹️  Test stopped by user")
    
    finally:
        bus.close()

def main():
    """Main test function"""
    print("\n" + "=" * 60)
    print("        ChefPax BH1750 Light Sensor Test Tool")
    print("=" * 60)
    
    # Initialize I2C bus
    try:
        bus = smbus2.SMBus(1)
    except Exception as e:
        print(f"❌ Error: Could not open I2C bus: {e}")
        print("   Make sure I2C is enabled: sudo raspi-config")
        return
    
    # Scan for sensors
    found_sensors = scan_i2c_devices(bus)
    bus.close()
    
    if not found_sensors:
        print("\n❌ No BH1750 sensors found!")
        print("\n🔧 Troubleshooting:")
        print("   1. Check wiring (VCC, GND, SCL, SDA)")
        print("   2. Verify 3.3V power to sensor")
        print("   3. Run: sudo i2cdetect -y 1")
        print("   4. Check I2C is enabled in raspi-config")
        return
    
    # Test based on number of sensors found
    print("\n" + "=" * 60)
    
    if len(found_sensors) == 1:
        test_single_sensor(found_sensors[0], duration=10)
    else:
        test_multiple_sensors(found_sensors, duration=10)
    
    print("\n✅ Test complete!")
    print("\n📋 Microgreen Light Level Guidelines:")
    print("   🌑 Germination (blackout): 0-10 lux")
    print("   🌿 Growing phase: 5,000-10,000 lux")
    print("   ☀️ Maximum safe: ~25,000 lux")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()


