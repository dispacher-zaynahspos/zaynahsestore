'use client';

import React, { useState, useEffect } from 'react';
import { HomepageSection, StoreSettings, Product, Category, Review } from '@/lib/types';
import StoreFront from '@/components/store/StoreFront';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import MobileBottomNav from '@/components/common/MobileBottomNav';
import FloatingContacts from '@/components/common/FloatingContacts';
import CartBar from '@/components/store/CartBar';
import PremiumFeaturesProvider from '@/components/store/PremiumFeaturesProvider';
import ShopPage from '@/components/store/ShopPage';
import ProductDetail from '@/components/store/ProductDetail';
import ProductReviews from '@/components/store/ProductReviews';
import ProductCard from '@/components/store/ProductCard';
import ThemeStyleRegistry from '@/components/common/ThemeStyleRegistry';
import SocialFeedRibbon from '@/components/store/SocialFeedRibbon';

interface PreviewClientProps {
  initialSections: HomepageSection[];
  products: Product[];
  categories: Category[];
  initialSettings: StoreSettings;
  reviews: Review[];
}

export default function PreviewClient({
  initialSections,
  products,
  categories,
  initialSettings,
  reviews
}: PreviewClientProps) {
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [activePage, setActivePage] = useState<'home' | 'shop' | 'product_detail' | 'product_card' | 'global'>('home');
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [activeProductSlug, setActiveProductSlug] = useState<string | null>(null);

  // Client-side real-time calculation of sale prices (matches applyFlashSaleDiscounts on server)
  const liveProducts = React.useMemo(() => {
    if (settings.flash_sale_enabled === false) {
      return productsList;
    }
    const now = Date.now();
    const fsSection = sections.find(s => s.section_type === 'flash_sale' && s.active);
    const isFsActive = fsSection ? (() => {
      const startStr = fsSection.settings?.startTime;
      const endStr = fsSection.settings?.endTime;
      if (!startStr && !endStr) return true;
      const start = startStr ? new Date(startStr).getTime() : 0;
      const end = endStr ? new Date(endStr).getTime() : 0;
      const isStarted = !startStr || start <= now;
      const isEnded = endStr && end < now;
      return isStarted && !isEnded;
    })() : false;

    return productsList.map(product => {
      // 1. Homepage manual products overrides (highest priority)
      if (isFsActive && fsSection) {
        const fsProducts = fsSection.content_data?.products || [];
        const fsProd = fsProducts.find((p: any) => p?.productId === product.id);
        
        if (fsProd) {
          const basePrice = product.comparePrice || product.price;
          const discountPrice = fsProd.discountValue ? parseFloat(fsProd.discountValue.toString()) : product.price;
          
          if (discountPrice < basePrice) {
            const ratio = discountPrice / basePrice;
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.comparePrice || (product.comparePrice ? Math.round(product.comparePrice * (v.price / product.price)) : v.price);
                const newVarPrice = Math.round(varBasePrice * ratio);
                return {
                  ...v,
                  price: newVarPrice,
                  comparePrice: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              comparePrice: basePrice,
              variants: updatedVariants,
              flashSaleEnabled: true,
              flashSaleEndDate: fsSection.settings?.endTime || undefined,
              flashSaleStartDate: fsSection.settings?.startTime || undefined
            };
          }
        }
      }

      // 2. Product-level Sale Settings (medium priority)
      if (product.flashSaleEnabled) {
        const pStartStr = product.flashSaleStartDate;
        const pEndStr = product.flashSaleEndDate;
        const isStarted = !pStartStr || new Date(pStartStr).getTime() <= now;
        const isEnded = pEndStr && new Date(pEndStr).getTime() < now;
        
        if (isStarted && !isEnded) {
          const discountType = product.flashSaleDiscountType || 'fixed';
          const discountVal = product.flashSaleDiscountValue || 0;
          
          const basePrice = product.comparePrice || product.price;
          let discountPrice = product.price;

          if (discountType === 'percentage') {
            discountPrice = Math.round(basePrice * (1 - discountVal / 100));
          } else if (discountType === 'fixed') {
            discountPrice = Math.max(0, basePrice - discountVal);
          }

          if (discountPrice < basePrice) {
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.comparePrice || (product.comparePrice ? Math.round(product.comparePrice * (v.price / product.price)) : v.price);
                let varDiscountPrice = v.price;
                if (discountType === 'percentage') {
                  varDiscountPrice = Math.round(varBasePrice * (1 - discountVal / 100));
                } else if (discountType === 'fixed') {
                  varDiscountPrice = Math.max(0, varBasePrice - discountVal);
                }
                return {
                  ...v,
                  price: varDiscountPrice,
                  comparePrice: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              comparePrice: basePrice,
              variants: updatedVariants,
              flashSaleEnabled: true,
              flashSaleEndDate: product.flashSaleEndDate || undefined,
              flashSaleStartDate: product.flashSaleStartDate || undefined
            };
          }
        }
      }

      // 3. Homepage Category Discounts (lowest priority)
      if (isFsActive && fsSection) {
        const categoryDiscounts = fsSection.content_data?.categoryDiscounts || [];
        const fsCat = categoryDiscounts.find((c: any) => c?.categoryId === product.categoryId);

        if (fsCat) {
          const basePrice = product.comparePrice || product.price;
          const discountVal = parseFloat(fsCat.discountValue) || 0;
          let discountPrice = product.price;

          if (fsCat.discountType === 'percentage') {
            discountPrice = Math.round(basePrice * (1 - discountVal / 100));
          } else if (fsCat.discountType === 'fixed') {
            discountPrice = Math.max(0, basePrice - discountVal);
          }

          if (discountPrice < basePrice) {
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.comparePrice || (product.comparePrice ? Math.round(product.comparePrice * (v.price / product.price)) : v.price);
                let varDiscountPrice = v.price;
                if (fsCat.discountType === 'percentage') {
                  varDiscountPrice = Math.round(varBasePrice * (1 - discountVal / 100));
                } else if (fsCat.discountType === 'fixed') {
                  varDiscountPrice = Math.max(0, varBasePrice - discountVal);
                }
                return {
                  ...v,
                  price: varDiscountPrice,
                  comparePrice: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              comparePrice: basePrice,
              variants: updatedVariants,
              flashSaleEnabled: true,
              flashSaleEndDate: fsSection.settings?.endTime || undefined,
              flashSaleStartDate: fsSection.settings?.startTime || undefined
            };
          }
        }
      }

      return product;
    });
  }, [productsList, sections, settings]);

  const currentProduct = React.useMemo(() => {
    const defaultProduct = liveProducts.find(p => p.active) || liveProducts[0];
    if (!activeProductSlug) return defaultProduct;
    return liveProducts.find(p => p.slug === activeProductSlug) || defaultProduct;
  }, [liveProducts, activeProductSlug]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'sync') {
          if (event.data.sections) {
            setSections(event.data.sections);
          }
          if (event.data.settings) {
            setSettings(event.data.settings);
          }
          if (event.data.products) {
            setProductsList(event.data.products);
          }
          if (event.data.activeProductSlug) {
            setActiveProductSlug(event.data.activeProductSlug);
          }
          if (event.data.activeSectionId) {
            setTimeout(() => {
              const element = document.getElementById(event.data.activeSectionId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
        } else if (event.data.type === 'scroll_to_section') {
          const element = document.getElementById(event.data.sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (event.data.type === 'change_page') {
          setActivePage(event.data.page);
        }
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      let anchor: HTMLAnchorElement | null = null;
      let curr = target;
      while (curr) {
        if (curr.tagName === 'A') {
          anchor = curr as HTMLAnchorElement;
          break;
        }
        curr = curr.parentElement;
      }
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href) {
          const isRelative = href.startsWith('/') && !href.startsWith('//');
          const isSameDomain = href.startsWith(window.location.origin);
          
          if (isRelative || isSameDomain) {
            e.preventDefault();
            e.stopPropagation();
            
            const path = isRelative ? href : href.substring(window.location.origin.length);
            
            let page: 'home' | 'shop' | 'product_detail' | 'global' = 'home';
            if (path.startsWith('/product/')) {
              page = 'product_detail';
              const slug = path.replace('/product/', '').split('?')[0];
              setActiveProductSlug(slug);
            } else if (path.startsWith('/shop') || path === '/shop') {
              page = 'shop';
            } else if (path === '/' || path === '') {
              page = 'home';
            }
            
            setActivePage(page);
            window.parent.postMessage({ type: 'nav_to_page', page, href: path }, '*');
            return;
          }
        }
      }
      
      // Also intercept buttons like "Choose Options" or "Buy Now" that trigger page changes
      let button: HTMLButtonElement | null = null;
      curr = target;
      while (curr) {
        if (curr.tagName === 'BUTTON') {
          button = curr as HTMLButtonElement;
          break;
        }
        curr = curr.parentElement;
      }
      
      if (button) {
        const text = button.textContent?.toLowerCase() || '';
        if (text.includes('choose options') || text.includes('buy now')) {
          let card = button.parentElement;
          while (card && !card.getAttribute('href')) {
            card = card.parentElement;
          }
          if (card) {
            const href = card.getAttribute('href');
            if (href) {
              e.preventDefault();
              e.stopPropagation();
              
              let page: 'home' | 'shop' | 'product_detail' | 'global' = 'home';
              if (href.startsWith('/product/')) {
                page = 'product_detail';
                const slug = href.replace('/product/', '').split('?')[0];
                setActiveProductSlug(slug);
              }
              
              setActivePage(page);
              window.parent.postMessage({ type: 'nav_to_page', page, href }, '*');
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('click', handleLinkClick, true);
    // Notify parent window that preview is loaded and ready
    window.parent.postMessage({ type: 'ready' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100 pb-20 md:pb-0 transition-colors duration-200 overflow-x-hidden w-full">
      <ThemeStyleRegistry settings={settings} />
      <Navbar settings={settings} />
      <main className="flex-grow bg-gray-50 dark:bg-[#0f0f1b] transition-colors duration-200 w-full">
        {(activePage === 'home' || activePage === 'global') && (
          <StoreFront
            initialProducts={liveProducts}
            categories={categories}
            settings={settings}
            reviews={reviews}
            sections={sections}
            isPreview={true}
          />
        )}
        {(activePage === 'shop' || activePage === 'product_card') && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <ShopPage
              initialProducts={liveProducts}
              categories={categories}
              settings={settings}
            />
          </div>
        )}
        {activePage === 'product_detail' && liveProducts.length > 0 && (
          <div className="space-y-10 pb-16 pt-8">
            {(settings.productPageLayout || ['details', 'ticker', 'reviews', 'related', 'recently_viewed', 'social_feed']).map((block) => {
              if (block === 'details') {
                return (
                  <div
                    key="details"
                    id="details"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'swatches' }, '*');
                    }}
                    className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block"
                  >
                    <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Product Details
                    </div>
                    <ProductDetail product={currentProduct} settings={settings} averageRating={{ average: 5, count: 1 }} />
                  </div>
                );
              }
              if (block === 'ticker') {
                if (!settings.enableTicker || !settings.tickerText) return null;
                return (
                  <div
                    key="ticker"
                    id="ticker"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'ticker' }, '*');
                    }}
                    className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block w-full overflow-hidden bg-gray-50 dark:bg-white/5 border-y border-gray-200 dark:border-gray-800 py-3.5 select-none"
                  >
                    <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Scrolling Ticker
                    </div>
                    <style>{`
                      @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                      }
                      .animate-marquee-infinite {
                        display: flex;
                        width: max-content;
                        animation: marquee 30s linear infinite;
                      }
                    `}</style>
                    <div className="animate-marquee-infinite flex items-center whitespace-nowrap gap-8">
                      {[...Array(4)].map((_, loopIdx) => (
                        <div key={loopIdx} className="flex items-center gap-8">
                          {settings.tickerText.split('\n').filter(Boolean).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-8 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                              <span>{item}</span>
                              <span className="text-gray-400 dark:text-gray-600 font-normal">✦</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              if (block === 'reviews') {
                return (
                  <div
                    key="reviews"
                    id="reviews"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'urgency' }, '*');
                    }}
                    className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                  >
                    <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Reviews & FAQ
                    </div>
                    <ProductReviews product={products[0]} reviews={[]} averageRating={{ average: 5, count: 1 }} />
                  </div>
                );
              }
              if (block === 'related') {
                return (
                  <div
                    key="related"
                    id="related"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'delivery' }, '*');
                    }}
                    className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 pt-10"
                  >
                    <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Related Products Grid
                    </div>
                    <div className="text-center md:text-left mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Related Products</h3>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                        You might also like these handpicked recommendations
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {products.slice(0, 4).map(prod => (
                        <ProductCard key={prod.id} product={prod} currencySymbol={settings.currencySymbol} settings={settings} />
                      ))}
                    </div>
                  </div>
                );
              }
              if (block === 'recently_viewed') {
                if (!settings.recently_viewed_limit || settings.recently_viewed_limit === 0) return null;
                return (
                  <div
                    key="recently_viewed"
                    id="recently_viewed"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'recently_viewed' }, '*');
                    }}
                    className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 pt-10"
                  >
                    <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Recently Viewed Products
                    </div>
                    <div className="text-center md:text-left mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Viewed</h3>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                        Products you have recently browsed
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {products.slice(1, 1 + (settings.recently_viewed_limit || 4)).map(prod => (
                        <ProductCard key={prod.id} product={prod} currencySymbol={settings.currencySymbol} settings={settings} />
                      ))}
                    </div>
                  </div>
                );
              }
              if (block === 'social_feed') {
                if (settings.social_feeds_enabled === false) return null;
                if (settings.social_feeds_product_enabled === false) return null;
                return (
                  <div
                    key="social_feed"
                    id="social_feed"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'social_feed' }, '*');
                    }}
                    className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block"
                  >
                    <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Social Feed Ribbon
                    </div>
                    <SocialFeedRibbon settings={settings} />
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </main>
      <Footer settings={settings} />
      <CartBar currencySymbol={settings.currencySymbol} />
      <MobileBottomNav />
      <FloatingContacts settings={settings} />
      <PremiumFeaturesProvider settings={settings} />
    </div>
  );
}
