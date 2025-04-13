'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FiDownload, FiX } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // App is already installed, don't show the prompt
    }

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser prompt
      e.preventDefault();

      // Store the event for later use
      setInstallEvent(e as BeforeInstallPromptEvent);

      // Show our custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (!installEvent) return;

    // Trigger the installation prompt
    installEvent.prompt();

    // Wait for the user to respond to the prompt
    installEvent.userChoice.then(({ outcome }) => {
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        // Remember that user dismissed the prompt
        setIsDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
      }

      // Clear the saved event
      setInstallEvent(null);
      setShowPrompt(false);
    });
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || isDismissed) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">Install ProDad App</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDismiss}>
              <FiX className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Add to your home screen for a better experience</CardDescription>
        </CardHeader>

        <CardContent className="pb-2 text-sm">
          <p>Install the ProDad app to:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Access your dashboard faster</li>
            <li>Use the app offline</li>
            <li>Receive important reminders</li>
          </ul>
        </CardContent>

        <CardFooter>
          <Button onClick={handleInstall} className="w-full">
            <FiDownload className="mr-2 h-4 w-4" /> Install App
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
