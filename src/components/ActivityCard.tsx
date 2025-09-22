import { useState } from "react";
import { Heart, MapPin, Calendar, Users, Phone, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ActivityCardProps {
  id?: string;
  title: string;
  description: string;
  location: string;
  date: string;
  participants: string;
  contact: string;
  type: "l2" | "cultura" | "social" | "sport";
  organization: string;
  isSaved?: boolean;
  created_by?: string;
  is_generated?: boolean;
  source_url?: string;
  onTitleClick?: () => void;
}

const ActivityCard = ({
  id,
  title,
  description,
  location,
  date,
  participants,
  contact,
  type,
  organization,
  isSaved = false,
  created_by,
  is_generated,
  source_url,
  onTitleClick
}: ActivityCardProps) => {
  const [saved, setSaved] = useState(isSaved);
  const { toast } = useToast();

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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`${saved ? 'text-accent' : 'text-muted-foreground'} hover:text-accent`}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="truncate">{location}</span>
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