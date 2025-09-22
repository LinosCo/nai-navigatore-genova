import { useState } from "react";
import { Heart, MapPin, Calendar, Users, Phone, ExternalLink, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

interface ActivityCardProps {
  id?: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  date: string;
  participants: string;
  contact: string;
  type: "l2" | "cultura" | "social" | "sport";
  organization: string;
  latitude?: number;
  longitude?: number;
  isSaved?: boolean;
  created_by?: string;
  is_generated?: boolean;
  source_url?: string;
  onTitleClick?: () => void;
  onDelete?: (id: string) => void;
}

const ActivityCard = ({
  id,
  title,
  description,
  location,
  address,
  date,
  participants,
  contact,
  type,
  organization,
  latitude,
  longitude,
  isSaved = false,
  created_by,
  is_generated,
  source_url,
  onTitleClick,
  onDelete
}: ActivityCardProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const typeConfig = {
    l2: { label: "Corso L2", color: "bg-primary text-primary-foreground" },
    cultura: { label: "Cultura", color: "bg-secondary text-secondary-foreground" },
    social: { label: "Sociale", color: "bg-accent text-accent-foreground" },
    sport: { label: "Sport", color: "bg-success text-success-foreground" }
  };

  const handleSave = () => {
    setSaved(!saved);
    toast({
      description: saved ? "Rimosso dai preferiti" : "Aggiunto ai preferiti",
      duration: 2000,
    });
  };

  const handleContact = () => {
    toast({
      title: "Contatto",
      description: `Apertura contatto: ${contact}`,
      duration: 3000,
    });
  };

  const handleBooking = () => {
    toast({
      title: "Prenotazione",
      description: "Reindirizzamento al sistema di prenotazione...",
      duration: 3000,
    });
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile eliminare l'attività",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Successo",
        description: "Attività eliminata con successo",
      });

      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Check if user can delete this activity
  const canDelete = user && id && (isAdmin || user.id === created_by);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={typeConfig[type].color}>
                {typeConfig[type].label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {organization}
              </Badge>
            </div>
            <h3 
              className={`font-semibold text-foreground leading-tight ${onTitleClick ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
              onClick={onTitleClick}
            >
              {title}
            </h3>
          </div>
          <div className="flex space-x-1">
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`${saved ? 'text-accent' : 'text-muted-foreground'} hover:text-accent`}
            >
              <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}
        </p>

        <div className="space-y-2">
          <div className="flex items-start text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">{location.split(',')[0]}</div>
              {address && address !== location && (
                <div className="text-muted-foreground/80 text-[10px] mt-0.5">
                  {address}
                </div>
              )}
              {latitude && longitude && (
                <div className="text-muted-foreground/60 text-[10px] mt-0.5">
                  📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
            <span>{date}</span>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-2 flex-shrink-0" />
            <span>{participants}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleContact}
            className="text-xs"
          >
            <Phone className="h-3 w-3 mr-1" />
            Contatta
          </Button>
          <Button 
            size="sm" 
            onClick={handleBooking}
            className="text-xs"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Prenota
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" className="w-full text-xs">
          <ExternalLink className="h-3 w-3 mr-1" />
          Maggiori informazioni
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActivityCard;