'use client';

import { Button } from '@/components/ui/button';
import { ProDadLogo } from '@/components/ui/logo';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <ProDadLogo size="lg" />
        </div>

        <h1 className="text-2xl font-bold mb-4">You're offline</h1>

        <p className="mb-6 text-muted-foreground">
          It looks like you're currently offline. Some features may not be available until you
          reconnect to the internet.
        </p>

        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm font-medium">
            Don't worry, the ProDad app is designed to work offline. You can:
          </p>
          <ul className="text-sm mt-2 text-left list-disc pl-5 space-y-1">
            <li>View your saved reminders</li>
            <li>Check your calendar events</li>
            <li>Access previously viewed documents</li>
          </ul>
        </div>

        <Button onClick={() => window.location.reload()} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
