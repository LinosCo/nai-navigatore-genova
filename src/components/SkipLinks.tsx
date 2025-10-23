import { useTranslation } from 'react-i18next';

/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for accessibility (WCAG 2.4.1)
 * Only visible when focused with Tab key
 */

export function SkipLinks() {
  const { t } = useTranslation();

  return (
    <div className="sr-only">
      <a href="#main-content" className="skip-link">
        {t('accessibility.skipToMain', 'Skip to main content')}
      </a>
      <a href="#main-navigation" className="skip-link">
        {t('accessibility.skipToNav', 'Skip to navigation')}
      </a>
      <a href="#search" className="skip-link">
        {t('accessibility.skipToSearch', 'Skip to search')}
      </a>
    </div>
  );
}
