import { Container, Typography, Box, Link } from '@mui/material';

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontFamily: 'Playfair Display, serif',
          color: 'primary.main',
          mb: 4,
          textAlign: 'center'
        }}
      >
        Privacy Policy
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          1. Information We Collect
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          We collect information you provide directly to us, such as when you create an account, 
          place an order, or contact us for support. This includes:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Contact information (name, email address, phone number, mailing address)
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Payment information (processed securely through Stripe)
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Account credentials (if you create an account)
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Order history and preferences
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Communication preferences
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We use the information we collect to:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Process and fulfill your orders
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Communicate with you about your orders and our services
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Provide customer support
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Send you marketing communications (with your consent)
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Improve our website and services
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Comply with legal obligations
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          3. Information Sharing and Disclosure
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We do not sell, trade, or rent your personal information to third parties. We may share 
          your information in the following circumstances:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            <strong>Service Providers:</strong> With trusted third-party vendors who assist us in 
            operating our website, processing payments (Stripe), and delivering products
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          4. Payment Processing
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          We use Stripe to process payments. Your payment information is encrypted and processed 
          securely by Stripe in accordance with their privacy policy and PCI DSS standards. 
          We do not store your full payment card information on our servers.
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          5. Data Security
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          We implement appropriate technical and organizational measures to protect your personal 
          information against unauthorized access, alteration, disclosure, or destruction. This 
          includes encryption, secure servers, and regular security assessments.
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          6. Your Rights
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You have the right to:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Access and update your personal information
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Request deletion of your personal information
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Opt out of marketing communications
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Request a copy of your data
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          7. Cookies and Tracking
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          We use cookies and similar technologies to improve your experience, analyze usage patterns, 
          and provide personalized content. You can control cookie settings through your browser.
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          8. Children's Privacy
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Our services are not directed to children under 13. We do not knowingly collect personal 
          information from children under 13. If we become aware of such collection, we will delete 
          the information immediately.
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          9. Changes to This Policy
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          We may update this privacy policy from time to time. We will notify you of any changes 
          by posting the new policy on this page and updating the &quot;Last updated&quot; date.
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          10. Contact Us
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          If you have any questions about this privacy policy, please contact us at:
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="body1">
            Email: <Link href="mailto:privacy@chefpax.com">privacy@chefpax.com</Link>
          </Typography>
          <Typography variant="body1">
            Phone: <Link href="tel:+15125551234">(512) 555-1234</Link>
          </Typography>
          <Typography variant="body1">
            Address: 123 Farm Road, Austin, TX 78701
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
<!-- Force deployment -->
