'use server';

import { createClient } from '@/lib/supabase/server';
import { StoreSettings } from '@/lib/types';
import { unstable_cache, revalidateTag } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const staticSupabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);


interface SettingsRow {
  id: string;
  store_name?: string | null;
  whatsapp_number?: string | null;
  currency?: string | null;
  currency_symbol?: string | null;
  logo_url?: string | null;
  logo_width?: number | null;
  banner_url?: string | null;
  favicon_url?: string | null;
  tagline?: string | null;
  address?: string | null;
  show_stock?: boolean | null;
  show_compare_price?: boolean | null;
  enable_search?: boolean | null;
  enable_category_filter?: boolean | null;
  whatsapp_greeting?: string | null;
  whatsapp_footer?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  footer_text?: string | null;
  social_facebook?: string | null;
  social_instagram?: string | null;
  social_whatsapp?: string | null;
  social_youtube?: string | null;
  enable_fake_views?: boolean | null;
  min_views?: number | null;
  max_views?: number | null;
  enable_trust_badges?: boolean | null;
  delivery_estimate_text?: string | null;
  free_shipping_text?: string | null;
  promo_code_text?: string | null;
  enable_safe_checkout?: boolean | null;
  safe_checkout_text?: string | null;
  safe_checkout_methods?: string[] | null;
  enable_ticker?: boolean | null;
  ticker_text?: string | null;
  enable_variant_swatches?: boolean | null;
  swatch_shape?: string | null;
  swatch_size?: string | null;
  swatch_limit?: number | null;
  default_variant_index?: number | null;
  image_hover_style?: string | null;
  image_aspect_ratio?: string | null;
  title_line_limit?: string | null;
  archive_swatch_size?: string | null;
  product_swatch_size?: string | null;
  archive_swatch_align?: string | null;
  header_sticky?: boolean | null;
  header_show_top_bar?: boolean | null;
  header_top_bar_phone?: string | null;
  header_top_bar_email?: string | null;
  header_show_newsletter?: boolean | null;
  header_newsletter_text?: string | null;
  header_top_bar_bg?: string | null;
  header_top_bar_text_color?: string | null;
  header_bg?: string | null;
  header_text_color?: string | null;
  header_border_color?: string | null;
  header_desktop_logo_align?: string | null;
  header_desktop_search_align?: string | null;
  header_desktop_wishlist_align?: string | null;
  header_desktop_cart_align?: string | null;
  header_desktop_theme_align?: string | null;
  header_mobile_logo_align?: string | null;
  header_mobile_menu_align?: string | null;
  header_mobile_search_align?: string | null;
  header_mobile_cart_align?: string | null;
  header_mobile_wishlist_align?: string | null;
  navigation_menu?: any;
  header_desktop_menu_align?: string | null;
  faq_content?: string | null;
  return_policy_content?: string | null;
  trust_badge_1_title?: string | null;
  trust_badge_1_desc?: string | null;
  trust_badge_1_icon?: string | null;
  trust_badge_2_title?: string | null;
  trust_badge_2_desc?: string | null;
  trust_badge_2_icon?: string | null;
  trust_badge_3_title?: string | null;
  trust_badge_3_desc?: string | null;
  trust_badge_3_icon?: string | null;
  trust_badge_4_title?: string | null;
  trust_badge_4_desc?: string | null;
  trust_badge_4_icon?: string | null;
  trust_badge_1_enabled?: boolean | null;
  trust_badge_2_enabled?: boolean | null;
  trust_badge_3_enabled?: boolean | null;
  trust_badge_4_enabled?: boolean | null;
  social_tiktok?: string | null;
  social_snapchat?: string | null;
  social_twitter?: string | null;
  footer_col_1_title?: string | null;
  footer_col_2_title?: string | null;
  footer_col_2_text?: string | null;
  footer_col_3_title?: string | null;
  footer_col_4_title?: string | null;
  footer_col_4_text?: string | null;
  footer_bottom_text?: string | null;
  floating_contacts_enabled?: boolean | null;
  floating_contacts_position?: string | null;
  floating_contacts_bottom_mobile?: number | null;
  floating_contacts_bottom_desktop?: number | null;
  floating_contacts_side_mobile?: number | null;
  floating_contacts_side_desktop?: number | null;
  floating_contacts_scale?: number | null;
  floating_whatsapp_preset?: string | null;
  floating_whatsapp_enabled?: boolean | null;
  floating_instagram_enabled?: boolean | null;
  floating_tiktok_enabled?: boolean | null;
  floating_snapchat_enabled?: boolean | null;
  floating_twitter_enabled?: boolean | null;
  
