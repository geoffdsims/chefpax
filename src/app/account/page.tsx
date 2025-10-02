// app/account/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Button, List, ListItem, ListItemText, Divider, Box, Grid, Card, CardContent, Alert } from "@mui/material";
import { useSession, signIn } from "next-auth/react";
import WelcomeBackDashboard from "@/components/WelcomeBackDashboard";
import OrderTrackingCalendar from "@/components/OrderTrackingCalendar";

type Order = {
  _id?: string;
  createdAt?: string;
  deliveryDate?: string;
  status?: string;
  items?: { name: string; qty: number }[];
  totalCents?: number;
};

export default function AccountPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d || []))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" mb={2}>Sign in to see your account</Typography>
        <Button variant="contained" onClick={() => signIn()}>Sign in</Button>
      </Container>
    );
  }

  async function handleManageBilling() {
    const res = await fetch("/api/create-portal-session", { method: "POST" });
    const j = await res.json();
    if (j.url) window.location.href = j.url;
    else alert(j.error || "Unable to open billing portal");
  }

  return (
    <Container sx={{ py: 6 }}>
      {/* Welcome Back Dashboard */}
      <Box sx={{ mb: 4 }}>
        <WelcomeBackDashboard />
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        {/* Order Tracking Calendar */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                📅 Order Tracking Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Track your orders and microgreens growth stages on a visual calendar
              </Typography>
              
              {loading ? (
                <Typography>Loading orders...</Typography>
              ) : orders.length === 0 ? (
                <Alert severity="info">
                  No orders yet. Place your first order to see it tracked here!
                </Alert>
              ) : (
                <OrderTrackingCalendar 
                  orders={orders} 
                  onOrderSelect={(order) => console.log('Selected order:', order)}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Management */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                ⚙️ Account Management
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Signed in as:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session.user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session.user?.name}
                </Typography>
              </Box>

              <Button 
                variant="contained" 
                onClick={handleManageBilling} 
                fullWidth
                sx={{ mb: 2 }}
              >
                Manage Billing & Subscriptions
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                📋 Order History
              </Typography>
              
              {loading ? (
                <Typography>Loading orders...</Typography>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {orders.length === 0 ? (
                    <Typography color="text.secondary">No orders yet.</Typography>
                  ) : (
                    orders.map((o) => (
                      <ListItem key={o._id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={`${new Date(o.createdAt || "").toLocaleString() || "Order" } — ${o.status || ""}`}
                          secondary={
                            <>
                              {(o.items || []).map((it, i) => <span key={i}>{it.name} x {it.qty} • </span>)}
                              <div>Total: ${( (o.totalCents || 0) / 100 ).toFixed(2)}</div>
                            </>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
