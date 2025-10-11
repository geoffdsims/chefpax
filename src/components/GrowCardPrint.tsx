'use client';

import { Box, Paper, Typography, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import growCardsData from '@/../docs/product-lineup/grow-cards.json';

export default function GrowCardPrint() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <Typography variant="h4">🌱 Production Grow Cards</Typography>
        <Button 
          variant="contained" 
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print All Cards
        </Button>
      </Box>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .grow-card { page-break-after: always; page-break-inside: avoid; }
          body { font-size: 11pt; }
          h1 { font-size: 18pt; }
          h2 { font-size: 14pt; }
        }
      `}</style>

      {growCardsData.growCards.map((card, index) => (
        <Paper 
          key={card.id} 
          elevation={3} 
          className="grow-card"
          sx={{ 
            p: 4, 
            mb: 4,
            border: '2px solid #2D5016',
            '@media print': {
              boxShadow: 'none',
              border: '2px solid #000'
            }
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 3, borderBottom: '3px solid #2D5016', pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2D5016' }}>
              {card.rank} CHEFPAX {card.category.toUpperCase()} — GROW CARD #{index + 1}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
              {card.icon} {card.name.toUpperCase()}
            </Typography>
          </Box>

          {/* Basic Info */}
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Typography><strong>Botanical Name:</strong> {card.botanical || 'N/A'}</Typography>
            <Typography><strong>Category:</strong> {card.category}</Typography>
            <Typography><strong>Tray Size:</strong> {card.traySize}</Typography>
            <Typography><strong>Seeding Density:</strong> {card.seedingDensity}</Typography>
          </Box>

          {/* Germination */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>🌱 Germination</Typography>
            <Typography>• Blackout: {card.germination.blackoutDays} days {card.germination.blackoutNotes ? `(${card.germination.blackoutNotes})` : ''}</Typography>
            <Typography>• Temperature: {card.germination.temperature}</Typography>
            <Typography>• Humidity: {card.germination.humidity}</Typography>
          </Box>

          {/* Light Phase */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff9e6', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>💡 Light Phase</Typography>
            <Typography>• Begin: Day {card.lightPhase.startDay}</Typography>
            <Typography>• Duration: {card.lightPhase.hoursPerDay} hours light/day</Typography>
            {card.lightPhase.notes && <Typography>• Notes: {card.lightPhase.notes}</Typography>}
          </Box>

          {/* Water & Flood */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>💧 Water & Flood</Typography>
            <Typography>• Requirement: {card.water.requirement}</Typography>
            <Typography>• Schedule: {card.water.schedule}</Typography>
            <Typography>• Rack Position: {card.water.tier}</Typography>
            {card.water.notes && <Typography>• Notes: {card.water.notes}</Typography>}
          </Box>

          {/* Harvest */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>🌿 Harvest</Typography>
            <Typography>• Days to Harvest: {card.harvest.days} days after seeding</Typography>
            <Typography>• Ready When: {card.harvest.readyWhen}</Typography>
            {card.harvest.prep && <Typography>• Prep: {card.harvest.prep}</Typography>}
          </Box>

          {/* Flavor & Pairing */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#fce4ec', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>🍽️ Flavor & Pairing</Typography>
            <Typography>• Flavor: {card.flavor.profile}</Typography>
            <Typography>• Texture: {card.flavor.texture}</Typography>
            {card.flavor.visual && <Typography>• Visual: {card.flavor.visual}</Typography>}
            <Typography>• Chef Use: {card.flavor.chefUse}</Typography>
          </Box>

          {/* Order Info */}
          <Box sx={{ mt: 3, p: 2, border: '2px solid #2D5016', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#2D5016' }}>
              📦 Order Information
            </Typography>
            <Typography><strong>Lead Time:</strong> {card.orderInfo.leadTimeDays} days</Typography>
            <Typography><strong>Weekly Capacity:</strong> {card.orderInfo.weeklyCapacity} trays</Typography>
            <Typography><strong>Price:</strong> ${(card.orderInfo.priceCents / 100).toFixed(2)}/tray</Typography>
            {card.orderInfo.notes && (
              <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                {card.orderInfo.notes}
              </Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

