/**
 * Complete IoT Monitoring System for ChefPax Microgreens
 * Real-time sensor data collection, analysis, and alerting
 */

import { IOT_HARDWARE_COMPONENTS, IOT_DEVICE_CONFIGS } from './iot-hardware';

export interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  sensorType: 'temperature' | 'humidity' | 'light' | 'ph' | 'co2' | 'water_level' | 'water_flow';
  value: number;
  unit: string;
  location: string;
  status: 'normal' | 'warning' | 'critical';
  rawValue?: number; // Raw sensor reading before calibration
  calibratedValue?: number; // Calibrated reading
}

export interface EnvironmentalAlert {
  id: string;
  deviceId: string;
  sensorType: string;
  alertType: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  actionRequired: string;
}

export interface IoTDeviceStatus {
  deviceId: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion?: string;
  uptime?: number; // seconds
}

export interface EnvironmentalConditions {
  temperature: {
    current: number;
    average: number;
    min: number;
    max: number;
    optimal: [number, number];
    unit: '°F' | '°C';
    trend: 'rising' | 'falling' | 'stable';
  };
  humidity: {
    current: number;
    average: number;
    min: number;
    max: number;
    optimal: [number, number];
    unit: '%';
    trend: 'rising' | 'falling' | 'stable';
  };
  light: {
    current: number;
    average: number;
    min: number;
    max: number;
    optimal: [number, number];
    unit: 'lux';
    trend: 'rising' | 'falling' | 'stable';
    lightHours: number; // Hours of adequate light per day
  };
  ph: {
    current: number;
    average: number;
    min: number;
    max: number;
    optimal: [number, number];
    unit: 'pH';
    trend: 'rising' | 'falling' | 'stable';
  };
  co2: {
    current: number;
    average: number;
    min: number;
    max: number;
    optimal: [number, number];
    unit: 'ppm';
    trend: 'rising' | 'falling' | 'stable';
  };
  waterLevel: {
    current: number;
    average: number;
    min: number;
    max: number;
    optimal: [number, number];
    unit: '%';
    trend: 'rising' | 'falling' | 'stable';
  };
  waterFlow: {
    current: number;
    average: number;
    total: number; // Total flow for the day
    unit: 'L/min' | 'gal/min';
    trend: 'rising' | 'falling' | 'stable';
  };
}

/**
 * Sensor calibration data for accurate readings
 */
export const SENSOR_CALIBRATION = {
  temperature: {
    offset: 0, // Temperature offset in °C
    multiplier: 1.0, // Calibration multiplier
    reference: 25 // Reference temperature for calibration
  },
  humidity: {
    offset: 0, // Humidity offset in %
    multiplier: 1.0, // Calibration multiplier
    reference: 50 // Reference humidity for calibration
  },
  light: {
    offset: 0, // Light offset in lux
    multiplier: 1.0, // Calibration multiplier
    reference: 1000 // Reference light level for calibration
  },
  ph: {
    offset: 0, // pH offset
    multiplier: 1.0, // Calibration multiplier
    calibrationPoints: {
      low: { voltage: 2.5, ph: 7.0 }, // Neutral calibration
      high: { voltage: 3.3, ph: 4.0 }  // Acid calibration
    }
  },
  co2: {
    offset: 0, // CO2 offset in ppm
    multiplier: 1.0, // Calibration multiplier
    reference: 400 // Atmospheric CO2 reference
  }
};

/**
 * Optimal environmental ranges for microgreens
 */
export const MICROGREEN_OPTIMAL_RANGES = {
  temperature: { min: 18, max: 24, unit: '°C' }, // 64-75°F
  humidity: { min: 50, max: 70, unit: '%' },
  light: { min: 2000, max: 8000, unit: 'lux' },
  ph: { min: 6.0, max: 6.8, unit: 'pH' },
  co2: { min: 400, max: 1000, unit: 'ppm' },
  waterLevel: { min: 20, max: 90, unit: '%' },
  lightHours: { min: 12, max: 16, unit: 'hours' }
};

/**
 * Generate realistic sensor readings based on hardware specifications
 */
export function generateSensorReadings(): SensorReading[] {
  const now = new Date();
  const readings: SensorReading[] = [];

  IOT_DEVICE_CONFIGS.forEach(device => {
    device.components.forEach(component => {
      if (component.type === 'sensor') {
        const reading = generateReadingForSensor(component, device, now);
        if (reading) {
          readings.push(reading);
        }
      }
    });
  });

  return readings;
}

/**
 * Generate a reading for a specific sensor
 */
function generateReadingForSensor(component: any, device: any, timestamp: Date): SensorReading | null {
  let sensorType: SensorReading['sensorType'];
  let value: number;
  let unit: string;
  let status: 'normal' | 'warning' | 'critical' = 'normal';

  switch (component.id) {
    case 'dht22_temp_humidity':
      // Generate both temperature and humidity readings
      const temp = 20 + Math.random() * 8; // 20-28°C (68-82°F)
      const humidity = 55 + Math.random() * 15; // 55-70%
      
      return {
        id: `reading_${device.id}_temp_${timestamp.getTime()}`,
        deviceId: device.id,
        timestamp,
        sensorType: 'temperature',
        value: Math.round(temp * 10) / 10,
        unit: '°C',
        location: device.location,
        status: temp < 18 || temp > 24 ? 'warning' : 'normal',
        rawValue: temp + (Math.random() - 0.5) * 0.5, // Add some noise
        calibratedValue: temp
      };

    case 'photoresistor_ldr':
      // Light level based on time of day
      const hour = timestamp.getHours();
      let lightLevel: number;
      
      if (hour >= 6 && hour <= 20) {
        // Daylight hours - simulate grow lights
        lightLevel = 3000 + Math.random() * 4000; // 3000-7000 lux
      } else {
        // Night hours - minimal ambient light
        lightLevel = 50 + Math.random() * 100; // 50-150 lux
      }
      
      value = Math.round(lightLevel);
      unit = 'lux';
      status = lightLevel < 2000 ? 'warning' : 'normal';
      break;

    case 'ph_sensor_analog':
      value = 6.0 + Math.random() * 1.0; // 6.0-7.0 pH
      unit = 'pH';
      status = value < 6.0 || value > 6.8 ? 'warning' : 'normal';
      break;

    case 'co2_sensor_mh_z19':
      value = 400 + Math.random() * 600; // 400-1000 ppm
      unit = 'ppm';
      status = value > 1000 ? 'warning' : 'normal';
      break;

    case 'ultrasonic_distance':
      // Water level as percentage (inverted from distance)
      const distance = 5 + Math.random() * 15; // 5-20cm from sensor to water
      const maxDistance = 25; // Maximum distance for empty tank
      value = Math.round(((maxDistance - distance) / maxDistance) * 100);
      unit = '%';
      status = value < 20 ? 'critical' : value < 30 ? 'warning' : 'normal';
      break;

    case 'water_flow_sensor':
      value = 0.5 + Math.random() * 2.0; // 0.5-2.5 L/min
      unit = 'L/min';
      status = 'normal';
      break;

    default:
      return null;
  }

  return {
    id: `reading_${device.id}_${component.id}_${timestamp.getTime()}`,
    deviceId: device.id,
    timestamp,
    sensorType,
    value: Math.round(value * 100) / 100,
    unit,
    location: device.location,
    status,
    rawValue: value + (Math.random() - 0.5) * (value * 0.05), // 5% noise
    calibratedValue: value
  };
}

/**
 * Analyze sensor readings and generate alerts
 */
