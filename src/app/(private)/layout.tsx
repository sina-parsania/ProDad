import Sidebar from '@/components/layout/navigation/Sidebar';
import MobileNav from '@/components/layout/navigation/MobileNav';
import Header from '@/components/layout/Header';
import { Toaster } from 'sonner';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ServiceWorkerRegistration />
      <div className="flex flex-1 pt-16">
        <Header />
        <Sidebar />
        <main className="flex-1 pb-18 p-3 md:p-6">{children}</main>
      </div>
      <MobileNav />
      <InstallPrompt />
      <Toaster position="top-right" />
    </>
  );
}
