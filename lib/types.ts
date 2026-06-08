export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color?: string;
  size?: string;
  material?: string;
  customOption?: string;
  customValue?: string;
  colorHex?: string;          // hex color for solid swatch
  price?: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  imageUrl?: string;          // image linked to this variant
  active: boolean;
  sortOrder: number;
}

export interface ProductModifier {
  id: string;
  productId: string;
  name: string;
  price: number;
  active: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku?: string;
  categoryId?: string;
  category?: Category;
  stock: number;
  hasVariants: boolean;
  isService: boolean;
  isFeatured: boolean;
  active: boolean;
  enableSwatches: boolean;
  showSwatchesOnArchive: boolean;
  customBadgeId?: string;
  badgeEnabled?: boolean;
  customBadge?: Badge;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  modifiers: ProductModifier[];
  rating?: number;
  reviewsCount?: number;
  sizeGuideId?: string;
  sizeGuide?: SizeGuide;
  frequentlyBoughtTogetherIds?: string[];
  flashSaleEnabled?: boolean;
  flashSaleStartDate?: string | null;
  flashSaleEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  whatsappNumber: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  logoWidth: number;
  bannerUrl?: string;
  faviconUrl?: string;
  tagline?: string;
  address?: string;
  showStock: boolean;
  showComparePrice: boolean;
  enableSearch: boolean;
  enableCategoryFilter: boolean;
  whatsappGreeting: string;
  whatsappFooter: string;
  metaTitle?: string;
  metaDescription?: string;
  footerText?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialWhatsapp?: string;
  socialYoutube?: string;
  enableFakeViews: boolean;
  minViews: number;
  maxViews: number;
  enableTrustBadges: boolean;
  deliveryEstimateText: string;
  freeShippingText: string;
  promoCodeText: string;
  enableSafeCheckout: boolean;
  safeCheckoutText: string;
  safeCheckoutMethods: string[];
  enableTicker: boolean;
  tickerText: string;
  enableVariantSwatches: boolean;
  swatchShape: 'circle' | 'square';
  swatchSize: 'sm' | 'md' | 'lg'; // Deprecated but kept
  archiveSwatchSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  productSwatchSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  archiveSwatchAlign?: 'left' | 'center' | 'right';
  swatchLimit: number;
  defaultVariantIndex: number;
  imageHoverStyle?: 'second_image' | 'zoom' | 'none';
  imageAspectRatio?: string;
  titleLineLimit?: '1' | '2' | 'none';
  
  // Header options
  headerSticky?: boolean;
  headerShowTopBar?: boolean;
  headerTopBarPhone?: string;
  headerTopBarEmail?: string;
  headerShowNewsletter?: boolean;
  headerNewsletterText?: string;

  headerTopBarBg?: string;
  headerTopBarTextColor?: string;
  headerBg?: string;
  headerTextColor?: string;
  headerBorderColor?: string;

  headerDesktopLogoAlign?: 'left' | 'center' | 'right';
  headerDesktopSearchAlign?: 'left' | 'right' | 'hidden';
  headerDesktopWishlistAlign?: 'left' | 'right' | 'hidden';
  headerDesktopCartAlign?: 'left' | 'right' | 'hidden';
  headerDesktopThemeAlign?: 'left' | 'right' | 'hidden';

  headerMobileLogoAlign?: 'left' | 'center' | 'right';
  headerMobileMenuAlign?: 'left' | 'right' | 'hidden';
  headerMobileSearchAlign?: 'left' | 'right' | 'hidden';
  headerMobileCartAlign?: 'left' | 'right' | 'hidden';
  headerMobileWishlistAlign?: 'left' | 'right' | 'hidden';

  // Navigation options
  navigationMenu?: NavigationItem[];
  headerDesktopMenuAlign?: 'left' | 'center' | 'right' | 'hidden';
  
  faqContent?: string;
  returnPolicyContent?: string;

  trustBadge1Title?: string;
  trustBadge1Desc?: string;
  trustBadge1Icon?: string;
  trustBadge1Enabled: boolean;
  
  trustBadge2Title?: string;
  trustBadge2Desc?: string;
  trustBadge2Icon?: string;
  trustBadge2Enabled: boolean;
  
  trustBadge3Title?: string;
  trustBadge3Desc?: string;
  trustBadge3Icon?: string;
  trustBadge3Enabled: boolean;
  
