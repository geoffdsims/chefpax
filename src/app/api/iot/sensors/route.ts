import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(request: NextRequest) {
  try {
    const sensorData = await request.json();
    
    // Validate the sensor data structure
    if (!sensorData.timestamp || !sensorData.source) {
      return NextResponse.json(
        { error: 'Invalid sensor data format' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await getDb();
    
    // Store sensor data in MongoDB
    const result = await db.collection('sensor_readings').insertOne({
      ...sensorData,
      createdAt: new Date(),
    });

    console.log('Sensor data stored:', result.insertedId);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Sensor data received and stored',
        id: result.insertedId 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error storing sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to store sensor data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    
    // Get the latest sensor readings
    const latestReadings = await db.collection('sensor_readings')
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (latestReadings.length === 0) {
      return NextResponse.json(
        { 
          readings: [],
          alerts: [],
          conditions: null
        },
        { status: 200 }
      );
    }

    const sensorDoc = latestReadings[0];
    
    // Return data in the format expected by the dashboard
    return NextResponse.json({
      readings: sensorDoc.readings || [],
      alerts: sensorDoc.alerts || [],
      conditions: sensorDoc.conditions || null,
      timestamp: sensorDoc.timestamp,
      source: sensorDoc.source
    }, { status: 200 });

  } catch (error) {
    console.error('Error retrieving sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve sensor data' },
      { status: 500 }
    );
  }
}