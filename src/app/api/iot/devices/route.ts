import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getDeviceStatus } from "@/lib/iot-monitoring";
import { IOT_DEVICE_CONFIGS } from "@/lib/iot-hardware";
import type { IoTDeviceStatus } from "@/lib/iot-monitoring";

/**
 * GET /api/iot/devices - Get IoT device status
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    const db = await getDb();
    
    // Get device status from library
    let deviceStatuses = getDeviceStatus();

    // Filter by device if specified
    if (deviceId) {
      deviceStatuses = deviceStatuses.filter(d => d.deviceId === deviceId);
    }

    // Get recent activity from database if available
    if (db) {
      for (const device of deviceStatuses) {
        try {
          // Get last sensor reading for this device
          const lastReading = await db.collection("sensor_readings")
            .findOne(
              { deviceId: device.deviceId },
              { sort: { timestamp: -1 } }
            );

          if (lastReading) {
            device.lastSeen = new Date(lastReading.timestamp);
            
            // Check if device is actually online (reading within last 5 minutes)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            device.status = device.lastSeen > fiveMinutesAgo ? 'online' : 'offline';
          }

          // Get alert count for this device
          const alertCount = await db.collection("environmental_alerts")
            .countDocuments({
              deviceId: device.deviceId,
              acknowledged: false,
              resolved: false
            });

          // Add alert count to device status
          (device as any).activeAlerts = alertCount;

        } catch (dbError) {
          console.warn(`Error getting device data for ${device.deviceId}:`, dbError);
        }
      }
    }

    // Get device configurations
    const deviceConfigs = deviceId 
      ? IOT_DEVICE_CONFIGS.filter(d => d.id === deviceId)
      : IOT_DEVICE_CONFIGS;

    // Combine status with configuration
    const devices = deviceStatuses.map(status => {
      const config = deviceConfigs.find(c => c.id === status.deviceId);
      return {
        ...status,
        config: config ? {
          name: config.name,
          location: config.location,
          components: config.components.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type
          }))
        } : null
      };
    });

    // Calculate summary
    const summary = {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      error: devices.filter(d => d.status === 'error').length,
      totalAlerts: devices.reduce((sum, d) => sum + ((d as any).activeAlerts || 0), 0)
    };

    return NextResponse.json({
      devices,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching device status:", error);
    return NextResponse.json(
      { error: "Failed to fetch device status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/iot/devices - Update device status
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, status, batteryLevel, signalStrength } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
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

    // Build update object
    const update: any = {
      lastUpdated: new Date()
    };

    if (status) update.status = status;
    if (batteryLevel !== undefined) update.batteryLevel = batteryLevel;
    if (signalStrength !== undefined) update.signalStrength = signalStrength;

    // Update device status in database
    const result = await db.collection("device_status").updateOne(
      { deviceId },
      { 
        $set: update,
        $setOnInsert: { deviceId }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0,
      upserted: result.upsertedCount > 0,
      deviceId
    });

  } catch (error) {
    console.error("Error updating device status:", error);
    return NextResponse.json(
      { error: "Failed to update device status" },
      { status: 500 }
    );
  }
}


