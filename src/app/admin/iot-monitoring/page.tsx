"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Badge,
  Divider,
  Button
} from '@mui/material';
import {
  Thermostat,
  WaterDrop,
  LightMode,
  Science,
  Co2,
  Waves,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Refresh,
  WifiOff,
  Wifi,
  Battery80,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

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

interface EnvironmentalAlert {
  id: string;
  deviceId: string;
  sensorType: string;
  alertType: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  actionRequired: string;
}

interface IoTDeviceStatus {
  deviceId: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion?: string;
  uptime?: number;
}

interface EnvironmentalData {
  readings: SensorReading[];
  conditions: any;
  devices: IoTDeviceStatus[];
  alerts: EnvironmentalAlert[];
  overallStatus: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
  timestamp: string;
}

const IoTMonitoringDashboard: React.FC = () => {
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/iot/sensors');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch sensor data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSensorData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'normal':
      case 'online':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
      case 'offline':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'normal':
      case 'online':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'critical':
      case 'offline':
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return <Thermostat />;
      case 'humidity':
        return <WaterDrop />;
      case 'light':
        return <LightMode />;
      case 'ph':
        return <Science />;
      case 'co2':
        return <Co2 />;
      case 'water_level':
      case 'water_flow':
        return <Waves />;
      default:
        return <SettingsIcon />;
    }
  };

  const renderEnvironmentalCard = (type: string, condition: any) => {
    if (!condition) return null;

    const isInRange = condition.current >= condition.optimal[0] && condition.current <= condition.optimal[1];
    const status = isInRange ? 'normal' : 'warning';

    return (
      <Grid item xs={12} sm={6} md={4} key={type}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  {getSensorIcon(type)}
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {type.replace('_', ' ')}
                  </Typography>
                </Box>
                {getStatusIcon(status)}
              </Box>
              
              <Typography variant="h3" color={isInRange ? 'success.main' : 'warning.main'} gutterBottom>
                {condition.current}{condition.unit}
              </Typography>

              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Optimal: {condition.optimal[0]}-{condition.optimal[1]}{condition.unit}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((condition.current - condition.min) / (condition.max - condition.min)) * 100}
                  color={isInRange ? 'success' : 'warning'}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Min</Typography>
                  <Typography variant="body2">{condition.min}{condition.unit}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Avg</Typography>
                  <Typography variant="body2">{condition.average}{condition.unit}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Max</Typography>
                  <Typography variant="body2">{condition.max}{condition.unit}</Typography>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Chip 
                  label={`Trend: ${condition.trend}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>IoT Monitoring Dashboard</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">
          <AlertTitle>Error Loading Sensor Data</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">🌱 IoT Monitoring Dashboard</Typography>
        <Box display="flex" gap={2}>
          <Tooltip title={autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}>
            <IconButton onClick={() => setAutoRefresh(!autoRefresh)} color={autoRefresh ? "primary" : "default"}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={fetchSensorData}
          >
            Refresh Now
          </Button>
        </Box>
      </Box>

      {/* Overall Status */}
      <Alert 
        severity={getStatusColor(data?.overallStatus || 'healthy') as any}
        icon={getStatusIcon(data?.overallStatus || 'healthy')}
        sx={{ mb: 3 }}
      >
        <AlertTitle>System Status: {data?.overallStatus?.toUpperCase()}</AlertTitle>
        {data?.alerts && data.alerts.length > 0 ? (
          `${data.alerts.length} active alert(s) require attention`
        ) : (
          'All environmental conditions are within optimal ranges'
        )}
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={
            <Badge badgeContent={data?.alerts?.length || 0} color="error">
              Environmental Conditions
            </Badge>
          } />
          <Tab label="Device Status" />
          <Tab label={
            <Badge badgeContent={data?.alerts?.length || 0} color="error">
              Alerts & Recommendations
            </Badge>
          } />
          <Tab label="Hardware Specifications" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {data?.conditions && Object.entries(data.conditions).map(([type, condition]) =>
            renderEnvironmentalCard(type, condition)
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell>Battery</TableCell>
                  <TableCell>Signal</TableCell>
                  <TableCell>Firmware</TableCell>
                  <TableCell>Uptime</TableCell>
                </TableRow>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.devices?.map((device) => (
                <TableRow key={device.deviceId}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {device.status === 'online' ? <Wifi color="success" /> : <WifiOff color="error" />}
                      {device.name}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {device.location.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={device.status} 
                      color={getStatusColor(device.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(device.lastSeen).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {device.batteryLevel ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Battery80 />
                        {Math.round(device.batteryLevel)}%
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {device.signalStrength ? `${Math.round(device.signalStrength)} dBm` : '-'}
                  </TableCell>
                  <TableCell>{device.firmwareVersion || '-'}</TableCell>
                  <TableCell>
                    {device.uptime ? `${Math.floor(device.uptime / 3600)}h ${Math.floor((device.uptime % 3600) / 60)}m` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <Box>
          {data?.alerts && data.alerts.length > 0 ? (
            <Grid container spacing={2}>
              {data.alerts.map((alert) => (
                <Grid item xs={12} key={alert.id}>
                  <Alert severity={alert.alertType === 'critical' ? 'error' : 'warning'}>
                    <AlertTitle>{alert.sensorType.toUpperCase()} - {alert.alertType.toUpperCase()}</AlertTitle>
                    <Typography variant="body2">{alert.message}</Typography>
                    {alert.actionRequired && (
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        Action Required: {alert.actionRequired}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="success">
              <AlertTitle>No Active Alerts</AlertTitle>
              All environmental conditions are within optimal ranges.
            </Alert>
          )}

          {data?.recommendations && data.recommendations.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>Recommendations</Typography>
              <Card>
                <CardContent>
                  {data.recommendations.map((rec, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      • {rec}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Hardware Components</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Complete list of IoT hardware components purchased for the ChefPax monitoring system.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Hardware Investment</AlertTitle>
            Total estimated cost: Approximately $200-300 for complete monitoring setup
          </Alert>
          {/* Hardware specs would be displayed here */}
          <Typography variant="body2">
            Hardware specifications are available in the IoT Hardware module.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default IoTMonitoringDashboard;
