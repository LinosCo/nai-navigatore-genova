import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-6 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Organization info */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-heading-3 text-white mb-4 font-titillium">
              NEIP - Network Educativo Interculturale Partecipato
            </h3>
            <p className="text-body-small text-secondary-light mb-4 leading-relaxed">
              Piattaforma educativa dedicata al supporto degli insegnanti nell'integrazione 
              degli studenti NAI (Nuovi Arrivati in Italia) attraverso servizi, corsi L2 
              e attività sul territorio genovese.
            </p>
            <div className="flex flex-col space-y-2 text-body-small text-secondary-light">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Genova, Liguria</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:info@neip.edu" className="hover:text-white transition-colors">
                  info@neip.edu
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+39 010 XXX XXXX</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-heading-3 text-white mb-4 font-titillium">
              Collegamenti rapidi
            </h4>
            <ul className="space-y-2 text-body-small">
              <li>
                <Link 
                  to="/attivita" 
                  className="text-secondary-light hover:text-white transition-colors"
                >
                  Attività e Servizi
                </Link>
              </li>
              <li>
                <Link 
                  to="/calendario" 
                  className="text-secondary-light hover:text-white transition-colors"
                >
                  Calendario Eventi
                </Link>
              </li>
              <li>
                <Link 
                  to="/mappa" 
                  className="text-secondary-light hover:text-white transition-colors"
                >
                  Mappa Interattiva
                </Link>
              </li>
              <li>
                <Link 
                  to="/supporto" 
                  className="text-secondary-light hover:text-white transition-colors"
                >
                  Supporto
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-heading-3 text-white mb-4 font-titillium">
              Risorse
            </h4>
            <ul className="space-y-2 text-body-small">
              <li>
                <a 
                  href="https://designers.italia.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-light hover:text-white transition-colors flex items-center gap-1"
                >
                  Designer Italia
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.miur.gov.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-light hover:text-white transition-colors flex items-center gap-1"
                >
                  MIUR
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.regione.liguria.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-light hover:text-white transition-colors flex items-center gap-1"
                >
                  Regione Liguria
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a 
                  href="https://smart.comune.genova.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-light hover:text-white transition-colors flex items-center gap-1"
                >
                  Comune di Genova
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-secondary-light/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-body-small text-secondary-light">
              © 2024 NEIP. Tutti i diritti riservati.
            </div>
            <div className="flex gap-6 text-body-small">
              <a 
                href="/privacy" 
                className="text-secondary-light hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/accessibilita" 
                className="text-secondary-light hover:text-white transition-colors"
              >
                Accessibilità
              </a>
              <a 
                href="/note-legali" 
                className="text-secondary-light hover:text-white transition-colors"
              >
                Note Legali
              </a>
            </div>
          </div>
          
          {/* Designer Italia compliance */}
          <div className="mt-4 pt-4 border-t border-secondary-light/20">
            <p className="text-caption text-secondary-light text-center">
              Sito realizzato secondo le{" "}
              <a 
                href="https://designers.italia.it" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                linee guida di design per i servizi web della PA
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;