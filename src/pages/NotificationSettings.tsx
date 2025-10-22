import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Bell } from "lucide-react";

const NotificationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    enable_all_notifications: true,
    enabled_categories: [] as string[],
    enable_email_notifications: false,
    notification_email: "",
  });

  const categories = [
    { value: "Corso L2", label: "Corsi L2" },
    { value: "Evento culturale", label: "Eventi culturali" },
    { value: "Servizio di supporto", label: "Servizi di supporto" },
    { value: "Attività ricreativa", label: "Attività ricreative" },
    { value: "Formazione professionale", label: "Formazione professionale" },
  ];

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          enable_all_notifications: data.enable_all_notifications,
          enabled_categories: data.enabled_categories || [],
          enable_email_notifications: data.enable_email_notifications,
          notification_email: data.notification_email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Errore nel caricamento delle preferenze");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Preferenze salvate con successo");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Errore nel salvataggio delle preferenze");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setPreferences((prev) => ({
      ...prev,
      enabled_categories: prev.enabled_categories.includes(category)
        ? prev.enabled_categories.filter((c) => c !== category)
        : [...prev.enabled_categories, category],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Caricamento...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Impostazioni Notifiche
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestisci le tue preferenze di notifica per rimanere aggiornato sulle nuove iniziative
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notifiche in-app</CardTitle>
              <CardDescription>
                Ricevi notifiche nella piattaforma quando vengono pubblicate nuove iniziative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="all-notifications">Tutte le notifiche</Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi notifiche per tutte le nuove iniziative pubblicate
                  </p>
                </div>
                <Switch
                  id="all-notifications"
                  checked={preferences.enable_all_notifications}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      enable_all_notifications: checked,
                    }))
                  }
                />
              </div>

              {!preferences.enable_all_notifications && (
                <div className="space-y-4 pt-4 border-t">
                  <Label>Categorie specifiche</Label>
                  <p className="text-sm text-muted-foreground">
                    Seleziona le categorie per cui vuoi ricevere notifiche
                  </p>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.value}
                          checked={preferences.enabled_categories.includes(
                            category.value
                          )}
                          onCheckedChange={() => toggleCategory(category.value)}
                        />
                        <Label
                          htmlFor={category.value}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifiche Email</CardTitle>
              <CardDescription>
                Ricevi una email quando vengono pubblicate nuove iniziative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Abilita notifiche email</Label>
                  <p className="text-sm text-muted-foreground">
                    Ti invieremo una email di riepilogo
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.enable_email_notifications}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      enable_email_notifications: checked,
                    }))
                  }
                />
              </div>

              {preferences.enable_email_notifications && (
                <div className="space-y-2">
                  <Label htmlFor="notification-email">
                    Email per le notifiche (opzionale)
                  </Label>
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="Lascia vuoto per usare la tua email principale"
                    value={preferences.notification_email}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        notification_email: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Se non specificata, useremo l'email del tuo profilo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? "Salvataggio..." : "Salva Preferenze"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationSettings;
