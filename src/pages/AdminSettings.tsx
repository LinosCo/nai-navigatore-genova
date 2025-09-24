import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Calendar, 
  Mail, 
  AlertTriangle,
  History,
  Settings,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface UserProfile {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  enabled: boolean;
  provider_autenticazione: string;
  codice_fiscale?: string;
  created_at: string;
  disabled_at?: string;
  disable_reason?: string;
  ultimo_accesso_spid?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

interface AdminAction {
  id: string;
  action: string;
  details: any;
  timestamp: string;
  admin_user_id: string;
  target_user_id?: string;
}

const AdminSettings = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [disableReason, setDisableReason] = useState("");
  const [newUserRole, setNewUserRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  useEffect(() => {
    console.log('AdminSettings useEffect - isAdmin:', isAdmin, 'user:', user);
    if (!isAdmin) {
      console.log('User is not admin, not fetching data');
      return;
    }
    console.log('User is admin, fetching data...');
    fetchUsers();
    fetchUserRoles();
    fetchAdminLogs();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Errore nel caricamento utenti');
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAdminLogs(data || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    }
    setLoading(false);
  };

  const disableUser = async (userId: string, reason: string) => {
    try {
      setActionLoading(userId);
      
      const { error } = await supabase.rpc('disable_user', {
        _user_id: userId,
        _reason: reason
      });

      if (error) throw error;

      // Log action
      await supabase
        .from('admin_actions_log')
        .insert({
          admin_user_id: user?.id,
          target_user_id: userId,
          action: 'disable_user',
          details: { reason }
        });

      toast.success('Utente disabilitato con successo');
      fetchUsers();
      fetchAdminLogs();
      setShowDisableDialog(false);
      setDisableReason("");
    } catch (error: any) {
      console.error('Error disabling user:', error);
      toast.error('Errore nella disabilitazione utente: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const enableUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      
      const { error } = await supabase.rpc('enable_user', {
        _user_id: userId
      });

      if (error) throw error;

      // Log action
      await supabase
        .from('admin_actions_log')
        .insert({
          admin_user_id: user?.id,
          target_user_id: userId,
          action: 'enable_user',
          details: {}
        });

      toast.success('Utente abilitato con successo');
      fetchUsers();
      fetchAdminLogs();
    } catch (error: any) {
      console.error('Error enabling user:', error);
      toast.error('Errore nell\'abilitazione utente: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      setActionLoading(userId);

      // Remove existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Add new role if not user (user is default)
      if (role !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });

        if (error) throw error;
      }

      // Log action
      await supabase
        .from('admin_actions_log')
        .insert({
          admin_user_id: user?.id,
          target_user_id: userId,
          action: 'update_role',
          details: { new_role: role }
        });

      toast.success('Ruolo utente aggiornato');
      fetchUserRoles();
      fetchAdminLogs();
      setShowRoleDialog(false);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Errore nell\'aggiornamento ruolo: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getUserRole = (userId: string): string => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const getUserRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Accesso negato. Solo gli amministratori possono accedere a questa pagina.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Pannello Amministrazione
          </h1>
          <p className="text-muted-foreground">
            Gestione utenti e controllo accessi della piattaforma NEIP
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestione Utenti
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Ruoli
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Log Attività
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utenti Registrati ({users.length})
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    Attivi: {users.filter(u => u.enabled).length}
                    <UserX className="h-4 w-4 ml-2" />
                    Disabilitati: {users.filter(u => !u.enabled).length}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utente</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ruolo</TableHead>
                        <TableHead>Autenticazione</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Registrato</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userProfile) => (
                        <TableRow key={userProfile.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {userProfile.nome} {userProfile.cognome}
                              </span>
                              {userProfile.codice_fiscale && (
                                <span className="text-xs text-muted-foreground">
                                  CF: {userProfile.codice_fiscale}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {userProfile.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getUserRoleBadgeVariant(getUserRole(userProfile.id))}>
                              {getUserRole(userProfile.id)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {userProfile.provider_autenticazione === 'spid' ? (
                                <div className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  SPID
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  Email
                                </div>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {userProfile.enabled ? (
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Attivo
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                <Badge variant="destructive">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Disabilitato
                                </Badge>
                                {userProfile.disable_reason && (
                                  <p className="text-xs text-muted-foreground">
                                    {userProfile.disable_reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(userProfile.created_at), 'dd MMM yyyy', { locale: it })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {userProfile.enabled ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(userProfile);
                                    setShowDisableDialog(true);
                                  }}
                                  disabled={actionLoading === userProfile.id}
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Disabilita
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => enableUser(userProfile.id)}
                                  disabled={actionLoading === userProfile.id}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Abilita
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(userProfile);
                                  setNewUserRole(getUserRole(userProfile.id) as any);
                                  setShowRoleDialog(true);
                                }}
                                disabled={actionLoading === userProfile.id}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Ruoli
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Gestione Ruoli Utenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Amministratori</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {userRoles.filter(r => r.role === 'admin').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Accesso completo</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Moderatori</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                          {userRoles.filter(r => r.role === 'moderator').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Gestione contenuti</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Utenti Base</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {users.length - userRoles.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Accesso standard</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Log Attività Amministratori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Ora</TableHead>
                        <TableHead>Azione</TableHead>
                        <TableHead>Dettagli</TableHead>
                        <TableHead>Amministratore</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm', { locale: it })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {log.details && typeof log.details === 'object' && (
                                <div>
                                  {Object.entries(log.details).map(([key, value]) => (
                                    <div key={key}>
                                      <strong>{key}:</strong> {String(value)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {log.admin_user_id}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Disabilita Utente */}
        <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disabilita Utente</DialogTitle>
              <DialogDescription>
                Stai per disabilitare l'utente {selectedUser?.nome} {selectedUser?.cognome}.
                L'utente non potrà più accedere alla piattaforma.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Motivo della disabilitazione</label>
                <Textarea
                  placeholder="Inserisci il motivo della disabilitazione..."
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
                Annulla
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedUser && disableUser(selectedUser.id, disableReason)}
                disabled={!disableReason.trim()}
              >
                Disabilita Utente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Gestione Ruoli */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestione Ruoli</DialogTitle>
              <DialogDescription>
                Modifica il ruolo dell'utente {selectedUser?.nome} {selectedUser?.cognome}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Ruolo</label>
                <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utente Base</SelectItem>
                    <SelectItem value="moderator">Moderatore</SelectItem>
                    <SelectItem value="admin">Amministratore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Annulla
              </Button>
              <Button 
                onClick={() => selectedUser && updateUserRole(selectedUser.id, newUserRole)}
              >
                Aggiorna Ruolo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminSettings;