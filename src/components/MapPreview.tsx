import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface MapPreviewProps {
  latitude?: number;
  longitude?: number;
  location: string;
  className?: string;
  showViewButton?: boolean;
  onViewFullMap?: () => void;
}

const MapPreview: React.FC<MapPreviewProps> = ({ 
  latitude, 
  longitude, 
  location,
  className = '',
  showViewButton = true,
  onViewFullMap
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Try to get Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setIsLoading(false);
          return;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
          setIsTokenSet(true);
        }
      } catch (error) {
        console.error('Error calling edge function:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchToken();
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || !latitude || !longitude) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [longitude, latitude],
      zoom: 14,
      interactive: false, // Disable interaction for preview
    });

    // Add marker
    const markerElement = document.createElement('div');
    markerElement.className = 'w-4 h-4 rounded-full border-2 border-white shadow-lg';
    markerElement.style.backgroundColor = 'hsl(var(--primary))';

    new mapboxgl.Marker(markerElement)
      .setLngLat([longitude, latitude])
      .addTo(map.current);
  };

  // Initialize map when token is available
  useEffect(() => {
    if (isTokenSet && mapboxToken && latitude && longitude) {
      initializeMap();
    }
  }, [isTokenSet, mapboxToken, latitude, longitude]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`h-24 bg-muted rounded-md flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <span className="text-xs text-muted-foreground">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (!latitude || !longitude || !isTokenSet) {
    return (
      <div className={`h-24 bg-muted rounded-md flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <span className="text-xs text-muted-foreground">{location}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      <div ref={mapContainer} className="h-24 w-full" />
      {showViewButton && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs"
            onClick={onViewFullMap}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Visualizza mappa
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapPreview;