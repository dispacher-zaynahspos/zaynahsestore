// Mock next/headers module so createClient doesn't crash outside of Next.js server context
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'next/headers') {
    return {
      cookies: async () => ({
        getAll: () => [],
        set: () => {},
      }),
    };
  }
  if (id === 'next/cache') {
    return {
      revalidateTag: (tag) => {
        console.log(`[Mock Cache] revalidating tag: ${tag}`);
      },
      unstable_cache: (fn) => fn
    };
  }
  return originalRequire.apply(this, arguments);
};

// Mock process.env for development check inside getSettings
process.env.NODE_ENV = 'development';

const dotenv = require('dotenv');
dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const { getSettings, updateSettings } = require('../lib/services/settings');

async function run() {
  console.log('Fetching initial settings...');
  const settings = await getSettings();
  console.log('Settings loaded successfully.');

  // Set NODE_ENV to production to test the server action behavior
  process.env.NODE_ENV = 'production';

  // Construct the exact payload that the form would submit
  const payload = {
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber,
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    logoUrl: settings.logoUrl || undefined,
    logoWidth: Number(settings.logoWidth) || 120,
    bannerUrl: settings.bannerUrl || undefined,
    faviconUrl: settings.faviconUrl || undefined,
    tagline: settings.tagline || undefined,
    address: settings.address || undefined,
    showStock: settings.showStock,
    showComparePrice: settings.showComparePrice,
    enableSearch: settings.enableSearch,
    enableCategoryFilter: settings.enableCategoryFilter,
    whatsappGreeting: settings.whatsappGreeting,
    whatsappFooter: settings.whatsappFooter,
    footerText: settings.footerText || undefined,
    socialFacebook: settings.socialFacebook || undefined,
    socialInstagram: settings.socialInstagram || undefined,
    socialWhatsapp: settings.socialWhatsapp || undefined,
    socialYoutube: settings.socialYoutube || undefined,
    enableFakeViews: settings.enableFakeViews,
    minViews: Number(settings.minViews),
    maxViews: Number(settings.maxViews),
    enableTrustBadges: settings.enableTrustBadges,
    deliveryEstimateText: settings.deliveryEstimateText,
    freeShippingText: settings.freeShippingText,
    promoCodeText: settings.promoCodeText,
    enableSafeCheckout: settings.enableSafeCheckout,
    safeCheckoutText: settings.safeCheckoutText,
    safeCheckoutMethods: settings.safeCheckoutMethods,
    enableTicker: settings.enableTicker,
    tickerText: settings.tickerText,
    enableVariantSwatches: settings.enableVariantSwatches,
    swatchShape: settings.swatchShape,
    swatchSize: settings.swatchSize,
    swatchLimit: Number(settings.swatchLimit) || 8,
    defaultVariantIndex: Number(settings.defaultVariantIndex) || 1,
    imageHoverStyle: settings.imageHoverStyle,
    imageAspectRatio: settings.imageAspectRatio,
    titleLineLimit: settings.titleLineLimit,
    archiveSwatchSize: settings.archiveSwatchSize,
    productSwatchSize: settings.productSwatchSize,
    archiveSwatchAlign: settings.archiveSwatchAlign,
    headerSticky: settings.headerSticky,
    headerShowTopBar: settings.headerShowTopBar,
    headerTopBarPhone: settings.headerTopBarPhone,
    headerTopBarEmail: settings.headerTopBarEmail,
    headerShowNewsletter: settings.headerShowNewsletter,
    headerNewsletterText: settings.headerNewsletterText,
    headerTopBarBg: settings.headerTopBarBg,
    headerTopBarTextColor: settings.headerTopBarTextColor,
    headerBg: settings.headerBg,
    headerTextColor: settings.headerTextColor,
    headerBorderColor: settings.headerBorderColor,
    headerDesktopLogoAlign: settings.headerDesktopLogoAlign,
    headerDesktopSearchAlign: settings.headerDesktopSearchAlign,
    headerDesktopWishlistAlign: settings.headerDesktopWishlistAlign,
    headerDesktopCartAlign: settings.headerDesktopCartAlign,
    headerDesktopThemeAlign: settings.headerDesktopThemeAlign,
    headerMobileLogoAlign: settings.headerMobileLogoAlign,
    headerMobileMenuAlign: settings.headerMobileMenuAlign,
    headerMobileSearchAlign: settings.headerMobileSearchAlign,
    headerMobileCartAlign: settings.headerMobileCartAlign,
    headerMobileWishlistAlign: settings.headerMobileWishlistAlign,
    navigationMenu: settings.navigationMenu,
    headerDesktopMenuAlign: settings.headerDesktopMenuAlign,
    faqContent: settings.faqContent,
    returnPolicyContent: settings.returnPolicyContent,
    trustBadge1Title: settings.trustBadge1Title,
    trustBadge1Desc: settings.trustBadge1Desc,
    trustBadge1Icon: settings.trustBadge1Icon,
    trustBadge2Title: settings.trustBadge2Title,
    trustBadge2Desc: settings.trustBadge2Desc,
    trustBadge2Icon: settings.trustBadge2Icon,
    trustBadge3Title: settings.trustBadge3Title,
    trustBadge3Desc: settings.trustBadge3Desc,
    trustBadge3Icon: settings.trustBadge3Icon,
    trustBadge4Title: settings.trustBadge4Title,
    trustBadge4Desc: settings.trustBadge4Desc,
    trustBadge4Icon: settings.trustBadge4Icon,
    trustBadge1Enabled: settings.trustBadge1Enabled,
    trustBadge2Enabled: settings.trustBadge2Enabled,
    trustBadge3Enabled: settings.trustBadge3Enabled,
    trustBadge4Enabled: settings.trustBadge4Enabled,
    socialTiktok: settings.socialTiktok,
    socialSnapchat: settings.socialSnapchat,
    socialTwitter: settings.socialTwitter,
    footerCol1Title: settings.footerCol1Title,
    footerCol2Title: settings.footerCol2Title,
    footerCol2Text: settings.footerCol2Text,
    footerCol3Title: settings.footerCol3Title,
    footerCol4Title: settings.footerCol4Title,
    footerCol4Text: settings.footerCol4Text,
    footerBottomText: settings.footerBottomText,
    footerShowPayments: settings.footerShowPayments,
    footerShowMenu: settings.footerShowMenu,
    footerShowNewsletter: settings.footerShowNewsletter,
    footerShowSocial: settings.footerShowSocial,
    floatingContactsEnabled: settings.floatingContactsEnabled,
    floatingContactsPosition: settings.floatingContactsPosition,
    floatingContactsBottomMobile: Number(settings.floatingContactsBottomMobile),
    floatingContactsBottomDesktop: Number(settings.floatingContactsBottomDesktop),
    floatingContactsSideMobile: Number(settings.floatingContactsSideMobile),
    floatingContactsSideDesktop: Number(settings.floatingContactsSideDesktop),
    floatingWhatsappEnabled: settings.floatingWhatsappEnabled,
    floatingInstagramEnabled: settings.floatingInstagramEnabled,
    floatingTiktokEnabled: settings.floatingTiktokEnabled,
    floatingSnapchatEnabled: settings.floatingSnapchatEnabled,
    floatingTwitterEnabled: settings.floatingTwitterEnabled,
    exit_intent_enabled: settings.exit_intent_enabled,
    exit_intent_title: settings.exit_intent_title,
    exit_intent_text: settings.exit_intent_text,
    exit_intent_coupon: settings.exit_intent_coupon,
    spin_wheel_enabled: settings.spin_wheel_enabled,
    spin_wheel_segments: settings.spin_wheel_segments,
    cart_timer_minutes: Number(settings.cart_timer_minutes),
    free_shipping_threshold: Number(settings.free_shipping_threshold),
    volume_discount_threshold: Number(settings.volume_discount_threshold),
    volume_discount_percentage: Number(settings.volume_discount_percentage),
    recent_buyers: typeof settings.recent_buyers === 'string' ? settings.recent_buyers : JSON.stringify(settings.recent_buyers),
    recently_viewed_limit: Number(settings.recently_viewed_limit),
    recent_buyers_enabled: settings.recent_buyers_enabled,
    cookie_consent_enabled: settings.cookie_consent_enabled,
    free_shipping_bar_enabled: settings.free_shipping_bar_enabled,
    volume_discounts_enabled: settings.volume_discounts_enabled,
    frequently_bought_together_enabled: settings.frequently_bought_together_enabled,
    stock_urgency_enabled: settings.stock_urgency_enabled,
    flash_sale_enabled: settings.flash_sale_enabled,
    flash_sale_start_date: settings.flash_sale_start_date,
    flash_sale_end_date: settings.flash_sale_end_date,
    globalFlashSaleDiscountType: settings.globalFlashSaleDiscountType,
    globalFlashSaleDiscountValue: settings.globalFlashSaleDiscountValue,
    social_feeds_enabled: settings.social_feeds_enabled,
    cart_timer_enabled: settings.cart_timer_enabled,
    size_guide_enabled: settings.size_guide_enabled,
    recent_buyers_names: settings.recent_buyers_names,
    recent_buyers_cities: settings.recent_buyers_cities,
    recent_buyers_source: settings.recent_buyers_source,
    recent_buyers_product_pool: settings.recent_buyers_product_pool,
    recent_buyers_custom_products: settings.recent_buyers_custom_products,
    recent_buyers_initial_delay: Number(settings.recent_buyers_initial_delay),
    recent_buyers_interval: Number(settings.recent_buyers_interval),
    recent_buyers_display_duration: Number(settings.recent_buyers_display_duration),
    recent_buyers_show_on_checkout: settings.recent_buyers_show_on_checkout,
    exit_intent_image_url: settings.exit_intent_image_url,
    exit_intent_delay_mobile: Number(settings.exit_intent_delay_mobile),
    cookie_consent_text: settings.cookie_consent_text,
    cookie_consent_button_text: settings.cookie_consent_button_text,
    social_feeds_homepage_enabled: settings.social_feeds_homepage_enabled,
    social_feeds_product_enabled: settings.social_feeds_product_enabled,
    social_feeds_title: settings.social_feeds_title,
    social_feeds_subtitle: settings.social_feeds_subtitle,
    social_feeds_desc: settings.social_feeds_desc,
    social_feeds_items: settings.social_feeds_items,
    cart_timer_message: settings.cart_timer_message,
    coupon_codes_enabled: settings.coupon_codes_enabled,
    meta_pixel_id: settings.meta_pixel_id,
    ga4_measurement_id: settings.ga4_measurement_id,
    gtm_container_id: settings.gtm_container_id,
    tiktok_pixel_id: settings.tiktok_pixel_id,
    twitter_pixel_id: settings.twitter_pixel_id,
    snapchat_pixel_id: settings.snapchat_pixel_id,
    pinterest_tag_id: settings.pinterest_tag_id,
    twitter_handle: settings.twitter_handle,
    meta_title_suffix: settings.meta_title_suffix,
    content_provider: settings.content_provider,
    content_model: settings.content_model,
    content_keys: settings.content_keys,
    vision_provider: settings.vision_provider,
    vision_model: settings.vision_model,
    vision_keys: settings.vision_keys,
    ai_tone: settings.ai_tone,
    ai_language: settings.ai_language,
    ai_custom_instructions: settings.ai_custom_instructions,
    auto_content_seo: settings.auto_content_seo,
    auto_media_ai: settings.auto_media_ai,
    smtp_email: settings.smtp_email,
    smtp_app_password: settings.smtp_app_password,
    smtp_from_name: settings.smtp_from_name,
    admin_notification_email: settings.admin_notification_email,
    email_notifications: settings.email_notifications,
    low_stock_threshold: Number(settings.low_stock_threshold) || 5
  };

  console.log('Executing updateSettings server action...');
  try {
    const updated = await updateSettings(payload);
    console.log('Update Succeeded! Updated Store Name:', updated.storeName);
  } catch (err) {
    console.error('Update Failed in Server Action:', err);
  }
}

run();
