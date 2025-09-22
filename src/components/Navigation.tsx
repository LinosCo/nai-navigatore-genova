import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Search, Map, BookOpen, HelpCircle, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navigation = () => {
  const [hasNotifications] = useState(true);

  const navItems = [
    {
      to: "/",
      icon: Search,
      label: "Cerca iniziative",
      description: "Trova attività e servizi"
    },
    {
      to: "/attivita",
      icon: BookOpen,
      label: "Le mie attività",
      description: "Cronologia e preferiti"
    },
    {
      to: "/mappa",
      icon: Map,
      label: "Mappa territoriale",
      description: "Vista geografica servizi"
    },
    {
      to: "/supporto",
      icon: HelpCircle,
      label: "Richiedi supporto",
      description: "Assistenza e contatti"
    }
  ];

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
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-nav-hover"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
              )}
            </Button>
            
            <div className="flex items-center space-x-3 pl-3 border-l border-border">
              <div className="text-right text-sm">
                <p className="font-medium text-foreground">Prof. Rossi</p>
                <p className="text-xs text-muted-foreground">IC Sampierdarena</p>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                  PR
                </AvatarFallback>
              </Avatar>
            </div>
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