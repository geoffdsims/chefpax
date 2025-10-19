import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';

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
    const { db } = await connectToDatabase();
    
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
    const { db } = await connectToDatabase();
    
    // Get the latest sensor readings
    const latestReadings = await db.collection('sensor_readings')
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (latestReadings.length === 0) {
      return NextResponse.json(
        { message: 'No sensor data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(latestReadings[0], { status: 200 });

  } catch (error) {
    console.error('Error retrieving sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve sensor data' },
      { status: 500 }
    );
  }
}