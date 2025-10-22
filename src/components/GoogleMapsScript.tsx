'use client';

import { useEffect } from 'react';

export default function GoogleMapsScript() {
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log('Google Maps script already exists');
      return;
    }

    console.log('Loading Google Maps API...');
    console.log('API Key available:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      console.log('Google object:', window.google);
    };
    script.onerror = (e) => {
      console.error('Failed to load Google Maps API:', e);
      console.log('API Key being used:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT_SET');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
