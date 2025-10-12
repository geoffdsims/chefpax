"use client";
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  Stack,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import { 
  PlayArrow, 
  Schedule, 
  CheckCircle, 
  Agriculture,
  Notifications
} from '@mui/icons-material';

export default function TestProductionPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testProductionSystem = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test creating a sample production task
      const taskResponse = await fetch('/api/admin/production-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'sunflower-live-tray',
          type: 'SEED',
          runAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          priority: 'MEDIUM',
          notes: 'Test seeding task for production system',
          quantity: 2
        })
      });

      if (!taskResponse.ok) {
        throw new Error('Failed to create test task');
      }

      const taskResult = await taskResponse.json();
      
      setResults({
        taskCreated: taskResult,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testReadyTasksCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/production/check-ready-tasks');
      const data = await response.json();
      
      setResults({
        readyTasksCheck: data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDailySummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/production/daily-summary');
      const data = await response.json();
      
      setResults({
        dailySummary: data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/production-tasks');
      const data = await response.json();
      
      setResults({
        productionTasks: data,
        taskCount: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🌱 Production System Testing
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Test the production scheduling system, task automation, and Slack notifications.
      </Alert>

      {/* Test Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Agriculture sx={{ mr: 1, verticalAlign: 'middle' }} />
                Create Test Task
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a sample production task to test the system
              </Typography>
              <Button
                variant="contained"
                onClick={testProductionSystem}
                disabled={loading}
                startIcon={<PlayArrow />}
                fullWidth
              >
                Create Task
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Check Ready Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Check for tasks ready to run and send notifications
              </Typography>
              <Button
                variant="contained"
                onClick={testReadyTasksCheck}
                disabled={loading}
                startIcon={<Notifications />}
                fullWidth
              >
                Check Tasks
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Daily Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generate and send daily production summary
              </Typography>
              <Button
                variant="contained"
                onClick={testDailySummary}
                disabled={loading}
                startIcon={<Schedule />}
                fullWidth
              >
                Generate Summary
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Agriculture sx={{ mr: 1, verticalAlign: 'middle' }} />
                Fetch Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fetch all production tasks from database
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchProductionTasks}
                disabled={loading}
                startIcon={<Agriculture />}
                fullWidth
              >
                Fetch Tasks
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error}
        </Alert>
      )}

      {results && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Last updated: {new Date(results.timestamp).toLocaleString()}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ 
              backgroundColor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400
            }}>
              <pre style={{ 
                fontSize: '0.8rem', 
                margin: 0, 
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {JSON.stringify(results, null, 2)}
              </pre>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Production System Status */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Production System Components
          </Typography>
          
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✅" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Production Task API Endpoints</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✅" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Automated Task Creation from Orders</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✅" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Slack Notification System</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✅" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Task Status Management</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✅" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Production Dashboard</Typography>
            </Box>
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            <strong>Environment Variables Needed:</strong>
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            <li><code>SLACK_WEBHOOK_URL</code> - For production notifications</li>
            <li><code>SLACK_CHANNEL</code> - Default channel for notifications</li>
            <li><code>MONGODB_URI</code> - Database connection</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
