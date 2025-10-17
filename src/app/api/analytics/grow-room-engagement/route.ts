import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

/**
 * Get grow room engagement analytics
 * For real-time marketing dashboard
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '24h'; // 24h, 7d, 30d
    
    const db = await getDb();
    
    // Calculate timestamp based on timeframe
    const now = new Date();
    let since: Date;
    
    switch (timeframe) {
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }
    
    // Get sensor readings for active trays
    const sensorData = await db.collection('sensor_readings')
      .find({
        timestamp: { $gte: since }
      })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    // Get production tasks in progress
    const activeTasks = await db.collection('productionTasks')
      .find({
        status: { $in: ['READY', 'IN_PROGRESS'] },
        type: { $in: ['GERMINATE', 'LIGHT', 'HARVEST'] }
      })
      .sort({ runAt: 1 })
      .toArray();
    
    // Calculate engagement metrics
    const metrics = {
      activeTrays: activeTasks.length,
      avgTemperature: calculateAverage(sensorData, 'temperature'),
      avgHumidity: calculateAverage(sensorData, 'humidity'),
      avgLightLux: calculateAverage(sensorData, 'light_lux'),
      optimalConditions: calculateOptimalPercentage(sensorData),
      recentReadings: sensorData.slice(0, 10),
      activeTasks: activeTasks.map(task => ({
        _id: task._id,
        product: task.productId,
        variety: task.variety,
        type: task.type,
        day: calculateDaysSinceSow(task.createdAt),
        status: task.status,
        runAt: task.runAt,
      })),
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching grow room analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Calculate average for a sensor reading
 */
function calculateAverage(readings: any[], field: string): number {
  if (!readings.length) return 0;
  
  const values = readings
    .filter(r => r[field] !== undefined && r[field] !== null)
    .map(r => r[field]);
  
  if (!values.length) return 0;
  
  return Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10;
}

/**
 * Helper: Calculate percentage of readings in optimal range
 */
function calculateOptimalPercentage(readings: any[]): number {
  if (!readings.length) return 0;
  
  const optimalCount = readings.filter(r => {
    const tempOk = r.temperature >= 70 && r.temperature <= 75;
    const humidityOk = r.humidity >= 60 && r.humidity <= 70;
    const lightOk = !r.light_lux || (r.light_lux >= 8000 && r.light_lux <= 12000);
    
    return tempOk && humidityOk && lightOk;
  }).length;
  
  return Math.round((optimalCount / readings.length) * 100);
}

/**
 * Helper: Calculate days since sow date
 */
function calculateDaysSinceSow(createdAt: string | Date): number {
  const sow = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - sow.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

