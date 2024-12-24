import React, { useEffect, useState } from 'react';
import { apiSettingsService } from '../../../services/apiSettingsService';
import type { APISettings } from '../../../services/apiSettingsService';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

export function ApiSettingsDebug() {
  const [settings, setSettings] = useState<APISettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await apiSettingsService.getSettings();
        setSettings(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      }
    };
    fetchSettings();
  }, []);

  if (error) return (
    <Card className="bg-destructive/10">
      <CardContent className="pt-6">
        <div className="text-destructive">Error: {error}</div>
      </CardContent>
    </Card>
  );
  
  if (!settings) return (
    <Card className="bg-muted">
      <CardContent className="pt-6">
        <div>Loading settings...</div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">API Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">SendGrid Configuration</h3>
            <div className="space-y-2 text-sm">
              <div>Enabled: {settings.sendgrid?.enabled ? 'Yes' : 'No'}</div>
              <div>From Email: {settings.sendgrid?.fromEmail || 'Not set'}</div>
              <div>API Key: {settings.sendgrid?.apiKey ? '********' : 'Not set'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
