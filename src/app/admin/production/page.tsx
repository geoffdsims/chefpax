"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Badge,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  AccessTime,
  Error,
  PlayArrow,
  Pause,
  Refresh,
  Visibility,
  Edit,
  Schedule,
  LocalShipping,
  Agriculture
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductionTask {
  _id: string;
  orderId?: string;
  subscriptionId?: string;
  productId: string;
  type: "SEED" | "GERMINATE" | "LIGHT" | "HARVEST" | "PACK";
  runAt: string;
  status: "PENDING" | "READY" | "IN_PROGRESS" | "DONE" | "FAILED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  notes?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryJob {
  _id: string;
  orderId: string;
  method: "LOCAL_COURIER" | "SHIPPING" | "PICKUP";
  status: "REQUESTED" | "SCHEDULED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
  trackingUrl?: string;
  trackingNumber?: string;
  scheduledFor?: string;
  address: {
    name: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
}

export default function ProductionDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, deliveriesRes] = await Promise.all([
        fetch('/api/admin/production-tasks'),
        fetch('/api/admin/delivery-jobs')
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        setDeliveries(deliveriesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/production-tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: taskNotes })
      });

      if (response.ok) {
        await fetchData();
        setTaskDialogOpen(false);
        setTaskNotes('');
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'READY': return 'info';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'default';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'SEED': return '🌱';
      case 'GERMINATE': return '🌿';
      case 'LIGHT': return '☀️';
      case 'HARVEST': return '✂️';
      case 'PACK': return '📦';
      default: return '📋';
    }
  };

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.runAt).toDateString();
    const today = new Date().toDateString();
    return taskDate === today && task.status !== 'DONE';
  });

  const urgentTasks = tasks.filter(task => 
    task.priority === 'URGENT' && task.status !== 'DONE'
  );

  const overdueTasks = tasks.filter(task => {
    const taskDate = new Date(task.runAt);
    const now = new Date();
    return taskDate < now && task.status === 'PENDING';
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🌱 Production Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your microgreen production pipeline and delivery operations
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {todayTasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">
                {urgentTasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Urgent Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {overdueTasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {deliveries.filter(d => d.status === 'DELIVERED').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Deliveries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              label={
                <Badge badgeContent={todayTasks.length} color="primary">
                  Today's Tasks
                </Badge>
              } 
              icon={<Schedule />}
            />
            <Tab 
              label={
                <Badge badgeContent={urgentTasks.length} color="error">
                  Urgent
                </Badge>
              } 
              icon={<Error />}
            />
            <Tab label="All Tasks" icon={<Agriculture />} />
            <Tab label="Deliveries" icon={<LocalShipping />} />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <TaskList 
              tasks={todayTasks}
              onTaskSelect={setSelectedTask}
              onCompleteTask={(task) => {
                setSelectedTask(task);
                setTaskNotes('');
                setTaskDialogOpen(true);
              }}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getTaskIcon={getTaskIcon}
            />
          )}

          {activeTab === 1 && (
            <TaskList 
              tasks={urgentTasks}
              onTaskSelect={setSelectedTask}
              onCompleteTask={(task) => {
                setSelectedTask(task);
                setTaskNotes('');
                setTaskDialogOpen(true);
              }}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getTaskIcon={getTaskIcon}
            />
          )}

          {activeTab === 2 && (
            <TaskList 
              tasks={tasks}
              onTaskSelect={setSelectedTask}
              onCompleteTask={(task) => {
                setSelectedTask(task);
                setTaskNotes('');
                setTaskDialogOpen(true);
              }}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getTaskIcon={getTaskIcon}
            />
          )}

          {activeTab === 3 && (
            <DeliveryList deliveries={deliveries} />
          )}
        </CardContent>
      </Card>

      {/* Task Completion Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Complete Task: {selectedTask?.type} - {selectedTask?.quantity} trays
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Completion Notes"
            fullWidth
            multiline
            rows={3}
            value={taskNotes}
            onChange={(e) => setTaskNotes(e.target.value)}
            placeholder="Add any notes about the completed task..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedTask && handleCompleteTask(selectedTask._id)}
            variant="contained"
            startIcon={<CheckCircle />}
          >
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function TaskList({ 
  tasks, 
  onTaskSelect, 
  onCompleteTask, 
  getStatusColor, 
  getPriorityColor, 
  getTaskIcon 
}: {
  tasks: ProductionTask[];
  onTaskSelect: (task: ProductionTask) => void;
  onCompleteTask: (task: ProductionTask) => void;
  getStatusColor: (status: string) => any;
  getPriorityColor: (priority: string) => any;
  getTaskIcon: (type: string) => string;
}) {
  if (tasks.length === 0) {
    return (
      <Alert severity="info">
        No tasks found for this category.
      </Alert>
    );
  }

  return (
    <List>
      {tasks.map((task) => (
        <motion.div
          key={task._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <ListItem 
            sx={{ 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1, 
              mb: 1,
              backgroundColor: task.status === 'DONE' ? 'action.hover' : 'background.paper'
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    {getTaskIcon(task.type)} {task.type}
                  </Typography>
                  <Chip 
                    label={task.status} 
                    size="small" 
                    color={getStatusColor(task.status)}
                  />
                  <Chip 
                    label={task.priority} 
                    size="small" 
                    color={getPriorityColor(task.priority)}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {task.quantity} trays • 
                    Scheduled: {new Date(task.runAt).toLocaleString()}
                  </Typography>
                  {task.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {task.notes}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => onTaskSelect(task)}
                  color="primary"
                >
                  <Visibility />
                </IconButton>
                {task.status !== 'DONE' && (
                  <IconButton 
                    size="small" 
                    onClick={() => onCompleteTask(task)}
                    color="success"
                  >
                    <CheckCircle />
                  </IconButton>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        </motion.div>
      ))}
    </List>
  );
}

function DeliveryList({ deliveries }: { deliveries: DeliveryJob[] }) {
  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'IN_TRANSIT': return 'info';
      case 'SCHEDULED': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  return (
    <List>
      {deliveries.map((delivery) => (
        <ListItem key={delivery._id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">
                  🚚 {delivery.method.replace('_', ' ')}
                </Typography>
                <Chip 
                  label={delivery.status} 
                  size="small" 
                  color={getDeliveryStatusColor(delivery.status)}
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {delivery.address.name} • {delivery.address.city}, {delivery.address.state}
                </Typography>
                {delivery.scheduledFor && (
                  <Typography variant="body2" color="text.secondary">
                    Scheduled: {new Date(delivery.scheduledFor).toLocaleString()}
                  </Typography>
                )}
                {delivery.trackingNumber && (
                  <Typography variant="body2" color="primary">
                    Tracking: {delivery.trackingNumber}
                  </Typography>
                )}
              </Box>
            }
          />
          <ListItemSecondaryAction>
            {delivery.trackingUrl && (
              <Button 
                size="small" 
                href={delivery.trackingUrl} 
                target="_blank"
                variant="outlined"
              >
                Track
              </Button>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}
