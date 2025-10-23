import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadICS,
  getGoogleCalendarUrl,
  getOutlookUrl,
  getOffice365Url,
  getYahooCalendarUrl,
  openCalendar
} from "@/lib/calendar";
import { toast } from "sonner";

interface AddToCalendarButtonProps {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  url?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const AddToCalendarButton = ({
  title,
  description,
  location,
  startDate,
  endDate,
  url,
  variant = "outline",
  size = "default"
}: AddToCalendarButtonProps) => {
  const event = {
    title,
    description,
    location,
    startDate,
    endDate,
    url
  };

  const handleGoogleCalendar = () => {
    const googleUrl = getGoogleCalendarUrl(event);
    openCalendar(googleUrl);
    toast.success("Apertura Google Calendar...");
  };

  const handleOutlook = () => {
    const outlookUrl = getOutlookUrl(event);
    openCalendar(outlookUrl);
    toast.success("Apertura Outlook...");
  };

  const handleOffice365 = () => {
    const office365Url = getOffice365Url(event);
    openCalendar(office365Url);
    toast.success("Apertura Office 365...");
  };

  const handleYahoo = () => {
    const yahooUrl = getYahooCalendarUrl(event);
    openCalendar(yahooUrl);
    toast.success("Apertura Yahoo Calendar...");
  };

  const handleDownloadICS = () => {
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    downloadICS(event, filename);
    toast.success("File calendario scaricato!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Calendar className="h-4 w-4" />
          Aggiungi a Calendario
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Google Calendar</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlook} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Outlook.com</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOffice365} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span>Office 365</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleYahoo} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Yahoo Calendar</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Scarica .ics (Apple/Altri)</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToCalendarButton;
