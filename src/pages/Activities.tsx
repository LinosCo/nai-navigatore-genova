import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import ActivityDetailDialog from "@/components/ActivityDetailDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, Calendar, Filter, Loader2, Eye, Edit, Trash2, Globe, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

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
  published: boolean;
  created_at: string;
}

const Activities = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Initiative | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInitiatives();
    }
  }, [user]);

  const fetchInitiatives = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('created_by', user.id)
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

  const handleActivityClick = (activity: Initiative) => {
    setSelectedActivity(activity);
    setDialogOpen(true);
  };

  const handleActivityUpdate = (updatedActivity: Initiative) => {
    setInitiatives(prev => 
      prev.map(initiative => 
        initiative.id === updatedActivity.id ? updatedActivity : initiative
      )
    );
    setSelectedActivity(updatedActivity);
  };

  const handleActivityDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', id)
        .eq('created_by', user?.id);

      if (error) throw error;

      setInitiatives(prev => prev.filter(initiative => initiative.id !== id));
      
      if (selectedActivity?.id === id) {
        setDialogOpen(false);
        setSelectedActivity(null);
      }

      toast({
        title: "Successo",
        description: "Iniziativa eliminata con successo",
      });
    } catch (error) {
      console.error('Error deleting initiative:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione dell'iniziativa",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublished = async (id: string, currentPublished: boolean) => {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .update({ published: !currentPublished })
        .eq('id', id)
        .eq('created_by', user?.id)
        .select()
        .single();

      if (error) throw error;

      setInitiatives(prev => 
        prev.map(initiative => 
          initiative.id === id ? { ...initiative, published: !currentPublished } : initiative
        )
      );

      toast({
        title: "Successo",
        description: `Iniziativa ${!currentPublished ? 'pubblicata' : 'non pubblicata'} con successo`,
      });
    } catch (error) {
      console.error('Error updating initiative:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'iniziativa",
        variant: "destructive",
      });
    }
  };

  const typeConfig = {
    l2: { label: "Corso L2", color: "bg-primary text-primary-foreground" },
    cultura: { label: "Cultura", color: "bg-secondary text-secondary-foreground" },
    social: { label: "Sociale", color: "bg-accent text-accent-foreground" },
    sport: { label: "Sport", color: "bg-success text-success-foreground" }
  };

  const publishedCount = initiatives.filter(i => i.published).length;
  const unpublishedCount = initiatives.filter(i => !i.published).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Le mie attività</h1>
            <p className="text-muted-foreground">
              Gestisci le tue iniziative e controlla il loro stato di pubblicazione
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
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
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{publishedCount}</div>
                    <div className="text-sm text-muted-foreground">Pubblicate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <EyeOff className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{unpublishedCount}</div>
                    <div className="text-sm text-muted-foreground">Bozze</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Initiatives Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tutte le iniziative</CardTitle>
                <Badge variant="secondary">{initiatives.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : initiatives.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titolo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Luogo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Data creazione</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initiatives.map((initiative) => (
                      <TableRow key={initiative.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{initiative.title}</span>
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {initiative.description}
                            </span>
                            {initiative.is_generated && (
                              <Badge variant="outline" className="w-fit mt-1 text-xs">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={typeConfig[initiative.type].color}>
                            {typeConfig[initiative.type].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{initiative.location}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {initiative.published ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Globe className="h-3 w-3 mr-1" />
                                Pubblicata
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Bozza
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(initiative.created_at).toLocaleDateString('it-IT')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivityClick(initiative)}
                              title="Visualizza dettagli"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePublished(initiative.id, initiative.published)}
                              title={initiative.published ? 'Rendi non pubblicata' : 'Pubblica'}
                            >
                              {initiative.published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivityDelete(initiative.id)}
                              className="text-destructive hover:text-destructive"
                              title="Elimina"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
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
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <ActivityDetailDialog
          activity={selectedActivity}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onActivityUpdate={handleActivityUpdate}
        />
      </div>
    </AuthGuard>
  );
};

export default Activities;