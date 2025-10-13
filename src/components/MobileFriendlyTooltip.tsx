"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Tooltip, Box, ClickAwayListener } from '@mui/material';

interface MobileFriendlyTooltipProps {
  title: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: boolean;
  enterDelay?: number;
  leaveDelay?: number;
}

export default function MobileFriendlyTooltip({
  title,
  children,
  placement = 'top',
  arrow = true,
  enterDelay = 300,
  leaveDelay = 200
}: MobileFriendlyTooltipProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      e.preventDefault();
      setOpen(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile) {
      e.preventDefault();
      // Keep tooltip open for 3 seconds on mobile
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 3000);
    }
  };

  const handleClickAway = () => {
    if (isMobile) {
      setOpen(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setOpen(true);
      // Clear any existing close timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    // Don't close immediately - give user time to move to tooltip
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 200); // 200ms delay before closing
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Tooltip
        title={title}
        placement={placement}
        arrow={arrow}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        enterDelay={isMobile ? 0 : enterDelay}
        leaveDelay={isMobile ? 0 : leaveDelay}
        disableHoverListener={isMobile}
        disableFocusListener={false}
        disableTouchListener={true} // We handle touch events manually
        disableInteractive={false} // IMPORTANT: Allow hovering over tooltip content
        PopperProps={{
          disablePortal: false,
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
              },
            },
            {
              name: 'offset',
              options: {
                offset: [0, isMobile ? 8 : 4],
              },
            },
          ],
        }}
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: 'rgba(45, 80, 22, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              maxWidth: { xs: '90vw', sm: 380 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              padding: { xs: '12px', sm: '16px' },
              // Mobile-specific styling
              '@media (max-width: 600px)': {
                maxWidth: '90vw',
                fontSize: '0.8rem',
                padding: '12px',
                zIndex: 9999, // Ensure it's above other elements
              },
              '& .MuiTooltip-arrow': {
                color: 'rgba(45, 80, 22, 0.98)',
              }
            }
          }
        }}
      >
        <Box
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ display: 'inline-block' }}
        >
          {children}
        </Box>
      </Tooltip>
    </ClickAwayListener>
  );
}