  // Customizer & Premium Theme Settings
  exit_intent_enabled?: boolean | null;
  exit_intent_title?: string | null;
  exit_intent_text?: string | null;
  exit_intent_coupon?: string | null;
  spin_wheel_enabled?: boolean | null;
  spin_wheel_segments?: string[] | null;
  cart_timer_minutes?: number | null;
  free_shipping_threshold?: number | null;
  volume_discount_threshold?: number | null;
  volume_discount_percentage?: number | null;
  recent_buyers?: any;
  recently_viewed_limit?: number | null;
  recent_buyers_enabled?: boolean | null;
  cookie_consent_enabled?: boolean | null;
  free_shipping_bar_enabled?: boolean | null;
  volume_discounts_enabled?: boolean | null;
  frequently_bought_together_enabled?: boolean | null;
  stock_urgency_enabled?: boolean | null;
  flash_sale_enabled?: boolean | null;
  flash_sale_start_date?: string | null;
  flash_sale_end_date?: string | null;
  social_feeds_enabled?: boolean | null;
  cart_timer_enabled?: boolean | null;
  size_guide_enabled?: boolean | null;
  recent_buyers_names?: string | null;
  recent_buyers_cities?: string | null;
  recent_buyers_source?: string | null;
  recent_buyers_product_pool?: string | null;
  recent_buyers_custom_products?: any;
  recent_buyers_initial_delay?: number | null;
  recent_buyers_interval?: number | null;
  recent_buyers_display_duration?: number | null;
  recent_buyers_show_on_checkout?: boolean | null;
  exit_intent_image_url?: string | null;
  exit_intent_delay_mobile?: number | null;
  cookie_consent_text?: string | null;
  cookie_consent_button_text?: string | null;
  social_feeds_homepage_enabled?: boolean | null;
  social_feeds_product_enabled?: boolean | null;
  social_feeds_title?: string | null;
  social_feeds_subtitle?: string | null;
  social_feeds_desc?: string | null;
  social_feeds_items?: any;
  cart_timer_message?: string | null;
  coupon_codes_enabled?: boolean | null;

  updated_at: string;
}

