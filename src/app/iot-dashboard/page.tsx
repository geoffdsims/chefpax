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
  Divider
} from '@mui/material';
import {
  Thermostat,
  WaterDrop,
  Lightbulb,
  Air,
  Sensors
} from '@mui/icons-material';

interface SensorData {
  timestamp: string;
  temperature_humidity: {
    [key: string]: {
      temperature: number | null;
      humidity: number | null;
    };
  };
  light_levels: {
    [key: string]: number | null;
  };
  water_levels: {
    [key: string]: {
      cm: number;
      inches: number;
    } | null;
  };
  co2_ppm: number | null;
  source: string;
}

export default function IoTDashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/iot/sensors');
      if (response.ok) {
        const data = await response.json();
        setSensorData(data);
        setError(null);
      } else {
        setError('Failed to fetch sensor data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number | null, thresholds: { good: number; warning: number }) => {
    if (value === null) return 'default';
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.warning) return 'warning';
    return 'error';
  };

  const getWaterLevelStatus = (water: { cm: number; inches: number } | null) => {
    if (!water) return { status: 'No Reading', color: 'default' };
    if (water.cm < 5) return { status: 'Low', color: 'error' };
    if (water.cm < 15) return { status: 'Good', color: 'success' };
    return { status: 'High', color: 'warning' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading sensor data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!sensorData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No sensor data available
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Sensors color="primary" />
        ChefPax IoT Monitoring Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Last updated: {new Date(sensorData.timestamp).toLocaleString()}
      </Typography>

      <Grid container spacing={3}>
        {/* Temperature & Humidity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Thermostat color="primary" />
                Temperature & Humidity
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(sensorData.temperature_humidity).map(([shelf, data]) => (
                  <Grid item xs={12} sm={6} key={shelf}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {shelf.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body2">
                        Temp: {data.temperature ? `${data.temperature}°F` : 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Humidity: {data.humidity ? `${data.humidity}%` : 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Light Levels */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="primary" />
                Light Levels
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(sensorData.light_levels).map(([shelf, lux]) => (
                  <Grid item xs={12} sm={6} key={shelf}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {shelf.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body2">
                        Light: {lux ? `${lux} lux` : 'N/A'}
                      </Typography>
                      <Chip
                        label={lux && lux > 1000 ? 'Good' : 'Low'}
                        color={lux && lux > 1000 ? 'success' : 'warning'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Water Levels */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WaterDrop color="primary" />
                Water Levels
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(sensorData.water_levels).map(([shelf, water]) => {
                  const status = getWaterLevelStatus(water);
                  return (
                    <Grid item xs={12} sm={6} key={shelf}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {shelf.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          Level: {water ? `${water.cm} cm (${water.inches}")` : 'No Reading'}
                        </Typography>
                        <Chip
                          label={status.status}
                          color={status.color as any}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* CO2 Level */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Air color="primary" />
                CO2 Level
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" color="primary">
                  {sensorData.co2_ppm ? `${sensorData.co2_ppm}` : 'N/A'}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  ppm
                </Typography>
                <Chip
                  label={sensorData.co2_ppm ? 
                    (sensorData.co2_ppm < 1000 ? 'Good' : 
                     sensorData.co2_ppm < 2000 ? 'Moderate' : 'High') : 'No Reading'}
                  color={sensorData.co2_ppm ? 
                    (sensorData.co2_ppm < 1000 ? 'success' : 
                     sensorData.co2_ppm < 2000 ? 'warning' : 'error') : 'default'}
                  sx={{ mt: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      
      <Typography variant="body2" color="text.secondary" align="center">
        Data updates every 30 seconds • Source: {sensorData.source}
      </Typography>
    </Box>
  );
}
