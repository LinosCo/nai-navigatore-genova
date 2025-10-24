import { useEffect } from "react";

const GuidaUtente = () => {
  useEffect(() => {
    // Redirect to the HTML presentation
    window.location.href = "/guida-utente.html";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Caricamento guida utente...</p>
      </div>
    </div>
  );
};

export default GuidaUtente;