const mapSettings = (row: SettingsRow): StoreSettings => ({
  id: row.id,
  storeName: row.store_name ?? 'Zaynahs E-Store',
  whatsappNumber: row.whatsapp_number ?? '',
  currency: row.currency ?? 'PKR',
  currencySymbol: row.currency_symbol ?? 'Rs.',
  logoUrl: row.logo_url || undefined,
  logoWidth: row.logo_width ?? 120,
  bannerUrl: row.banner_url || undefined,
  faviconUrl: row.favicon_url || undefined,
  tagline: row.tagline || undefined,
  address: row.address || undefined,
  showStock: row.show_stock ?? false,
  showComparePrice: row.show_compare_price ?? true,
  enableSearch: row.enable_search ?? true,
  enableCategoryFilter: row.enable_category_filter ?? true,
  whatsappGreeting: row.whatsapp_greeting ?? 'Hello! I would like to order:',
  whatsappFooter: row.whatsapp_footer ?? 'Please confirm my order. Thank you!',
  metaTitle: row.meta_title || undefined,
  metaDescription: row.meta_description || undefined,
  footerText: row.footer_text || undefined,
  socialFacebook: row.social_facebook || undefined,
  socialInstagram: row.social_instagram || undefined,
  socialWhatsapp: row.social_whatsapp || undefined,
  socialYoutube: row.social_youtube || undefined,
  enableFakeViews: row.enable_fake_views ?? true,
  minViews: row.min_views ?? 10,
  maxViews: row.max_views ?? 50,
  enableTrustBadges: row.enable_trust_badges ?? true,
  deliveryEstimateText: row.delivery_estimate_text ?? 'Estimate delivery times: 3-5 days International.',
  freeShippingText: row.free_shipping_text ?? 'Free shipping & returns: On all orders over $150.',
  promoCodeText: row.promo_code_text ?? 'Use code "WELCOME15" for discount 15% on your first order.',
  enableSafeCheckout: row.enable_safe_checkout ?? true,
  safeCheckoutText: row.safe_checkout_text ?? 'Guarantee Safe Checkout:',
  safeCheckoutMethods: row.safe_checkout_methods ?? ['visa', 'mastercard', 'paypal', 'amex', 'klarna', 'cirrus', 'westernunion'],
  enableTicker: row.enable_ticker ?? false,
  tickerText: row.ticker_text ?? 'Free returns within 30 days\nUnlimited delivery for only $175',
  enableVariantSwatches: row.enable_variant_swatches ?? true,
  swatchShape: (row.swatch_shape as 'circle' | 'square') ?? 'circle',
  swatchSize: (row.swatch_size as 'sm' | 'md' | 'lg') ?? 'md',
  swatchLimit: row.swatch_limit ?? 8,
  defaultVariantIndex: row.default_variant_index ?? 1,
  imageHoverStyle: (row.image_hover_style as 'second_image' | 'zoom' | 'none') ?? 'second_image',
  imageAspectRatio: row.image_aspect_ratio ?? '1:1',
  titleLineLimit: (row.title_line_limit as '1' | '2' | 'none') ?? '2',
  archiveSwatchSize: (row.archive_swatch_size as any) ?? 'md',
  productSwatchSize: (row.product_swatch_size as any) ?? 'md',
  archiveSwatchAlign: (row.archive_swatch_align as any) ?? 'left',
  headerSticky: row.header_sticky ?? true,
  headerShowTopBar: row.header_show_top_bar ?? true,
  headerTopBarPhone: row.header_top_bar_phone ?? '0328-4114551',
  headerTopBarEmail: row.header_top_bar_email ?? 'Totvoguepk@gmail.com',
  headerShowNewsletter: row.header_show_newsletter ?? true,
  headerNewsletterText: row.header_newsletter_text ?? 'Summer sale discount off 50%. Shop Sale',
  headerTopBarBg: row.header_top_bar_bg ?? '#d97706',
  headerTopBarTextColor: row.header_top_bar_text_color ?? '#ffffff',
  headerBg: row.header_bg ?? '#ffffff',
  headerTextColor: row.header_text_color ?? '#1a1a2e',
  headerBorderColor: row.header_border_color ?? '#e5e7eb',
  headerDesktopLogoAlign: (row.header_desktop_logo_align as any) ?? 'left',
  headerDesktopSearchAlign: (row.header_desktop_search_align as any) ?? 'right',
  headerDesktopWishlistAlign: (row.header_desktop_wishlist_align as any) ?? 'right',
  headerDesktopCartAlign: (row.header_desktop_cart_align as any) ?? 'right',
  headerDesktopThemeAlign: (row.header_desktop_theme_align as any) ?? 'right',
  headerMobileLogoAlign: (row.header_mobile_logo_align as any) ?? 'center',
  headerMobileMenuAlign: (row.header_mobile_menu_align as any) ?? 'left',
  headerMobileSearchAlign: (row.header_mobile_search_align as any) ?? 'right',
  headerMobileCartAlign: (row.header_mobile_cart_align as any) ?? 'right',
  headerMobileWishlistAlign: (row.header_mobile_wishlist_align as any) ?? 'hidden',
  navigationMenu: Array.isArray(row.navigation_menu) ? row.navigation_menu : [],
  headerDesktopMenuAlign: (row.header_desktop_menu_align as any) ?? 'center',
  faqContent: row.faq_content ?? '',
  returnPolicyContent: row.return_policy_content ?? '',
  trustBadge1Title: row.trust_badge_1_title ?? 'Free Delivery',
  trustBadge1Desc: row.trust_badge_1_desc ?? 'On all orders above Rs. 2,000',
  trustBadge1Icon: row.trust_badge_1_icon ?? 'Truck',
  trustBadge2Title: row.trust_badge_2_title ?? 'Secure Payments',
  trustBadge2Desc: row.trust_badge_2_desc ?? '100% protected checkout payments',
  trustBadge2Icon: row.trust_badge_2_icon ?? 'Shield',
  trustBadge3Title: row.trust_badge_3_title ?? 'Easy Exchange',
  trustBadge3Desc: row.trust_badge_3_desc ?? 'No questions asked return policy',
  trustBadge3Icon: row.trust_badge_3_icon ?? 'RefreshCw',
  trustBadge4Title: row.trust_badge_4_title ?? '24/7 Support',
  trustBadge4Desc: row.trust_badge_4_desc ?? 'Call/WhatsApp anytime for assistance',
  trustBadge4Icon: row.trust_badge_4_icon ?? 'Phone',
  trustBadge1Enabled: row.trust_badge_1_enabled ?? true,
  trustBadge2Enabled: row.trust_badge_2_enabled ?? true,
  trustBadge3Enabled: row.trust_badge_3_enabled ?? true,
  trustBadge4Enabled: row.trust_badge_4_enabled ?? true,
  socialTiktok: row.social_tiktok || '',
  socialSnapchat: row.social_snapchat || '',
  socialTwitter: row.social_twitter || '',
  footerCol1Title: row.footer_col_1_title ?? 'About Our Store',
  footerCol2Title: row.footer_col_2_title ?? 'Customer Support',
  footerCol2Text: row.footer_col_2_text ?? 'Call/WhatsApp: 0328-4114551\nEmail: Totvoguepk@gmail.com\nTimings: 10 AM - 10 PM',
  footerCol3Title: row.footer_col_3_title ?? 'Quick Links',
  footerCol4Title: row.footer_col_4_title ?? 'Newsletter',
  footerCol4Text: row.footer_col_4_text ?? 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.',
  footerBottomText: row.footer_bottom_text ?? 'All rights reserved.',
  floatingContactsEnabled: row.floating_contacts_enabled ?? true,
  floatingContactsPosition: (row.floating_contacts_position as any) ?? 'left',
  floatingContactsBottomMobile: row.floating_contacts_bottom_mobile ?? 80,
  floatingContactsBottomDesktop: row.floating_contacts_bottom_desktop ?? 24,
  floatingContactsSideMobile: row.floating_contacts_side_mobile ?? 16,
  floatingContactsSideDesktop: row.floating_contacts_side_desktop ?? 24,
  floatingContactsScale: row.floating_contacts_scale ? parseFloat(row.floating_contacts_scale.toString()) : 1.0,
  floatingWhatsappPreset: row.floating_whatsapp_preset ?? 'Hello! I am visiting your store and have a question.',
  floatingWhatsappEnabled: row.floating_whatsapp_enabled ?? true,
  floatingInstagramEnabled: row.floating_instagram_enabled ?? true,
  floatingTiktokEnabled: row.floating_tiktok_enabled ?? false,
  floatingSnapchatEnabled: row.floating_snapchat_enabled ?? false,
  floatingTwitterEnabled: row.floating_twitter_enabled ?? false,
  
  // Customizer & Premium Theme Settings
  exit_intent_enabled: row.exit_intent_enabled ?? false,
  exit_intent_title: row.exit_intent_title ?? 'Wait! Get a Special Discount',
  exit_intent_text: row.exit_intent_text ?? 'Submit your WhatsApp number to unlock a secret coupon code.',
  exit_intent_coupon: row.exit_intent_coupon ?? 'WELCOME10',
  spin_wheel_enabled: row.spin_wheel_enabled ?? false,
  spin_wheel_segments: Array.isArray(row.spin_wheel_segments) ? row.spin_wheel_segments : ['Try Again', '5% Off', 'Free Shipping', '10% Off', 'Free Delivery', 'WELCOME15'],
  cart_timer_minutes: row.cart_timer_minutes ?? 10,
  free_shipping_threshold: row.free_shipping_threshold ? parseFloat(row.free_shipping_threshold.toString()) : 2000.00,
  volume_discount_threshold: row.volume_discount_threshold ?? 3,
  volume_discount_percentage: row.volume_discount_percentage ? parseFloat(row.volume_discount_percentage.toString()) : 10.00,
  recent_buyers: typeof row.recent_buyers === 'string' ? JSON.parse(row.recent_buyers) : (row.recent_buyers ?? []),
  recently_viewed_limit: row.recently_viewed_limit ?? 4,
  recent_buyers_enabled: row.recent_buyers_enabled ?? true,
  cookie_consent_enabled: row.cookie_consent_enabled ?? true,
  free_shipping_bar_enabled: row.free_shipping_bar_enabled ?? true,
  volume_discounts_enabled: row.volume_discounts_enabled ?? true,
  frequently_bought_together_enabled: row.frequently_bought_together_enabled ?? true,
  stock_urgency_enabled: row.stock_urgency_enabled ?? true,
  flash_sale_enabled: row.flash_sale_enabled ?? true,
  flash_sale_start_date: row.flash_sale_start_date || undefined,
  flash_sale_end_date: row.flash_sale_end_date || undefined,
  social_feeds_enabled: row.social_feeds_enabled ?? true,
  cart_timer_enabled: row.cart_timer_enabled ?? true,
  size_guide_enabled: row.size_guide_enabled ?? true,

  recent_buyers_names: row.recent_buyers_names ?? 'Ahmad, Fatima, Zainab, Hamza, Ayesha, Bilal, Sana, Ali, Usman, Maryam',
  recent_buyers_cities: row.recent_buyers_cities ?? 'Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala',
  recent_buyers_source: (row.recent_buyers_source as any) ?? 'simulated',
  recent_buyers_product_pool: (row.recent_buyers_product_pool as any) ?? 'any',
  recent_buyers_custom_products: typeof row.recent_buyers_custom_products === 'string' ? JSON.parse(row.recent_buyers_custom_products) : (row.recent_buyers_custom_products ?? []),
  recent_buyers_initial_delay: row.recent_buyers_initial_delay ?? 15,
  recent_buyers_interval: row.recent_buyers_interval ?? 35,
  recent_buyers_display_duration: row.recent_buyers_display_duration ?? 6,
  recent_buyers_show_on_checkout: row.recent_buyers_show_on_checkout ?? false,
  exit_intent_image_url: row.exit_intent_image_url ?? '',
  exit_intent_delay_mobile: row.exit_intent_delay_mobile ?? 25,
  cookie_consent_text: row.cookie_consent_text ?? 'We use cookies to optimize your experience, analyze traffic, and support checkout flows. By continuing, you agree to our privacy policy.',
  cookie_consent_button_text: row.cookie_consent_button_text ?? 'Accept All',
  social_feeds_homepage_enabled: row.social_feeds_homepage_enabled ?? true,
  social_feeds_product_enabled: row.social_feeds_product_enabled ?? true,
  social_feeds_title: row.social_feeds_title ?? 'Follow Us On Instagram',
  social_feeds_subtitle: row.social_feeds_subtitle ?? '@Zaynahs.pk',
  social_feeds_desc: row.social_feeds_desc ?? 'Tag us in your post to get featured on our page',
  social_feeds_items: typeof row.social_feeds_items === 'string' ? JSON.parse(row.social_feeds_items) : (row.social_feeds_items ?? []),
  cart_timer_message: row.cart_timer_message ?? 'Items in your cart are reserved for {timer} minutes.',
  coupon_codes_enabled: row.coupon_codes_enabled ?? true,
  
  updatedAt: row.updated_at
});

