"use client";

import { useState } from 'react';
import { Box, Container, Typography, Paper, Button, List, ListItem, ListItemText, Alert, CircularProgress } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';

export default function FacebookDemoPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate Facebook Login and fetching pages
      // In production, this would use the Facebook SDK
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock pages data
      const mockPages = [
        { id: '861932703661799', name: 'ChefPax Microgreens', fan_count: 245 },
        { id: 'mock_personal_123', name: 'Personal Page', fan_count: 150 },
        { id: 'mock_business_456', name: 'Business Page 2', fan_count: 89 }
      ];
      
      setPages(mockPages);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Facebook');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPage(pageId);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Facebook Page Integration Demo
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          This demo shows how ChefPax uses the <strong>pages_show_list</strong> permission to let users
          select which Facebook Page to post their microgreens content to.
        </Typography>

        <Box sx={{ mt: 4 }}>
          {pages.length === 0 ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Connect Your Facebook Account
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Click below to connect your Facebook account and see the list of Pages you manage.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FacebookIcon />}
                onClick={handleFacebookLogin}
                disabled={loading}
                sx={{ 
                  mt: 2,
                  bgcolor: '#1877f2',
                  '&:hover': { bgcolor: '#166fe5' }
                }}
              >
                {loading ? 'Connecting...' : 'Connect with Facebook'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select a Page to Post To
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose which Facebook Page will receive automated posts about your microgreens products,
                harvest updates, and delivery schedules.
              </Typography>

              <List>
                {pages.map((page) => (
                  <ListItem
                    key={page.id}
                    button
                    selected={selectedPage === page.id}
                    onClick={() => handleSelectPage(page.id)}
                    sx={{
                      border: '1px solid',
                      borderColor: selectedPage === page.id ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: selectedPage === page.id ? 'action.selected' : 'background.paper'
                    }}
                  >
                    <ListItemText
                      primary={page.name}
                      secondary={`Page ID: ${page.id} • ${page.fan_count} followers`}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedPage && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✅ You've selected: <strong>{pages.find(p => p.id === selectedPage)?.name}</strong>
                  <br />
                  ChefPax will now post microgreens content to this page.
                </Alert>
              )}

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPages([]);
                    setSelectedPage(null);
                  }}
                >
                  Disconnect & Reset Demo
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            📋 Demo Flow:
          </Typography>
          <Typography variant="body2">
            1. User clicks "Connect with Facebook" (OAuth login)<br />
            2. Facebook asks for permission to access list of Pages<br />
            3. ChefPax displays all Pages the user manages<br />
            4. User selects which Page to use for automated posting<br />
            5. ChefPax saves the selection and uses it for social media automation
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

