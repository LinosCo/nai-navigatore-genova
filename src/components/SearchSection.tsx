import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const quickFilters = [
    { id: "l2", label: "Corsi L2", color: "bg-primary" },
    { id: "cultura", label: "Attività culturali", color: "bg-secondary" },
    { id: "social", label: "Servizi sociali", color: "bg-accent" },
    { id: "sampierdarena", label: "Sampierdarena", color: "bg-success" }
  ];

  const recentSearches = [
    "Corsi di italiano L2 Sampierdarena",
    "Mediazione culturale scuole",
    "Attività ricreative studenti NAI"
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Search */}
      <Card className="border-2 border-dashed border-primary/20 bg-primary-light/30">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Trova iniziative per i tuoi studenti NAI
            </h2>
            <p className="text-muted-foreground">
              Cerca corsi, attività e servizi nella città di Genova
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Es: Corsi di italiano L2 a Sampierdarena"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 h-12 text-base"
              />
              <Button className="absolute right-1 top-1 h-10">
                Cerca
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(filter.id)}
                  className="text-xs"
                >
                  {filter.label}
                </Button>
              ))}
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3 mr-1" />
                Altri filtri
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions and Recent Searches */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Azioni rapide
            </h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                <div>
                  <div className="font-medium text-sm">Trova mediatori culturali</div>
                  <div className="text-xs text-muted-foreground">Supporto linguistico per colloqui</div>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                <div>
                  <div className="font-medium text-sm">Corsi L2 gratuiti</div>
                  <div className="text-xs text-muted-foreground">Percorsi di alfabetizzazione</div>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                <div>
                  <div className="font-medium text-sm">Attività extrascolastiche</div>
                  <div className="text-xs text-muted-foreground">Sport e cultura per l'integrazione</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-3">Ricerche recenti</h3>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => setSearchQuery(search)}
                >
                  <div className="flex items-center space-x-2">
                    <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{search}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchSection;