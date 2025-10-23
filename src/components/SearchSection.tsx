import { useState } from "react";
import { Search, MapPin, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface SearchFilters {
  searchTerm: string;
  type: string;
  location: string;
  ageGroup: string;
  format: string;
  language: string;
  isFree: boolean | null;
  difficultyLevel: string;
}

interface SearchSectionProps {
  onSearch?: (filters: SearchFilters) => void;
}

const SearchSection = ({ onSearch }: SearchSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [onlyFree, setOnlyFree] = useState<boolean | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        searchTerm,
        type: selectedType,
        location: selectedLocation,
        ageGroup: selectedAgeGroup,
        format: selectedFormat,
        language: selectedLanguage,
        isFree: onlyFree,
        difficultyLevel: selectedDifficulty
      });
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedAgeGroup("all");
    setSelectedFormat("all");
    setSelectedLanguage("all");
    setOnlyFree(null);
    setSelectedDifficulty("all");
    if (onSearch) {
      onSearch({
        searchTerm: "",
        type: "all",
        location: "all",
        ageGroup: "all",
        format: "all",
        language: "all",
        isFree: null,
        difficultyLevel: "all"
      });
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

  const ageGroups = [
    { value: "all", label: "Tutte le età" },
    { value: "bambini", label: "Bambini (3-10 anni)" },
    { value: "ragazzi", label: "Ragazzi (11-18 anni)" },
    { value: "adulti", label: "Adulti (18+)" },
    { value: "tutti", label: "Tutte le fasce d'età" }
  ];

  const formats = [
    { value: "all", label: "Tutti i formati" },
    { value: "presenza", label: "In presenza" },
    { value: "online", label: "Online" },
    { value: "ibrido", label: "Ibrido (misto)" }
  ];

  const languages = [
    { value: "all", label: "Tutte le lingue" },
    { value: "italiano", label: "Italiano" },
    { value: "inglese", label: "Inglese" },
    { value: "francese", label: "Francese" },
    { value: "spagnolo", label: "Spagnolo" },
    { value: "arabo", label: "Arabo" },
    { value: "cinese", label: "Cinese" },
    { value: "multilingua", label: "Multilingua" },
    { value: "altro", label: "Altra lingua" }
  ];

  const difficultyLevels = [
    { value: "all", label: "Tutti i livelli" },
    { value: "principiante", label: "Principiante" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzato", label: "Avanzato" }
  ];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tutte le iniziative per studenti NAI
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

            {/* Advanced Filters Toggle */}
            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <div className="flex justify-center">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtri Avanzati
                    {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  {/* Age Group */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fascia d'età</Label>
                    <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Formato</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Lingua</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty Level */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Livello</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Free Only Checkbox */}
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id="onlyFree"
                      checked={onlyFree === true}
                      onCheckedChange={(checked) => setOnlyFree(checked ? true : null)}
                    />
                    <Label htmlFor="onlyFree" className="text-sm font-medium cursor-pointer">
                      Solo iniziative gratuite
                    </Label>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                className="text-sm"
              >
                Cancella tutti i filtri
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
                handleSearch();
              }}
            >
              Corsi Italiano
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("cultura");
                handleSearch();
              }}
            >
              Attività Culturali
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("social");
                handleSearch();
              }}
            >
              Servizi Sociali
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("sport");
                handleSearch();
              }}
            >
              Sport
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOnlyFree(true);
                handleSearch();
              }}
            >
              Solo Gratis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchSection;