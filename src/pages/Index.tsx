import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import SearchSection from "@/components/SearchSection";
import ActivityCard from "@/components/ActivityCard";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Removed auto-redirect to allow users to access search functionality
  const mockActivities = [
    {
      title: "Corso di Italiano L2 - Livello A1",
      description: "Corso base di lingua italiana per studenti stranieri. Lezioni interattive con supporto multimediale e attività pratiche.",
      location: "Via XXV Aprile, 12 - Sampierdarena",
      date: "Lun-Mer-Ven 14:00-16:00",
      participants: "Max 15 studenti",
      contact: "Tel: 010-1234567",
      type: "l2" as const,
      organization: "Centro Interculturale",
      isSaved: false
    },
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
    },
    {
      title: "Supporto Scolastico e Orientamento",
      description: "Servizio di supporto per l'inserimento scolastico di studenti stranieri con consulenza psicopedagogica.",
      location: "Via del Campo, 91 - Centro Ovest",
      date: "Lun-Ven 9:00-17:00",
      participants: "Famiglie e studenti",
      contact: "Tel: 010-5577123",
      type: "social" as const,
      organization: "Servizi Sociali",
      isSaved: false
    },
    {
      title: "Calcio Interculturale Under 16",
      description: "Squadra di calcio mista per promuovere l'integrazione attraverso lo sport. Allenamenti bisettimanali.",
      location: "Campo Sportivo Canevari - Sampierdarena",
      date: "Mar-Gio 17:00-19:00",
      participants: "12-16 anni",
      contact: "mister@calciointegrazione.it",
      type: "sport" as const,
      organization: "ASD Genova United",
      isSaved: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchSection />
        
        {/* Results Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Iniziative disponibili
              </h2>
              <p className="text-sm text-muted-foreground">
                {mockActivities.length} risultati trovati nella tua zona
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActivities.map((activity, index) => (
              <ActivityCard key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-primary-light rounded-lg">
            <div className="text-2xl font-bold text-primary">24</div>
            <div className="text-sm text-muted-foreground">Corsi L2 attivi</div>
          </div>
          <div className="text-center p-4 bg-secondary-light rounded-lg">
            <div className="text-2xl font-bold text-secondary">16</div>
            <div className="text-sm text-muted-foreground">Attività culturali</div>
          </div>
          <div className="text-center p-4 bg-accent-light rounded-lg">
            <div className="text-2xl font-bold text-accent">8</div>
            <div className="text-sm text-muted-foreground">Servizi sociali</div>
          </div>
          <div className="text-center p-4 bg-success-light rounded-lg">
            <div className="text-2xl font-bold text-success">12</div>
            <div className="text-sm text-muted-foreground">Attività sportive</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
