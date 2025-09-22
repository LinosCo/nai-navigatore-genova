import { useState } from "react";
import { MapPin, Filter, List, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InteractiveMap from "@/components/InteractiveMap";

// Mock data for demonstration
const mockLocations = [
  {
    id: 1,
    name: "Centro Interculturale Sampierdarena",
    type: "l2",
    address: "Via XXV Aprile, 12",
    district: "Sampierdarena",
    services: ["Corsi L2", "Mediazione culturale"],
    coordinates: { lat: 44.4254, lng: 8.8924 }
  },
  {
    id: 2,
    name: "Biblioteca Civica Berio",
    type: "cultura",
    address: "Via del Seminario, 16",
    district: "Centro Storico",
    services: ["Laboratori lettura", "Supporto compiti"],
    coordinates: { lat: 44.4056, lng: 8.9463 }
  },
  {
    id: 3,
    name: "Centro Sportivo Comunale",
    type: "sport",
    address: "Via Canevari, 28",
    district: "Sampierdarena",
    services: ["Calcio", "Pallavolo", "Attività inclusive"],
    coordinates: { lat: 44.4189, lng: 8.8856 }
  },
  {
    id: 4,
    name: "Servizi Sociali Municipio II",
    type: "social",
    address: "Via del Campo, 91",
    district: "Centro Ovest",
    services: ["Assistenza famiglie", "Orientamento servizi"],
    coordinates: { lat: 44.4098, lng: 8.9234 }
  }
];

const MapView = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedLocation, setSelectedLocation] = useState<typeof mockLocations[0] | null>(null);

  const districts = ["all", "Sampierdarena", "Centro Storico", "Centro Ovest", "Valpolcevera"];
  const serviceTypes = [
    { id: "all", label: "Tutti i servizi", color: "bg-muted" },
    { id: "l2", label: "Corsi L2", color: "bg-primary" },
    { id: "cultura", label: "Cultura", color: "bg-secondary" },
    { id: "social", label: "Sociale", color: "bg-accent" },
    { id: "sport", label: "Sport", color: "bg-success" }
  ];

  const filteredLocations = mockLocations.filter(location => {
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