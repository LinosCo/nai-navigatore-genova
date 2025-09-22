import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Database, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface AppSetting {
  id: string;
  key: string;
  value: any;
  description: string;
}

interface UserWithRole {
  id: string;
  email: string;
  roles: string[];
  created_at: string;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading) {
      if (!isAdmin) {
        navigate('/');
        toast({
          title: 'Accesso negato',
          description: 'Non hai i permessi per accedere a questa pagina',
          variant: 'destructive',
        });
        return;
      }
      loadData();
    }
  }, [isAdmin, roleLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSettings(), loadUsers()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Errore',
        description: 'Errore nel caricamento dei dati',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error loading settings:', error);
      return;
    }

    setSettings(data || []);
  };

  const loadUsers = async () => {
    // Get users with their roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        created_at
      `);

    if (rolesError) {
      console.error('Error loading user roles:', rolesError);
      return;
    }

    // Group roles by user
    const userMap = new Map<string, UserWithRole>();
    
    userRoles?.forEach(ur => {
      if (!userMap.has(ur.user_id)) {
        userMap.set(ur.user_id, {
          id: ur.user_id,
          email: 'Caricamento...',
          roles: [],
          created_at: ur.created_at
        });
      }
      userMap.get(ur.user_id)!.roles.push(ur.role);
    });

    setUsers(Array.from(userMap.values()));
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value: typeof value === 'string' ? JSON.stringify(value) : value,
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('key', key);

      if (error) throw error;

      toast({
        title: 'Impostazione aggiornata',
        description: `${key} è stato aggiornato con successo`,
      });

      loadSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Errore',
        description: 'Errore nell\'aggiornamento dell\'impostazione',
        variant: 'destructive',
      });
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role });

      if (error) throw error;

      toast({
        title: 'Ruolo assegnato',
        description: `Ruolo ${role} assegnato con successo`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Errore',
        description: 'Errore nell\'assegnazione del ruolo',
        variant: 'destructive',
      });
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Caricamento...</div>
        </main>
      </div>
    );
  }

  const getSetting = (key: string) => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return null;
    
    try {
      return typeof setting.value === 'string' 
        ? JSON.parse(setting.value) 
        : setting.value;
    } catch {
      return setting.value;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Impostazioni Admin</h1>
            <Badge variant="secondary">Admin</Badge>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Generali</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Utenti</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Database</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impostazioni Generali</CardTitle>
                  <CardDescription>
                    Configura le impostazioni principali dell'applicazione
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="site_name">Nome del sito</Label>
                      <Input
                        id="site_name"
                        value={getSetting('site_name') || ''}
                        onChange={(e) => updateSetting('site_name', e.target.value)}
                        placeholder="NEIP Genova"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="contact_email">Email di contatto</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={getSetting('contact_email') || ''}
                        onChange={(e) => updateSetting('contact_email', e.target.value)}
                        placeholder="info@neip.genova.it"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="max_initiatives">Massimo iniziative per utente</Label>
                      <Input
                        id="max_initiatives"
                        type="number"
                        value={getSetting('max_initiatives_per_user') || 10}
                        onChange={(e) => updateSetting('max_initiatives_per_user', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="public_registration"
                        checked={getSetting('allow_public_registration') || false}
                        onCheckedChange={(checked) => updateSetting('allow_public_registration', checked)}
                      />
                      <Label htmlFor="public_registration">Permetti registrazione pubblica</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenance_mode"
                        checked={getSetting('maintenance_mode') || false}
                        onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                      />
                      <Label htmlFor="maintenance_mode">Modalità manutenzione</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestione Utenti</CardTitle>
                  <CardDescription>
                    Visualizza e gestisci i ruoli degli utenti registrati
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <div className="flex space-x-1 mt-1">
                            {user.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => assignRole(user.id, 'admin')}
                            disabled={user.roles.includes('admin')}
                          >
                            Admin
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => assignRole(user.id, 'moderator')}
                            disabled={user.roles.includes('moderator')}
                          >
                            Moderatore
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiche Database</CardTitle>
                  <CardDescription>
                    Informazioni sullo stato del database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">-</div>
                      <div className="text-sm text-muted-foreground">Iniziative Totali</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{users.length}</div>
                      <div className="text-sm text-muted-foreground">Utenti Registrati</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{settings.length}</div>
                      <div className="text-sm text-muted-foreground">Impostazioni</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;