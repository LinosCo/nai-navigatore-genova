import { useState, useEffect } from "react";
import { MapPin, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InteractiveMap from "@/components/InteractiveMap";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Initiative {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  participants: string;
  contact: string;
  type: string;
  organization: string;
  latitude?: number;
  longitude?: number;
}

interface Location {
  id: string;
  name: string;
  type: string;
  address: string;
  district: string;
  services: string[];
  coordinates: { lat: number; lng: number };
}

const MapView = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const { data: initiativesData, error } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching initiatives:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le iniziative",
          variant: "destructive",
        });
        return;
      }

      setInitiatives(initiativesData || []);
      
      // Convert initiatives to map locations
      const mapLocations: Location[] = (initiativesData || [])
        .filter(initiative => initiative.latitude && initiative.longitude)
        .map(initiative => ({
          id: initiative.id,
          name: initiative.title,
          type: initiative.type,
          address: initiative.location,
          district: getDistrictFromLocation(initiative.location),
          services: [initiative.organization],
          coordinates: { 
            lat: initiative.latitude!, 
            lng: initiative.longitude! 
          }
        }));

      setLocations(mapLocations);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore di connessione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDistrictFromLocation = (location: string): string => {
    // Simple logic to extract district from location string
    const districts = ["Centro Storico", "Valpolcevera", "Ponente", "Val Bisagno", "Levante", "Sampierdarena", "Centro Ovest"];
    const found = districts.find(district => 
      location.toLowerCase().includes(district.toLowerCase()) ||
      location.toLowerCase().includes(district.toLowerCase().replace(/\s/g, ''))
    );
    return found || "Centro Storico";
  };

  const districts = ["all", "Centro Storico", "Valpolcevera", "Ponente", "Val Bisagno", "Levante", "Sampierdarena", "Centro Ovest"];
  const serviceTypes = [
    { id: "all", label: "Tutti i servizi", color: "bg-muted" },
    { id: "l2", label: "Corsi L2", color: "bg-primary" },
    { id: "cultura", label: "Cultura", color: "bg-secondary" },
    { id: "social", label: "Sociale", color: "bg-accent" },
    { id: "sport", label: "Sport", color: "bg-success" }
  ];

  const filteredLocations = locations.filter(location => {
    const districtMatch = selectedDistrict === "all" || location.district === selectedDistrict;
    const typeMatch = selectedType === "all" || location.type === selectedType;
    return districtMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mappa territoriale</h1>
          <p className="text-muted-foreground">Servizi e iniziative per studenti NAI a Genova</p>
          {loading && <p className="text-sm text-muted-foreground">Caricamento iniziative...</p>}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Mappa
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-1" />
            Lista
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">Municipio:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-sm border border-border rounded-md px-2 py-1 bg-background"
          >
            {districts.map(district => (
              <option key={district} value={district}>
                {district === "all" ? "Tutti" : district}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1">
          {serviceTypes.map(type => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.id)}
              className="text-xs"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Map/List Content */}
      {viewMode === "map" ? (
        <InteractiveMap 
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />
      ) : (
        <div className="grid gap-4">
          {filteredLocations.map(location => (
            <Card key={location.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  <Badge variant="outline">{location.district}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {location.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedLocation(location);
                        setViewMode("map");
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Visualizza su mappa
                    </Button>
                    <Button size="sm">
                      Contatta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && filteredLocations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna iniziativa trovata con i filtri selezionati
            </div>
          )}
        </div>
      )}

      {/* Legend for map view */}
      {viewMode === "map" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legenda</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {serviceTypes.slice(1).map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                  <span className="text-xs text-muted-foreground">{type.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapView;