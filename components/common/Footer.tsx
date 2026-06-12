'use client';

import React from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/lib/types';
import { toast } from 'sonner';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} style={props.style}>
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.48 1.328 5L2 22l5.176-1.357c1.472.803 3.128 1.226 4.836 1.226h.004c5.502 0 9.984-4.483 9.984-9.99 0-2.67-1.04-5.18-2.93-7.07a9.92 9.92 0 0 0-7.062-2.91zm0 1.623c2.235 0 4.337.87 5.92 2.454 1.581 1.583 2.451 3.687 2.451 5.92 0 4.614-3.754 8.368-8.367 8.368a8.31 8.31 0 0 1-4.254-1.164l-.304-.182-3.164.83.843-3.085-.2-.317a8.316 8.316 0 0 1-1.272-4.462c0-4.614 3.754-8.368 8.367-8.368zm-3.567 4.887c-.195 0-.323.015-.494.205-.172.19-.656.64-.656 1.56s.67 1.81.764 1.94c.094.13 1.31 2.002 3.172 2.805.443.19.79.305 1.06.39.447.142.853.122 1.173.074.358-.053 1.1-.45 1.256-.884.156-.434.156-.807.11-.884-.047-.078-.172-.124-.36-.217-.187-.093-1.1-.543-1.27-.605-.172-.062-.297-.093-.422.093-.125.187-.484.605-.593.73-.11.124-.219.14-.406.046-.188-.093-.792-.292-1.508-.93-.558-.497-.934-1.112-1.043-1.3-.11-.186-.012-.287.082-.38.084-.083.187-.218.28-.327.094-.11.126-.187.188-.31.063-.125.03-.234-.015-.328-.047-.094-.422-1.018-.578-1.393-.153-.368-.31-.318-.423-.324-.11-.005-.235-.006-.36-.006z" />
  </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M19 17.5c-1-1.5-1.5-2.5-2-4.5.5-1.5.5-3.5-.5-5.5C15.5 5 13.5 4 12 4s-3.5 1-4.5 3.5c-1 2-1 4-.5 5.5-.5 2-1 3-2 4.5-.5.8-.3 1.5.7 1.5 1.5 0 2.5-.5 3.5-1 .5-.2 1.3-.2 1.8 0 .5.2 1 .5 2 .5s1.5-.3 2-.5c.5-.2 1.3-.2 1.8 0 1 .5 2 1 3.5 1 1 0 1.2-.7.7-1.5z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

