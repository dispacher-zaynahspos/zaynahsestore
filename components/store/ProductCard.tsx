'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from '@/components/common/Icons';
import { Product, StoreSettings } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils/whatsapp';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
  settings?: StoreSettings | null;
}

export default function ProductCard({ product, currencySymbol = 'Rs.', settings }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const primaryImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=60';

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [selectedSwatchImage, setSelectedSwatchImage] = useState<string | null>(null);
  const [touchActive, setTouchActive] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Settings properties
  const cardStyle = settings?.card_style || 'style1';
  const showStars = settings?.card_show_stars !== false;
  const showWishlist = settings?.card_show_wishlist !== false;
  const showQuickview = settings?.card_show_quickview !== false;
  const showQuickcart = settings?.card_show_quickcart !== false;
  const cardAlignment = settings?.card_alignment || 'left';
  const elementsOrder = settings?.card_elements_order || ['title', 'rating', 'price', 'swatches'];

  // Flash sale state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (cardStyle !== 'style5') return;
    const targetTime = product.flashSaleEndDate 
      ? new Date(product.flashSaleEndDate).getTime()
      : new Date().setHours(23, 59, 59, 999); // Midnight tonight

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [product.flashSaleEndDate, cardStyle]);

  useEffect(() => {
    const checkWishlist = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.includes(product.id));
    };
    checkWishlist();
    window.addEventListener('wishlist-updated', checkWishlist);
    return () => {
      window.removeEventListener('wishlist-updated', checkWishlist);
    };
  }, [product.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newWishlist;
    if (isInWishlist) {
      newWishlist = wishlist.filter((id: string) => id !== product.id);
      toast.success('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, product.id];
      toast.success('Added to wishlist');
    }
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const activeVariants = product.variants.filter(v => v.active);
  const defaultIndex = (settings?.defaultVariantIndex || 1) - 1;
  const defaultVar = activeVariants[defaultIndex] || activeVariants[0];

  const initialImage = (defaultVar && defaultVar.imageUrl) || primaryImage;
  const initialPrice = (defaultVar && defaultVar.price) ? defaultVar.price : product.price;
  const initialComparePrice = (defaultVar && defaultVar.comparePrice) ? defaultVar.comparePrice : product.comparePrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasVariants) {
      setQuickViewOpen(true);
      return;
    }
    addItem(product, undefined, [], 1);
    toast.success(`${product.name} added to cart!`);
  };

  const showSwatches = settings?.enableVariantSwatches ?? true;
  const swatchShape = settings?.swatchShape ?? 'circle';
  const archiveSwatchSize = settings?.archiveSwatchSize ?? settings?.swatchSize ?? 'md';
  const swatchSizeClass = 
    archiveSwatchSize === 'sm' ? 'h-4 w-4' : 
    archiveSwatchSize === 'lg' ? 'h-6 w-6' : 
    archiveSwatchSize === 'xl' ? 'h-7 w-7' :
    archiveSwatchSize === 'xxl' ? 'h-8 w-8' :
    'h-5 w-5';
  const shapeClass = swatchShape === 'circle' ? 'rounded-full' : 'rounded-sm';

  const colorVariants = product.variants
    .filter(v => v.color && v.active)
    .reduce<typeof product.variants>((acc, v) => {
      const exists = acc.find(e => e.color === v.color);
      if (!exists) acc.push(v);
      return acc;
    }, []);

  const getAspectClass = (ratio?: string) => {
    switch (ratio) {
      case '3:4': return 'aspect-[3/4]';
      case '4:3': return 'aspect-[4/3]';
      case '16:9': return 'aspect-[16/9]';
      case 'auto': return 'aspect-auto';
      case '1:1':
      default:
        return 'aspect-square';
    }
  };

  const getTitleClampClass = (limit?: string) => {
    switch (limit) {
      case '1': return 'line-clamp-1 min-h-[20px]';
      case 'none': return 'line-clamp-none';
      case '2':
      default:
        return 'line-clamp-2 min-h-[40px]';
    }
  };

  const aspectClass = getAspectClass(settings?.imageAspectRatio);
  const titleClampClass = getTitleClampClass(settings?.titleLineLimit);

  const hasSecondImage = settings?.imageHoverStyle === 'second_image' && product.images.length > 1;
  const secondImage = hasSecondImage ? (product.images.find(img => !img.isPrimary)?.url || product.images[1]?.url) : null;

  const alignClass = cardAlignment === 'center' ? 'items-center text-center' :
                     cardAlignment === 'right' ? 'items-end text-right' :
                     'items-start text-left';

  const swatchAlign = cardAlignment === 'center' ? 'justify-center' :
                      cardAlignment === 'right' ? 'justify-end' :
                      'justify-start';

  const renderElement = (element: string) => {
    switch (element) {
      case 'title':
        return (
          <h4 
            key="title" 
            className={`font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#e94560] transition-colors ${titleClampClass} ${
              cardStyle === 'style4' ? 'font-serif uppercase tracking-widest text-[10px] !min-h-0' : ''
            }`}
          >
            {product.name}
          </h4>
        );
      case 'rating':
        if (!showStars) return null;
        return (
          <div key="rating" className="mt-1 flex items-center gap-0.5 text-xs text-amber-400">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg
                key={idx}
                className={`h-3.5 w-3.5 ${
                  idx < Math.round(product.rating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold ml-1">
              ({product.reviewsCount || 0})
            </span>
          </div>
        );
      case 'price':
        return (
          <div key="price" className="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-[#1a1a2e] dark:text-white">
              {formatPrice(initialPrice, currencySymbol)}
            </span>
            {initialComparePrice && initialComparePrice > initialPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(initialComparePrice, currencySymbol)}
              </span>
            )}
          </div>
        );
      case 'swatches':
        if (!showSwatches || (product.showSwatchesOnArchive === false) || colorVariants.length === 0) return null;
        return (
          <div key="swatches" className={`mt-2.5 mb-3 flex items-center gap-1.5 flex-wrap ${swatchAlign}`}>
            {colorVariants.slice(0, settings?.swatchLimit ?? 8).map((v, i) => {
              const bg = v.colorHex ? v.colorHex : undefined;
              return (
                <button
                  key={i}
                  type="button"
                  title={v.color}
                  onMouseEnter={() => v.imageUrl ? setHoveredImage(v.imageUrl) : null}
                  onMouseLeave={() => setHoveredImage(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (v.imageUrl) setSelectedSwatchImage(v.imageUrl);
                  }}
                  className={`
                    ${swatchSizeClass} ${shapeClass}
                    border-2 transition-all duration-150 cursor-pointer flex-shrink-0 overflow-hidden
                    shadow ring-1
                    ${selectedSwatchImage === v.imageUrl
                      ? 'border-[#e94560] ring-[#e94560]/40 scale-110'
                      : 'border-white dark:border-gray-800 ring-gray-200 dark:ring-gray-700 hover:ring-[#e94560] hover:scale-110'
                    }
                  `}
                  style={{ background: bg || '#e5e7eb' }}
                >
                  {v.imageUrl && !v.colorHex && (
                    <img
                      src={v.imageUrl}
                      alt={v.color || ''}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
            {colorVariants.length > (settings?.swatchLimit ?? 8) && (
              <span className="text-[10px] text-gray-400 font-semibold">+{colorVariants.length - (settings?.swatchLimit ?? 8)}</span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Wrapper styling class based on style selection
  const wrapperClass = cardStyle === 'style4'
    ? "group flex flex-col overflow-hidden bg-transparent border-none shadow-none transition-all duration-300"
    : "group flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-sm hover:shadow-md transition-all duration-300";

  return (
    <>
      <Link 
        href={`/product/${product.slug}`} 
        onTouchStart={() => setTouchActive(true)}
        onTouchEnd={() => setTouchActive(false)}
        onTouchCancel={() => setTouchActive(false)}
        className={wrapperClass}
      >
        {/* Product Image Wrapper */}
        <div className={`relative ${aspectClass} w-full overflow-hidden bg-gray-50`}>
          {/* Show swatch-selected image > hover image > initial image */}
          {(selectedSwatchImage || hoveredImage) ? (
            <Image
              src={selectedSwatchImage || hoveredImage!}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-all duration-300"
              priority={false}
              unoptimized={true}
            />
          ) : (
            <>
              <Image
                src={initialImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={`object-cover transition-all duration-500 ${
                  settings?.imageHoverStyle === 'zoom' ? (touchActive ? 'scale-105' : 'group-hover:scale-105 group-active:scale-105') : ''
                } ${
                  secondImage ? (touchActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0 group-active:opacity-0') : ''
                }`}
                priority={false}
                unoptimized={true}
              />
              {secondImage && (
                <Image
                  src={secondImage}
                  alt={`${product.name} alternate`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`object-cover absolute inset-0 transition-opacity duration-500 ${
                    touchActive ? 'opacity-100' : 'opacity-0'
                  } group-hover:opacity-100 group-active:opacity-100`}
                  priority={false}
                  unoptimized={true}
                />
              )}
            </>
          )}

          {/* Badge Overlays */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 items-start pointer-events-none">
            {initialComparePrice && initialComparePrice > initialPrice && (
              <span className="rounded-md bg-[#e94560] px-2 py-0.5 text-[9px] font-extrabold text-white shadow-sm uppercase tracking-wide">
                -{Math.round(((initialComparePrice - initialPrice) / initialComparePrice) * 100)}%
              </span>
            )}
            {product.isFeatured && (
              <span className="rounded-md bg-[#10b981] px-2 py-0.5 text-[9px] font-extrabold text-white shadow-sm uppercase tracking-wide">
                FEATURED
              </span>
            )}
            {product.badgeEnabled && product.customBadge && (
              <span
                className="rounded-md px-2 py-0.5 text-[9px] font-extrabold text-white shadow-sm uppercase tracking-wide"
                style={{
                  backgroundColor: product.customBadge.bgColor,
                  color: product.customBadge.textColor
                }}
              >
                {product.customBadge.name}
              </span>
            )}
          </div>

          {/* OVERLAY ACTIONS BASED ON ACTIVE STYLE TEMPLATE */}

          {/* Style 1: Current Style (Floating Round Buttons on Hover) */}
          {(cardStyle === 'style1' || cardStyle === 'style5') && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100">
              {showWishlist && (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white dark:bg-[#16162a] shadow-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-[#e94560] dark:hover:text-[#e94560] transition-all cursor-pointer active:scale-90"
                  title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-4.5 w-4.5 ${isInWishlist ? 'fill-red-500 text-red-500 border-none' : ''}`} />
                </button>
              )}

              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewOpen(true);
                  }}
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white dark:bg-[#16162a] shadow-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-[#e94560] dark:hover:text-[#e94560] transition-all cursor-pointer active:scale-90"
                  title="Quick View"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
              )}

              {showQuickcart && (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white dark:bg-[#16162a] shadow-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-[#e94560] dark:hover:text-[#e94560] transition-all cursor-pointer active:scale-90"
                  title={product.hasVariants ? "Choose Options" : "Add to Cart"}
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          )}

          {/* Style 2: Bottom action bar overlay */}
          {cardStyle === 'style2' && (
            <>
              {showWishlist && (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#16162a] shadow-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#e94560] transition-all cursor-pointer active:scale-90"
                  title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-4.5 w-4.5 ${isInWishlist ? 'fill-red-500 text-red-500 border-none' : ''}`} />
                </button>
              )}

              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewOpen(true);
                  }}
                  className={`absolute top-2 ${showWishlist ? 'right-11' : 'right-2'} z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#16162a] shadow-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#e94560] transition-all cursor-pointer active:scale-90`}
                  title="Quick View"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
              )}

              {showQuickcart && (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="absolute bottom-0 left-0 right-0 z-20 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-y-3 md:translate-y-2 md:group-hover:translate-y-0 cursor-pointer border-none"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {product.hasVariants ? "Choose Options" : "Add to Cart"}
                </button>
              )}
            </>
          )}

          {/* Style 3: Minimal Layout Image Buttons */}
          {cardStyle === 'style3' && (
            <>
              {showWishlist && (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-[#16162a]/80 backdrop-blur-xs shadow-sm text-gray-700 dark:text-gray-300 hover:text-[#e94560] transition-colors cursor-pointer"
                  title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-4.5 w-4.5 ${isInWishlist ? 'fill-red-500 text-red-500 border-none' : ''}`} />
                </button>
              )}

              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewOpen(true);
                  }}
                  className={`absolute top-2 ${showWishlist ? 'right-11' : 'right-2'} z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-[#16162a]/80 backdrop-blur-xs shadow-sm text-gray-700 dark:text-gray-300 hover:text-[#e94560] transition-colors cursor-pointer`}
                  title="Quick View"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          {/* Style 4: Zara Magazine/Editorial Layout Image Buttons */}
          {cardStyle === 'style4' && (
            <>
              {showWishlist && (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="absolute top-2.5 right-2.5 z-20 text-gray-500 dark:text-gray-400 hover:text-[#e94560] transition-colors cursor-pointer"
                  title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500 border-none' : ''}`} />
                </button>
              )}

              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewOpen(true);
                  }}
                  className="absolute top-2.5 left-2.5 z-20 text-gray-500 dark:text-gray-400 hover:text-[#e94560] transition-colors cursor-pointer"
                  title="Quick View"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
              )}
            </>
          )}

          {/* Style 5 Flash Sale Countdown Timer Overlay */}
          {cardStyle === 'style5' && (
            <div className="absolute bottom-0 left-0 right-0 bg-[#e94560]/95 backdrop-blur-xs text-white text-[10px] py-1.5 px-3 flex items-center justify-between font-bold z-10">
              <span className="uppercase tracking-wider text-[8px]">Sale Ends In:</span>
              <span className="font-mono text-[10px] tracking-wider">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>

        {/* Product Info details block */}
        <div className={`flex flex-grow flex-col p-3.5 ${alignClass}`}>
          {elementsOrder.map(element => renderElement(element))}

          {/* Style 5 Sold Stock Progress Bar */}
          {cardStyle === 'style5' && (
            <div className="mt-3 space-y-1.5 w-full">
              <div className="flex items-center justify-between text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                <span>Sold: {Math.max(30, (product.id.charCodeAt(0) % 40) + 45)}%</span>
                <span className="text-[#e94560]">Only {Math.max(2, 20 - Math.round((Math.max(30, (product.id.charCodeAt(0) % 40) + 45)) / 5))} Left!</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#e94560] h-full rounded-full" 
                  style={{ width: `${Math.max(30, (product.id.charCodeAt(0) % 40) + 45)}%` }}
                />
              </div>
            </div>
          )}

          {/* Style 3 Quick Add to Cart button */}
          {cardStyle === 'style3' && showQuickcart && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-3.5 w-full py-2 bg-[#1a1a2e] dark:bg-white/5 hover:bg-[#e94560] dark:hover:bg-[#e94560] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer border-none"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {product.hasVariants ? "Choose Options" : "Add to Cart"}
            </button>
          )}

          {/* Style 4 Flat underline text quick buy */}
          {cardStyle === 'style4' && showQuickcart && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white underline transition-colors cursor-pointer border-none bg-transparent py-1 w-full text-center"
            >
              + {product.hasVariants ? "Select Options" : "Quick Add"}
            </button>
          )}
        </div>
      </Link>

      {/* Quick View Modal */}
      {quickViewOpen && settings && (
        <QuickViewModal
          product={product}
          settings={settings}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
}
