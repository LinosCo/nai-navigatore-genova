import { Bell, BellOff, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTranslation } from 'react-i18next';

export function PushNotificationSettings() {
  const { t } = useTranslation();
  const {
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    subscribe,
    unsubscribe,
    testNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            {t('notifications.pushNotifications')}
          </CardTitle>
          <CardDescription>
            Le notifiche push non sono supportate dal tuo browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Per ricevere notifiche push, usa un browser moderno come Chrome, Firefox, Edge o Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('notifications.pushNotifications')}
        </CardTitle>
        <CardDescription>
          Ricevi notifiche in tempo reale anche quando non sei sulla piattaforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Stato Permessi</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' && '✅ Permessi concessi'}
              {permission === 'denied' && '❌ Permessi negati'}
              {permission === 'default' && '⏳ Permessi non richiesti'}
            </p>
          </div>
          <div>
            {isSubscribed ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🔔 Attivo
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                🔕 Disattivo
              </span>
            )}
          </div>
        </div>

        {/* Enable/Disable Button */}
        <div className="flex gap-3">
          {!isSubscribed ? (
            <Button
              onClick={subscribe}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              <Bell className="mr-2 h-4 w-4" />
              {isLoading ? 'Abilitazione...' : 'Abilita Notifiche Push'}
            </Button>
          ) : (
            <Button
              onClick={unsubscribe}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              <BellOff className="mr-2 h-4 w-4" />
              {isLoading ? 'Disabilitazione...' : 'Disabilita Notifiche Push'}
            </Button>
          )}

          {/* Test Button (only when subscribed) */}
          {isSubscribed && (
            <Button
              onClick={testNotification}
              variant="outline"
              size="lg"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Test
            </Button>
          )}
        </div>

        {/* Information Alert */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertDescription>
              Hai bloccato le notifiche per questo sito. Per abilitarle, vai nelle impostazioni del browser e rimuovi il blocco.
            </AlertDescription>
          </Alert>
        )}

        {isSubscribed && (
          <Alert>
            <AlertDescription>
              Le notifiche push sono abilitate. Riceverai notifiche in tempo reale per:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nuove iniziative nella tua zona</li>
                <li>Promemoria eventi 24h prima</li>
                <li>Aggiornamenti importanti</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Notification Preferences (when subscribed) */}
        {isSubscribed && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Preferenze Notifiche Push</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nuove iniziative</Label>
                <p className="text-sm text-muted-foreground">
                  Ricevi notifiche per nuove iniziative pubblicate
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Promemoria eventi</Label>
                <p className="text-sm text-muted-foreground">
                  Ricevi promemoria 24h prima degli eventi
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aggiornamenti sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Ricevi notifiche per aggiornamenti importanti
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        )}

        {/* Browser compatibility note */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          ℹ️ Le notifiche push funzionano su Chrome, Firefox, Edge e Safari (iOS 16.4+).
          Le notifiche vengono inviate anche quando il browser è chiuso su desktop.
        </div>
      </CardContent>
    </Card>
  );
}