import PaymentBadges from './PaymentBadges';

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Social Links Check
  const hasSocialLinks =
    settings.socialFacebook ||
    settings.socialInstagram ||
    settings.socialWhatsapp ||
    settings.socialYoutube ||
    settings.socialTiktok ||
    settings.socialSnapchat ||
    settings.socialTwitter;

  const navigationMenu = settings?.navigationMenu ?? [];

  // Footer toggles with defaults to TRUE
  const showMenu = settings.footerShowMenu ?? true;
  const showSocial = settings.footerShowSocial ?? true;
  const showNewsletter = settings.footerShowNewsletter ?? true;
  const showPayments = settings.footerShowPayments ?? true;

  // Calculate dynamic grid columns
  const showCol3 = showMenu;
  const showCol4 = showNewsletter || (showSocial && hasSocialLinks);
  
  let gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-4";
  const activeCols = 2 + (showCol3 ? 1 : 0) + (showCol4 ? 1 : 0);
  if (activeCols === 2) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 max-w-4xl";
  } else if (activeCols === 3) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  }

  return (
    <footer
      onClick={(e) => {
        if (typeof window !== 'undefined' && window.self !== window.top) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'select_global_tab', subTab: 'footer' }, '*');
        }
      }}
      className={`w-full bg-white dark:bg-[#0f0f1b] border-t border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 select-none transition-colors duration-200 ${
        typeof window !== 'undefined' && window.self !== window.top ? 'cursor-pointer hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Footer Top - Shopify Dynamic Responsive Grid */}
        <div className={`grid gap-8 pb-10 ${gridColsClass}`}>
          
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              {settings.footerCol1Title || 'About Our Store'}
            </h3>
            <div className="space-y-3">
              {settings.tagline && (
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 max-w-sm">
                  {settings.tagline}
                </p>
              )}
              <p className="text-sm font-semibold leading-relaxed max-w-md text-gray-500 dark:text-gray-400">
                {settings.footerText || `Welcome to ${settings.storeName}. We provide premium quality products delivered right to your doorstep. Confirm your orders instantly via WhatsApp.`}
              </p>
              {settings.address && (
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 leading-relaxed">
                  {settings.address}
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Customer Support Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              {settings.footerCol2Title || 'Customer Support'}
            </h3>
            <p className="text-sm font-semibold leading-relaxed whitespace-pre-line text-gray-500 dark:text-gray-400">
              {settings.footerCol2Text || 'Call/WhatsApp: 0328-4114551\nEmail: Totvoguepk@gmail.com\nTimings: 10 AM - 10 PM'}
            </p>
          </div>

          {/* Column 3: Quick Links navigation */}
          {showCol3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                {settings.footerCol3Title || 'Quick Links'}
              </h3>
              {navigationMenu.length > 0 ? (
                <ul className="space-y-2.5 text-sm font-semibold">
                  {navigationMenu.map((item) => (
                    <li key={item.id}>
                      <Link href={item.url} className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2.5 text-sm font-semibold">
                  <li>
                    <Link href="/" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/cart" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
                      Cart
                    </Link>
                  </li>
                  <li>
                    <Link href="/account" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
                      My Account
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Column 4: Newsletter & Connect */}
          {showCol4 && (
            <div className="space-y-4">
              {showNewsletter && (
                <>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    {settings.footerCol4Title || 'Newsletter'}
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-gray-500 dark:text-gray-400">
                    {settings.footerCol4Text || 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.'}
                  </p>
                  
                  {/* Newsletter Subscription Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const emailInput = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
                    if (emailInput && emailInput.value) {
                      toast.success('Thank you for subscribing to our newsletter!');
                      emailInput.value = '';
                    }
                  }} className="mt-3 flex gap-2">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Your email address"
                      className="flex-grow rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-[#16162a]/50 px-3.5 py-2 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a]"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#e94560] px-4 py-2 text-xs font-bold text-white hover:bg-[#d8344f] transition-all cursor-pointer shrink-0"
                    >
                      Subscribe
                    </button>
                  </form>
                </>
              )}

              {/* Social Icons row (including TikTok, Snapchat, Twitter) */}
              {showSocial && hasSocialLinks && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {settings.socialFacebook && (
                    <a
                      href={settings.socialFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
                      title="Facebook"
                    >
                      <FacebookIcon className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {settings.socialInstagram && (
                    <a
                      href={settings.socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
                      title="Instagram"
                    >
                      <InstagramIcon className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {settings.socialTiktok && (
                    <a
                      href={settings.socialTiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
                      title="TikTok"
                    >
                      <TiktokIcon className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {settings.socialSnapchat && (
                    <a
                      href={settings.socialSnapchat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
                      title="Snapchat"
                    >
                      <SnapchatIcon className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {settings.socialTwitter && (
                    <a
                      href={settings.socialTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
                      title="Twitter (X)"
                    >
                      <TwitterIcon className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {settings.socialYoutube && (
                    <a
                      href={settings.socialYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
                      title="YouTube"
                    >
                      <YoutubeIcon className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {settings.socialWhatsapp && (
                    <a
                      href={`https://wa.me/${settings.socialWhatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#10b981] hover:text-white dark:hover:bg-[#10b981] dark:hover:text-white transition-all cursor-pointer"
                      title="WhatsApp"
                    >
                      <WhatsAppIcon className="h-4.5 w-4.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Bottom (Divider & Copyright) */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {settings.footerBottomText ? settings.footerBottomText : `© ${currentYear} ${settings.storeName || 'Zaynahs E-Store'}. All rights reserved.`}
          </p>
          {showPayments && settings.enableTrustBadges && settings.safeCheckoutMethods && settings.safeCheckoutMethods.length > 0 && (
            <PaymentBadges methods={settings.safeCheckoutMethods} className="flex flex-wrap items-center gap-1.5 justify-end" />
          )}
        </div>

      </div>
    </footer>
  );
}
