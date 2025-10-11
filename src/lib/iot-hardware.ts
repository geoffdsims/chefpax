/**
 * IoT Hardware Specifications for ChefPax Microgreen Monitoring
 * Based on the hardware components purchased for the monitoring system
 */

export interface HardwareComponent {
  id: string;
  name: string;
  type: 'sensor' | 'controller' | 'actuator' | 'accessory';
  model: string;
  description: string;
  specifications: Record<string, any>;
  price?: number;
  quantity?: number;
}

export interface IoTDevice {
  id: string;
  name: string;
  location: string;
  components: HardwareComponent[];
  status: 'active' | 'offline' | 'maintenance';
  lastSeen?: Date;
}

/**
 * Standard IoT hardware components for microgreen monitoring
 * These are the components that were recommended and purchased
 */
export const IOT_HARDWARE_COMPONENTS: HardwareComponent[] = [
  // Microcontrollers
  {
    id: 'esp32_devkit',
    name: 'ESP32 Development Board',
    type: 'controller',
    model: 'ESP32-DevKitC',
    description: 'WiFi-enabled microcontroller for IoT connectivity',
    specifications: {
      processor: 'Dual-core 32-bit LX6',
      clockSpeed: '240MHz',
      memory: '520KB SRAM, 4MB Flash',
      connectivity: 'WiFi 802.11 b/g/n, Bluetooth 4.2',
      gpio: '30 GPIO pins',
      adc: '12-bit ADC',
      operatingVoltage: '3.3V',
      inputVoltage: '5-12V'
    },
    price: 8.99,
    quantity: 2
  },

  // Temperature & Humidity Sensors
  {
    id: 'dht22_temp_humidity',
    name: 'DHT22 Temperature & Humidity Sensor',
    type: 'sensor',
    model: 'AM2302/DHT22',
    description: 'Digital temperature and humidity sensor',
    specifications: {
      temperatureRange: '-40°C to +80°C',
      temperatureAccuracy: '±0.5°C',
      humidityRange: '0-100% RH',
      humidityAccuracy: '±2% RH',
      resolution: '16-bit',
      samplingRate: '0.5Hz (once every 2 seconds)',
      operatingVoltage: '3.3V-6V',
      currentDraw: '1-2.5mA'
    },
    price: 9.95,
    quantity: 3
  },

  // Light Level Sensors
  {
    id: 'photoresistor_ldr',
    name: 'Photoresistor (Light Dependent Resistor)',
    type: 'sensor',
    model: 'GL5528',
    description: 'Analog light level sensor',
    specifications: {
      resistanceRange: '10KΩ (dark) to 1KΩ (bright)',
      spectralPeak: '540nm',
      responseTime: '20ms',
      operatingTemperature: '-30°C to +70°C',
      operatingVoltage: '5V',
      packageType: 'Through-hole'
    },
    price: 2.99,
    quantity: 4
  },

  // pH Sensors
  {
    id: 'ph_sensor_analog',
    name: 'Analog pH Sensor Kit',
    type: 'sensor',
    model: 'SEN0161',
    description: 'Water quality pH measurement sensor',
    specifications: {
      phRange: '0-14 pH',
      accuracy: '±0.1 pH (25°C)',
      responseTime: '<1 minute',
      operatingTemperature: '0-60°C',
      operatingVoltage: '5V',
      currentDraw: '<20mA',
      calibrationPoints: '4.0, 7.0, 10.0 pH'
    },
    price: 39.95,
    quantity: 1
  },

  // Water Level Sensors
  {
    id: 'ultrasonic_distance',
    name: 'Ultrasonic Distance Sensor',
    type: 'sensor',
    model: 'HC-SR04',
    description: 'Water level monitoring for reservoirs',
    specifications: {
      range: '2cm to 400cm',
      accuracy: '3mm',
      measuringAngle: '15°',
      operatingVoltage: '5V',
      operatingCurrent: '15mA',
      frequency: '40kHz',
      triggerPulse: '10μs'
    },
    price: 3.99,
    quantity: 2
  },

  // CO2 Sensor
  {
    id: 'co2_sensor_mh_z19',
    name: 'CO2 Air Quality Sensor',
    type: 'sensor',
    model: 'MH-Z19',
    description: 'NDIR CO2 concentration sensor',
    specifications: {
      co2Range: '0-5000 ppm',
      accuracy: '±(50ppm + 5% reading)',
      responseTime: '<60 seconds',
      operatingTemperature: '0-50°C',
      operatingVoltage: '4.5-6V',
      currentDraw: '18mA',
      interface: 'UART/TTL'
    },
    price: 29.99,
    quantity: 1
  },

  // Water Flow Sensor
  {
    id: 'water_flow_sensor',
    name: 'Hall Effect Water Flow Sensor',
    type: 'sensor',
    model: 'YF-S201',
    description: 'Monitoring water flow in irrigation systems',
    specifications: {
      flowRate: '1-30 L/min',
      accuracy: '±3%',
      operatingPressure: '≤1.75 MPa',
      operatingVoltage: '5V-24V',
      currentDraw: '15mA',
      pulseRate: '450 pulses/L',
      operatingTemperature: '-25°C to +80°C'
    },
    price: 12.99,
    quantity: 2
  },

  // Relays for Control
  {
    id: 'relay_module_4ch',
    name: '4-Channel Relay Module',
    type: 'actuator',
    model: 'SRD-05VDC-SL-C',
    description: 'Control pumps, lights, fans',
    specifications: {
      channels: 4,
      relayType: 'SPDT',
      switchingVoltage: '250V AC / 30V DC',
      switchingCurrent: '10A',
      controlVoltage: '5V',
      controlCurrent: '5mA',
      responseTime: '<10ms',
      isolation: 'Opto-isolated'
    },
    price: 8.99,
    quantity: 1
  },

  // Power Supply
  {
    id: 'power_supply_5v',
    name: '5V 3A Power Supply',
    type: 'accessory',
    model: 'AC-DC Adapter',
    description: 'Stable power for all components',
    specifications: {
      outputVoltage: '5V DC',
      outputCurrent: '3A',
      inputVoltage: '100-240V AC',
      efficiency: '>80%',
      protection: 'Short circuit, over current, over voltage',
      connector: '2.1mm barrel jack'
    },
    price: 12.99,
    quantity: 1
  },

  // Breadboards and Wiring
  {
    id: 'breadboard_830',
    name: '830 Point Breadboard',
    type: 'accessory',
    model: 'Solderless Breadboard',
    description: 'Prototyping and testing',
    specifications: {
      tiePoints: 830,
      dimensions: '165mm x 55mm',
      material: 'ABS plastic',
      contactResistance: '<20mΩ',
      insulationResistance: '>500MΩ'
    },
    price: 4.99,
    quantity: 2
  },

  {
    id: 'jumper_wires',
    name: 'Jumper Wire Kit',
    type: 'accessory',
    model: 'Male-Male, Male-Female, Female-Female',
    description: 'Connection wires for prototyping',
    specifications: {
      lengths: '10cm, 20cm, 30cm',
      wireGauge: '22 AWG',
      connectorTypes: 'Dupont connectors',
      colors: 'Multiple colors for organization',
      quantity: 120
    },
    price: 7.99,
    quantity: 1
  },

  // Resistors
  {
    id: 'resistor_kit',
    name: 'Resistor Kit',
    type: 'accessory',
    model: '1/4W Carbon Film',
    description: 'Various resistance values',
    specifications: {
      powerRating: '1/4W',
      tolerance: '±5%',
      values: '10Ω to 1MΩ (common values)',
      packageType: 'Axial lead',
      quantity: 600
    },
    price: 9.99,
    quantity: 1
  },

  // Enclosure
  {
    id: 'project_enclosure',
    name: 'Weatherproof Project Enclosure',
    type: 'accessory',
    model: 'IP65 Plastic Box',
    description: 'Protect electronics from moisture',
    specifications: {
      dimensions: '200mm x 120mm x 75mm',
      material: 'ABS plastic',
      protection: 'IP65 (dust and water resistant)',
      mounting: 'Wall or surface mount',
      cableGlands: 'Included for wire entry'
    },
    price: 15.99,
    quantity: 2
  }
];

