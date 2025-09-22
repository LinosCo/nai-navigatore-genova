import { useState } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface SearchSectionProps {
  onSearch?: (searchTerm: string, type: string, location: string) => void;
}

const SearchSection = ({ onSearch }: SearchSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm, selectedType, selectedLocation);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedLocation("all");
    if (onSearch) {
      onSearch("", "all", "all");
    }
  };

  const serviceTypes = [
    { value: "all", label: "Tutti i servizi" },
    { value: "l2", label: "Corsi L2" },
    { value: "cultura", label: "Cultura" },
    { value: "social", label: "Sociale" },
    { value: "sport", label: "Sport" }
  ];

  const locations = [
    { value: "all", label: "Tutte le zone" },
    { value: "centro storico", label: "Centro Storico" },
    { value: "sampierdarena", label: "Sampierdarena" },
    { value: "centro ovest", label: "Centro Ovest" },
    { value: "valpolcevera", label: "Valpolcevera" },
    { value: "ponente", label: "Ponente" },
    { value: "levante", label: "Levante" },
    { value: "val bisagno", label: "Val Bisagno" }
  ];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Trova iniziative per studenti NAI
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Scopri corsi di lingua, attività culturali, servizi sociali e opportunità sportive 
              nella città di Genova per studenti Neo Arrivati in Italia
            </p>
          </div>

          {/* Search Form */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca iniziative, corsi, attività..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Type Filter */}
              <div className="w-full md:w-48">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="w-full md:w-48">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Cerca
              </Button>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="text-sm"
              >
                Cancella filtri
              </Button>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("l2");
                if (onSearch) onSearch(searchTerm, "l2", selectedLocation);
              }}
            >
              Corsi Italiano
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("cultura");
                if (onSearch) onSearch(searchTerm, "cultura", selectedLocation);
              }}
            >
              Attività Culturali
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("social");
                if (onSearch) onSearch(searchTerm, "social", selectedLocation);
              }}
            >
              Servizi Sociali
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("sport");
                if (onSearch) onSearch(searchTerm, "sport", selectedLocation);
              }}
            >
              Sport
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchSection;