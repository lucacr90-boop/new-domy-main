'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { t } from '../lib/translations';

export default function NotificationPreferences({ language = 'cs' }) {
  const [preferences, setPreferences] = useState({
    property_alerts: true,
    inquiry_responses: true,
    onboarding_emails: true,
    marketing_emails: false,
    frequency: 'daily',
    email_enabled: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notification-preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (key, checked) => {
    setPreferences(prev => ({ ...prev, [key]: checked }));
  };

  const handleFrequencyChange = (frequency) => {
    setPreferences(prev => ({ ...prev, frequency }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        toast.success(t('club.notificationsPage.successMessage', language));
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(t('club.notificationsPage.errorMessage', language));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('club.notificationsPage.preferencesTitle', language)}</CardTitle>
        <CardDescription>
          {t('club.notificationsPage.preferencesDesc', language)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5 flex-1">
              <Label>{t('club.notificationsPage.emailNotifications', language)}</Label>
              <p className="text-sm text-muted-foreground">
                {t('club.notificationsPage.emailNotificationsDesc', language)}
              </p>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handleSwitchChange('email_enabled', checked)}
            />
          </div>

          <div className="space-y-4 opacity-100 transition-opacity" style={{ 
            opacity: preferences.email_enabled ? 1 : 0.5 
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <Label>{t('club.notificationsPage.propertyAlerts', language)}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('club.notificationsPage.propertyAlertsDescription', language)}
                </p>
              </div>
              <Switch
                checked={preferences.property_alerts && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('property_alerts', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <Label>{t('club.notificationsPage.inquiryResponses', language)}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('club.notificationsPage.inquiryResponsesDesc', language)}
                </p>
              </div>
              <Switch
                checked={preferences.inquiry_responses && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('inquiry_responses', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <Label>{t('club.notificationsPage.onboardingEmails', language)}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('club.notificationsPage.onboardingEmailsDesc', language)}
                </p>
              </div>
              <Switch
                checked={preferences.onboarding_emails && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('onboarding_emails', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <Label>{t('club.notificationsPage.marketingEmails', language)}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('club.notificationsPage.marketingEmailsDesc', language)}
                </p>
              </div>
              <Switch
                checked={preferences.marketing_emails && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('marketing_emails', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('club.notificationsPage.notificationFrequency', language)}</Label>
            <Select 
              value={preferences.frequency} 
              onValueChange={handleFrequencyChange}
              disabled={!preferences.email_enabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('club.notificationsPage.selectFrequency', language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">{t('club.notificationsPage.instant', language)}</SelectItem>
                <SelectItem value="daily">{t('club.notificationsPage.daily', language)}</SelectItem>
                <SelectItem value="weekly">{t('club.notificationsPage.weekly', language)}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('club.notificationsPage.frequencyDesc', language)}
            </p>
          </div>
        </div>

        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="w-full"
        >
          {saving ? t('club.notificationsPage.saving', language) : t('club.notificationsPage.savePreferences', language)}
        </Button>
      </CardContent>
    </Card>
  );
}