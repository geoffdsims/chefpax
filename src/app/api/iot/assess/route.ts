import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { generateSensorReadings, analyzeSensorReadings, calculateEnvironmentalConditions } from "@/lib/iot-monitoring";
import type { SensorReading } from "@/lib/iot-monitoring";

/**
 * GET /api/iot/assess - Comprehensive environmental assessment
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const hours = parseInt(searchParams.get("hours") || "24");

    const db = await getDb();
    
    // Get sensor readings for assessment period
    let readings: SensorReading[] = [];
    
    if (db) {
      // Calculate time range
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000));

      const query: any = {
        timestamp: {
          $gte: startTime,
          $lte: endTime
        }
      };

      if (deviceId) {
        query.deviceId = deviceId;
      }

      const dbReadings = await db.collection("sensor_readings")
        .find(query)
        .sort({ timestamp: -1 })
        .limit(1000)
        .toArray();
      
      readings = dbReadings.map(r => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }));
    }

    // If no readings in database, generate sample data
    if (readings.length === 0) {
      console.log("No sensor readings for assessment, generating sample data");
      readings = generateSensorReadings();
      
      // Filter by device if specified
      if (deviceId) {
        readings = readings.filter(r => r.deviceId === deviceId);
      }
    }

    // Perform comprehensive analysis
    const analysis = analyzeSensorReadings(readings);
    const conditions = calculateEnvironmentalConditions(readings);

    // Calculate health score (0-100)
    const healthScore = calculateHealthScore(readings, analysis);

    // Generate recommendations
    const recommendations = generateRecommendations(conditions, analysis);

    // Calculate growth impact assessment
    const growthImpact = assessGrowthImpact(conditions, analysis);

    // Get recent alerts
    let recentAlerts = [];
    if (db) {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours
      
      const query: any = {
        timestamp: {
          $gte: startTime,
          $lte: endTime
        },
        resolved: false
      };

      if (deviceId) {
        query.deviceId = deviceId;
      }

      recentAlerts = await db.collection("environmental_alerts")
        .find(query)
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();
    }

    return NextResponse.json({
      assessment: {
        healthScore,
        overallStatus: analysis.overallStatus,
        timestamp: new Date().toISOString(),
        assessmentPeriod: {
          hours,
          startTime: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString()
        }
      },
      conditions,
      analysis: {
        alerts: analysis.alerts,
        recommendations: analysis.recommendations
      },
      growthImpact,
      customRecommendations: recommendations,
      recentAlerts: recentAlerts.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      })),
      dataQuality: {
        totalReadings: readings.length,
        timeSpan: hours,
        averageReadingsPerHour: readings.length / hours,
        devicesMonitored: [...new Set(readings.map(r => r.deviceId))].length
      }
    });

  } catch (error) {
    console.error("Error performing environmental assessment:", error);
    return NextResponse.json(
      { error: "Failed to perform environmental assessment" },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall health score based on readings and alerts
 */
function calculateHealthScore(readings: SensorReading[], analysis: any): number {
  let score = 100;
  
  // Deduct points for alerts
  score -= analysis.alerts.filter((a: any) => a.alertType === 'critical').length * 20;
  score -= analysis.alerts.filter((a: any) => a.alertType === 'warning').length * 5;
  
  // Deduct points for readings outside optimal ranges
  readings.forEach(reading => {
    // This would check against optimal ranges and deduct points
    // For now, we'll use the status field
    if (reading.status === 'critical') {
      score -= 15;
    } else if (reading.status === 'warning') {
      score -= 5;
    }
  });
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate custom recommendations based on conditions
 */
function generateRecommendations(conditions: any, analysis: any): string[] {
  const recommendations: string[] = [];
  
  // Temperature recommendations
  if (conditions.temperature?.current > conditions.temperature?.optimal[1]) {
    recommendations.push("Consider increasing ventilation or reducing heating to lower temperature");
  } else if (conditions.temperature?.current < conditions.temperature?.optimal[0]) {
    recommendations.push("Consider increasing heating or reducing ventilation to raise temperature");
  }
  
  // Humidity recommendations
  if (conditions.humidity?.current > conditions.humidity?.optimal[1]) {
    recommendations.push("Increase air circulation or reduce watering frequency to lower humidity");
  } else if (conditions.humidity?.current < conditions.humidity?.optimal[0]) {
    recommendations.push("Consider adding a humidifier or increasing watering frequency");
  }
  
  // Light recommendations
  if (conditions.light?.current < conditions.light?.optimal[0]) {
    recommendations.push("Check grow lights and ensure adequate light duration (12-16 hours daily)");
  }
  
  // Water level recommendations
  if (conditions.waterLevel?.current < 30) {
    recommendations.push("Refill water reservoir - low water level detected");
  }
  
  // Add any critical alerts as urgent recommendations
  analysis.alerts
    .filter((alert: any) => alert.alertType === 'critical' && !alert.resolved)
    .forEach((alert: any) => {
      recommendations.unshift(`URGENT: ${alert.actionRequired}`);
    });
  
  return recommendations;
}

/**
 * Assess potential impact on microgreen growth
 */
function assessGrowthImpact(conditions: any, analysis: any): any {
  const impact = {
    overall: 'minimal',
    factors: [] as string[],
    estimatedGrowthDelay: 0, // days
    qualityImpact: 'none'
  };
  
  // Temperature impact
  if (conditions.temperature?.current < 15 || conditions.temperature?.current > 30) {
    impact.factors.push('Temperature stress');
    impact.estimatedGrowthDelay += 2;
    impact.qualityImpact = 'moderate';
  }
  
  // Humidity impact
  if (conditions.humidity?.current > 80) {
    impact.factors.push('High humidity - risk of mold');
    impact.estimatedGrowthDelay += 1;
    impact.qualityImpact = 'severe';
  } else if (conditions.humidity?.current < 40) {
    impact.factors.push('Low humidity - dehydration risk');
    impact.estimatedGrowthDelay += 1;
  }
  
  // Light impact
  if (conditions.light?.current < 1000) {
    impact.factors.push('Insufficient light');
    impact.estimatedGrowthDelay += 3;
    impact.qualityImpact = 'moderate';
  }
  
  // Water impact
  if (conditions.waterLevel?.current < 20) {
    impact.factors.push('Water shortage');
    impact.estimatedGrowthDelay += 1;
    impact.qualityImpact = 'severe';
  }
  
  // Determine overall impact
  if (impact.estimatedGrowthDelay >= 3 || impact.qualityImpact === 'severe') {
    impact.overall = 'significant';
  } else if (impact.estimatedGrowthDelay >= 1 || impact.qualityImpact === 'moderate') {
    impact.overall = 'moderate';
  }
  
  return impact;
}


