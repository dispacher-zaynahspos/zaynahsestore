import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { headers } from 'next/headers';
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
import ChunkErrorListener from '@/components/common/ChunkErrorListener';

const getFaviconType = (url: string) => {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.svg')) return 'image/svg+xml';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  return 'image/x-icon';
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    const headersList = await headers();
    const host = headersList.get('host') || '';
    
    // Automatically derive store name from hostname if host is present
    let derivedName = settings.storeName || "Zaynahs E-Store";
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const parts = host.replace('www.', '').split('.');
      if (parts.length > 0) {
        const namePart = parts[0];
        derivedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        if (namePart.toLowerCase() === 'totvogue') {
          derivedName = 'TotVogue';
        }
        if (parts[1]) {
          derivedName += '.' + parts[1];
        }
      }
    }

    const title = derivedName;
    const suffix = settings.meta_title_suffix || "";
    
    let description = settings.tagline || "Welcome to our store. We provide premium quality products delivered right to your doorstep.";
    if (settings.tagline) {
      if (host.includes('zaynahs')) {
        description = settings.tagline.replace(/TotVogue/gi, "Zaynahs").replace(/totvogue.pk/gi, "zaynahs.pk");
      } else if (host.includes('totvogue')) {
        description = settings.tagline.replace(/Zaynahs/gi, "TotVogue").replace(/zaynahs.pk/gi, "totvogue.pk");
      }
    } else {
      description = `Welcome to ${derivedName}. We provide premium quality products delivered right to your doorstep. Confirm your orders instantly via WhatsApp.`;
    }

    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const siteUrl = `${protocol}://${host || 'zaynahs.pk'}`;

    const timestamp = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();
    const fav = settings.faviconUrl 
      ? `${settings.faviconUrl}?v=${timestamp}` 
      : settings.logoUrl 
        ? `${settings.logoUrl}?v=${timestamp}` 
        : "/favicon.ico";
    return {
      metadataBase: new URL(siteUrl),
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
        icon: [
          {
            url: fav,
            type: getFaviconType(fav),
          }
        ],
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
      className={`${jakarta.variable} ${outfit.variable} h-full antialiased overflow-x-clip`}
    >
      <head>
        <ThemeStyleRegistry settings={settings} />
      </head>
      <body className={`${jakarta.variable} ${outfit.variable} font-body min-h-full flex flex-col bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100 overflow-x-clip`}>
        {/* Conditional Script Injection for Tracking Pixels */}
        <Pixels />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <ChunkErrorListener />
          {children}
          <Toaster 
            position="bottom-center" 
            toastOptions={{
              className: 'dark:bg-[#16162a] dark:text-white dark:border-gray-800 rounded-2xl shadow-lg border border-gray-100 font-semibold',
              style: {
                fontSize: '11px',
                padding: '10px 14px',
                maxWidth: '300px',
                marginBottom: '72px',
              }
            }} 
            closeButton 
          />
          
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for (var i = 0; i < registrations.length; i++) {
                        registrations[i].unregister();
                        console.log('Service Worker unregistered on localhost to prevent stale cache.');
                      }
                    });
                  } else {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').then(function(reg) {
                        console.log('SW registered:', reg);
                      }).catch(function(err) {
                        console.log('SW registration failed:', err);
                      });
                    });
                  }
                }
              `,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
