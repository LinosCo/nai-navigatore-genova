/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for accessibility (WCAG 2.4.1)
 */

export function SkipLinks() {
  return (
    <div className="skip-links-container">
      <a href="#main-content" className="skip-link">
        Salta al contenuto principale
      </a>
      <a href="#main-navigation" className="skip-link">
        Salta alla navigazione
      </a>
      <a href="#search" className="skip-link">
        Salta alla ricerca
      </a>
    </div>
  );
}
