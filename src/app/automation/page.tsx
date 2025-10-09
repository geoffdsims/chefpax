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
          Professional SaaS automation platform for microgreens businesses
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto' }}>
          ChefPax LLC is a registered technology company providing automation services to microgreens growers and agricultural businesses. We specialize in IoT monitoring, social media automation, and business process optimization for the agricultural sector.
        </Typography>
      </Box>

      {/* Service Description */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          SaaS Platform Services
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Business Information:</strong> ChefPax LLC operates as a Software-as-a-Service (SaaS) provider, offering automation solutions specifically designed for microgreens cultivation businesses. Our platform integrates with Meta's APIs to provide automated social media management, IoT sensor monitoring, and business analytics.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Services Provided:</strong> We provide a comprehensive SaaS platform for microgreens businesses to automate their social media presence across Facebook, Instagram, and Twitter. Our platform uses Meta's Platform Data to enable automated posting, engagement analytics, and customer communication for agricultural businesses.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>How Platform Data is Used:</strong> ChefPax uses Meta's Platform Data through specific API calls to provide automation services to microgreens businesses:
        </Typography>
        <Typography variant="body1" component="div" sx={{ pl: 2, borderLeft: '3px solid #2D5016' }}>
          <Typography variant="subtitle1" gutterBottom><strong>Specific API Calls We Make:</strong></Typography>
          <Typography variant="body2" component="div">
            • <strong>pages_show_list:</strong> Retrieve list of Facebook Pages our clients manage<br/>
            • <strong>pages_read_engagement:</strong> Access post engagement metrics, likes, comments, shares<br/>
            • <strong>pages_manage_posts:</strong> Automatically create and schedule posts about harvest updates, product availability, delivery schedules<br/>
            • <strong>instagram_basic:</strong> Access Instagram Business account information and analytics<br/>
            • <strong>instagram_content_publish:</strong> Automatically post harvest photos and product updates to Instagram<br/>
            • <strong>read_insights:</strong> Generate automated reports on social media performance for microgreens businesses
          </Typography>
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Data Processing:</strong> We process this data to automatically schedule posts about microgreens harvest schedules, delivery updates, and product availability. This enables microgreens businesses to maintain consistent social media presence without manual posting.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Technical Implementation:</strong> Our platform uses webhook integrations and scheduled API calls to automatically:
        </Typography>
        <Typography variant="body1" component="div" sx={{ pl: 2 }}>
          <Typography variant="body2" component="div">
            • Monitor harvest schedules and automatically post "Fresh harvest today!" with product photos<br/>
            • Track delivery routes and post real-time delivery updates to customers<br/>
            • Analyze engagement data to optimize posting times for maximum reach<br/>
            • Generate weekly performance reports for microgreens business owners<br/>
            • Send automated responses to customer inquiries about product availability
          </Typography>
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Client Benefits:</strong> Microgreens businesses can focus on growing while our platform handles their social media marketing, customer engagement, and brand awareness through automated content posting and analytics.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Business Model:</strong> ChefPax operates as a subscription-based SaaS platform, charging microgreens businesses monthly fees for automated social media management services. We serve multiple clients in the agricultural sector, each with their own Facebook Pages and Instagram Business accounts.
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

