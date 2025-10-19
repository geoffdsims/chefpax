'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Thermostat,
  WaterDrop,
  Lightbulb,
  Air,
  Sensors,
  Refresh,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Warning,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import {
  type SensorReading,
  type EnvironmentalAlert,
  type IoTDeviceStatus,
  type EnvironmentalConditions
} from '@/lib/iot-monitoring';

export default function IoTMonitoringDashboard() {
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<IoTDeviceStatus[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [conditions, setConditions] = useState<EnvironmentalConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState(0);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sensorsResponse, devicesResponse] = await Promise.all([
        fetch('/api/iot/sensors'),
        fetch('/api/iot/devices')
      ]);

      if (!sensorsResponse.ok || !devicesResponse.ok) {
        throw new Error('Failed to fetch IoT data');
      }

      const [sensorsData, devicesData] = await Promise.all([
        sensorsResponse.json(),
        devicesResponse.json()
      ]);

      setSensorData(sensorsData.readings || []);
      setDeviceStatus(devicesData.devices || []);
      setAlerts(sensorsData.alerts || []);
      setConditions(sensorsData.conditions || null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
    }
  };

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising': return <TrendingUp color="error" />;
      case 'falling': return <TrendingDown color="success" />;
      case 'stable': return <TrendingFlat color="info" />;
    }
  };

  // Process data for charts
  const processChartData = () => {
    const chartData: any[] = [];
    const locations = [...new Set(sensorData.map(r => r.location))];
    
    locations.forEach(location => {
      const locationReadings = sensorData.filter(r => r.location === location);
      
      chartData.push({
        location: location.replace('_', ' ').toUpperCase(),
        temperature: locationReadings.find(r => r.sensorType === 'temperature')?.value || 0,
        humidity: locationReadings.find(r => r.sensorType === 'humidity')?.value || 0,
        light: locationReadings.find(r => r.sensorType === 'light')?.value || 0,
        waterLevel: locationReadings.find(r => r.sensorType === 'water_level')?.value || 0,
      });
    });
    
    return chartData;
  };

  const processTimeSeriesData = () => {
    // Group readings by hour for time series
    const hourlyData: { [key: string]: any } = {};
    
    sensorData.forEach(reading => {
      const hour = new Date(reading.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { hour: `${hour}:00`, temperature: [], humidity: [], light: [] };
      }
      hourlyData[hour][reading.sensorType] = reading.value;
    });
    
    return Object.values(hourlyData).sort((a, b) => a.hour.localeCompare(b.hour));
  };

  const getStatusDistribution = () => {
    const statusCounts = sensorData.reduce((acc, reading) => {
      acc[reading.status] = (acc[reading.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.toUpperCase(),
      value: count,
      color: status === 'normal' ? '#4caf50' : status === 'warning' ? '#ff9800' : '#f44336'
    }));
  };

  if (loading && sensorData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading IoT sensor data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sensors color="primary" />
          IoT Monitoring Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated.toLocaleString()}
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchSensorData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Charts & Analytics" />
          <Tab label="Real-time Data" />
          <Tab label="Alerts & Status" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tab Content */}
      {activeTab === 0 && (
        <OverviewTab 
          conditions={conditions}
          deviceStatus={deviceStatus}
          alerts={alerts}
        />
      )}

      {activeTab === 1 && (
        <ChartsTab 
          sensorData={sensorData}
          processChartData={processChartData}
          processTimeSeriesData={processTimeSeriesData}
          getStatusDistribution={getStatusDistribution}
        />
      )}

      {activeTab === 2 && (
        <RealTimeDataTab sensorData={sensorData} />
      )}

      {activeTab === 3 && (
        <AlertsTab alerts={alerts} />
      )}

      <Divider sx={{ my: 3 }} />
      
      <Typography variant="body2" color="text.secondary" align="center">
        Data updates every 30 seconds • Real-time monitoring system
      </Typography>
    </Box>
  );
}

// Tab Components
function OverviewTab({ conditions, deviceStatus, alerts }: any) {
  return (
    <Grid container spacing={3}>
      {/* Device Status Cards */}
      {deviceStatus.map((device: any) => (
        <Grid item xs={12} md={4} key={device.deviceId}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{device.name}</Typography>
                <Chip
                  label={device.status}
                  color={device.status === 'online' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Location: {device.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last seen: {new Date(device.lastSeen).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Environmental Conditions */}
      {conditions && (
        <>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Thermostat color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>Temperature</Typography>
                <Typography variant="h3" color="primary">
                  {conditions.temperature?.current?.toFixed(1) || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {conditions.temperature?.unit || '°F'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <WaterDrop color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>Humidity</Typography>
                <Typography variant="h3" color="primary">
                  {conditions.humidity?.current?.toFixed(1) || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {conditions.humidity?.unit || '%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Lightbulb color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>Light Level</Typography>
                <Typography variant="h3" color="primary">
                  {conditions.light?.current?.toFixed(0) || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {conditions.light?.unit || 'lux'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Air color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>CO2 Level</Typography>
                <Typography variant="h3" color="primary">
                  {conditions.co2?.current?.toFixed(0) || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {conditions.co2?.unit || 'ppm'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
}

function ChartsTab({ sensorData, processChartData, processTimeSeriesData, getStatusDistribution }: any) {
  const chartData = processChartData();
  const timeSeriesData = processTimeSeriesData();
  const statusData = getStatusDistribution();

  return (
    <Grid container spacing={3}>
      {/* Temperature Comparison Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Temperature by Location</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="temperature" fill="#ff6b6b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Humidity Comparison Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Humidity by Location</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="humidity" fill="#4ecdc4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Light Levels Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Light Levels by Location</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="light" stroke="#ffd93d" fill="#ffd93d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Water Levels Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Water Levels by Location</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="waterLevel" stroke="#6c5ce7" fill="#6c5ce7" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Status Distribution Pie Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Sensor Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Time Series Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Environmental Trends</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="temperature" stroke="#ff6b6b" strokeWidth={2} />
                <Line type="monotone" dataKey="humidity" stroke="#4ecdc4" strokeWidth={2} />
                <Line type="monotone" dataKey="light" stroke="#ffd93d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function RealTimeDataTab({ sensorData }: any) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Latest Sensor Readings</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sensor</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sensorData.slice(-20).map((reading: any) => (
                <TableRow key={reading.id}>
                  <TableCell>{reading.sensorType}</TableCell>
                  <TableCell>{reading.location}</TableCell>
                  <TableCell>
                    {reading.value.toFixed(2)} {reading.unit}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={reading.status}
                      color={reading.status === 'normal' ? 'success' : reading.status === 'warning' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(reading.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function AlertsTab({ alerts }: any) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={alerts.length} color="error">
            <Warning color="warning" />
          </Badge>
          Environmental Alerts
        </Typography>
        {alerts.length === 0 ? (
          <Alert severity="success">No active alerts - All systems operating normally!</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sensor</TableCell>
                  <TableCell>Alert</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Threshold</TableCell>
                  <TableCell>Action Required</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert: any) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.sensorType}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.alertType}
                        color={alert.alertType === 'critical' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{alert.value}</TableCell>
                    <TableCell>{alert.threshold}</TableCell>
                    <TableCell>{alert.actionRequired}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.acknowledged ? 'Acknowledged' : 'New'}
                        color={alert.acknowledged ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}