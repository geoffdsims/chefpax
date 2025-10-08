"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';
import { 
  AutoMode as AutomationIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

export default function AutomationPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Social Media Automation Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Automated social media management for microgreens businesses
        </Typography>
      </Box>

      {/* Service Description */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          SaaS Platform Services
        </Typography>
        <Typography variant="body1" paragraph>
          ChefPax provides a comprehensive SaaS platform for microgreens businesses to automate their social media presence across Facebook, Instagram, and Twitter. Our platform uses Meta's Platform Data to enable automated posting, engagement analytics, and customer communication.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>How Platform Data is Used:</strong> We access Facebook Page information, post engagement metrics, and user interaction data to automatically schedule and publish content about microgreens products, harvest updates, and delivery schedules. This data enables our clients to maintain consistent social media presence without manual intervention.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Client Benefits:</strong> Microgreens businesses can focus on growing while our platform handles their social media marketing, customer engagement, and brand awareness through automated content posting and analytics.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <AutomationIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Automated Posting
              </Typography>
              <Typography variant="body2">
                Automatically post harvest updates, product availability, and delivery schedules across Facebook, Instagram, and Twitter.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Engagement Analytics
              </Typography>
              <Typography variant="body2">
                Track post performance, customer engagement, and optimize content strategy using real-time analytics from Meta Platform Data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Smart Scheduling
              </Typography>
              <Typography variant="body2">
                Intelligent content scheduling based on harvest cycles, delivery schedules, and optimal posting times for maximum engagement.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Integration */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Platform Integrations
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FacebookIcon sx={{ fontSize: 30, color: '#1877f2', mr: 2 }} />
              <Typography variant="h6">Facebook</Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemText primary="• Page management and posting" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Engagement analytics" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Customer interaction tracking" />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InstagramIcon sx={{ fontSize: 30, color: '#E4405F', mr: 2 }} />
              <Typography variant="h6">Instagram</Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemText primary="• Content posting and stories" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Visual content optimization" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Hashtag strategy automation" />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TwitterIcon sx={{ fontSize: 30, color: '#1DA1F2', mr: 2 }} />
              <Typography variant="h6">Twitter</Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemText primary="• Tweet scheduling and posting" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Real-time updates" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Engagement monitoring" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Business Information */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          About ChefPax SaaS Platform
        </Typography>
        <Typography variant="body1" paragraph>
          ChefPax is a technology company that provides automated social media management services specifically designed for microgreens businesses. We use Meta's Platform Data and APIs to enable our clients to maintain professional social media presence without manual effort.
        </Typography>
        <Typography variant="body1" paragraph>
          Our platform serves microgreens growers, distributors, and retailers who need consistent social media marketing to grow their customer base and maintain brand awareness in the local food market.
        </Typography>
        <Typography variant="body1">
          <strong>Contact:</strong> For more information about our SaaS platform services, please visit our main website or contact us through our business portal.
        </Typography>
      </Paper>
    </Container>
  );
}
