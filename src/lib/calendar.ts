/**
 * Utility functions for calendar integration
 * Supports: Google Calendar, Outlook, Apple Calendar (iCal)
 */

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  url?: string;
}

/**
 * Format date to iCal format (YYYYMMDDTHHMMSS)
 */
const formatICalDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

/**
 * Generate .ics file content (iCalendar format)
 */
export const generateICS = (event: CalendarEvent): string => {
  const startDate = formatICalDate(event.startDate);
  const endDate = event.endDate
    ? formatICalDate(event.endDate)
    : formatICalDate(new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString()); // Default: 2 hours

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NEIP//Navigatore Educativo//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    event.url ? `URL:${event.url}` : '',
    `UID:${Date.now()}@neip-genova.it`,
    `DTSTAMP:${formatICalDate(new Date().toISOString())}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');

  return icsContent;
};

/**
 * Download .ics file
 */
export const downloadICS = (event: CalendarEvent, filename: string = 'evento.ics') => {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get Google Calendar add event URL
 */
export const getGoogleCalendarUrl = (event: CalendarEvent): string => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate
    ? new Date(event.endDate)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default: 2 hours

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: event.description,
    location: event.location,
    ...(event.url && { sprop: `website:${event.url}` })
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Get Outlook.com add event URL
 */
export const getOutlookUrl = (event: CalendarEvent): string => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate
    ? new Date(event.endDate)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    allday: 'false'
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Get Office 365 add event URL
 */
export const getOffice365Url = (event: CalendarEvent): string => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate
    ? new Date(event.endDate)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString()
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Get Yahoo Calendar add event URL
 */
export const getYahooCalendarUrl = (event: CalendarEvent): string => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate
    ? new Date(event.endDate)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatYahooDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, -1);
  };

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatYahooDate(startDate),
    et: formatYahooDate(endDate),
    desc: event.description,
    in_loc: event.location
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
};

/**
 * Open calendar service in new window
 */
export const openCalendar = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
