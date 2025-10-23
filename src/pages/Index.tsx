import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import SearchSection, { SearchFilters } from "@/components/SearchSection";
import ActivityCard from "@/components/ActivityCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Initiative {
  id: string;
  title: string;
  description: string;
  nai_benefits?: string;
  location: string;
  date: string;
  participants: string;
  contact: string;
  type: "l2" | "cultura" | "social" | "sport";
  organization: string;
  latitude?: number;
  longitude?: number;
  created_by: string;
  is_generated: boolean;
  source_url?: string;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    searchTerm: "",
    type: "all",
    location: "all",
    ageGroup: "all",
    format: "all",
    language: "all",
    isFree: null,
    difficultyLevel: "all"
  });

  useEffect(() => {
    fetchInitiatives();
  }, []);

  useEffect(() => {
    filterInitiatives();
  }, [initiatives, currentFilters]);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData = (data || []).map(item => ({
        ...item,
        type: item.type as "l2" | "cultura" | "social" | "sport"
      }));
      
      setInitiatives(mappedData);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle iniziative",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInitiatives = () => {
    let filtered = initiatives;

    // Filter by search term
    if (currentFilters.searchTerm.trim()) {
      const term = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(initiative =>
        initiative.title.toLowerCase().includes(term) ||
        initiative.description.toLowerCase().includes(term) ||
        initiative.organization.toLowerCase().includes(term) ||
        initiative.location.toLowerCase().includes(term) ||
        (initiative.nai_benefits && initiative.nai_benefits.toLowerCase().includes(term))
      );
    }

    // Filter by type
    if (currentFilters.type !== "all") {
      filtered = filtered.filter(initiative => initiative.type === currentFilters.type);
    }

    // Filter by location
    if (currentFilters.location !== "all") {
      filtered = filtered.filter(initiative =>
        initiative.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }

    // Filter by age group
    if (currentFilters.ageGroup !== "all") {
      filtered = filtered.filter(initiative =>
        (initiative as any).age_group === currentFilters.ageGroup ||
        (initiative as any).age_group === "tutti"
      );
    }

    // Filter by format
    if (currentFilters.format !== "all") {
      filtered = filtered.filter(initiative =>
        (initiative as any).format === currentFilters.format
      );
    }

    // Filter by language
    if (currentFilters.language !== "all") {
      filtered = filtered.filter(initiative =>
        (initiative as any).language === currentFilters.language ||
        (initiative as any).language === "multilingua"
      );
    }

    // Filter by free only
    if (currentFilters.isFree === true) {
      filtered = filtered.filter(initiative =>
        (initiative as any).is_free === true
      );
    }

    // Filter by difficulty level
    if (currentFilters.difficultyLevel !== "all") {
      filtered = filtered.filter(initiative =>
        (initiative as any).difficulty_level === currentFilters.difficultyLevel
      );
    }

    setFilteredInitiatives(filtered);
  };

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };

  const handleActivityClick = (initiative: Initiative) => {
    // Could implement a detail view or redirect to activity page
    if (user) {
      navigate('/attivita');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <SearchSection onSearch={handleSearch} />
        
        {/* Results Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {currentFilters.searchTerm ? `Risultati per "${currentFilters.searchTerm}"` : "Tutte le iniziative"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {loading ? "Caricamento..." : `${filteredInitiatives.length} risultati trovati`}
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInitiatives.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInitiatives.map((initiative) => (
                <ActivityCard 
                  key={initiative.id}
                  id={initiative.id}
                  title={initiative.title}
                  description={initiative.description}
                  nai_benefits={initiative.nai_benefits}
                  location={initiative.location}
                  date={initiative.date}
                  participants={initiative.participants}
                  contact={initiative.contact}
                  type={initiative.type}
                  organization={initiative.organization}
                  latitude={initiative.latitude}
                  longitude={initiative.longitude}
                  created_by={initiative.created_by}
                  is_generated={initiative.is_generated}
                  source_url={initiative.source_url}
                  onTitleClick={() => handleActivityClick(initiative)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {currentFilters.searchTerm ? "Nessun risultato trovato" : "Nessuna iniziativa disponibile"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {currentFilters.searchTerm
                    ? "Prova a modificare i criteri di ricerca"
                    : "Al momento non ci sono iniziative pubblicate"}
                </p>
                {user && (
                  <button
                    onClick={() => navigate('/supporto')}
                    className="text-primary hover:underline"
                  >
                    Crea una nuova iniziativa
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats - Real Data */}
        {!loading && initiatives.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {initiatives.filter(i => i.type === 'l2').length}
              </div>
              <div className="text-sm text-muted-foreground">Corsi L2</div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {initiatives.filter(i => i.type === 'cultura').length}
              </div>
              <div className="text-sm text-muted-foreground">Attività culturali</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {initiatives.filter(i => i.type === 'social').length}
              </div>
              <div className="text-sm text-muted-foreground">Servizi sociali</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {initiatives.filter(i => i.type === 'sport').length}
              </div>
              <div className="text-sm text-muted-foreground">Attività sportive</div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
