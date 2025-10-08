import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { 
  generateSensorReadings, 
  analyzeSensorReadings,
  calculateEnvironmentalConditions,
  getDeviceStatus
} from '@/lib/iot-monitoring';

/**
 * GET /api/iot/sensors
 * Get current sensor readings, device status, and environmental conditions
 */
export async function GET() {
  try {
    // Generate current sensor readings (in production, this would come from real hardware)
    const readings = generateSensorReadings();
    
    // Analyze readings for alerts
    const analysis = analyzeSensorReadings(readings);
    
    // Calculate environmental conditions summary
    const conditions = calculateEnvironmentalConditions(readings);
    
    // Get device status
    const devices = getDeviceStatus();

    // Store readings in database for historical tracking
    try {
      const db = await getDb();
      if (readings.length > 0) {
        await db.collection('sensor_readings').insertMany(
          readings.map(reading => ({
            ...reading,
            timestamp: reading.timestamp.toISOString()
          }))
        );
      }

      // Store alerts if any
      if (analysis.alerts.length > 0) {
        await db.collection('environmental_alerts').insertMany(
          analysis.alerts.map(alert => ({
            ...alert,
            timestamp: alert.timestamp.toISOString()
          }))
        );
      }
    } catch (dbError) {
      console.error('Database storage error:', dbError);
      // Continue even if DB storage fails
    }

    return NextResponse.json({
      success: true,
      data: {
        readings,
        conditions,
        devices,
        alerts: analysis.alerts,
        overallStatus: analysis.overallStatus,
        recommendations: analysis.recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error fetching sensor data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/iot/sensors
 * Receive sensor data from IoT devices (ESP32 microcontrollers)
 * 
 * Expected payload:
 * {
 *   deviceId: string,
 *   sensorType: 'temperature' | 'humidity' | 'light' | 'ph' | 'co2' | 'water_level' | 'water_flow',
 *   value: number,
 *   unit: string,
 *   location: string,
 *   rawValue?: number
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, sensorType, value, unit, location, rawValue } = body;

    if (!deviceId || !sensorType || value === undefined) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: deviceId, sensorType, value' 
        },
        { status: 400 }
      );
    }

    const reading = {
      id: `reading_${deviceId}_${sensorType}_${Date.now()}`,
      deviceId,
      timestamp: new Date(),
      sensorType,
      value: Number(value),
      unit: unit || '',
      location: location || 'unknown',
      status: 'normal' as const,
      rawValue: rawValue !== undefined ? Number(rawValue) : Number(value),
      calibratedValue: Number(value)
    };

    // Store in database
    const db = await getDb();
    await db.collection('sensor_readings').insertOne({
      ...reading,
      timestamp: reading.timestamp.toISOString()
    });

    // Analyze this reading for alerts
    const analysis = analyzeSensorReadings([reading]);

    // If critical alert, trigger notification
    if (analysis.overallStatus === 'critical') {
      // TODO: Integrate with notification system
      console.warn('CRITICAL ALERT:', analysis.alerts);
    }

    return NextResponse.json({
      success: true,
      data: {
        reading,
        alerts: analysis.alerts,
        status: analysis.overallStatus
      }
    });
  } catch (error: any) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}
