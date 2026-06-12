import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

import ThemeStyleRegistry from '@/components/common/ThemeStyleRegistry';
import { getSettings } from '@/lib/services/settings';
import Pixels from '@/components/Pixels';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    const title = settings.storeName || "Zaynahs E-Store";
    const suffix = settings.meta_title_suffix || "";
    const description = settings.tagline || "Modern Pakistani E-Commerce — Premium Mobile Shop";
    const fav = settings.faviconUrl || settings.logoUrl || "/favicon.ico";
    return {
      title: {
        default: title + suffix,
        template: `%s${suffix}`
      },
      description: description,
      manifest: "/manifest.json",
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: title,
      },
      icons: {
        icon: fav,
        shortcut: fav,
        apple: settings.logoUrl || fav,
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION || '',
      },
      openGraph: {
        type: 'website',
        title: title + suffix,
        description: description,
        images: [{ url: '/og-default.jpg' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: title + suffix,
        description: description,
        images: ['/og-default.jpg'],
        creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
      }
    };
  } catch (err) {
    return {
      title: "Zaynahs E-Store",
      description: "Modern Pakistani E-Commerce — Premium Mobile Shop",
      manifest: "/manifest.json",
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Zaynahs E-Store",
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION || '',
      }
    };
  }
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${outfit.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        <ThemeStyleRegistry settings={settings} />
      </head>
      <body className={`${jakarta.variable} ${outfit.variable} font-body min-h-full flex flex-col bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100 overflow-x-hidden`}>
        {/* Conditional Script Injection for Tracking Pixels */}
        <Pixels />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors closeButton />
          
          {/* Register Service Worker */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      console.log('SW registered:', reg);
                    }).catch(function(err) {
                      console.log('SW registration failed:', err);
                    });
                  });
                }
              `,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
