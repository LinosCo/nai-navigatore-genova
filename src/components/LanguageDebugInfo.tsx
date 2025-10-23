import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Debug component to show current language state
 * Remove in production or set display:none
 */
export function LanguageDebugInfo() {
  const { i18n } = useTranslation();

  // Set to false to hide in production
  const showDebug = import.meta.env.DEV;

  if (!showDebug) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-64 z-50 opacity-80 hover:opacity-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🌐 i18n Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        <div>
          <strong>Current:</strong> {i18n.language}
        </div>
        <div>
          <strong>Normalized:</strong> {i18n.language.split('-')[0]}
        </div>
        <div>
          <strong>Fallback:</strong> {i18n.options.fallbackLng as string}
        </div>
        <div>
          <strong>Loaded:</strong> {Object.keys(i18n.store.data).join(', ')}
        </div>
        <div>
          <strong>RTL:</strong> {document.documentElement.dir}
        </div>
      </CardContent>
    </Card>
  );
}
