import Navigation from "@/components/Navigation";
import ActivityCard from "@/components/ActivityCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Filter } from "lucide-react";

const Activities = () => {
  const savedActivities = [
    {
      title: "Laboratorio di Teatro Interculturale",
      description: "Attività teatrale per favorire l'integrazione e l'espressione creativa degli studenti NAI attraverso la drammatizzazione.",
      location: "Teatro della Gioventù - Centro Storico",
      date: "Martedì 16:30-18:30",
      participants: "8-20 anni",
      contact: "info@teatrogiovani.it",
      type: "cultura" as const,
      organization: "Teatro della Gioventù",
      isSaved: true
    }
  ];

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
                    {savedActivities.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Attività salvate</div>
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

        {/* Saved Activities */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Attività salvate</h2>
            <Badge variant="secondary">{savedActivities.length}</Badge>
          </div>
          
          {savedActivities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedActivities.map((activity, index) => (
                <ActivityCard key={index} {...activity} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nessuna attività salvata
                </h3>
                <p className="text-muted-foreground mb-4">
                  Salva le attività che ti interessano per trovarle facilmente qui
                </p>
                <Button>Esplora attività</Button>
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