const fetchSettings = async (): Promise<StoreSettings> => {
  const { data, error } = await staticSupabase
    .from('store_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .maybeSingle();

  if (error) throw error;
  if (data) return mapSettings(data);

  // Fallback (only run if somehow the row doesn't exist, which shouldn't happen under normal circumstances)
  const supabase = await createClient();
  const { data: insData, error: insError } = await supabase
    .from('store_settings')
    .insert({ id: SETTINGS_ID })
    .select('*')
    .single();

  if (insError) throw insError;
  return mapSettings(insData);
};

const cachedSettings = unstable_cache(
  async () => fetchSettings(),
  ['store-settings'],
  { revalidate: 3600, tags: ['settings'] }
);

export const getSettings = async () => {
  if (process.env.NODE_ENV === 'development') {
    return fetchSettings();
  }
  return cachedSettings();
};


export const updateSettings = async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
  try {
    const supabase = await createClient();
    const updatePayload: Record<string, any> = {};
    if (settings.storeName !== undefined) updatePayload.store_name = settings.storeName;
    if (settings.whatsappNumber !== undefined) updatePayload.whatsapp_number = settings.whatsappNumber;
    if (settings.currency !== undefined) updatePayload.currency = settings.currency;
    if (settings.currencySymbol !== undefined) updatePayload.currency_symbol = settings.currencySymbol;
    if (settings.logoUrl !== undefined) updatePayload.logo_url = settings.logoUrl;
    if (settings.logoWidth !== undefined) updatePayload.logo_width = settings.logoWidth;
    if (settings.bannerUrl !== undefined) updatePayload.banner_url = settings.bannerUrl;
    if (settings.faviconUrl !== undefined) updatePayload.favicon_url = settings.faviconUrl;
    if (settings.tagline !== undefined) updatePayload.tagline = settings.tagline;
    if (settings.address !== undefined) updatePayload.address = settings.address;
    if (settings.showStock !== undefined) updatePayload.show_stock = settings.showStock;
    if (settings.showComparePrice !== undefined) updatePayload.show_compare_price = settings.showComparePrice;
    if (settings.enableSearch !== undefined) updatePayload.enable_search = settings.enableSearch;
    if (settings.enableCategoryFilter !== undefined) updatePayload.enable_category_filter = settings.enableCategoryFilter;
    if (settings.whatsappGreeting !== undefined) updatePayload.whatsapp_greeting = settings.whatsappGreeting;
    if (settings.whatsappFooter !== undefined) updatePayload.whatsapp_footer = settings.whatsappFooter;
    if (settings.metaTitle !== undefined) updatePayload.meta_title = settings.metaTitle;
    if (settings.metaDescription !== undefined) updatePayload.meta_description = settings.metaDescription;
    if (settings.footerText !== undefined) updatePayload.footer_text = settings.footerText;
    if (settings.socialFacebook !== undefined) updatePayload.social_facebook = settings.socialFacebook;
    if (settings.socialInstagram !== undefined) updatePayload.social_instagram = settings.socialInstagram;
    if (settings.socialWhatsapp !== undefined) updatePayload.social_whatsapp = settings.socialWhatsapp;
    if (settings.socialYoutube !== undefined) updatePayload.social_youtube = settings.socialYoutube;
    if (settings.enableFakeViews !== undefined) updatePayload.enable_fake_views = settings.enableFakeViews;
    if (settings.minViews !== undefined) updatePayload.min_views = settings.minViews;
    if (settings.maxViews !== undefined) updatePayload.max_views = settings.maxViews;
    if (settings.enableTrustBadges !== undefined) updatePayload.enable_trust_badges = settings.enableTrustBadges;
    if (settings.deliveryEstimateText !== undefined) updatePayload.delivery_estimate_text = settings.deliveryEstimateText;
    if (settings.freeShippingText !== undefined) updatePayload.free_shipping_text = settings.freeShippingText;
    if (settings.promoCodeText !== undefined) updatePayload.promo_code_text = settings.promoCodeText;
    if (settings.enableSafeCheckout !== undefined) updatePayload.enable_safe_checkout = settings.enableSafeCheckout;
    if (settings.safeCheckoutText !== undefined) updatePayload.safe_checkout_text = settings.safeCheckoutText;
    if (settings.safeCheckoutMethods !== undefined) updatePayload.safe_checkout_methods = settings.safeCheckoutMethods;
    if (settings.enableTicker !== undefined) updatePayload.enable_ticker = settings.enableTicker;
    if (settings.tickerText !== undefined) updatePayload.ticker_text = settings.tickerText;
    if (settings.enableVariantSwatches !== undefined) updatePayload.enable_variant_swatches = settings.enableVariantSwatches;
    if (settings.swatchShape !== undefined) updatePayload.swatch_shape = settings.swatchShape;
    if (settings.swatchSize !== undefined) updatePayload.swatch_size = settings.swatchSize;
    if (settings.swatchLimit !== undefined) updatePayload.swatch_limit = settings.swatchLimit;
    if (settings.defaultVariantIndex !== undefined) updatePayload.default_variant_index = settings.defaultVariantIndex;
    if (settings.imageHoverStyle !== undefined) updatePayload.image_hover_style = settings.imageHoverStyle;
    if (settings.imageAspectRatio !== undefined) updatePayload.image_aspect_ratio = settings.imageAspectRatio;
    if (settings.titleLineLimit !== undefined) updatePayload.title_line_limit = settings.titleLineLimit;
    if (settings.archiveSwatchSize !== undefined) updatePayload.archive_swatch_size = settings.archiveSwatchSize;
    if (settings.productSwatchSize !== undefined) updatePayload.product_swatch_size = settings.productSwatchSize;
    if (settings.archiveSwatchAlign !== undefined) updatePayload.archive_swatch_align = settings.archiveSwatchAlign;
    if (settings.headerSticky !== undefined) updatePayload.header_sticky = settings.headerSticky;
    if (settings.headerShowTopBar !== undefined) updatePayload.header_show_top_bar = settings.headerShowTopBar;
    if (settings.headerTopBarPhone !== undefined) updatePayload.header_top_bar_phone = settings.headerTopBarPhone;
    if (settings.headerTopBarEmail !== undefined) updatePayload.header_top_bar_email = settings.headerTopBarEmail;
    if (settings.headerShowNewsletter !== undefined) updatePayload.header_show_newsletter = settings.headerShowNewsletter;
    if (settings.headerNewsletterText !== undefined) updatePayload.header_newsletter_text = settings.headerNewsletterText;
    if (settings.headerTopBarBg !== undefined) updatePayload.header_top_bar_bg = settings.headerTopBarBg;
    if (settings.headerTopBarTextColor !== undefined) updatePayload.header_top_bar_text_color = settings.headerTopBarTextColor;
    if (settings.headerBg !== undefined) updatePayload.header_bg = settings.headerBg;
    if (settings.headerTextColor !== undefined) updatePayload.header_text_color = settings.headerTextColor;
    if (settings.headerBorderColor !== undefined) updatePayload.header_border_color = settings.headerBorderColor;
    if (settings.headerDesktopLogoAlign !== undefined) updatePayload.header_desktop_logo_align = settings.headerDesktopLogoAlign;
    if (settings.headerDesktopSearchAlign !== undefined) updatePayload.header_desktop_search_align = settings.headerDesktopSearchAlign;
    if (settings.headerDesktopWishlistAlign !== undefined) updatePayload.header_desktop_wishlist_align = settings.headerDesktopWishlistAlign;
    if (settings.headerDesktopCartAlign !== undefined) updatePayload.header_desktop_cart_align = settings.headerDesktopCartAlign;
    if (settings.headerDesktopThemeAlign !== undefined) updatePayload.header_desktop_theme_align = settings.headerDesktopThemeAlign;
    if (settings.headerMobileLogoAlign !== undefined) updatePayload.header_mobile_logo_align = settings.headerMobileLogoAlign;
    if (settings.headerMobileMenuAlign !== undefined) updatePayload.header_mobile_menu_align = settings.headerMobileMenuAlign;
    if (settings.headerMobileSearchAlign !== undefined) updatePayload.header_mobile_search_align = settings.headerMobileSearchAlign;
    if (settings.headerMobileCartAlign !== undefined) updatePayload.header_mobile_cart_align = settings.headerMobileCartAlign;
    if (settings.headerMobileWishlistAlign !== undefined) updatePayload.header_mobile_wishlist_align = settings.headerMobileWishlistAlign;
    if (settings.navigationMenu !== undefined) updatePayload.navigation_menu = settings.navigationMenu;
    if (settings.headerDesktopMenuAlign !== undefined) updatePayload.header_desktop_menu_align = settings.headerDesktopMenuAlign;
    if (settings.faqContent !== undefined) updatePayload.faq_content = settings.faqContent;
    if (settings.returnPolicyContent !== undefined) updatePayload.return_policy_content = settings.returnPolicyContent;
    
    if (settings.trustBadge1Title !== undefined) updatePayload.trust_badge_1_title = settings.trustBadge1Title;
    if (settings.trustBadge1Desc !== undefined) updatePayload.trust_badge_1_desc = settings.trustBadge1Desc;
    if (settings.trustBadge1Icon !== undefined) updatePayload.trust_badge_1_icon = settings.trustBadge1Icon;
    
    if (settings.trustBadge2Title !== undefined) updatePayload.trust_badge_2_title = settings.trustBadge2Title;
    if (settings.trustBadge2Desc !== undefined) updatePayload.trust_badge_2_desc = settings.trustBadge2Desc;
    if (settings.trustBadge2Icon !== undefined) updatePayload.trust_badge_2_icon = settings.trustBadge2Icon;
    
    if (settings.trustBadge3Title !== undefined) updatePayload.trust_badge_3_title = settings.trustBadge3Title;
    if (settings.trustBadge3Desc !== undefined) updatePayload.trust_badge_3_desc = settings.trustBadge3Desc;
    if (settings.trustBadge3Icon !== undefined) updatePayload.trust_badge_3_icon = settings.trustBadge3Icon;
    
    if (settings.trustBadge4Title !== undefined) updatePayload.trust_badge_4_title = settings.trustBadge4Title;
    if (settings.trustBadge4Desc !== undefined) updatePayload.trust_badge_4_desc = settings.trustBadge4Desc;
    if (settings.trustBadge4Icon !== undefined) updatePayload.trust_badge_4_icon = settings.trustBadge4Icon;
    
    if (settings.trustBadge1Enabled !== undefined) updatePayload.trust_badge_1_enabled = settings.trustBadge1Enabled;
    if (settings.trustBadge2Enabled !== undefined) updatePayload.trust_badge_2_enabled = settings.trustBadge2Enabled;
    if (settings.trustBadge3Enabled !== undefined) updatePayload.trust_badge_3_enabled = settings.trustBadge3Enabled;
    if (settings.trustBadge4Enabled !== undefined) updatePayload.trust_badge_4_enabled = settings.trustBadge4Enabled;
    
    if (settings.socialTiktok !== undefined) updatePayload.social_tiktok = settings.socialTiktok;
    if (settings.socialSnapchat !== undefined) updatePayload.social_snapchat = settings.socialSnapchat;
    if (settings.socialTwitter !== undefined) updatePayload.social_twitter = settings.socialTwitter;
    
    if (settings.footerCol1Title !== undefined) updatePayload.footer_col_1_title = settings.footerCol1Title;
    if (settings.footerCol2Title !== undefined) updatePayload.footer_col_2_title = settings.footerCol2Title;
    if (settings.footerCol2Text !== undefined) updatePayload.footer_col_2_text = settings.footerCol2Text;
    if (settings.footerCol3Title !== undefined) updatePayload.footer_col_3_title = settings.footerCol3Title;
    if (settings.footerCol4Title !== undefined) updatePayload.footer_col_4_title = settings.footerCol4Title;
    if (settings.footerCol4Text !== undefined) updatePayload.footer_col_4_text = settings.footerCol4Text;
    if (settings.footerBottomText !== undefined) updatePayload.footer_bottom_text = settings.footerBottomText;

    if (settings.floatingContactsEnabled !== undefined) updatePayload.floating_contacts_enabled = settings.floatingContactsEnabled;
    if (settings.floatingContactsPosition !== undefined) updatePayload.floating_contacts_position = settings.floatingContactsPosition;
    if (settings.floatingContactsBottomMobile !== undefined) updatePayload.floating_contacts_bottom_mobile = settings.floatingContactsBottomMobile;
    if (settings.floatingContactsBottomDesktop !== undefined) updatePayload.floating_contacts_bottom_desktop = settings.floatingContactsBottomDesktop;
    if (settings.floatingContactsSideMobile !== undefined) updatePayload.floating_contacts_side_mobile = settings.floatingContactsSideMobile;
    if (settings.floatingContactsSideDesktop !== undefined) updatePayload.floating_contacts_side_desktop = settings.floatingContactsSideDesktop;
    if (settings.floatingContactsScale !== undefined) updatePayload.floating_contacts_scale = settings.floatingContactsScale;
    if (settings.floatingWhatsappPreset !== undefined) updatePayload.floating_whatsapp_preset = settings.floatingWhatsappPreset;
    if (settings.floatingWhatsappEnabled !== undefined) updatePayload.floating_whatsapp_enabled = settings.floatingWhatsappEnabled;
    if (settings.floatingInstagramEnabled !== undefined) updatePayload.floating_instagram_enabled = settings.floatingInstagramEnabled;
    if (settings.floatingTiktokEnabled !== undefined) updatePayload.floating_tiktok_enabled = settings.floatingTiktokEnabled;
    if (settings.floatingSnapchatEnabled !== undefined) updatePayload.floating_snapchat_enabled = settings.floatingSnapchatEnabled;
    if (settings.floatingTwitterEnabled !== undefined) updatePayload.floating_twitter_enabled = settings.floatingTwitterEnabled;

    if (settings.exit_intent_enabled !== undefined) updatePayload.exit_intent_enabled = settings.exit_intent_enabled;
    if (settings.exit_intent_title !== undefined) updatePayload.exit_intent_title = settings.exit_intent_title;
    if (settings.exit_intent_text !== undefined) updatePayload.exit_intent_text = settings.exit_intent_text;
    if (settings.exit_intent_coupon !== undefined) updatePayload.exit_intent_coupon = settings.exit_intent_coupon;
    if (settings.spin_wheel_enabled !== undefined) updatePayload.spin_wheel_enabled = settings.spin_wheel_enabled;
    if (settings.spin_wheel_segments !== undefined) updatePayload.spin_wheel_segments = settings.spin_wheel_segments;
    if (settings.cart_timer_minutes !== undefined) updatePayload.cart_timer_minutes = settings.cart_timer_minutes;
    if (settings.free_shipping_threshold !== undefined) updatePayload.free_shipping_threshold = settings.free_shipping_threshold;
    if (settings.volume_discount_threshold !== undefined) updatePayload.volume_discount_threshold = settings.volume_discount_threshold;
    if (settings.volume_discount_percentage !== undefined) updatePayload.volume_discount_percentage = settings.volume_discount_percentage;
    if (settings.recent_buyers !== undefined) updatePayload.recent_buyers = typeof settings.recent_buyers === 'string' ? JSON.parse(settings.recent_buyers) : settings.recent_buyers;
    if (settings.recently_viewed_limit !== undefined) updatePayload.recently_viewed_limit = settings.recently_viewed_limit;
    if (settings.recent_buyers_enabled !== undefined) updatePayload.recent_buyers_enabled = settings.recent_buyers_enabled;
    if (settings.cookie_consent_enabled !== undefined) updatePayload.cookie_consent_enabled = settings.cookie_consent_enabled;
    if (settings.free_shipping_bar_enabled !== undefined) updatePayload.free_shipping_bar_enabled = settings.free_shipping_bar_enabled;
    if (settings.volume_discounts_enabled !== undefined) updatePayload.volume_discounts_enabled = settings.volume_discounts_enabled;
    if (settings.frequently_bought_together_enabled !== undefined) updatePayload.frequently_bought_together_enabled = settings.frequently_bought_together_enabled;
    if (settings.stock_urgency_enabled !== undefined) updatePayload.stock_urgency_enabled = settings.stock_urgency_enabled;
    if (settings.flash_sale_enabled !== undefined) updatePayload.flash_sale_enabled = settings.flash_sale_enabled;
    if (settings.flash_sale_start_date !== undefined) updatePayload.flash_sale_start_date = settings.flash_sale_start_date;
    if (settings.flash_sale_end_date !== undefined) updatePayload.flash_sale_end_date = settings.flash_sale_end_date;
    if (settings.social_feeds_enabled !== undefined) updatePayload.social_feeds_enabled = settings.social_feeds_enabled;
    if (settings.cart_timer_enabled !== undefined) updatePayload.cart_timer_enabled = settings.cart_timer_enabled;
    if (settings.size_guide_enabled !== undefined) updatePayload.size_guide_enabled = settings.size_guide_enabled;

    if (settings.recent_buyers_names !== undefined) updatePayload.recent_buyers_names = settings.recent_buyers_names;
    if (settings.recent_buyers_cities !== undefined) updatePayload.recent_buyers_cities = settings.recent_buyers_cities;
    if (settings.recent_buyers_source !== undefined) updatePayload.recent_buyers_source = settings.recent_buyers_source;
    if (settings.recent_buyers_product_pool !== undefined) updatePayload.recent_buyers_product_pool = settings.recent_buyers_product_pool;
    if (settings.recent_buyers_custom_products !== undefined) updatePayload.recent_buyers_custom_products = typeof settings.recent_buyers_custom_products === 'string' ? JSON.parse(settings.recent_buyers_custom_products) : settings.recent_buyers_custom_products;
    if (settings.recent_buyers_initial_delay !== undefined) updatePayload.recent_buyers_initial_delay = settings.recent_buyers_initial_delay;
    if (settings.recent_buyers_interval !== undefined) updatePayload.recent_buyers_interval = settings.recent_buyers_interval;
    if (settings.recent_buyers_display_duration !== undefined) updatePayload.recent_buyers_display_duration = settings.recent_buyers_display_duration;
    if (settings.recent_buyers_show_on_checkout !== undefined) updatePayload.recent_buyers_show_on_checkout = settings.recent_buyers_show_on_checkout;
    if (settings.exit_intent_image_url !== undefined) updatePayload.exit_intent_image_url = settings.exit_intent_image_url;
    if (settings.exit_intent_delay_mobile !== undefined) updatePayload.exit_intent_delay_mobile = settings.exit_intent_delay_mobile;
    if (settings.cookie_consent_text !== undefined) updatePayload.cookie_consent_text = settings.cookie_consent_text;
    if (settings.cookie_consent_button_text !== undefined) updatePayload.cookie_consent_button_text = settings.cookie_consent_button_text;
    if (settings.social_feeds_homepage_enabled !== undefined) updatePayload.social_feeds_homepage_enabled = settings.social_feeds_homepage_enabled;
    if (settings.social_feeds_product_enabled !== undefined) updatePayload.social_feeds_product_enabled = settings.social_feeds_product_enabled;
    if (settings.social_feeds_title !== undefined) updatePayload.social_feeds_title = settings.social_feeds_title;
    if (settings.social_feeds_subtitle !== undefined) updatePayload.social_feeds_subtitle = settings.social_feeds_subtitle;
    if (settings.social_feeds_desc !== undefined) updatePayload.social_feeds_desc = settings.social_feeds_desc;
    if (settings.social_feeds_items !== undefined) updatePayload.social_feeds_items = typeof settings.social_feeds_items === 'string' ? JSON.parse(settings.social_feeds_items) : settings.social_feeds_items;
    if (settings.cart_timer_message !== undefined) updatePayload.cart_timer_message = settings.cart_timer_message;
    if (settings.coupon_codes_enabled !== undefined) updatePayload.coupon_codes_enabled = settings.coupon_codes_enabled;

    const { data, error } = await supabase
      .from('store_settings')
      .update(updatePayload)
      .eq('id', SETTINGS_ID)
      .select('*')
      .single();

    if (error) throw error;
    revalidateTag('settings', 'max');
    return mapSettings(data);
  } catch (error) {
    console.error('[settings] updateSettings failed:', error);
    throw error;
  }
};
