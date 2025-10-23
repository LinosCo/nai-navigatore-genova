import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supportedLanguages, SupportedLanguage } from '@/i18n/config';
import { useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Apply RTL direction for Arabic
  useEffect(() => {
    // Normalizza il codice lingua (es. 'it-IT' -> 'it')
    const normalizedLang = i18n.language.split('-')[0];

    const currentLang = supportedLanguages.find(
      (lang) => lang.code === normalizedLang
    );

    if (currentLang?.dir === 'rtl') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = currentLang.code;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = normalizedLang;
    }
  }, [i18n.language]);

  const changeLanguage = async (langCode: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(langCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Normalizza per trovare la lingua corrente
  const normalizedCurrentLang = i18n.language.split('-')[0];
  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === normalizedCurrentLang
  ) || supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
          <span className="absolute -top-1 -right-1 text-xs">
            {currentLanguage.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer ${
              normalizedCurrentLang === lang.code ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span className={lang.dir === 'rtl' ? 'font-arabic' : ''}>
              {lang.name}
            </span>
            {normalizedCurrentLang === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