/**
 * Calculate total hardware cost
 */
export function calculateHardwareCost(): number {
  return IOT_HARDWARE_COMPONENTS.reduce((total, component) => {
    return total + (component.price || 0) * (component.quantity || 1);
  }, 0);
}

/**
 * Get components by type
 */
export function getComponentsByType(type: 'sensor' | 'controller' | 'actuator' | 'accessory'): HardwareComponent[] {
  return IOT_HARDWARE_COMPONENTS.filter(component => component.type === type);
}

/**
 * Get total estimated cost
 */
export const TOTAL_ESTIMATED_COST = calculateHardwareCost();

/**
 * IoT Device Configurations
 */
export const IOT_DEVICE_CONFIGS: IoTDevice[] = [
  {
    id: 'grow_room_main',
    name: 'Main Grow Room Monitor',
    location: 'grow_room',
    status: 'active',
    components: [
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'esp32_devkit')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'dht22_temp_humidity')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'co2_sensor_mh_z19')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'photoresistor_ldr')!
    ]
  },
  {
    id: 'tray_monitor_1',
    name: 'Tray 1 Monitor',
    location: 'tray_1',
    status: 'active',
    components: [
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'esp32_devkit')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'dht22_temp_humidity')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'photoresistor_ldr')!
    ]
  },
  {
    id: 'water_system',
    name: 'Water System Controller',
    location: 'water_reservoir',
    status: 'active',
    components: [
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'esp32_devkit')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'ph_sensor_analog')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'ultrasonic_distance')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'water_flow_sensor')!,
      IOT_HARDWARE_COMPONENTS.find(c => c.id === 'relay_module_4ch')!
    ]
  }
];





