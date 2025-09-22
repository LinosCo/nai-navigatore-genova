import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, FileText, Save, Search, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import ActivityCard from "./ActivityCard";
import { useAuth } from "@/hooks/useAuth";

interface GeneratedCard {
  title: string;
  description: string;
  location: string;
  date: string;
  participants: string;
  contact: string;
  type: "l2" | "cultura" | "social" | "sport";
  organization: string;
  latitude?: number;
  longitude?: number;
}

const ContentCardGenerator = () => {
  const [mode, setMode] = useState<'prompt' | 'url' | 'report'>('prompt');
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [activityType, setActivityType] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [location, setLocation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [editableCard, setEditableCard] = useState<GeneratedCard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (mode === 'report') {
      await handleReportWebsite();
      return;
    }

    if (mode === 'prompt' && !prompt.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una descrizione per l'attività",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'url' && !url.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un URL valido",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-card', {
        body: {
          prompt: mode === 'prompt' ? prompt.trim() : "",
          url: mode === 'url' ? url.trim() : "",
          activityType,
          targetAge,
          location,
        },
      });

      if (error) throw error;

      setGeneratedCard(data.contentCard);
      setEditableCard({ ...data.contentCard });
      setIsEditing(true);
      toast({
        title: "Scheda generata!",
        description: "Puoi modificare i campi prima di salvare",
      });
    } catch (error) {
      console.error('Error generating content card:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione della scheda",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReportWebsite = async () => {
    if (!reportUrl.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci l'URL del sito web da segnalare",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .insert({
          title: `Segnalazione sito: ${new URL(reportUrl).hostname}`,
          description: reportDescription || `Sito web segnalato dall'utente per la ricerca di iniziative: ${reportUrl}`,
          location: location || "Da definire",
          date: "Da definire",
          participants: "Da definire",
          contact: "Da contattare",
          type: "social",
          organization: `Segnalazione utente: ${new URL(reportUrl).hostname}`,
          source_url: reportUrl,
          created_by: user?.id,
          is_generated: false
        });

      if (error) throw error;

      toast({
        title: "Segnalazione inviata",
        description: "Il sito web è stato segnalato per l'analisi. Grazie per il contributo!",
      });

      // Reset form
      setReportUrl("");
      setReportDescription("");
      setLocation("");
    } catch (error) {
      console.error('Error reporting website:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio della segnalazione",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setPrompt("");
    setUrl("");
    setReportUrl("");
    setReportDescription("");
    setActivityType("");
    setTargetAge("");
    setLocation("");
    setGeneratedCard(null);
    setEditableCard(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableCard(null);
    setGeneratedCard(null);
  };

  const handleSaveInitiative = async () => {
    if (!editableCard) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per salvare un'iniziativa",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('initiatives')
        .insert({
          title: editableCard.title,
          description: editableCard.description,
          location: editableCard.location,
          date: editableCard.date,
          participants: editableCard.participants,
          contact: editableCard.contact,
          type: editableCard.type,
          organization: editableCard.organization,
          latitude: editableCard.latitude || null,
          longitude: editableCard.longitude || null,
          created_by: user.id,
          is_generated: true,
          source_url: mode === 'url' ? url : null,
        });

      if (error) throw error;

      toast({
        title: "Successo!",
        description: "Iniziativa salvata tra le attività disponibili",
      });

      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error('Error saving initiative:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio dell'iniziativa",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generatore Schede Attività AI
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Crea automaticamente schede dettagliate per attività educative rivolte a studenti NAI
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'prompt' | 'url' | 'report')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prompt">Genera con AI</TabsTrigger>
              <TabsTrigger value="url">Analizza URL</TabsTrigger>
              <TabsTrigger value="report">Segnala Sito</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompt" className="space-y-4">
              <div>
                <Label htmlFor="prompt">Descrivi l'attività che vorresti creare</Label>
                <Textarea
                  id="prompt"
                  placeholder="Es: Un corso di italiano per bambini dai 6 ai 10 anni nel quartiere di Sampierdarena..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="activity-type">Tipo di attività</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="l2">Corso L2</SelectItem>
                      <SelectItem value="cultura">Attività culturale</SelectItem>
                      <SelectItem value="sport">Attività sportiva</SelectItem>
                      <SelectItem value="social">Servizio sociale</SelectItem>
                      <SelectItem value="formazione">Formazione</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="target-age">Età target</Label>
                  <Input
                    id="target-age"
                    placeholder="Es: 6-10 anni"
                    value={targetAge}
                    onChange={(e) => setTargetAge(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Zona/Quartiere</Label>
                  <Input
                    id="location"
                    placeholder="Es: Sampierdarena"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="url">URL della pagina da analizzare</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://esempio.com/iniziativa"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Inserisci l'URL di una pagina con informazioni su un'attività
                </p>
              </div>
            </TabsContent>

            <TabsContent value="report" className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">🌐 Segnala un sito web</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Hai trovato un sito web che potrebbe contenere iniziative interessanti per studenti NAI? 
                  Segnalacelo e lo analizzeremo per estrarre le attività rilevanti.
                </p>
              </div>
              
              <div>
                <Label htmlFor="report-url">URL del sito web da segnalare *</Label>
                <Input
                  id="report-url"
                  type="url"
                  placeholder="https://esempio.com"
                  value={reportUrl}
                  onChange={(e) => setReportUrl(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="report-description">Descrizione (opzionale)</Label>
                <Textarea
                  id="report-description"
                  placeholder="Perché pensi che questo sito contenga iniziative interessanti? Ci sono sezioni specifiche da controllare?"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="suggested-location">Zona geografica suggerita (opzionale)</Label>
                <Input
                  id="suggested-location"
                  placeholder="Es: Genova, Sampierdarena, Liguria..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || (mode === 'prompt' && !prompt.trim()) || (mode === 'url' && !url.trim()) || (mode === 'report' && !reportUrl.trim())}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'report' ? 'Invio segnalazione...' : 'Generazione...'}
              </>
            ) : (
              <>
                {mode === 'prompt' && <Sparkles className="mr-2 h-4 w-4" />}
                {mode === 'url' && <Search className="mr-2 h-4 w-4" />}
                {mode === 'report' && <Send className="mr-2 h-4 w-4" />}
                {mode === 'prompt' && 'Genera Attività'}
                {mode === 'url' && 'Analizza Pagina'}
                {mode === 'report' && 'Invia Segnalazione'}
              </>
            )}
          </Button>

          {(generatedCard || (mode !== 'report')) && (
            <Button variant="outline" onClick={resetForm} className="w-full">
              Nuova Richiesta
            </Button>
          )}
        </CardContent>
      </Card>

      {generatedCard && isEditing && editableCard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Modifica Scheda Attività</h3>
            <p className="text-sm text-muted-foreground">
              Rivedi e modifica i dettagli prima di salvare
            </p>
          </div>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Titolo *</Label>
                  <Input
                    id="edit-title"
                    value={editableCard.title}
                    onChange={(e) => setEditableCard({ ...editableCard, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-organization">Organizzazione</Label>
                  <Input
                    id="edit-organization"
                    value={editableCard.organization}
                    onChange={(e) => setEditableCard({ ...editableCard, organization: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Descrizione *</Label>
                <Textarea
                  id="edit-description"
                  value={editableCard.description}
                  onChange={(e) => setEditableCard({ ...editableCard, description: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">Luogo</Label>
                  <Input
                    id="edit-location"
                    value={editableCard.location}
                    onChange={(e) => setEditableCard({ ...editableCard, location: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Data/Orario</Label>
                  <Input
                    id="edit-date"
                    value={editableCard.date}
                    onChange={(e) => setEditableCard({ ...editableCard, date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-participants">Partecipanti</Label>
                  <Input
                    id="edit-participants"
                    value={editableCard.participants}
                    onChange={(e) => setEditableCard({ ...editableCard, participants: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contact">Contatto</Label>
                  <Input
                    id="edit-contact"
                    value={editableCard.contact}
                    onChange={(e) => setEditableCard({ ...editableCard, contact: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-type">Tipo Attività</Label>
                <Select 
                  value={editableCard.type} 
                  onValueChange={(value: "l2" | "cultura" | "social" | "sport") => 
                    setEditableCard({ ...editableCard, type: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="l2">Corso L2</SelectItem>
                    <SelectItem value="cultura">Cultura</SelectItem>
                    <SelectItem value="social">Sociale</SelectItem>
                    <SelectItem value="sport">Sport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button onClick={handleSaveInitiative} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salva Iniziativa
                </>
              )}
            </Button>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Anteprima Scheda</h4>
            <ActivityCard
              title={editableCard.title}
              description={editableCard.description}
              location={editableCard.location}
              date={editableCard.date}
              participants={editableCard.participants}
              contact={editableCard.contact}
              type={editableCard.type}
              organization={editableCard.organization}
            />
          </div>
        </div>
      )}

      {generatedCard && !isEditing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Iniziativa Salvata</h3>
            <Badge variant="outline" className="bg-success/10 text-success border-success">
              ✓ Salvata
            </Badge>
          </div>
          <ActivityCard
            title={generatedCard.title}
            description={generatedCard.description}
            location={generatedCard.location}
            date={generatedCard.date}
            participants={generatedCard.participants}
            contact={generatedCard.contact}
            type={generatedCard.type}
            organization={generatedCard.organization}
          />
        </div>
      )}
    </div>
  );
};

export default ContentCardGenerator;