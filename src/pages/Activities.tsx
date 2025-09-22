import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import ActivityCard from "@/components/ActivityCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Activities = () => {
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInitiatives(data || []);
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

  const recentlyViewed = [
    {
      title: "Corso di Italiano L2 - Livello A1",
      description: "Corso base di lingua italiana per studenti stranieri.",
      location: "Via XXV Aprile, 12 - Sampierdarena",
      date: "Lun-Mer-Ven 14:00-16:00",
      participants: "Max 15 studenti",
      contact: "Tel: 010-1234567",
      type: "l2" as const,
      organization: "Centro Interculturale",
      isSaved: false
    },
    {
      title: "Supporto Scolastico e Orientamento",
      description: "Servizio di supporto per l'inserimento scolastico di studenti stranieri.",
      location: "Via del Campo, 91 - Centro Ovest",
      date: "Lun-Ven 9:00-17:00",
      participants: "Famiglie e studenti",
      contact: "Tel: 010-5577123",
      type: "social" as const,
      organization: "Servizi Sociali",
      isSaved: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Le mie attività</h1>
          <p className="text-muted-foreground">
            Gestisci le tue attività salvate e visualizza la cronologia delle ricerche
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent-light rounded-lg">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {initiatives.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Iniziative totali</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">5</div>
                  <div className="text-sm text-muted-foreground">Prenotazioni attive</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary-light rounded-lg">
                  <Filter className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">12</div>
                  <div className="text-sm text-muted-foreground">Ricerche questo mese</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Initiatives */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Tutte le iniziative</h2>
            <Badge variant="secondary">{initiatives.length}</Badge>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : initiatives.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((initiative) => (
                <div key={initiative.id} className="relative">
                  <ActivityCard
                    title={initiative.title}
                    description={initiative.description}
                    location={initiative.location}
                    date={initiative.date}
                    participants={initiative.participants}
                    contact={initiative.contact}
                    type={initiative.type}
                    organization={initiative.organization}
                  />
                  {initiative.is_generated && (
                    <Badge 
                      variant="outline" 
                      className="absolute top-2 right-2 bg-primary/10 text-primary border-primary"
                    >
                      AI Generated
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nessuna iniziativa trovata
                </h3>
                <p className="text-muted-foreground mb-4">
                  Usa il generatore AI per creare le prime iniziative
                </p>
                <Button onClick={() => window.location.href = '/supporto'}>
                  Vai al Generatore
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recently Viewed */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Visualizzate di recente</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.map((activity, index) => (
              <ActivityCard key={index} {...activity} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Activities;