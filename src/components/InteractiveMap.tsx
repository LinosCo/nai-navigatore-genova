import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  name: string;
  type: string;
  address: string;
  district: string;
  services: string[];
  coordinates: { lat: number; lng: number };
}

interface InteractiveMapProps {
  locations: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  locations, 
  selectedLocation, 
  onLocationSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  // Colors for different service types
  const typeColors = {
    l2: '#hsl(var(--primary))',
    cultura: '#hsl(var(--secondary))',
    social: '#hsl(var(--accent))',
    sport: '#hsl(var(--success))',
    default: '#hsl(var(--muted-foreground))'
  };

  // Try to get Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          return;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
          setIsTokenSet(true);
        } else {
          console.error('No token received from edge function');
        }
      } catch (error) {
        console.error('Error calling edge function:', error);
      }
    };
    
    fetchToken();
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [8.9463, 44.4056], // Genova coordinates
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for each location
    addMarkersToMap();
  };

  const addMarkersToMap = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    locations.forEach(location => {
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110';
      markerElement.style.backgroundColor = typeColors[location.type as keyof typeof typeColors] || typeColors.default;

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([location.coordinates.lng, location.coordinates.lat])
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'mapbox-popup'
      }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-1">${location.name}</h3>
          <p class="text-xs text-gray-600 mb-1">${location.address}</p>
          <div class="flex flex-wrap gap-1">
            ${location.services.map(service => 
              `<span class="text-xs bg-gray-100 px-1 py-0.5 rounded">${service}</span>`
            ).join('')}
          </div>
        </div>
      `);

      markerElement.addEventListener('click', () => {
        popup.addTo(map.current!);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      });

      markers.current.push(marker);
    });
  };

  // Initialize map when token is available
  useEffect(() => {
    if (isTokenSet && mapboxToken) {
      initializeMap();
    }
  }, [isTokenSet, mapboxToken, locations]);

  // Update markers when locations change
  useEffect(() => {
    if (map.current) {
      addMarkersToMap();
    }
  }, [locations]);

  // Focus on selected location
  useEffect(() => {
    if (map.current && selectedLocation) {
      map.current.flyTo({
        center: [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [selectedLocation]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
    }
  };

  if (!isTokenSet) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Caricamento mappa...</h3>
          <p className="text-muted-foreground text-sm">
            Sto recuperando la configurazione della mappa
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-96 overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
    </Card>
  );
};

export default InteractiveMap;