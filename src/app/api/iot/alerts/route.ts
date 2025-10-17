import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import type { EnvironmentalAlert } from "@/lib/iot-monitoring";

/**
 * GET /api/iot/alerts - Get environmental alerts
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const status = searchParams.get("status"); // 'active', 'acknowledged', 'resolved'
    const alertType = searchParams.get("type"); // 'warning', 'critical'
    const hours = parseInt(searchParams.get("hours") || "24");

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

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

    if (status) {
      if (status === 'active') {
        query.acknowledged = false;
        query.resolved = false;
      } else if (status === 'acknowledged') {
        query.acknowledged = true;
        query.resolved = false;
      } else if (status === 'resolved') {
        query.resolved = true;
      }
    }

    if (alertType) {
      query.alertType = alertType;
    }

    // Get alerts from database
    const alerts = await db.collection("environmental_alerts")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    // Convert timestamps back to Date objects
    const formattedAlerts = alerts.map(alert => ({
      ...alert,
      timestamp: new Date(alert.timestamp)
    }));

    // Calculate summary statistics
    const summary = {
      total: formattedAlerts.length,
      critical: formattedAlerts.filter(a => a.alertType === 'critical').length,
      warning: formattedAlerts.filter(a => a.alertType === 'warning').length,
      active: formattedAlerts.filter(a => !a.acknowledged && !a.resolved).length,
      acknowledged: formattedAlerts.filter(a => a.acknowledged && !a.resolved).length,
      resolved: formattedAlerts.filter(a => a.resolved).length
    };

    return NextResponse.json({
      alerts: formattedAlerts,
      summary,
      timeRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        hours
      }
    });

  } catch (error) {
    console.error("Error fetching environmental alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/iot/alerts/[alertId] - Update alert status
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { alertId, acknowledged, resolved } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: "Alert ID is required" },
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
    const update: any = {};
    if (acknowledged !== undefined) update.acknowledged = acknowledged;
    if (resolved !== undefined) update.resolved = resolved;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided" },
        { status: 400 }
      );
    }

    // Update alert
    const result = await db.collection("environmental_alerts").updateOne(
      { id: alertId },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0,
      alertId
    });

  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}


