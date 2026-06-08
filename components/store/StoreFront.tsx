'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Category, StoreSettings, Review, HomepageSection } from '@/lib/types';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import { useSearchStore } from '@/store/searchStore';
import { 
  Truck, Shield, RefreshCw, Phone, HelpCircle, Award, Star, Lock, Clock, Gift, Headphones, Play 
} from '@/components/common/Icons';
import StarRating from './StarRating';
import { format, parseISO } from 'date-fns';

interface StoreFrontProps {
  initialProducts: Product[];
  categories: Category[];
  settings: StoreSettings;
  reviews?: (Review & { productName?: string; productSlug?: string })[];
  sections?: HomepageSection[];
}

export default function StoreFront({
  initialProducts,
  categories,
  settings,
  reviews = [],
  sections = []
}: StoreFrontProps) {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const parsedFeeds = useMemo(() => {
    const items = settings.social_feeds_items;
    if (!items) return [];
    try {
      const arr = typeof items === 'string' ? JSON.parse(items) : items;
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [settings.social_feeds_items]);

  const activeSections = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections.filter(s => s.active);
    }
    // Fallback default sections
    return [
      { id: 'def-hero', section_type: 'hero_banner', title: 'Hero Slider', settings: {}, content_data: {}, sort_order: 1, active: true },
      { id: 'def-cats', section_type: 'category_list', title: 'Shop By Category', settings: {}, content_data: {}, sort_order: 2, active: true },
      { id: 'def-grid', section_type: 'product_grid', title: 'Featured Collection', settings: { limit: 8, columns_desktop: 4, columns_mobile: 2, source: 'all' }, content_data: {}, sort_order: 3, active: true },
      { id: 'def-trust', section_type: 'trust_badges', title: 'Our Guarantees', settings: {}, content_data: {}, sort_order: 4, active: true },
      { id: 'def-revs', section_type: 'recent_reviews', title: 'Customer Feedback', settings: { limit: 3 }, content_data: {}, sort_order: 5, active: true }
    ] as HomepageSection[];
  }, [sections]);

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return initialProducts.filter(product => {
      const matchesCategory = !selectedCategoryId || product.categoryId === selectedCategoryId;
      if (!q) return matchesCategory;

      const matchesSearch = 
        product.name.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) ||
        (product.sku && product.sku.toLowerCase().includes(q)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (product.category?.name && product.category.name.toLowerCase().includes(q)) ||
        (product.variants && product.variants.some(v => 
          v.active && (
            (v.color && v.color.toLowerCase().includes(q)) ||
            (v.size && v.size.toLowerCase().includes(q)) ||
            (v.material && v.material.toLowerCase().includes(q)) ||
            (v.sku && v.sku.toLowerCase().includes(q)) ||
            (v.customValue && v.customValue.toLowerCase().includes(q))
          )
        ));

      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategoryId, searchQuery]);

  // Dynamic Icon selector for trust badges
  const renderBadgeIcon = (iconName: string) => {
    const props = { className: "h-6 w-6 text-[#e94560]" };
    switch (iconName) {
      case 'Truck': return <Truck {...props} />;
      case 'Shield': return <Shield {...props} />;
      case 'RefreshCw': return <RefreshCw {...props} />;
      case 'Phone': return <Phone {...props} />;
      case 'HelpCircle': return <HelpCircle {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Lock': return <Lock {...props} />;
      case 'Clock': return <Clock {...props} />;
      case 'Gift': return <Gift {...props} />;
      case 'Headphones': return <Headphones {...props} />;
      default: return <Truck {...props} />;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarColorClass = (name: string) => {
    const colors = [
      'bg-[#FF8B3D]',
      'bg-[#10b981]',
      'bg-[#3b82f6]',
      'bg-[#8b5cf6]',
      'bg-[#e94560]',
      'bg-[#06b6d4]',
      'bg-[#f59e0b]'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return 'Recently';
    }
  };

  const renderHeroBanner = (section: HomepageSection) => {
    const heightDesktop = section.settings?.height_desktop ?? '450px';
    const heightMobile = section.settings?.height_mobile ?? '250px';
    const opacity = section.settings?.overlay_opacity ?? 0.3;
    const overlayColor = section.settings?.overlay_color ?? '#000000';
    
    // Images
    const desktopBannerUrl = section.content_data?.image_url || settings.bannerUrl;
    const mobileBannerUrl = section.content_data?.mobile_image_url || desktopBannerUrl;
    
    // Content box position (desktop horizontal and vertical)
    const contentPosDesktopX = section.settings?.content_position_desktop_x || section.settings?.content_position_desktop || 'center';
    let containerJustifyDesktop = 'md:justify-center';
    if (contentPosDesktopX === 'left') containerJustifyDesktop = 'md:justify-start';
    if (contentPosDesktopX === 'right') containerJustifyDesktop = 'md:justify-end';

    const contentPosDesktopY = section.settings?.content_position_desktop_y || 'middle';
    let containerAlignDesktop = 'md:items-center';
    if (contentPosDesktopY === 'top') containerAlignDesktop = 'md:items-start';
    if (contentPosDesktopY === 'bottom') containerAlignDesktop = 'md:items-end';

    // Content box position (mobile horizontal and vertical)
    const contentPosMobileX = section.settings?.content_position_mobile_x || 'center';
    let containerJustifyMobile = 'justify-center';
    if (contentPosMobileX === 'left') containerJustifyMobile = 'justify-start';
    if (contentPosMobileX === 'right') containerJustifyMobile = 'justify-end';

    const contentPosMobileY = section.settings?.content_position_mobile_y || 'middle';
    let containerAlignMobile = 'items-center';
    if (contentPosMobileY === 'top') containerAlignMobile = 'items-start';
    if (contentPosMobileY === 'bottom') containerAlignMobile = 'items-end';

    // Desktop text align
    const textAlignDesktop = section.settings?.text_align_desktop || 'center';
    let textColAlignDesktop = 'md:text-center md:items-center';
    if (textAlignDesktop === 'left') textColAlignDesktop = 'md:text-left md:items-start';
    if (textAlignDesktop === 'right') textColAlignDesktop = 'md:text-right md:items-end';

    // Mobile text align
    const textAlignMobile = section.settings?.text_align_mobile || 'center';
    let textColAlignMobile = 'text-center items-center';
    if (textAlignMobile === 'left') textColAlignMobile = 'text-left items-start';
    if (textAlignMobile === 'right') textColAlignMobile = 'text-right items-end';

    // Glass backdrop container styling on desktop
    const showBackdrop = section.settings?.show_backdrop_container ?? false;
    const backdropClass = showBackdrop 
      ? 'md:backdrop-blur-md md:bg-black/35 md:border md:border-white/10 md:p-8 md:rounded-2xl shadow-xl' 
      : 'md:bg-transparent md:border-none md:p-0';

    // Image Scaling and Focal Points
    const imageScaleDesktop = section.settings?.image_scale_desktop ?? 100;
    const imageFocalXDesktop = section.settings?.image_focal_x_desktop ?? 50;
    const imageFocalYDesktop = section.settings?.image_focal_y_desktop ?? 50;

    const imageScaleMobile = section.settings?.image_scale_mobile ?? 100;
    const imageFocalXMobile = section.settings?.image_focal_x_mobile ?? 50;
    const imageFocalYMobile = section.settings?.image_focal_y_mobile ?? 50;

    // Content box widths
    const contentWidthDesktop = section.settings?.content_width_desktop || '576px';
    const contentWidthMobile = section.settings?.content_width_mobile || '100%';

    // Supertitle / Tagline
    const taglineText = section.content_data?.tagline || settings.tagline;
    const taglineColor = section.settings?.tagline_color || '#ffffff';

    // Heading custom sizes and colors
    const headingSizeDesktop = section.settings?.heading_size_desktop || '5xl';
    const headingSizeMobile = section.settings?.heading_size_mobile || '2xl';
    
    let headingDesktopClass = 'md:text-5xl';
    if (headingSizeDesktop === '2xl') headingDesktopClass = 'md:text-2xl';
    if (headingSizeDesktop === '3xl') headingDesktopClass = 'md:text-3xl';
    if (headingSizeDesktop === '4xl') headingDesktopClass = 'md:text-4xl';
    if (headingSizeDesktop === '6xl') headingDesktopClass = 'md:text-6xl';

    let headingMobileClass = 'text-2xl';
    if (headingSizeMobile === 'lg') headingMobileClass = 'text-lg';
    if (headingSizeMobile === 'xl') headingMobileClass = 'text-xl';
    if (headingSizeMobile === '3xl') headingMobileClass = 'text-3xl';

    const headingColor = section.settings?.heading_color || '#ffffff';

    // Subtitle
    const subtitleColor = section.settings?.subtitle_color || '#e0e0e0';

    // Buttons
    const primaryButtonText = section.content_data?.button_text || '';
    const primaryButtonLink = section.content_data?.button_link || '/shop';
    const primaryButtonBg = section.settings?.btn_bg_color || '#e94560';
    const primaryButtonTextColor = section.settings?.btn_text_color || '#ffffff';

    const secondaryButtonText = section.content_data?.button_secondary_text || '';
    const secondaryButtonLink = section.content_data?.button_secondary_link || '';
    const secondaryButtonBg = section.settings?.sec_btn_bg_color || 'transparent';
    const secondaryButtonTextColor = section.settings?.sec_btn_text_color || '#ffffff';

    return (
      <div 
        key={section.id} 
        style={{ 
          height: heightMobile,
          '--height-desktop': heightDesktop,
          '--height-mobile': heightMobile
        } as React.CSSProperties}
        className="relative md:h-[var(--height-desktop)] w-full bg-[#1a1a2e] overflow-hidden"
      >
        {desktopBannerUrl ? (
          <>
            {/* Desktop Image */}
            <div className="absolute inset-0 hidden md:block overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={desktopBannerUrl}
                alt={section.title || settings.storeName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${imageFocalXDesktop}% ${imageFocalYDesktop}%`,
                  transform: `scale(${imageScaleDesktop / 100})`,
                  transformOrigin: `${imageFocalXDesktop}% ${imageFocalYDesktop}%`,
                  transition: 'transform 0.3s ease, transform-origin 0.3s ease, object-position 0.3s ease'
                }}
              />
            </div>
            {/* Mobile Image */}
            <div className="absolute inset-0 block md:hidden overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mobileBannerUrl}
                alt={section.title || settings.storeName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${imageFocalXMobile}% ${imageFocalYMobile}%`,
                  transform: `scale(${imageScaleMobile / 100})`,
                  transformOrigin: `${imageFocalXMobile}% ${imageFocalYMobile}%`,
                  transition: 'transform 0.3s ease, transform-origin 0.3s ease, object-position 0.3s ease'
                }}
              />
            </div>
            <div 
              className="absolute inset-0 transition-colors duration-300" 
              style={{ backgroundColor: overlayColor, opacity }} 
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] to-[#e94560]" />
        )}
        
        {/* Banner content layout container */}
        <div className={`absolute inset-0 flex p-6 md:p-16 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent ${containerJustifyMobile} ${containerAlignMobile} ${containerJustifyDesktop} ${containerAlignDesktop}`}>
          <div 
            style={{
              '--content-width-desktop': contentWidthDesktop,
              '--content-width-mobile': contentWidthMobile
            } as React.CSSProperties}
            className={`flex flex-col w-[var(--content-width-mobile)] md:w-[var(--content-width-desktop)] max-w-full transition-all duration-300 ${textColAlignMobile} ${textColAlignDesktop} ${backdropClass}`}
          >
            
            {taglineText && (
              <p 
                style={{ color: taglineColor }}
                className="text-xs font-extrabold uppercase tracking-widest mb-2"
              >
                {taglineText}
              </p>
            )}
            
            <h1 
              style={{ color: headingColor }}
              className={`font-black tracking-tight font-serif leading-tight ${headingMobileClass} ${headingDesktopClass}`}
            >
              {section.title || settings.storeName}
            </h1>
            
            {section.content_data?.subtitle && (
              <p 
                style={{ color: subtitleColor }}
                className="text-xs sm:text-sm mt-3 font-medium opacity-90 leading-relaxed"
              >
                {section.content_data.subtitle}
              </p>
            )}
            
            {/* CTA Buttons */}
            {(primaryButtonText || secondaryButtonText) && (
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                {primaryButtonText && (
                  <Link 
                    href={primaryButtonLink}
                    style={{ backgroundColor: primaryButtonBg, color: primaryButtonTextColor }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {primaryButtonText}
                  </Link>
                )}
                {secondaryButtonText && (
                  <Link 
                    href={secondaryButtonLink}
                    style={{ 
                      backgroundColor: secondaryButtonBg, 
                      color: secondaryButtonTextColor,
                      borderColor: secondaryButtonBg === 'transparent' ? secondaryButtonTextColor : 'transparent'
                    }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl border transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {secondaryButtonText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryList = (section: HomepageSection) => {
    return (
      <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        {section.title && (
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3 text-center md:text-left">
            {section.title}
          </h3>
        )}
        {settings.enableCategoryFilter && (
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        )}
      </div>
    );
  };

  const renderProductGrid = (section: HomepageSection) => {
    const limit = section.settings?.limit ?? 8;
    const source = section.settings?.source ?? 'all';
    
    // Filter display products dynamically based on source setting
    const displayProducts = (() => {
      let prodList = filteredProducts;
      if (selectedCategoryId) {
        prodList = prodList.filter(p => p.categoryId === selectedCategoryId);
      } else if (source === 'featured') {
        prodList = prodList.filter(p => p.isFeatured);
      } else if (source !== 'all' && source !== 'featured') {
        prodList = prodList.filter(p => p.categoryId === source || p.category?.slug === source);
      }
      return prodList.slice(0, limit);
    })();

    return (
      <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {section.title && !selectedCategoryId && (
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-6">
            <h2 className="text-base font-black uppercase tracking-wider text-gray-900 dark:text-white">
              {section.title}
            </h2>
            <Link href="/shop" className="text-xs font-bold text-[#e94560] hover:underline">
              View All
            </Link>
          </div>
        )}
        <ProductGrid 
          products={displayProducts} 
          currencySymbol={settings.currencySymbol} 
          settings={settings} 
        />
      </div>
    );
  };

  const renderTrustBadges = (section: HomepageSection) => {
    const badge1Active = settings.trustBadge1Enabled && (settings.trustBadge1Title || settings.trustBadge1Desc);
    const badge2Active = settings.trustBadge2Enabled && (settings.trustBadge2Title || settings.trustBadge2Desc);
    const badge3Active = settings.trustBadge3Enabled && (settings.trustBadge3Title || settings.trustBadge3Desc);
    const badge4Active = settings.trustBadge4Enabled && (settings.trustBadge4Title || settings.trustBadge4Desc);
    
    const activeCount = [badge1Active, badge2Active, badge3Active, badge4Active].filter(Boolean).length;
    if (activeCount === 0) return null;

    let gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    let maxContainerClass = "";
    if (activeCount === 1) {
      gridColsClass = "grid-cols-1";
      maxContainerClass = "max-w-md mx-auto";
    } else if (activeCount === 2) {
      gridColsClass = "grid-cols-1 sm:grid-cols-2";
      maxContainerClass = "max-w-2xl mx-auto";
    } else if (activeCount === 3) {
      gridColsClass = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3";
      maxContainerClass = "max-w-5xl mx-auto";
    }

    return (
      <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100 dark:border-gray-800">
        <div className={`grid gap-6 ${gridColsClass} ${maxContainerClass}`}>
          {badge1Active && (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
                {renderBadgeIcon(settings.trustBadge1Icon || 'Truck')}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge1Title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge1Desc}</p>
              </div>
            </div>
          )}
          {badge2Active && (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
                {renderBadgeIcon(settings.trustBadge2Icon || 'Shield')}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge2Title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge2Desc}</p>
              </div>
            </div>
          )}
          {badge3Active && (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-250 dark:border-gray-800 shadow-sm">
              <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
                {renderBadgeIcon(settings.trustBadge3Icon || 'RefreshCw')}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge3Title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge3Desc}</p>
              </div>
            </div>
          )}
          {badge4Active && (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-250 dark:border-gray-800 shadow-sm">
              <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
                {renderBadgeIcon(settings.trustBadge4Icon || 'Phone')}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge4Title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge4Desc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecentReviews = (section: HomepageSection) => {
    if (!reviews || reviews.length === 0) return null;
    const limit = section.settings?.limit ?? 3;
    const displayReviews = reviews.slice(0, limit);

    return (
      <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white">
            {section.title || 'What Our Customers Say'}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-sm">
            <span>★★★★★</span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Happy customer reviews</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review) => (
            <div
              key={review.id}
              className="flex gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] shadow-sm text-gray-900 dark:text-white"
            >
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm ${getAvatarColorClass(review.customerName)}`}>
                {getInitials(review.customerName)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <StarRating rating={review.rating} showText={false} starSize={12} />
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-gray-950 dark:text-white">
                    {review.customerName}
                  </span>
                  <div className="flex items-center gap-0.5 text-[9px] font-bold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-full">
                    <span>✓ Verified Buyer</span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                    "{review.comment}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPromoBanner = (section: HomepageSection) => {
    const bg = section.settings?.bg_color || '#e94560';
    const text = section.settings?.text_color || '#ffffff';
    const link = section.content_data?.link || '/shop';

    return (
      <div 
        key={section.id} 
        style={{ backgroundColor: bg, color: text }}
        className="w-full py-12 px-6 text-center space-y-4"
      >
        <h2 className="text-2xl font-black uppercase tracking-wider">{section.title || 'Special Promotion!'}</h2>
        {section.content_data?.text && (
          <p className="text-sm max-w-xl mx-auto opacity-95 leading-relaxed">{section.content_data.text}</p>
        )}
        <div className="pt-2">
          <Link
            href={link}
            className="px-6 py-2.5 bg-white text-gray-950 hover:bg-gray-100 text-xs font-bold uppercase rounded-xl transition-all shadow-md active:scale-95 inline-block cursor-pointer"
          >
            {section.content_data?.button_text || 'Shop Offer'}
          </Link>
        </div>
      </div>
    );
  };

  const renderBrandsLogos = (section: HomepageSection) => {
    const logos = section.content_data?.logos || [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=120&auto=format&fit=crop&q=60'
    ];

    return (
      <div key={section.id} className="w-full py-8 bg-gray-50 dark:bg-white/5 border-y border-gray-150 dark:border-gray-800/80 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 text-center mb-4">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {section.title || 'Our Premium Partners'}
          </span>
        </div>
        <div className="flex items-center justify-center gap-12 flex-wrap opacity-65 grayscale hover:opacity-100 transition-opacity">
          {logos.map((logoUrl: string, idx: number) => (
            <div key={idx} className="relative w-24 h-12">
              <Image
                src={logoUrl}
                alt="Brand logo Partner"
                fill
                sizes="96px"
                className="object-contain animate-fade-in"
                unoptimized={true}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCategoryGrid = (section: HomepageSection) => {
    const items = section.content_data?.items || [];
    
    // Premium placeholder categories matching reference
    const defaultItems = [
      { title: 'New Arrivals', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80' },
      { title: 'Trending Now', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80' },
      { title: 'Premium Collection', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80' },
      { title: 'Accessories', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&auto=format&fit=crop&q=80' }
    ];

    const displayItems = items.length > 0 
      ? items.filter((item: any) => item && item.imageUrl) 
      : defaultItems;

    // Use responsive columns based on length to maintain grid nicely
    let gridCols = "grid-cols-2 md:grid-cols-4";
    if (displayItems.length === 1) gridCols = "grid-cols-1 md:grid-cols-1 max-w-md mx-auto";
    else if (displayItems.length === 2) gridCols = "grid-cols-2 md:grid-cols-2 max-w-2xl mx-auto";
    else if (displayItems.length === 3) gridCols = "grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto";
    else if (displayItems.length > 4) gridCols = "grid-cols-2 md:grid-cols-4 lg:grid-cols-5";

    return (
      <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {section.title && (
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-6">
            <h2 className="text-base font-black uppercase tracking-wider text-gray-900 dark:text-white">
              {section.title}
            </h2>
          </div>
        )}
        <div className={`grid gap-4 ${gridCols}`}>
          {displayItems.map((item: any, idx: number) => (
            <Link 
              key={idx} 
              href={item.link || '/shop'}
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer bg-gray-100 dark:bg-gray-900"
            >
              <Image
                src={item.imageUrl}
                alt={item.title || 'Category'}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
              
              {/* Capsule label floating bottom-left */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-white text-[#1a1a2e] px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-md transform transition-all group-hover:translate-x-1 duration-300">
                {item.title || 'Explore'}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderSocialFeed = (section: HomepageSection) => {
    if (settings.social_feeds_homepage_enabled === false) return null;
    
    return (
      <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center space-y-2 mb-8">
          <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">
            {section.content_data?.subtitle || settings.social_feeds_subtitle || '#ZAYNAHSVOGUE'}
          </span>
          <h2 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white">
            {section.title || settings.social_feeds_title || 'Follow Us On Social Media'}
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 max-w-sm mx-auto font-semibold">
            {section.content_data?.desc || settings.social_feeds_desc || 'Tag us in your post to get featured on our page'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(parsedFeeds.length > 0 ? parsedFeeds : [
            { id: 'v1', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=70', link: '#', username: 'buyer1', caption: 'Stunning piece!' },
            { id: 'v2', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=70', link: '#', username: 'buyer2', caption: 'Obsessed with the quality.' },
            { id: 'v3', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=70', link: '#', username: 'buyer3', caption: 'Super fast shipping!' },
            { id: 'v4', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=70', link: '#', username: 'buyer4', caption: 'Highly recommended.' }
          ]).slice(0, section.settings?.limit || 8).map((feed, idx) => (
            <a
              key={feed.id || idx}
              href={feed.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-[9/16] bg-gray-150 dark:bg-gray-800 rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-855 block cursor-pointer"
            >
              <Image
                src={feed.imageUrl}
                alt={feed.caption || `Social post by @${feed.username}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/40 shadow self-end">
                  <Play className="w-3.5 h-3.5 text-white fill-current translate-x-0.5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white">@{feed.username}</p>
                  {feed.caption && <p className="text-[9px] text-gray-250 line-clamp-2 mt-0.5 leading-tight">{feed.caption}</p>}
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2.5 py-1 rounded-full group-hover:opacity-0 transition-opacity">
                @{feed.username}
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  // If there is an active search query, bypass the section customization view
  if (searchQuery) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Search Results for: <span className="text-[#e94560]">"{searchQuery}"</span> ({filteredProducts.length} items)
        </h2>
        <ProductGrid products={filteredProducts} currencySymbol={settings.currencySymbol} settings={settings} />
      </div>
    );
  }

  return (
    <div className="pb-12 min-h-screen bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100 transition-colors duration-200 space-y-6">
      {activeSections.map((section) => {
        switch (section.section_type) {
          case 'hero_banner':
            return renderHeroBanner(section);
          case 'category_list':
            return renderCategoryList(section);
          case 'product_grid':
            return renderProductGrid(section);
          case 'category_grid':
            return renderCategoryGrid(section);
          case 'trust_badges':
            return renderTrustBadges(section);
          case 'recent_reviews':
            return renderRecentReviews(section);
          case 'promo_banner':
            return renderPromoBanner(section);
          case 'brands_logos':
            return renderBrandsLogos(section);
          case 'social_feed':
            return renderSocialFeed(section);
          default:
            return null;
        }
      })}

    </div>
  );
}
