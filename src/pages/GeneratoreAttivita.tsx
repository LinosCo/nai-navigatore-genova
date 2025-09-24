import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import ContentCardGenerator from "@/components/ContentCardGenerator";

const GeneratoreAttivita = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Generatore di Attività
          </h1>
          <p className="text-muted-foreground">
            Crea contenuti personalizzati per studenti NAI con strumenti avanzati
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generatore Automatico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContentCardGenerator />
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default GeneratoreAttivita;