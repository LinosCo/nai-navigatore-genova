import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { User, Mail, FileText, Trash2, Download, AlertTriangle } from "lucide-react";

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Form fields
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setNome(data.nome || "");
        setCognome(data.cognome || "");
        setEmail(data.email || user?.email || "");
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Errore nel caricamento del profilo");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome,
          cognome,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Aggiorna email se cambiata
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        });

        if (emailError) throw emailError;

        toast.success("Profilo aggiornato! Verifica la nuova email se l'hai modificata.");
      } else {
        toast.success("Profilo aggiornato con successo!");
      }

      loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Errore nell'aggiornamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);

      // Recupera tutte le iniziative create dall'utente
      const { data: initiatives, error: initError } = await supabase
        .from('initiatives')
        .select('*')
        .eq('created_by', user?.id);

      if (initError) throw initError;

      // Crea un oggetto con tutti i dati dell'utente (GDPR data portability)
      const userData = {
        profile: profile,
        email: user?.email,
        created_at: user?.created_at,
        initiatives: initiatives,
        exported_at: new Date().toISOString()
      };

      // Crea un file JSON
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `miei-dati-neip-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Dati esportati con successo!");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error("Errore nell'esportazione dei dati");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ELIMINA") {
      toast.error("Scrivi ELIMINA per confermare");
      return;
    }

    setLoading(true);

    try {
      // Prima elimina tutte le iniziative dell'utente
      const { error: initError } = await supabase
        .from('initiatives')
        .delete()
        .eq('created_by', user?.id);

      if (initError) throw initError;

      // Elimina le notifiche
      const { error: notifError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user?.id);

      if (notifError) throw notifError;

      // Elimina il profilo
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Infine, elimina l'account auth
      const { error: authError } = await supabase.rpc('delete_user');

      if (authError) throw authError;

      toast.success("Account eliminato con successo");

      // Logout e redirect
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Errore nell'eliminazione dell'account. Contatta il supporto.");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto p-4 max-w-4xl">
          <div className="space-y-6 py-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="h-8 w-8" />
                Il Mio Profilo
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestisci le tue informazioni personali e le preferenze dell'account
              </p>
            </div>

            {/* Informazioni Profilo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informazioni Personali
                </CardTitle>
                <CardDescription>
                  Aggiorna i tuoi dati personali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="nome" className="text-sm font-medium">
                        Nome
                      </label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Il tuo nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cognome" className="text-sm font-medium">
                        Cognome
                      </label>
                      <Input
                        id="cognome"
                        type="text"
                        placeholder="Il tuo cognome"
                        value={cognome}
                        onChange={(e) => setCognome(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="la-tua-email@esempio.it"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se modifichi l'email, riceverai una mail di conferma
                    </p>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvataggio..." : "Salva Modifiche"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* GDPR - Esportazione Dati */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  I Tuoi Dati (GDPR)
                </CardTitle>
                <CardDescription>
                  Scarica una copia di tutti i tuoi dati personali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  In conformità con il GDPR, puoi richiedere una copia di tutti i dati che abbiamo su di te.
                  Il file includerà il tuo profilo, le iniziative create e altre informazioni associate al tuo account.
                </p>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Scarica i Miei Dati
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Zona Pericolosa */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Zona Pericolosa
                </CardTitle>
                <CardDescription>
                  Azioni irreversibili sull'account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    L'eliminazione dell'account è permanente e non può essere annullata.
                    Tutte le tue iniziative, dati e impostazioni saranno eliminati definitivamente.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />

        {/* Dialog Conferma Eliminazione */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Conferma Eliminazione Account</DialogTitle>
              <DialogDescription>
                Questa azione è irreversibile. Tutti i tuoi dati saranno eliminati permanentemente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Verranno eliminati:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Tutte le iniziative che hai creato</li>
                    <li>Le tue notifiche e preferenze</li>
                    <li>I tuoi dati personali</li>
                    <li>L'accesso al tuo account</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <label htmlFor="confirm-delete" className="text-sm font-medium">
                  Scrivi <span className="font-bold">ELIMINA</span> per confermare
                </label>
                <Input
                  id="confirm-delete"
                  type="text"
                  placeholder="ELIMINA"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
              >
                Annulla
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmText !== "ELIMINA"}
              >
                {loading ? "Eliminazione..." : "Elimina Definitivamente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default UserProfile;
