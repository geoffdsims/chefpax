"use client";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Pause, 
  PlayArrow, 
  Cancel,
  CheckCircle,
  Schedule
} from "@mui/icons-material";
import type { Subscription, UserProfile, DeliveryOption } from "@/lib/schema";

interface SubscriptionManagerProps {
  userId: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SubscriptionManager({ userId }: SubscriptionManagerProps) {
  const { data: subscriptions, mutate: mutateSubscriptions } = useSWR(
    "/api/subscriptions", 
    fetcher
  );
  const { data: profile } = useSWR("/api/profile", fetcher);
  const { data: deliveryOptions } = useSWR("/api/delivery-options", fetcher);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [newSubscription, setNewSubscription] = useState({
    frequency: "weekly" as const,
    deliveryDay: 5, // Friday
    nextDeliveryDate: "",
    items: [] as any[],
    autoRenew: true
  });

  useEffect(() => {
    // Set default delivery date to next available Friday
    if (deliveryOptions && deliveryOptions.length > 0) {
      const nextFriday = deliveryOptions.find((opt: DeliveryOption) => 
        new Date(opt.date).getDay() === 5 && opt.available
      );
      if (nextFriday) {
        setNewSubscription(prev => ({
          ...prev,
          nextDeliveryDate: nextFriday.date
        }));
      }
    }
  }, [deliveryOptions]);

  const handleCreateSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSubscription,
          deliveryFeeCents: 500 // $5 delivery fee
        })
      });

      if (response.ok) {
        setCreateDialogOpen(false);
        mutateSubscriptions();
        // Reset form
        setNewSubscription({
          frequency: "weekly",
          deliveryDay: 5,
          nextDeliveryDate: "",
          items: [],
          autoRenew: true
        });
      }
    } catch (error) {
      console.error("Failed to create subscription:", error);
    }
  };

  const handleUpdateSubscription = async (subscriptionId: string, updates: Partial<Subscription>) => {
    try {
      await fetch("/api/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, updates })
      });
      mutateSubscriptions();
      setEditingSubscription(null);
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await fetch(`/api/subscriptions?subscriptionId=${subscriptionId}`, {
        method: "DELETE"
      });
      mutateSubscriptions();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "paused": return "warning";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "weekly": return "Weekly";
      case "biweekly": return "Bi-weekly";
      case "monthly": return "Monthly";
      default: return frequency;
    }
  };

  const formatDeliveryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!subscriptions) {
    return <Box>Loading subscriptions...</Box>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          My Subscriptions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Subscription
        </Button>
      </Box>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Active Subscriptions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create a subscription to get fresh microgreens delivered automatically
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create First Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {subscriptions.map((subscription: Subscription) => (
            <Grid item xs={12} md={6} key={subscription._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">
                      {getFrequencyLabel(subscription.frequency)} Delivery
                    </Typography>
                    <Chip 
                      label={subscription.status} 
                      color={getStatusColor(subscription.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Next delivery: {formatDeliveryDate(subscription.nextDeliveryDate)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {subscription.items.length} items • ${(subscription.items.reduce((sum, item) => 
                      sum + (item.priceCents * item.qty), 0) + subscription.deliveryFeeCents) / 100}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => setEditingSubscription(subscription)}
                    >
                      Edit
                    </Button>
                    
                    {subscription.status === "active" ? (
                      <Button
                        size="small"
                        startIcon={<Pause />}
                        onClick={() => handleUpdateSubscription(subscription._id!, { status: "paused" })}
                      >
                        Pause
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => handleUpdateSubscription(subscription._id!, { status: "active" })}
                      >
                        Resume
                      </Button>
                    )}
                    
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleCancelSubscription(subscription._id!)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Subscription Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Subscription</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSubscription.frequency}
                onChange={(e) => setNewSubscription(prev => ({ ...prev, frequency: e.target.value as any }))}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Preferred Delivery Day</InputLabel>
              <Select
                value={newSubscription.deliveryDay}
                onChange={(e) => setNewSubscription(prev => ({ ...prev, deliveryDay: e.target.value as number }))}
              >
                <MenuItem value={1}>Monday</MenuItem>
                <MenuItem value={2}>Tuesday</MenuItem>
                <MenuItem value={3}>Wednesday</MenuItem>
                <MenuItem value={4}>Thursday</MenuItem>
                <MenuItem value={5}>Friday</MenuItem>
                <MenuItem value={6}>Saturday</MenuItem>
                <MenuItem value={0}>Sunday</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Next Delivery Date"
              type="date"
              value={newSubscription.nextDeliveryDate ? newSubscription.nextDeliveryDate.split('T')[0] : ''}
              onChange={(e) => setNewSubscription(prev => ({ 
                ...prev, 
                nextDeliveryDate: new Date(e.target.value).toISOString() 
              }))}
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newSubscription.autoRenew}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, autoRenew: e.target.checked }))}
                />
              }
              label="Auto-renew subscription"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              You'll save 10% on all subscription orders! Add items to your cart and they'll be automatically included in your subscription.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSubscription} variant="contained">
            Create Subscription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subscription Dialog */}
      {editingSubscription && (
        <Dialog open={!!editingSubscription} onClose={() => setEditingSubscription(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Edit your subscription preferences and delivery schedule.
            </Typography>
            {/* Add edit form fields here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingSubscription(null)}>Cancel</Button>
            <Button variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

