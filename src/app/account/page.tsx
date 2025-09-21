// app/account/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Button, List, ListItem, ListItemText, Divider, Box } from "@mui/material";
import { useSession, signIn } from "next-auth/react";

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
      <Typography variant="h4" mb={2}>Your Account</Typography>
      <Box mb={2}>
        <Typography variant="subtitle1">Signed in as {session.user?.email}</Typography>
        <Button variant="outlined" onClick={handleManageBilling} sx={{ mt: 1 }}>Manage billing</Button>
      </Box>

      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" mb={1}>Orders</Typography>
      {loading ? <Typography>Loading…</Typography> : null}
      <List>
        {orders.length === 0 ? <Typography color="text.secondary">No orders yet.</Typography> : null}
        {orders.map((o) => (
          <ListItem key={o._id}>
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
        ))}
      </List>
    </Container>
  );
}
