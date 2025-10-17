'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Alert,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  DeviceThermostat as TempIcon,
  Opacity as HumidityIcon,
  Lightbulb as LightIcon,
  Water as WaterIcon
} from '@mui/icons-material';

interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: string;
  sensorType: string;
  value: number;
  unit: string;
  location: string;
  status: 'normal' | 'warning' | 'critical';
}

interface DeviceStatus {
  deviceId: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  activeAlerts?: number;
}

interface EnvironmentalAlert {
  id: string;
  deviceId: string;
  sensorType: string;
  alertType: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  actionRequired: string;
}

export default function IoTMonitoringPage() {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch devices, readings, and alerts in parallel
      const [devicesRes, readingsRes, alertsRes] = await Promise.all([
        fetch('/api/iot/devices'),
        fetch('/api/iot/sensors?analysis=true'),
        fetch('/api/iot/alerts?status=active')
      ]);

      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setDevices(devicesData.devices || []);
      }

      if (readingsRes.ok) {
        const readingsData = await readingsRes.json();
        setReadings(readingsData.readings || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching IoT data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon />;
      case 'offline': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <WarningIcon />;
    }
  };

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature': return <TempIcon />;
      case 'humidity': return <HumidityIcon />;
      case 'light': return <LightIcon />;
      case 'waterLevel': return <WaterIcon />;
      default: return <TempIcon />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.alertType === 'critical');
  const warningAlerts = alerts.filter(a => a.alertType === 'warning');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          IoT Monitoring Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <IconButton onClick={fetchData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
          </Typography>
          {criticalAlerts.map(alert => (
            <Typography key={alert.id} variant="body2">
              • {alert.message} - {alert.actionRequired}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {warningAlerts.length} Warning Alert{warningAlerts.length > 1 ? 's' : ''}
          </Typography>
          {warningAlerts.slice(0, 3).map(alert => (
            <Typography key={alert.id} variant="body2">
              • {alert.message}
            </Typography>
          ))}
          {warningAlerts.length > 3 && (
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              ...and {warningAlerts.length - 3} more
            </Typography>
          )}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Device Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Device Status ({devices.length} devices)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Device</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Alerts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devices.map(device => (
                      <TableRow key={device.deviceId}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {device.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {device.location}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(device.status)}
                            label={device.status}
                            color={getStatusColor(device.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {device.activeAlerts ? (
                            <Chip
                              label={device.activeAlerts}
                              color="warning"
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Sensor Readings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Current Sensor Readings
              </Typography>
              <Grid container spacing={2}>
                {readings.map(reading => (
                  <Grid item xs={12} sm={6} key={reading.id}>
                    <Box sx={{ 
                      p: 2, 
                      border: 1, 
                      borderColor: reading.status === 'critical' ? 'error.main' : 
                                   reading.status === 'warning' ? 'warning.main' : 'success.main',
                      borderRadius: 1,
                      bgcolor: reading.status === 'critical' ? 'error.light' : 
                               reading.status === 'warning' ? 'warning.light' : 'success.light',
                      opacity: 0.1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getSensorIcon(reading.sensorType)}
                        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {reading.sensorType}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {reading.value.toFixed(1)}{reading.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reading.location}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Alerts ({alerts.length} total)
              </Typography>
              {alerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active alerts
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Device</TableCell>
                        <TableCell>Sensor</TableCell>
                        <TableCell>Alert</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Action Required</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts.slice(0, 10).map(alert => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {alert.deviceId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {alert.sensorType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.alertType}
                              color={alert.alertType === 'critical' ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {alert.value.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {alert.actionRequired}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}


