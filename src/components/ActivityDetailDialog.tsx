import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Save, X } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  participants: string;
  contact: string;
  type: "l2" | "cultura" | "social" | "sport";
  organization: string;
  created_by: string;
  is_generated: boolean;
  source_url?: string;
}

interface ActivityDetailDialogProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityUpdate?: (activity: Activity) => void;
}

const ActivityDetailDialog = ({ activity, open, onOpenChange, onActivityUpdate }: ActivityDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Activity>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const typeConfig = {
    l2: { label: "Corso L2", color: "bg-primary text-primary-foreground" },
    cultura: { label: "Cultura", color: "bg-secondary text-secondary-foreground" },
    social: { label: "Sociale", color: "bg-accent text-accent-foreground" },
    sport: { label: "Sport", color: "bg-success text-success-foreground" }
  };

  useEffect(() => {
    if (activity) {
      setEditData(activity);
      setIsEditing(false);
    }
  }, [activity]);

  // Check if user can edit (creator or admin - for now just creator)
  const canEdit = user && activity && user.id === activity.created_by;

  const handleSave = async () => {
    if (!activity || !editData || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .update({
          title: editData.title,
          description: editData.description,
          location: editData.location,
          date: editData.date,
          participants: editData.participants,
          contact: editData.contact,
          type: editData.type,
          organization: editData.organization,
        })
        .eq('id', activity.id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Attività aggiornata con successo",
      });

      setIsEditing(false);
      if (onActivityUpdate && data) {
        onActivityUpdate(data as Activity);
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'attività",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (activity) {
      setEditData(activity);
    }
    setIsEditing(false);
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Modifica Attività" : "Dettagli Attività"}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {activity.is_generated && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                  AI Generated
                </Badge>
              )}
              <Badge className={typeConfig[activity.type].color}>
                {typeConfig[activity.type].label}
              </Badge>
              {canEdit && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Modifica
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={editData.title || ""}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm font-medium mt-1">{activity.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editData.description || ""}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-1">{activity.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Luogo</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editData.location || ""}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{activity.location}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date">Data/Orario</Label>
                {isEditing ? (
                  <Input
                    id="date"
                    value={editData.date || ""}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{activity.date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="participants">Partecipanti</Label>
                {isEditing ? (
                  <Input
                    id="participants"
                    value={editData.participants || ""}
                    onChange={(e) => setEditData({ ...editData, participants: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{activity.participants}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contact">Contatto</Label>
                {isEditing ? (
                  <Input
                    id="contact"
                    value={editData.contact || ""}
                    onChange={(e) => setEditData({ ...editData, contact: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{activity.contact}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                {isEditing ? (
                  <Select
                    value={editData.type}
                    onValueChange={(value: "l2" | "cultura" | "social" | "sport") => 
                      setEditData({ ...editData, type: value })
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
                ) : (
                  <p className="text-sm mt-1">{typeConfig[activity.type].label}</p>
                )}
              </div>

              <div>
                <Label htmlFor="organization">Organizzazione</Label>
                {isEditing ? (
                  <Input
                    id="organization"
                    value={editData.organization || ""}
                    onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{activity.organization}</p>
                )}
              </div>
            </div>

            {activity.source_url && (
              <div>
                <Label>URL Sorgente</Label>
                <p className="text-sm mt-1 text-muted-foreground">
                  <a 
                    href={activity.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {activity.source_url}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailDialog;