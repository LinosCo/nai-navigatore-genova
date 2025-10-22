import { NavLink } from "react-router-dom";
import { Search, Map, BookOpen, HelpCircle, User, LogOut, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const navItems = [
    {
      to: "/",
      icon: Search,
      label: "Tutte le iniziative",
      description: "Trova attività e servizi"
    },
    {
      to: "/attivita",
      icon: BookOpen,
      label: "Le mie attività",
      description: "Cronologia e preferiti"
    },
    {
      to: "/calendario",
      icon: BookOpen,
      label: "Calendario",
      description: "Vista calendario iniziative"
    },
    {
      to: "/mappa",
      icon: Map,
      label: "Mappa territoriale",
      description: "Vista geografica servizi"
    },
    {
      to: "/generatore",
      icon: Sparkles,
      label: "Generatore",
      description: "Crea contenuti automaticamente"
    },
    {
      to: "/supporto",
      icon: HelpCircle,
      label: "Supporto",
      description: "Assistenza e contatti"
    }
  ];

  // Add admin nav item if user is admin
  if (isAdmin) {
    navItems.push({
      to: "/admin",
      icon: Settings,
      label: "Admin",
      description: "Impostazioni amministrative"
    });
  }

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">NEIP</h1>
              <p className="text-sm text-muted-foreground">Piattaforma Educativa</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group relative ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-nav-hover"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.to === "/admin" && (
                  <Badge variant="secondary" className="text-xs ml-1">Admin</Badge>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user && <NotificationsPanel />}
            
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-border">
                <div className="text-right text-sm">
                  <p className="font-medium text-foreground">{user.email}</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-xs text-muted-foreground">Utente</p>
                    {isAdmin && (
                      <Badge variant="outline" className="text-xs">Admin</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profilo</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center" asChild>
                          <NavLink to="/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Impostazioni Admin</span>
                          </NavLink>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center text-destructive" 
                      onClick={signOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Esci</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <NavLink to="/auth">Accedi</NavLink>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-nav-hover"
                  }`
                }
              >
                <item.icon className="h-3 w-3" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;