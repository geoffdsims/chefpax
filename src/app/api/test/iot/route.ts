import { NextResponse } from "next/server";
import { generateSensorReadings, analyzeSensorReadings, calculateEnvironmentalConditions } from "@/lib/iot-monitoring";

/**
 * GET /api/test/iot - Test IoT monitoring functionality
 */
export async function GET() {
  try {
    console.log("🧪 Testing IoT monitoring system...");

    // Generate sample sensor readings
    const readings = generateSensorReadings();
    console.log(`✅ Generated ${readings.length} sensor readings`);

    // Analyze readings
    const analysis = analyzeSensorReadings(readings);
    console.log(`✅ Analysis complete: ${analysis.alerts.length} alerts, status: ${analysis.overallStatus}`);

    // Calculate environmental conditions
    const conditions = calculateEnvironmentalConditions(readings);
    console.log("✅ Environmental conditions calculated");

    // Test data quality
    const dataQuality = {
      totalReadings: readings.length,
      devicesMonitored: [...new Set(readings.map(r => r.deviceId))].length,
      sensorTypes: [...new Set(readings.map(r => r.sensorType))],
      timeSpan: '24 hours (simulated)',
      averageReadingsPerHour: readings.length / 24
    };

    // Calculate health score
    const criticalAlerts = analysis.alerts.filter(a => a.alertType === 'critical').length;
    const warningAlerts = analysis.alerts.filter(a => a.alertType === 'warning').length;
    const healthScore = Math.max(0, 100 - (criticalAlerts * 20) - (warningAlerts * 5));

    return NextResponse.json({
      success: true,
      testResults: {
        sensorReadings: {
          total: readings.length,
          sample: readings.slice(0, 3) // Show first 3 readings
        },
        analysis: {
          overallStatus: analysis.overallStatus,
          alerts: {
            total: analysis.alerts.length,
            critical: criticalAlerts,
            warning: warningAlerts
          },
          recommendations: analysis.recommendations.slice(0, 3) // Show first 3 recommendations
        },
        environmentalConditions: {
          temperature: conditions.temperature,
          humidity: conditions.humidity,
          light: conditions.light,
          waterLevel: conditions.waterLevel
        },
        healthScore,
        dataQuality,
        timestamp: new Date().toISOString()
      },
      message: "IoT monitoring system is working correctly"
    });

  } catch (error) {
    console.error("❌ IoT test failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "IoT monitoring test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


