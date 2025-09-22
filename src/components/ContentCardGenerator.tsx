import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, FileText, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import ActivityCard from "./ActivityCard";

interface GeneratedCard {
  title: string;
  description: string;
  location: string;
  date: string;
  participants: string;
  contact: string;
  type: "l2" | "cultura" | "social" | "sport";
  organization: string;
}

const ContentCardGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [activityType, setActivityType] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [location, setLocation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [editableCard, setEditableCard] = useState<GeneratedCard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!useUrl && !prompt.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una descrizione per l'attività",
        variant: "destructive",
      });
      return;
    }

    if (useUrl && !url.trim()) {
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
          prompt: useUrl ? "" : prompt.trim(),
          url: useUrl ? url.trim() : "",
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

  const resetForm = () => {
    setPrompt("");
    setUrl("");
    setActivityType("");
    setTargetAge("");
    setLocation("");
    setGeneratedCard(null);
    setEditableCard(null);
    setIsEditing(false);
    setUseUrl(false);
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
          created_by: user.id,
          is_generated: true,
          source_url: useUrl ? url : null,
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
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!useUrl}
                onChange={() => setUseUrl(false)}
                className="text-primary"
              />
              <span className="text-sm font-medium">Descrivi l'attività</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={useUrl}
                onChange={() => setUseUrl(true)}
                className="text-primary"
              />
              <span className="text-sm font-medium">Importa da URL</span>
            </label>
          </div>

          {!useUrl ? (
            <div>
              <Label htmlFor="prompt">Descrizione Attività *</Label>
              <Textarea
                id="prompt"
                placeholder="Es: Laboratorio di cucina interculturale per far conoscere le tradizioni culinarie dei paesi d'origine degli studenti..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="url">URL Contenuto *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/articolo-attivita"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Inserisci l'URL di una pagina web con i dettagli dell'attività
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="activityType">Tipo Attività</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="l2">Corso L2</SelectItem>
                  <SelectItem value="cultura">Cultura</SelectItem>
                  <SelectItem value="social">Sociale</SelectItem>
                  <SelectItem value="sport">Sport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetAge">Età Target</Label>
              <Input
                id="targetAge"
                placeholder="Es: 14-18 anni"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Area Genova</Label>
              <Input
                id="location"
                placeholder="Es: Sampierdarena, Centro"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Genera Scheda
                </>
              )}
            </Button>
            {generatedCard && (
              <Button variant="outline" onClick={resetForm}>
                Nuova Scheda
              </Button>
            )}
          </div>
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