  trustBadge4Title?: string;
  trustBadge4Desc?: string;
  trustBadge4Icon?: string;
  trustBadge4Enabled: boolean;

  socialTiktok?: string;
  socialSnapchat?: string;
  socialTwitter?: string;

  footerCol1Title?: string;
  footerCol2Title?: string;
  footerCol2Text?: string;
  footerCol3Title?: string;
  footerCol4Title?: string;
  footerCol4Text?: string;
  footerBottomText?: string;

  floatingContactsEnabled: boolean;
  floatingContactsPosition: 'left' | 'right';
  floatingContactsBottomMobile: number;
  floatingContactsBottomDesktop: number;
  floatingContactsSideMobile: number;
  floatingContactsSideDesktop: number;
  floatingContactsScale: number;
  floatingWhatsappPreset?: string;
  floatingWhatsappEnabled: boolean;
  floatingInstagramEnabled: boolean;
  floatingTiktokEnabled: boolean;
  floatingSnapchatEnabled: boolean;
  floatingTwitterEnabled: boolean;

  // Customizer & Premium Theme Settings
  exit_intent_enabled?: boolean;
  exit_intent_title?: string;
  exit_intent_text?: string;
  exit_intent_coupon?: string;
  spin_wheel_enabled?: boolean;
  spin_wheel_segments?: string[];
  cart_timer_minutes?: number;
  free_shipping_threshold?: number;
  volume_discount_threshold?: number;
  volume_discount_percentage?: number;
  recent_buyers?: { name: string; city: string }[] | string; // JSONB can be string or array
  recently_viewed_limit?: number;
  recent_buyers_enabled?: boolean;
  cookie_consent_enabled?: boolean;
  free_shipping_bar_enabled?: boolean;
  volume_discounts_enabled?: boolean;
  frequently_bought_together_enabled?: boolean;
  stock_urgency_enabled?: boolean;
  flash_sale_enabled?: boolean;
  flash_sale_start_date?: string;
  flash_sale_end_date?: string;
  social_feeds_enabled?: boolean;
  cart_timer_enabled?: boolean;
  size_guide_enabled?: boolean;

  recent_buyers_names?: string;
  recent_buyers_cities?: string;
  recent_buyers_source?: 'simulated' | 'real';
  recent_buyers_product_pool?: 'any' | 'featured' | 'sale' | 'recent' | 'custom';
  recent_buyers_custom_products?: string[] | string;
  recent_buyers_initial_delay?: number;
  recent_buyers_interval?: number;
  recent_buyers_display_duration?: number;
  recent_buyers_show_on_checkout?: boolean;
  exit_intent_image_url?: string;
  exit_intent_delay_mobile?: number;
  cookie_consent_text?: string;
  cookie_consent_button_text?: string;

  social_feeds_homepage_enabled?: boolean;
  social_feeds_product_enabled?: boolean;
  social_feeds_title?: string;
  social_feeds_subtitle?: string;
  social_feeds_desc?: string;
  social_feeds_items?: any;
  cart_timer_message?: string;
  coupon_codes_enabled?: boolean;

  updatedAt: string;
}

export interface RecentBuyer {
  name: string;
  city: string;
}

export interface SizeGuide {
  id: string;
  name: string;
  chart_data: Array<Record<string, string>>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageSection {
  id: string;
  section_type: 'hero_banner' | 'product_grid' | 'category_list' | 'promo_banner' | 'trust_badges' | 'recent_reviews' | 'brands_logos' | 'category_grid' | 'social_feed';
  title?: string;
  settings: Record<string, any>;
  content_data: Record<string, any>;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WhatsAppSubscriber {
  id: string;
  name?: string;
  phone: string;
  created_at?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  children?: NavigationItem[];
}

export interface CartItem {
  id: string;                          // unique cart item id
  product: Product;
  selectedVariant?: ProductVariant;
  selectedModifiers: ProductModifier[];
  quantity: number;
  unitPrice: number;                   // final price (variant price or product price)
  total: number;                       // unitPrice * quantity + modifiers
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment?: string;
  approved: boolean;
  createdAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimatedDays?: string;
  active: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
}

export interface VariantPresetValue {
  label: string;
  hex?: string;
  imageUrl?: string;
}

export interface VariantPreset {
  id: string;
  name: string;
  attribute: 'color' | 'size' | 'material' | 'custom';
  values: VariantPresetValue[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minCartAmount?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
