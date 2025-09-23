import { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isSameDay, startOfDay, endOfDay, parse, isValid, isWithinInterval, endOfMonth, startOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { MapPin, Users, Calendar as CalendarIcon } from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  end_date?: string;
  type: string;
  organization: string;
  participants: string;
  contact: string;
  published: boolean;
  is_generated?: boolean;
}

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [selectedDateInitiatives, setSelectedDateInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  useEffect(() => {
    if (date) {
      filterInitiativesByDate(date);
    }
  }, [date, initiatives]);

  // Auto-seleziona una data utile che contiene iniziative (la più vicina al presente)
  useEffect(() => {
    if (!initiatives.length) return;
    const dates = getInitiativeDates();
    if (!dates.length) return;

    const today = startOfDay(new Date());
    const future = dates.filter(d => d >= today).sort((a, b) => a.getTime() - b.getTime());
    const past = dates.filter(d => d < today).sort((a, b) => b.getTime() - a.getTime());
    const best = future[0] || past[0];

    if (best && (!date || !isSameDay(date, best))) {
      setDate(best);
    }
  }, [initiatives]);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching initiatives:', error);
        return;
      }

      setInitiatives(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tries to parse flexible Italian date strings and ranges from the "date" text field
  const parseInitiativeDateRange = (dateText: string): { start: Date; end?: Date } | null => {
    if (!dateText) return null;
    const raw = dateText.trim();

    // 1) Try ISO first
    const iso = parseISO(raw);
    if (isValid(iso)) return { start: iso };

    // 2) Try to extract dd/MM/yyyy from anywhere in the string
    const ddmmyyyyMatch = raw.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (ddmmyyyyMatch) {
      // Support both d/M/yyyy and dd/MM/yyyy
      const d1 = parse(ddmmyyyyMatch[1], 'd/M/yyyy', new Date());
      const d2 = isValid(d1) ? d1 : parse(ddmmyyyyMatch[1], 'dd/MM/yyyy', new Date());
      if (isValid(d2)) return { start: d2 };
    }

    // 3) Handle ranges like "Giugno 2023 - Settembre 2023"
    if (raw.includes('-')) {
      const [left, right] = raw.split('-').map(s => s.trim());
      const leftParsed = parse(left, 'MMMM yyyy', new Date(), { locale: it });
      const rightParsed = parse(right, 'MMMM yyyy', new Date(), { locale: it });

      if (isValid(leftParsed) && isValid(rightParsed)) {
        const start = startOfMonth(leftParsed);
        const end = endOfMonth(rightParsed);
        return { start, end };
      }

      // If only left is valid month-year, treat as that month
      if (isValid(leftParsed) && !isValid(rightParsed)) {
        const start = startOfMonth(leftParsed);
        const end = endOfMonth(leftParsed);
        return { start, end };
      }
    }

    // 4) Single month-year like "Giugno 2023"
    const monthYear = parse(raw, 'MMMM yyyy', new Date(), { locale: it });
    if (isValid(monthYear)) {
      return { start: startOfMonth(monthYear), end: endOfMonth(monthYear) };
    }

    return null;
  };

  const filterInitiativesByDate = (selectedDate: Date) => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    const filtered = initiatives.filter(initiative => {
      const range = parseInitiativeDateRange(initiative.date);
      if (!range) return false;

      // Exact day or within range
      if (range.end) {
        return isWithinInterval(selectedDate, { start: range.start, end: range.end });
      }
      return isSameDay(range.start, selectedDate);
    });

    setSelectedDateInitiatives(filtered);
  };

  const getInitiativeDates = () => {
    return initiatives
      .map(initiative => parseInitiativeDateRange(initiative.date)?.start || null)
      .filter(Boolean) as Date[];
  };

  const isExpired = (initiative: Initiative): boolean => {
    if (!initiative.end_date) return false;
    try {
      const endDate = parseISO(initiative.end_date);
      return endDate < new Date();
    } catch {
      return false;
    }
  };

  const typeConfig = {
    'sociale': { label: 'Sociale', color: 'bg-green-100 text-green-800' },
    'culturale': { label: 'Culturale', color: 'bg-purple-100 text-purple-800' },
    'educativo': { label: 'Educativo', color: 'bg-blue-100 text-blue-800' },
    'ambientale': { label: 'Ambientale', color: 'bg-emerald-100 text-emerald-800' },
    'tecnologico': { label: 'Tecnologico', color: 'bg-indigo-100 text-indigo-800' },
    'sportivo': { label: 'Sportivo', color: 'bg-orange-100 text-orange-800' },
    'altro': { label: 'Altro', color: 'bg-gray-100 text-gray-800' }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Calendario Iniziative
            </h1>
            <p className="text-muted-foreground">
              Naviga le iniziative per data e scopri quando si svolgono gli eventi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Seleziona Data
                  </CardTitle>
                  <CardDescription>
                    Clicca su una data per vedere le iniziative programmate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={it}
                    className="rounded-md border"
                    modifiers={{
                      hasEvents: getInitiativeDates()
                    }}
                    modifiersStyles={{
                      hasEvents: {
                        fontWeight: 'bold',
                        color: 'hsl(var(--primary))',
                        background: 'hsl(var(--primary) / 0.1)',
                        borderRadius: '6px'
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Initiatives List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Iniziative del {date ? format(date, 'dd MMMM yyyy', { locale: it }) : ''}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateInitiatives.length} iniziative trovate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Caricamento iniziative...</p>
                    </div>
                  ) : selectedDateInitiatives.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Nessuna iniziativa
                      </h3>
                      <p className="text-muted-foreground">
                        Non ci sono iniziative programmate per questa data
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateInitiatives.map((initiative) => (
                        <Card key={initiative.id} className={`${isExpired(initiative) ? 'opacity-60 border-muted' : ''}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2 flex items-center gap-2">
                                  {initiative.title}
                                  {isExpired(initiative) && (
                                    <Badge variant="secondary" className="text-xs">
                                      Terminata
                                    </Badge>
                                  )}
                                  {initiative.is_generated && (
                                    <Badge variant="outline" className="text-xs">
                                      AI
                                    </Badge>
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <span className="font-medium">{initiative.organization}</span>
                                  <Badge 
                                    className={typeConfig[initiative.type as keyof typeof typeConfig]?.color || typeConfig.altro.color}
                                  >
                                    {typeConfig[initiative.type as keyof typeof typeConfig]?.label || 'Altro'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {initiative.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{initiative.location}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{initiative.participants || 'non definito'}</span>
                              </div>
                              
                              {initiative.end_date && (
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Termina il {format(parseISO(initiative.end_date), 'dd/MM/yyyy', { locale: it })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}