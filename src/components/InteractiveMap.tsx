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
  // Aggiungi i dati dell'iniziativa
  description?: string;
  organization?: string;
  date?: string;
  participants?: string;
  contact?: string;
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
    l2: '#3b82f6',
    cultura: '#8b5cf6', 
    social: '#10b981',
    sport: '#f59e0b',
    default: '#6b7280'
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

    console.log('Adding markers for locations:', locations);
    
    locations.forEach(location => {
      console.log('Creating marker for:', location.name, 'at', location.coordinates);
      
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
        <div class="p-4 min-w-[250px] max-w-[320px]">
          <h3 class="font-semibold text-lg mb-3 text-gray-900 leading-tight">${location.name}</h3>
          
          ${location.description ? `
            <div class="mb-3">
              <p class="text-sm text-gray-700 leading-relaxed line-clamp-3">
                ${location.description.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z0-9#]+;/g, ' ').replace(/\s+/g, ' ').trim()}
              </p>
            </div>
          ` : ''}
          
          <div class="space-y-2 text-xs border-t pt-3">
            <div class="flex items-start">
              <span class="text-blue-600 mr-2">📍</span>
              <span class="text-gray-600 leading-relaxed">${location.address}</span>
            </div>
            
            ${location.date ? `
              <div class="flex items-center">
                <span class="text-green-600 mr-2">📅</span>
                <span class="text-gray-700">${location.date}</span>
              </div>
            ` : ''}
            
            ${location.organization ? `
              <div class="flex items-center">
                <span class="text-purple-600 mr-2">🏢</span>
                <span class="text-gray-700 font-medium">${location.organization}</span>
              </div>
            ` : ''}
            
            <div class="flex items-center">
              <span class="text-orange-600 mr-2">🏷️</span>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">${location.type}</span>
            </div>
          </div>
          
          <div class="mt-4 pt-3 border-t border-gray-200">
            <button class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium">
              Visualizza dettagli completi
            </button>
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
      
      // Check for URL parameters to center map on specific location
      const urlParams = new URLSearchParams(window.location.search);
      const lat = urlParams.get('lat');
      const lng = urlParams.get('lng');
      
      if (lat && lng && map.current) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        setTimeout(() => {
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 2000
          });
        }, 1000);
      }
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