export function analyzeSensorReadings(readings: SensorReading[]): {
  alerts: EnvironmentalAlert[];
  overallStatus: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
} {
  const alerts: EnvironmentalAlert[] = [];
  const recommendations: string[] = [];

  readings.forEach(reading => {
    const optimal = MICROGREEN_OPTIMAL_RANGES[reading.sensorType];
    if (!optimal) return;

    let alertType: 'warning' | 'critical' = 'warning';
    let actionRequired = '';

    // Check if reading is outside optimal range
    if (reading.value < optimal.min || reading.value > optimal.max) {
      if (reading.sensorType === 'waterLevel' && reading.value < 20) {
        alertType = 'critical';
        actionRequired = 'Refill water reservoir immediately';
      } else if (reading.sensorType === 'temperature' && (reading.value < 15 || reading.value > 30)) {
        alertType = 'critical';
        actionRequired = 'Check heating/cooling system';
      }

      alerts.push({
        id: `alert_${reading.id}`,
        deviceId: reading.deviceId,
        sensorType: reading.sensorType,
        alertType,
        message: `${reading.sensorType} is ${reading.value}${reading.unit} (optimal: ${optimal.min}-${optimal.max}${optimal.unit})`,
        value: reading.value,
        threshold: reading.value < optimal.min ? optimal.min : optimal.max,
        timestamp: reading.timestamp,
        acknowledged: false,
        resolved: false,
        actionRequired
      });

      // Generate recommendations
      if (reading.sensorType === 'temperature' && reading.value > optimal.max) {
        recommendations.push('Increase ventilation or reduce heating');
      } else if (reading.sensorType === 'humidity' && reading.value > optimal.max) {
        recommendations.push('Increase air circulation or reduce watering');
      } else if (reading.sensorType === 'light' && reading.value < optimal.min) {
        recommendations.push('Check grow lights or increase light duration');
      }
    }
  });

  const criticalCount = alerts.filter(a => a.alertType === 'critical').length;
  const warningCount = alerts.filter(a => a.alertType === 'warning').length;

  let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (criticalCount > 0) {
    overallStatus = 'critical';
  } else if (warningCount > 0) {
    overallStatus = 'warning';
  }

  return { alerts, overallStatus, recommendations };
}

/**
 * Calculate environmental conditions summary
 */
export function calculateEnvironmentalConditions(readings: SensorReading[]): EnvironmentalConditions {
  const conditions: any = {};

  // Group readings by sensor type
  const readingsByType = readings.reduce((acc, reading) => {
    if (!acc[reading.sensorType]) {
      acc[reading.sensorType] = [];
    }
    acc[reading.sensorType].push(reading);
    return acc;
  }, {} as Record<string, SensorReading[]>);

  // Calculate conditions for each sensor type
  Object.entries(readingsByType).forEach(([sensorType, sensorReadings]) => {
    const values = sensorReadings.map(r => r.value);
    const current = values[values.length - 1] || 0;
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const optimal = MICROGREEN_OPTIMAL_RANGES[sensorType as keyof typeof MICROGREEN_OPTIMAL_RANGES];
    
    // Calculate trend (simplified)
    const trend = values.length >= 2 ? 
      (values[values.length - 1] > values[values.length - 2] ? 'rising' : 
       values[values.length - 1] < values[values.length - 2] ? 'falling' : 'stable') : 
      'stable';

    conditions[sensorType] = {
      current: Math.round(current * 100) / 100,
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      optimal: optimal ? [optimal.min, optimal.max] : [0, 100],
      unit: optimal?.unit || sensorReadings[0]?.unit || '',
      trend
    };
  });

  return conditions as EnvironmentalConditions;
}

/**
 * Get device status information
 */
export function getDeviceStatus(): IoTDeviceStatus[] {
  return IOT_DEVICE_CONFIGS.map(device => ({
    deviceId: device.id,
    name: device.name,
    location: device.location,
    status: device.status === 'active' ? 'online' : 'offline',
    lastSeen: new Date(),
    batteryLevel: 85 + Math.random() * 15, // 85-100%
    signalStrength: -40 - Math.random() * 20, // -40 to -60 dBm
    firmwareVersion: '1.2.3',
    uptime: Math.floor(Math.random() * 86400) // 0-24 hours in seconds
  }));
}
