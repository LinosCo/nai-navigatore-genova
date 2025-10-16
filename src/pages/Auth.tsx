import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Mail, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSpidCallback, setIsSpidCallback] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }

    // Controlla se è un callback SPID
    const urlParams = new URLSearchParams(window.location.search);
    const samlResponse = urlParams.get('SAMLResponse');
    if (samlResponse) {
      setIsSpidCallback(true);
      handleSpidCallback(samlResponse);
    }
  }, [user, navigate]);

  const handleSpidCallback = async (samlResponse: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('spid-auth', {
        body: {
          spidAssertion: samlResponse,
          returnUrl: window.location.origin
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Accesso SPID completato con successo!");
        // Il redirect avverrà automaticamente tramite il token
      } else {
        throw new Error(data.error || "Errore durante l'autenticazione SPID");
      }
    } catch (error: any) {
      console.error("SPID callback error:", error);
      setMessage("Errore durante l'autenticazione SPID: " + error.message);
      toast.error("Errore durante l'autenticazione SPID");
    } finally {
      setLoading(false);
    }
  };

  const handleSpidLogin = async () => {
    try {
      setLoading(true);
      // Redirect to SPID authentication page
      const spidUrl = buildSpidAuthUrl(window.location.origin);
      window.location.href = spidUrl;
    } catch (error: any) {
      setMessage("Errore durante l'accesso SPID: " + error.message);
      toast.error("Errore durante l'accesso SPID");
    } finally {
      setLoading(false);
    }
  };

  const buildSpidAuthUrl = (returnUrl: string): string => {
    // URL del Service Provider SPID (da configurare con l'Identity Provider)
    const spidServiceProviderUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com/spid/login'  // URL produzione
      : 'https://localhost:8080/spid/login';  // URL test locale

    const params = new URLSearchParams({
      returnUrl: returnUrl,
      level: 'SpidL2', // Livello di autenticazione SPID
      attributeConsumingServiceIndex: '0'
    });

    return `${spidServiceProviderUrl}?${params.toString()}`;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage("Email e password sono obbligatori");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Accesso effettuato con successo!");
    } catch (error: any) {
      console.error("Auth error:", error);
      setMessage(error.message || "Errore durante l'accesso");
      toast.error("Errore durante l'accesso");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage("Email e password sono obbligatori");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      // Invia email di benvenuto personalizzata
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: { email }
        });
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Non bloccare la registrazione se l'email fallisce
      }

      setMessage("Controlla la tua email per confermare la registrazione");
      toast.success("Registrazione completata! Controlla la tua email.");
    } catch (error: any) {
      console.error("Signup error:", error);
      setMessage(error.message || "Errore durante la registrazione");
      toast.error("Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  if (isSpidCallback) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Elaborazione SPID...
              </CardTitle>
              <CardDescription>
                Stiamo verificando la tua identità digitale
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* SPID Login Card */}
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Accesso con SPID
              </CardTitle>
              <CardDescription>
                Sistema Pubblico di Identità Digitale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSpidLogin}
                disabled={loading}
                className="w-full h-12 text-base"
                size="lg"
              >
                <Shield className="h-5 w-5 mr-2" />
                {loading ? "Reindirizzamento..." : "Entra con SPID"}
              </Button>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Metodo di accesso consigliato per la Pubblica Amministrazione
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">oppure</span>
            </div>
          </div>

          {/* Email/Password Login Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Accesso Tradizionale
              </CardTitle>
              <CardDescription>
                Utilizza email e password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Accedi</TabsTrigger>
                  <TabsTrigger value="signup">Registrati</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="La tua password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      <User className="h-4 w-4 mr-2" />
                      {loading ? "Accesso in corso..." : "Accedi"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="signup-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="la-tua-email@esempio.it"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signup-password" className="text-sm font-medium">
                        Password
                      </label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Scegli una password sicura"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      <User className="h-4 w-4 mr-2" />
                      {loading ? "Registrazione..." : "Registrati"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {message && (
                <Alert className={`mt-4 ${message.includes("Controlla") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  {message.includes("Controlla") ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={message.includes("Controlla") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;