import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { generateSensorReadings, analyzeSensorReadings, calculateEnvironmentalConditions } from "@/lib/iot-monitoring";
import type { SensorReading, EnvironmentalAlert } from "@/lib/iot-monitoring";

/**
 * GET /api/iot/sensors - Get current sensor readings
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const hours = parseInt(searchParams.get("hours") || "24");
    const includeAnalysis = searchParams.get("analysis") === "true";

    const db = await getDb();
    
    // Calculate time range
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000));

    // Build query
    const query: any = {
      timestamp: {
        $gte: startTime,
        $lte: endTime
      }
    };

    if (deviceId) {
      query.deviceId = deviceId;
    }

    // Get sensor readings from database
    let readings: SensorReading[] = [];
    
    if (db) {
      const dbReadings = await db.collection("sensor_readings")
        .find(query)
        .sort({ timestamp: -1 })
        .limit(1000) // Limit to prevent large responses
        .toArray();
      
      readings = dbReadings.map(r => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }));
    }

    // If no readings in database, generate sample data
    if (readings.length === 0) {
      console.log("No sensor readings in database, generating sample data");
      readings = generateSensorReadings();
    }

    // Filter by device if specified
    if (deviceId) {
      readings = readings.filter(r => r.deviceId === deviceId);
    }

    // Group by sensor type for latest readings
    const latestReadings = readings.reduce((acc, reading) => {
      const key = `${reading.deviceId}_${reading.sensorType}`;
      if (!acc[key] || reading.timestamp > acc[key].timestamp) {
        acc[key] = reading;
      }
      return acc;
    }, {} as Record<string, SensorReading>);

    const response: any = {
      readings: Object.values(latestReadings),
      totalReadings: readings.length,
      timeRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        hours
      }
    };

    // Add analysis if requested
    if (includeAnalysis) {
      const analysis = analyzeSensorReadings(readings);
      const conditions = calculateEnvironmentalConditions(readings);
      
      response.analysis = analysis;
      response.conditions = conditions;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    return NextResponse.json(
      { error: "Failed to fetch sensor readings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/iot/sensors - Store new sensor readings
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { readings }: { readings: SensorReading[] } = body;

    if (!readings || !Array.isArray(readings)) {
      return NextResponse.json(
        { error: "Invalid readings data" },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Validate readings
    const validReadings = readings.map(reading => ({
      ...reading,
      timestamp: new Date(reading.timestamp),
      id: reading.id || `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    // Store readings in database
    const result = await db.collection("sensor_readings").insertMany(validReadings);

    // Analyze readings for alerts
    const analysis = analyzeSensorReadings(validReadings);
    
    // Store any new alerts
    if (analysis.alerts.length > 0) {
      await db.collection("environmental_alerts").insertMany(analysis.alerts);
    }

    return NextResponse.json({
      success: true,
      inserted: result.insertedCount,
      alerts: analysis.alerts.length,
      overallStatus: analysis.overallStatus
    });

  } catch (error) {
    console.error("Error storing sensor readings:", error);
    return NextResponse.json(
      { error: "Failed to store sensor readings" },
      { status: 500 }
    );
  }
}


