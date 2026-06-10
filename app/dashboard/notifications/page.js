'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationPreferences from '@/components/NotificationPreferences';
import { Bell, Mail, Settings } from 'lucide-react';
import { t } from '../../../lib/translations';

export default function NotificationsPage() {
  const [language, setLanguage] = useState('cs');

  useEffect(() => {
    // Load language preference
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) setLanguage(savedLanguage);
    
    // Listen for language changes
    const handleLanguageChange = (e) => {
      setLanguage(e.detail);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('club.notificationsPage.title', language)}</h1>
          <p className="text-muted-foreground">
            {t('club.notificationsPage.subtitle', language)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-slate-800" />
              <span>{t('club.notificationsPage.propertyAlertsTitle', language)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('club.notificationsPage.propertyAlertsDesc', language)}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>{t('club.notificationsPage.inquiryUpdatesTitle', language)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('club.notificationsPage.inquiryUpdatesDesc', language)}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-purple-600" />
              <span>{t('club.notificationsPage.tipsGuidesTitle', language)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('club.notificationsPage.tipsGuidesDesc', language)}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <NotificationPreferences language={language} />
    </div>
  );
}