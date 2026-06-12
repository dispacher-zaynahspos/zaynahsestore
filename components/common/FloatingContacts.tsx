'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';

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

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} style={props.style}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.89 2.22 1.43 3.53 1.52v3.91c-1.39-.08-2.71-.62-3.8-1.52-.39-.33-.74-.72-1.03-1.14v6.86c-.03 1.63-.52 3.23-1.42 4.56-1.12 1.4-2.8 2.28-4.6 2.4-1.84.18-3.71-.38-5.08-1.59-1.54-1.25-2.42-3.19-2.35-5.18.06-1.92.93-3.73 2.37-4.94 1.42-1.29 3.37-1.9 5.28-1.63.15.02.3.05.45.09v3.96c-.19-.04-.38-.07-.58-.07-1.19-.08-2.38.44-3.05 1.42-.64.84-.79 1.99-.41 2.97.38.99 1.34 1.66 2.41 1.68.99.03 1.94-.48 2.4-1.37.28-.46.39-.99.38-1.52V.02z" />
  </svg>
);

const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} style={props.style}>
    <path d="M12 .024c-1.618 0-2.825.297-3.954.912-.962.522-1.745 1.252-2.316 2.148-.564.887-.84 1.954-.84 3.013 0 .399.04.838.12 1.24a.5.5 0 0 1-.225.485c-.628.435-1.146.966-1.522 1.597-.37.62-.563 1.332-.563 2.062 0 .546.12 1.077.346 1.58.196.438.473.81.825 1.11.233.199.346.495.3.793-.166 1.037-.413 2.046-.734 3.023-.053.161.01.335.15.428.825.556 1.83.945 2.875 1.135a.5.5 0 0 1 .403.447c.21 1.246.541 2.386.974 3.327.113.245.353.402.623.402.66 0 1.205-.098 1.67-.282.263-.105.555-.105.818 0 .465.184 1.01.282 1.67.282.27 0 .51-.157.623-.402.433-.941.764-2.081.974-3.327a.5.5 0 0 1 .403-.447c1.045-.19 2.05-.579 2.875-1.135a.5.5 0 0 1 .15-.428c-.32-.977-.568-1.986-.734-3.023a.5.5 0 0 1 .3-.793c.352-.3.63-.672.825-1.11.226-.503.346-1.034.346-1.58 0-.73-.193-1.442-.563-2.062-.376-.631-.894-1.162-1.522-1.597a.5.5 0 0 1-.225-.485c.08-.402.12-.841.12-1.24 0-1.06-.276-2.126-.84-3.013-.57-.896-1.354-1.626-2.316-2.148C14.825.321 13.618.024 12 .024z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} style={props.style}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface FloatingContactsProps {
  settings: StoreSettings;
}

export default function FloatingContacts({ settings }: FloatingContactsProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  // Check global enable toggle
  if (settings.floatingContactsEnabled === false) return null;

  const whatsappNumber = settings.whatsappNumber;
  const instagramUrl = settings.socialInstagram;
  const tiktokUrl = settings.socialTiktok;
  const snapchatUrl = settings.socialSnapchat;
  const twitterUrl = settings.socialTwitter;

  // Format active urls based on enabled config flags
  const whatsappUrl = (settings.floatingWhatsappEnabled !== false && whatsappNumber)
    ? `https://wa.me/${cleanWhatsAppPhone(whatsappNumber)}?text=${encodeURIComponent(settings.floatingWhatsappPreset || "Hello! I am visiting your store and have a question.")}`
    : null;

  const instagramUrlFormatted = (settings.floatingInstagramEnabled !== false && instagramUrl)
    ? (instagramUrl.startsWith('http') ? instagramUrl : `https://instagram.com/${instagramUrl}`)
    : null;

  const tiktokUrlFormatted = (settings.floatingTiktokEnabled && tiktokUrl)
    ? (tiktokUrl.startsWith('http') ? tiktokUrl : `https://tiktok.com/@${tiktokUrl.replace('@', '')}`)
    : null;

  const snapchatUrlFormatted = (settings.floatingSnapchatEnabled && snapchatUrl)
    ? (snapchatUrl.startsWith('http') ? snapchatUrl : `https://snapchat.com/add/${snapchatUrl}`)
    : null;

  const twitterUrlFormatted = (settings.floatingTwitterEnabled && twitterUrl)
    ? (twitterUrl.startsWith('http') ? twitterUrl : `https://x.com/${twitterUrl}`)
    : null;

  // If no buttons are active/configured, hide the widget
  if (!whatsappUrl && !instagramUrlFormatted && !tiktokUrlFormatted && !snapchatUrlFormatted && !twitterUrlFormatted) {
    return null;
  }

  // Calculate dynamic bottom and side offset dimensions based on mobile vs desktop
  const bottomOffset = isMobile 
    ? (settings.floatingContactsBottomMobile ?? 80) 
    : (settings.floatingContactsBottomDesktop ?? 24);
    
  const sideOffset = isMobile 
    ? (settings.floatingContactsSideMobile ?? 16) 
    : (settings.floatingContactsSideDesktop ?? 24);

  const position = settings.floatingContactsPosition || 'left';
  const scale = settings.floatingContactsScale ?? 1.0;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `${bottomOffset}px`,
    [position]: `${sideOffset}px`,
    transform: `scale(${scale})`,
    transformOrigin: position === 'right' ? 'bottom right' : 'bottom left',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'auto'
  };

  return (
    <div style={containerStyle}>
      {/* Instagram Button */}
      {instagramUrlFormatted && (
        <a
          href={instagramUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          title="Instagram Profile"
        >
          <InstagramIcon className="h-5.5 w-5.5" />
        </a>
      )}

      {/* TikTok Button */}
      {tiktokUrlFormatted && (
        <a
          href={tiktokUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border border-gray-800"
          title="TikTok Profile"
        >
          <TikTokIcon className="h-5 w-5" />
        </a>
      )}

      {/* Snapchat Button */}
      {snapchatUrlFormatted && (
        <a
          href={snapchatUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fffc00] text-black shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          title="Snapchat Profile"
        >
          <SnapchatIcon className="h-5.5 w-5.5" />
        </a>
      )}

      {/* Twitter (X) Button */}
      {twitterUrlFormatted && (
        <a
          href={twitterUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border border-gray-800"
          title="Twitter Profile"
        >
          <TwitterIcon className="h-4 w-4" />
        </a>
      )}

      {/* WhatsApp Button */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          title="WhatsApp Chat"
        >
          <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.007a9.86 9.86 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.8.978 3.8 1.492 5.85 1.493h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
