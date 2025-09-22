import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MessageCircle, HelpCircle, FileText, Users, Sparkles } from "lucide-react";
import ContentCardGenerator from "@/components/ContentCardGenerator";

const Support = () => {
  const contacts = [
    {
      title: "Supporto Tecnico",
      description: "Problemi con la piattaforma NEIP",
      icon: HelpCircle,
      contact: "supporto@neip.it",
      phone: "010-1234567",
      hours: "Lun-Ven 9:00-17:00"
    },
    {
      title: "Coordinamento Pedagogico",
      description: "Consulenza su percorsi educativi NAI",
      icon: Users,
      contact: "pedagogico@neip.it", 
      phone: "010-2345678",
      hours: "Lun-Ven 8:30-16:30"
    },
    {
      title: "Mediazione Culturale",
      description: "Servizi di interpretariato e mediazione",
      icon: MessageCircle,
      contact: "mediazione@neip.it",
      phone: "010-3456789",
      hours: "Lun-Sab 9:00-18:00"
    }
  ];

  const faqItems = [
    {
      question: "Come posso prenotare un corso L2 per i miei studenti?",
      answer: "Usa la funzione di ricerca per trovare corsi nella tua zona, poi clicca su 'Prenota' nella scheda del corso."
    },
    {
      question: "È possibile richiedere un mediatore culturale per i colloqui?",
      answer: "Sì, contatta il servizio di Mediazione Culturale almeno 48 ore prima del colloquio."
    },
    {
      question: "Come faccio a segnalare un nuovo studente NAI?",
      answer: "Utilizza il modulo di richiesta supporto specificando 'Nuovo inserimento NAI' nell'oggetto."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Richiedi supporto</h1>
          <p className="text-muted-foreground">
            Contatti, assistenza e risorse per insegnanti che lavorano con studenti NAI
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generatore AI
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Supporto Tradizionale
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6">
            <ContentCardGenerator />
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                  Invia una richiesta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Nome e Cognome
                    </label>
                    <Input placeholder="Il tuo nome completo" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Scuola di appartenenza
                    </label>
                    <Input placeholder="Nome dell'istituto" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Email
                  </label>
                  <Input type="email" placeholder="la-tua-email@scuola.it" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Tipo di richiesta
                  </label>
                  <select className="w-full border border-border rounded-md px-3 py-2 bg-background">
                    <option>Seleziona il tipo di supporto</option>
                    <option>Inserimento nuovo studente NAI</option>
                    <option>Richiesta mediatore culturale</option>
                    <option>Consulenza pedagogica</option>
                    <option>Problemi tecnici piattaforma</option>
                    <option>Informazioni su corsi L2</option>
                    <option>Altro</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Descrizione della richiesta
                  </label>
                  <Textarea 
                    placeholder="Descrivi nel dettaglio la tua richiesta di supporto..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="urgent" className="rounded" />
                  <label htmlFor="urgent" className="text-sm text-foreground">
                    Richiesta urgente (entro 24 ore)
                  </label>
                </div>

                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Invia richiesta
                </Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-secondary" />
                  Domande frequenti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-foreground mb-2">{item.question}</h4>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contacts Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contatti diretti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary-light rounded-lg">
                        <contact.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{contact.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{contact.description}</p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-primary">{contact.contact}</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contact.hours}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Risorse utili
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-sm h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">Guida inserimento NAI</div>
                    <div className="text-xs text-muted-foreground">Procedure e modulistica</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-sm h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">Protocolli accoglienza</div>
                    <div className="text-xs text-muted-foreground">Linee guida ministeriali</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-sm h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">Mappa servizi territorio</div>
                    <div className="text-xs text-muted-foreground">PDF aggiornato</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-success-light border-success/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <Phone className="h-8 w-8 text-success mx-auto mb-2" />
                  <h4 className="font-medium text-success mb-1">Emergenze</h4>
                  <p className="text-sm text-success/80 mb-2">
                    Per situazioni urgenti che richiedono intervento immediato
                  </p>
                  <Badge variant="outline" className="border-success text-success">
                    800-NEIP-SOS
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Support;