import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Download,
  BookOpen,
  Calendar,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface InitiativeStats {
  total: number;
  published: number;
  byType: Record<string, number>;
  totalParticipants: number;
  avgRating: number;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<InitiativeStats>({
    total: 0,
    published: 0,
    byType: {},
    totalParticipants: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentInitiatives, setRecentInitiatives] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user's initiatives
      const { data: initiatives, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate statistics
      const published = initiatives?.filter(i => i.published).length || 0;
      const byType = initiatives?.reduce((acc, init) => {
        acc[init.type] = (acc[init.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalParticipantsText = initiatives?.reduce((sum, init) => {
        const participants = parseInt(init.participants) || 0;
        return sum + participants;
      }, 0) || 0;

      const avgRating = initiatives?.reduce((sum, init) => {
        return sum + (init.average_rating || 0);
      }, 0) / (initiatives?.length || 1) || 0;

      setStats({
        total: initiatives?.length || 0,
        published,
        byType,
        totalParticipants: totalParticipantsText,
        avgRating
      });

      setRecentInitiatives(initiatives?.slice(0, 5) || []);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  const educationalResources = [
    {
      title: "Guida all'insegnamento L2",
      description: "Metodologie e best practices per l'insegnamento dell'italiano L2",
      type: "PDF",
      icon: FileText,
      url: "#"
    },
    {
      title: "Attività interculturali",
      description: "Raccolta di attività per promuovere l'inclusione",
      type: "PDF",
      icon: BookOpen,
      url: "#"
    },
    {
      title: "Valutazione competenze NAI",
      description: "Strumenti per la valutazione delle competenze linguistiche",
      type: "DOCX",
      icon: FileText,
      url: "#"
    }
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto p-4 max-w-7xl">
          <div className="space-y-6 py-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8" />
                Dashboard Docenti
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestisci le tue iniziative, visualizza statistiche e accedi a risorse didattiche
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Iniziative Totali</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.published} pubblicate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partecipanti Totali</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                  <p className="text-xs text-muted-foreground">
                    Studenti raggiunti
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valutazione Media</CardTitle>
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}/5.0</div>
                  <p className="text-xs text-muted-foreground">
                    Media recensioni
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attività</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.keys(stats.byType).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tipologie diverse
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Panoramica</TabsTrigger>
                <TabsTrigger value="resources">Materiali</TabsTrigger>
                <TabsTrigger value="community">Comunità</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Distribuzione per Tipologia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.byType).map(([type, count]) => {
                        const typeLabels: Record<string, { label: string; color: string }> = {
                          l2: { label: "Corsi L2", color: "bg-primary" },
                          cultura: { label: "Cultura", color: "bg-secondary" },
                          social: { label: "Sociale", color: "bg-accent" },
                          sport: { label: "Sport", color: "bg-success" }
                        };

                        const config = typeLabels[type] || { label: type, color: "bg-gray-500" };
                        const percentage = ((count / stats.total) * 100).toFixed(1);

                        return (
                          <div key={type} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{config.label}</span>
                              <span className="text-muted-foreground">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`${config.color} h-2 rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Initiatives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Iniziative Recenti</CardTitle>
                    <CardDescription>Le tue ultime 5 iniziative</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentInitiatives.map((initiative) => (
                        <div key={initiative.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{initiative.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(initiative.date).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {initiative.published ? (
                              <Badge variant="default">Pubblicata</Badge>
                            ) : (
                              <Badge variant="secondary">Bozza</Badge>
                            )}
                            {initiative.average_rating > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {initiative.average_rating.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Materiali Didattici
                    </CardTitle>
                    <CardDescription>
                      Risorse e guide per docenti che lavorano con studenti NAI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {educationalResources.map((resource, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <resource.icon className="h-5 w-5 text-primary" />
                                <CardTitle className="text-base">{resource.title}</CardTitle>
                              </div>
                              <Badge variant="outline">{resource.type}</Badge>
                            </div>
                            <CardDescription>{resource.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Scarica
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Community Tab */}
              <TabsContent value="community" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Comunità Docenti NAI
                    </CardTitle>
                    <CardDescription>
                      Condividi esperienze e best practices con altri educatori
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-center py-8">
                      <Users className="h-16 w-16 mx-auto text-muted-foreground" />
                      <h3 className="text-xl font-semibold">Forum della Comunità</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Uno spazio dedicato per scambiare idee, chiedere consigli e
                        condividere risorse con colleghi che lavorano con studenti NAI
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button>Accedi al Forum</Button>
                        <Button variant="outline">Ultime Discussioni</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default TeacherDashboard;
