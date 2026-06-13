const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

async function run() {
  console.log('Testing settings update directly using Service Role Client...');
  
  // 1. Fetch current settings first
  const { data: settings, error: fetchError } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  // 2. Build the full update payload using DB column names
  const updatePayload = {};

  // Text fields
  updatePayload.store_name = settings.store_name;
  updatePayload.whatsapp_number = settings.whatsapp_number;
  updatePayload.currency = settings.currency;
  updatePayload.currency_symbol = settings.currency_symbol;
  updatePayload.logo_url = settings.logo_url;
  updatePayload.logo_width = Number(settings.logo_width) || 120;
  updatePayload.banner_url = settings.banner_url;
  updatePayload.favicon_url = settings.favicon_url;
  updatePayload.tagline = settings.tagline;
  updatePayload.address = settings.address;
  updatePayload.show_stock = settings.show_stock;
  updatePayload.show_compare_price = settings.show_compare_price;
  updatePayload.enable_search = settings.enable_search;
  updatePayload.enable_category_filter = settings.enable_category_filter;
  updatePayload.whatsapp_greeting = settings.whatsapp_greeting;
  updatePayload.whatsapp_footer = settings.whatsapp_footer;
  updatePayload.footer_text = settings.footer_text;
  updatePayload.social_facebook = settings.social_facebook;
  updatePayload.social_instagram = settings.social_instagram;
  updatePayload.social_whatsapp = settings.social_whatsapp;
  updatePayload.social_youtube = settings.social_youtube;
  updatePayload.enable_fake_views = settings.enable_fake_views;
  updatePayload.min_views = Number(settings.min_views);
  updatePayload.max_views = Number(settings.max_views);
  updatePayload.enable_trust_badges = settings.enable_trust_badges;
  updatePayload.delivery_estimate_text = settings.delivery_estimate_text;
  updatePayload.free_shipping_text = settings.free_shipping_text;
  updatePayload.promo_code_text = settings.promo_code_text;
  updatePayload.enable_safe_checkout = settings.enable_safe_checkout;
  updatePayload.safe_checkout_text = settings.safe_checkout_text;
  updatePayload.safe_checkout_methods = settings.safe_checkout_methods;
  updatePayload.enable_ticker = settings.enable_ticker;
  updatePayload.ticker_text = settings.ticker_text;
  updatePayload.enable_variant_swatches = settings.enable_variant_swatches;
  updatePayload.swatch_shape = settings.swatch_shape;
  updatePayload.swatch_size = settings.swatch_size;
  updatePayload.swatch_limit = Number(settings.swatch_limit) || 8;
  updatePayload.default_variant_index = Number(settings.default_variant_index) || 1;
  updatePayload.image_hover_style = settings.image_hover_style;
  updatePayload.image_aspect_ratio = settings.image_aspect_ratio;
  updatePayload.title_line_limit = settings.title_line_limit;
  updatePayload.archive_swatch_size = settings.archive_swatch_size;
  updatePayload.product_swatch_size = settings.product_swatch_size;
  updatePayload.archive_swatch_align = settings.archive_swatch_align;
  updatePayload.header_sticky = settings.header_sticky;
  updatePayload.header_show_top_bar = settings.header_show_top_bar;
  updatePayload.header_top_bar_phone = settings.header_top_bar_phone;
  updatePayload.header_top_bar_email = settings.header_top_bar_email;
  updatePayload.header_show_newsletter = settings.header_show_newsletter;
  updatePayload.header_newsletter_text = settings.header_newsletter_text;
  updatePayload.header_top_bar_bg = settings.header_top_bar_bg;
  updatePayload.header_top_bar_text_color = settings.header_top_bar_text_color;
  updatePayload.header_bg = settings.header_bg;
  updatePayload.header_text_color = settings.header_text_color;
  updatePayload.header_border_color = settings.header_border_color;
  updatePayload.header_desktop_logo_align = settings.header_desktop_logo_align;
  updatePayload.header_desktop_search_align = settings.header_desktop_search_align;
  updatePayload.header_desktop_wishlist_align = settings.header_desktop_wishlist_align;
  updatePayload.header_desktop_cart_align = settings.header_desktop_cart_align;
  updatePayload.header_desktop_theme_align = settings.header_desktop_theme_align;
  updatePayload.header_mobile_logo_align = settings.header_mobile_logo_align;
  updatePayload.header_mobile_menu_align = settings.header_mobile_menu_align;
  updatePayload.header_mobile_search_align = settings.header_mobile_search_align;
  updatePayload.header_mobile_cart_align = settings.header_mobile_cart_align;
  updatePayload.header_mobile_wishlist_align = settings.header_mobile_wishlist_align;
  updatePayload.navigation_menu = settings.navigation_menu;
  updatePayload.header_desktop_menu_align = settings.header_desktop_menu_align;
  updatePayload.faq_content = settings.faq_content;
  updatePayload.return_policy_content = settings.return_policy_content;
  
  updatePayload.trust_badge_1_title = settings.trust_badge_1_title;
  updatePayload.trust_badge_1_desc = settings.trust_badge_1_desc;
  updatePayload.trust_badge_1_icon = settings.trust_badge_1_icon;
  updatePayload.trust_badge_2_title = settings.trust_badge_2_title;
  updatePayload.trust_badge_2_desc = settings.trust_badge_2_desc;
  updatePayload.trust_badge_2_icon = settings.trust_badge_2_icon;
  updatePayload.trust_badge_3_title = settings.trust_badge_3_title;
  updatePayload.trust_badge_3_desc = settings.trust_badge_3_desc;
  updatePayload.trust_badge_3_icon = settings.trust_badge_3_icon;
  updatePayload.trust_badge_4_title = settings.trust_badge_4_title;
  updatePayload.trust_badge_4_desc = settings.trust_badge_4_desc;
  updatePayload.trust_badge_4_icon = settings.trust_badge_4_icon;

  updatePayload.trust_badge_1_enabled = settings.trust_badge_1_enabled;
  updatePayload.trust_badge_2_enabled = settings.trust_badge_2_enabled;
  updatePayload.trust_badge_3_enabled = settings.trust_badge_3_enabled;
  updatePayload.trust_badge_4_enabled = settings.trust_badge_4_enabled;

  updatePayload.social_tiktok = settings.social_tiktok;
  updatePayload.social_snapchat = settings.social_snapchat;
  updatePayload.social_twitter = settings.social_twitter;

  updatePayload.footer_col_1_title = settings.footer_col_1_title;
  updatePayload.footer_col_2_title = settings.footer_col_2_title;
  updatePayload.footer_col_2_text = settings.footer_col_2_text;
  updatePayload.footer_col_3_title = settings.footer_col_3_title;
  updatePayload.footer_col_4_title = settings.footer_col_4_title;
  updatePayload.footer_col_4_text = settings.footer_col_4_text;
  updatePayload.footer_bottom_text = settings.footer_bottom_text;
  updatePayload.footer_show_payments = settings.footer_show_payments;
  updatePayload.footer_show_menu = settings.footer_show_menu;
  updatePayload.footer_show_newsletter = settings.footer_show_newsletter;
  updatePayload.footer_show_social = settings.footer_show_social;

  updatePayload.floating_contacts_enabled = settings.floating_contacts_enabled;
  updatePayload.floating_contacts_position = settings.floating_contacts_position;
  updatePayload.floating_contacts_bottom_mobile = Number(settings.floating_contacts_bottom_mobile);
  updatePayload.floating_contacts_bottom_desktop = Number(settings.floating_contacts_bottom_desktop);
  updatePayload.floating_contacts_side_mobile = Number(settings.floating_contacts_side_mobile);
  updatePayload.floating_contacts_side_desktop = Number(settings.floating_contacts_side_desktop);
  
  updatePayload.floating_whatsapp_enabled = settings.floating_whatsapp_enabled;
  updatePayload.floating_instagram_enabled = settings.floating_instagram_enabled;
  updatePayload.floating_tiktok_enabled = settings.floating_tiktok_enabled;
  updatePayload.floating_snapchat_enabled = settings.floating_snapchat_enabled;
  updatePayload.floating_twitter_enabled = settings.floating_twitter_enabled;

  updatePayload.exit_intent_enabled = settings.exit_intent_enabled;
  updatePayload.exit_intent_title = settings.exit_intent_title;
  updatePayload.exit_intent_text = settings.exit_intent_text;
  updatePayload.exit_intent_coupon = settings.exit_intent_coupon;
  updatePayload.spin_wheel_enabled = settings.spin_wheel_enabled;
  updatePayload.spin_wheel_segments = settings.spin_wheel_segments;
  updatePayload.cart_timer_minutes = Number(settings.cart_timer_minutes);
  updatePayload.free_shipping_threshold = Number(settings.free_shipping_threshold);
  updatePayload.volume_discount_threshold = Number(settings.volume_discount_threshold);
  updatePayload.volume_discount_percentage = Number(settings.volume_discount_percentage);
  
  updatePayload.recent_buyers = settings.recent_buyers;
  updatePayload.recently_viewed_limit = Number(settings.recently_viewed_limit);
  updatePayload.recent_buyers_enabled = settings.recent_buyers_enabled;
  updatePayload.cookie_consent_enabled = settings.cookie_consent_enabled;
  updatePayload.free_shipping_bar_enabled = settings.free_shipping_bar_enabled;
  updatePayload.volume_discounts_enabled = settings.volume_discounts_enabled;
  updatePayload.frequently_bought_together_enabled = settings.frequently_bought_together_enabled;
  updatePayload.stock_urgency_enabled = settings.stock_urgency_enabled;
  updatePayload.flash_sale_enabled = settings.flash_sale_enabled;
  updatePayload.flash_sale_start_date = settings.flash_sale_start_date;
  updatePayload.flash_sale_end_date = settings.flash_sale_end_date;
  updatePayload.global_flash_sale_discount_type = settings.global_flash_sale_discount_type;
  updatePayload.global_flash_sale_discount_value = settings.global_flash_sale_discount_value;
  updatePayload.social_feeds_enabled = settings.social_feeds_enabled;
  updatePayload.cart_timer_enabled = settings.cart_timer_enabled;
  updatePayload.size_guide_enabled = settings.size_guide_enabled;

  updatePayload.recent_buyers_names = settings.recent_buyers_names;
  updatePayload.recent_buyers_cities = settings.recent_buyers_cities;
  updatePayload.recent_buyers_source = settings.recent_buyers_source;
  updatePayload.recent_buyers_product_pool = settings.recent_buyers_product_pool;
  updatePayload.recent_buyers_custom_products = settings.recent_buyers_custom_products;
  updatePayload.recent_buyers_initial_delay = Number(settings.recent_buyers_initial_delay);
  updatePayload.recent_buyers_interval = Number(settings.recent_buyers_interval);
  updatePayload.recent_buyers_display_duration = Number(settings.recent_buyers_display_duration);
  updatePayload.recent_buyers_show_on_checkout = settings.recent_buyers_show_on_checkout;
  updatePayload.exit_intent_image_url = settings.exit_intent_image_url;
  updatePayload.exit_intent_delay_mobile = Number(settings.exit_intent_delay_mobile);
  updatePayload.cookie_consent_text = settings.cookie_consent_text;
  updatePayload.cookie_consent_button_text = settings.cookie_consent_button_text;
  updatePayload.social_feeds_homepage_enabled = settings.social_feeds_homepage_enabled;
  updatePayload.social_feeds_product_enabled = settings.social_feeds_product_enabled;
  updatePayload.social_feeds_title = settings.social_feeds_title;
  updatePayload.social_feeds_subtitle = settings.social_feeds_subtitle;
  updatePayload.social_feeds_desc = settings.social_feeds_desc;
  updatePayload.social_feeds_items = settings.social_feeds_items;
  updatePayload.cart_timer_message = settings.cart_timer_message;
  updatePayload.coupon_codes_enabled = settings.coupon_codes_enabled;
  updatePayload.product_page_layout = settings.product_page_layout;
  updatePayload.theme_preset = settings.theme_preset;
  updatePayload.theme_config = settings.theme_config;
  updatePayload.card_style = settings.card_style;
  updatePayload.card_show_stars = settings.card_show_stars;
  updatePayload.card_show_quickview = settings.card_show_quickview;
  updatePayload.card_show_wishlist = settings.card_show_wishlist;
  updatePayload.card_show_quickcart = settings.card_show_quickcart;
  updatePayload.card_alignment = settings.card_alignment;
  updatePayload.card_elements_order = settings.card_elements_order;

  // Pixels & Tracking
  updatePayload.meta_pixel_id = settings.meta_pixel_id;
  updatePayload.ga4_measurement_id = settings.ga4_measurement_id;
  updatePayload.gtm_container_id = settings.gtm_container_id;
  updatePayload.tiktok_pixel_id = settings.tiktok_pixel_id;
  updatePayload.twitter_pixel_id = settings.twitter_pixel_id;
  updatePayload.snapchat_pixel_id = settings.snapchat_pixel_id;
  updatePayload.pinterest_tag_id = settings.pinterest_tag_id;

  // Social & SEO
  updatePayload.twitter_handle = settings.twitter_handle;
  updatePayload.meta_title_suffix = settings.meta_title_suffix;

  // AI settings
  updatePayload.content_provider = settings.content_provider;
  updatePayload.content_model = settings.content_model;
  updatePayload.content_keys = settings.content_keys;
  updatePayload.vision_provider = settings.vision_provider;
  updatePayload.vision_model = settings.vision_model;
  updatePayload.vision_keys = settings.vision_keys;
  updatePayload.ai_tone = settings.ai_tone;
  updatePayload.ai_language = settings.ai_language;
  updatePayload.ai_custom_instructions = settings.ai_custom_instructions;
  updatePayload.auto_content_seo = settings.auto_content_seo;
  updatePayload.auto_media_ai = settings.auto_media_ai;

  // SMTP/Email Fallback Columns
  updatePayload.smtp_email = settings.smtp_email;
  updatePayload.smtp_app_password = settings.smtp_app_password;
  updatePayload.smtp_from_name = settings.smtp_from_name;
  updatePayload.admin_notification_email = settings.admin_notification_email;
  updatePayload.email_notifications = settings.email_notifications;
  updatePayload.low_stock_threshold = Number(settings.low_stock_threshold) || 5;

  console.log('Sending direct DB update query...');
  const { data, error } = await supabase
    .from('store_settings')
    .update(updatePayload)
    .eq('id', SETTINGS_ID)
    .select('*');

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Update query succeeded! Rows affected:', data.length);
  }
}

run();
