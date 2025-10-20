#!/usr/bin/env python3
"""
CO2 Sensor Calibration Script for MH-Z19C
==========================================

This script calibrates the MH-Z19C CO2 sensor to outdoor air baseline (~400 ppm).

IMPORTANT: 
- Take the Raspberry Pi OUTSIDE or to a well-ventilated area
- Let it run for 20 minutes to stabilize
- Outdoor air should be ~400 ppm CO2

Usage:
    python3 calibrate_co2.py
"""

import serial
import time

# Serial port configuration
SERIAL_PORT = '/dev/ttyS0'
BAUD_RATE = 9600

def send_command(ser, command):
    """Send command to sensor and return response"""
    ser.write(bytearray(command))
    time.sleep(0.1)
    
    if ser.in_waiting > 0:
        response = ser.read(9)
        return response
    return None

def read_co2(ser):
    """Read CO2 value from sensor"""
    # Command to read CO2: [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]
    cmd = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]
    response = send_command(ser, cmd)
    
    if response and len(response) == 9:
        # CO2 value is in bytes 2 and 3
        co2 = (response[2] << 8) | response[3]
        return co2
    return None

def zero_point_calibration(ser):
    """
    Perform zero point calibration
    This sets the current reading as 400 ppm (outdoor air baseline)
    """
    print("\n⚠️  ZERO POINT CALIBRATION")
    print("=" * 60)
    print("This will set the CURRENT environment as 400 ppm baseline.")
    print("Make sure you are OUTDOORS or in a well-ventilated area!")
    print("=" * 60)
    
    response = input("\nAre you ready to calibrate? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Calibration cancelled.")
        return False
    
    # Zero point calibration command: [0xFF, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78]
    cmd = [0xFF, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78]
    
    print("\n🔄 Sending calibration command...")
    response = send_command(ser, cmd)
    
    if response:
        print("✅ Calibration command sent successfully!")
        print("\n⏱️  Please wait 20 minutes for calibration to complete...")
        print("   (Sensor needs time to stabilize)")
        return True
    else:
        print("❌ Failed to send calibration command.")
        return False

def main():
    print("=" * 60)
    print("MH-Z19C CO2 Sensor Calibration Script")
    print("=" * 60)
    
    try:
        # Open serial connection
        print(f"\n🔌 Connecting to {SERIAL_PORT} at {BAUD_RATE} baud...")
        ser = serial.Serial(
            port=SERIAL_PORT,
            baudrate=BAUD_RATE,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=1
        )
        
        print("✅ Connected to sensor!")
        
        # Read current CO2 level (5 samples to get average)
        print("\n📊 Reading current CO2 levels...")
        readings = []
        for i in range(5):
            co2 = read_co2(ser)
            if co2 is not None:
                readings.append(co2)
                print(f"   Reading {i+1}/5: {co2} ppm")
            time.sleep(1)
        
        if readings:
            avg_co2 = sum(readings) / len(readings)
            print(f"\n📈 Average current reading: {avg_co2:.1f} ppm")
            
            if avg_co2 < 300:
                print("\n⚠️  WARNING: Current reading is very low (< 300 ppm)")
                print("   This might indicate the sensor needs calibration.")
            elif avg_co2 > 800:
                print("\n⚠️  WARNING: Current reading is high (> 800 ppm)")
                print("   Make sure you're in a well-ventilated area for calibration.")
            else:
                print(f"\n✅ Current reading looks reasonable ({avg_co2:.1f} ppm)")
        else:
            print("\n❌ Could not read current CO2 levels.")
            print("   Sensor might not be responding. Check wiring.")
            return
        
        # Perform calibration
        if zero_point_calibration(ser):
            print("\n" + "=" * 60)
            print("✅ CALIBRATION COMPLETE!")
            print("=" * 60)
            print("\nNext steps:")
            print("1. Leave sensor outdoors for 20 minutes")
            print("2. Bring back inside and restart monitoring script")
            print("3. You should see readings around 400-600 ppm indoors")
            print("\nTo restart monitoring:")
            print("   sudo systemctl restart chefpax-iot")
        
        ser.close()
        
    except serial.SerialException as e:
        print(f"\n❌ Serial port error: {e}")
        print("\nTroubleshooting:")
        print("1. Check that UART is enabled in /boot/config.txt")
        print("2. Verify serial console is disabled")
        print("3. Check sensor wiring (TX → RXD, RX → TXD)")
        print("4. Make sure sensor has 5V power")
    
    except KeyboardInterrupt:
        print("\n\n⏹️  Calibration interrupted by user.")
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()


