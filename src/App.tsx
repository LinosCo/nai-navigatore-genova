import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Activities from "./pages/Activities";
import Calendar from "./pages/Calendar";
import Map from "./pages/Map";
import Support from "./pages/Support";
import GeneratoreAttivita from "./pages/GeneratoreAttivita";
import Auth from "./pages/Auth";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/attivita" element={<Activities />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/mappa" element={<Map />} />
            <Route path="/supporto" element={<Support />} />
            <Route path="/generatore" element={<GeneratoreAttivita />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
