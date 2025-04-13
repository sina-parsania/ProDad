'use client';

import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Register the service worker
export function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Handle service worker updates
  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Send a message to the waiting service worker to trigger skipWaiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    // Check if the browser supports service workers
    if ('serviceWorker' in navigator) {
      // The service worker registration is now handled by next-pwa
      // We're just setting up event listeners and handling updates

      // Listen for when a new service worker is installed
      const handleNewServiceWorker = () => {
        // Check if there's any registration with a waiting service worker
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg && reg.waiting) {
            setUpdateAvailable(true);
            setRegistration(reg);

            // Show toast notification for update
            toast('New version available', {
              description: 'Click to update to the latest version.',
              action: {
                label: 'Update',
                onClick: handleUpdate,
              },
              duration: 10000, // 10 seconds
            });
          }
        });
      };

      // Listen for 'controllerchange' events
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed, app will reload');
      });

      // Set up listeners for service worker updates
      window.addEventListener('load', () => {
        // Check if there's a service worker update available
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (!reg) return;
          setRegistration(reg);

          // When a new service worker is waiting
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            // When the new service worker is installed
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available, show update notification
                setUpdateAvailable(true);

                toast('New version available', {
                  description: 'Click to update to the latest version.',
                  action: {
                    label: 'Update',
                    onClick: handleUpdate,
                  },
                  duration: 10000, // 10 seconds
                });
              }
            });
          });
        });
      });
    } else {
      console.log('Service workers are not supported in this browser.');
    }
  }, []);

  // Component doesn't render anything visible
  return null;
}

export default memo(ServiceWorkerRegistration);
