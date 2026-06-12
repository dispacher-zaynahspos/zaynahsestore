# 📜 ZAYNAHS E-STORE — SCHEMA CHANGE LOG

> Har database change yahan log karo. Kabhi skip mat karo.

---

## FORMAT:
```
### [YYYY-MM-DD] vX.X.X — Short Title
**Files Updated:** list of files
**Changes:**
1. What changed and why
```

### [2026-06-12] v3.7.0 — Meta Catalog Real-time Sync Database Schema
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [20260612110000_add_meta_catalog_sync.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/migrations/20260612110000_add_meta_catalog_sync.sql)
**Changes:**
1. Appended `meta_sync_status` (TEXT), `meta_sync_error` (TEXT), and `meta_last_synced_at` (TIMESTAMPTZ) fields to the `products` table definition to track Meta Catalog sync statuses.
2. Created the `meta_category_mapping` database table to map storefront categories to Meta's standard catalog product category paths.

### [2026-06-12] v3.6.0 — Zaynahs SEO + AI Copywriting and Media Library Tables
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [20260612100000_add_seo_and_media_library.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/migrations/20260612100000_add_seo_and_media_library.sql)
**Changes:**
1. Created `seo_meta` database table to track metadata overrides (title, meta descriptions, open graph details, and structured FAQ arrays) for products, categories, and custom pages.
2. Created `media_library` database table to log uploaded files, SEO-friendly file names, captions, alt text, and AI statuses.
3. Created `ai_settings` database table to store Content/Image SEO AI provider parameters, model selections, and rotating API keys.

### [2026-06-12] v3.5.0 — Email Templates System & Order Tracking Columns
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Email Templates Database Table: Created the `email_templates` table via migration containing `email_type`, `category`, `label`, `description`, `enabled`, `subject`, and `custom_html` columns, pre-seeded with 18 default customer and admin email types.
2. Orders Table Columns: Appended `review_email_pending` (BOOLEAN), `delivered_at` (TIMESTAMPTZ), `tracking_number` (TEXT), `courier_name` (TEXT), `tracking_url` (TEXT), `cancel_reason` (TEXT), and `refund_amount` (NUMERIC) fields to the orders table.

### [2026-06-12] v3.4.0 — Tracking Pixels, SEO Title Suffix & AI Configurations
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [settings.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/settings.ts)
**Changes:**
1. Database Schema Additions: Altered `store_settings` table to add Meta Pixel, GA4, GTM, TikTok, Snapchat, Pinterest, and Twitter/X tracking columns, dynamic `meta_title_suffix` and `twitter_handle` columns, and AI content/vision configuration variables (Groq/Gemini models, tones, languages, and generation switches).
2. Centralized Scripts and Event Triggers: Mounted client-side event listeners tracking standard ecommerce actions on product details, cart changes, checkout forms, search query triggers, and order completions.

### [2026-06-12] v3.3.0 — Product Card Customization Templates & Media Library Upgrades
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [settings.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/settings.ts)
**Changes:**
1. Product Card Customization Fields: Added `card_style`, `card_show_stars`, `card_show_quickview`, `card_show_wishlist`, `card_show_quickcart`, `card_alignment`, and `card_elements_order` columns to `store_settings` to support visual customizations, 5 templates, alignment, and element reordering.

### [2026-06-12] v3.2.0 — Dynamic Theme Appearance Presets System
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [settings.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/settings.ts)
**Changes:**
1. Database Appearance Columns: Added `theme_preset` (TEXT) and `theme_config` (JSONB) columns to the `store_settings` table via migration to store visual presentation configurations and 10 ready-made presets.

### [2026-06-12] v3.1.0 — Shopify-Style Orders Log, Staff Notes, Timeline Logs, and Financial Dashboard
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [orders.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/orders.ts), [OrderLog.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/OrderLog.tsx), [products.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/products.ts), [PreviewClient.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/settings/customizer/preview/PreviewClient.tsx)
**Changes:**
1. Orders Database Alteration: Added `staff_notes` (TEXT) and `status_logs` (JSONB) to the `orders` table via migration to support internal note editing and order lifecycle history logging.
2. Orders Lifecycle Status Log: Configured status updates and staff notes additions to write rich timeline event logs to `status_logs` automatically.
3. Compare Price Variant Calculation Fix: Overhauled `applyFlashSaleDiscounts` on the server and `liveProducts` on the client customizer preview to dynamically calculate and fallback variants' original compare prices proportionally, ensuring flash sale price calculations cut off the original compare price instead of the selling price when a compare price is present.

### [2026-06-12] v3.0.0 — Dedicated WhatsApp Leads Tab, Email Capture, & Live Previews
**Files Updated:** [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [sections.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/sections.ts), [layout.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/layout.tsx), [PremiumFeaturesProvider.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/store/PremiumFeaturesProvider.tsx), [PremiumTab.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/settings/PremiumTab.tsx), [page.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/leads/page.tsx)
**Changes:**
1. Extended WhatsApp subscribers schema: Supported storing optional email address and widget source types ('wheel' vs 'exit_intent').
2. Leads tab additions: Replaced customer lists sub-tab with a fully dedicated Sidebar menu item "WhatsApp Leads" routing to a detailed dashboard.
3. Advanced admin filtering: Implemented search filters, date range filters (Today, Yesterday, Last 7/30 days), source widget segment filters, prefilled WhatsApp templates, and copy buttons on the leads page.
4. Settings live preview mockups: Built visual storefront popup mocks (Exit intent dialog card & Spin wheel SVG layout) directly inside the Settings console page updating in real-time.

### [2026-06-12] v2.9.2 — YouTube/Vimeo Video Embeds & Custom Autoplay Controls
**Files Updated:** [HeroBannerSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/HeroBannerSettings.tsx), [StoreFront.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/store/StoreFront.tsx), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Customizer settings: Added support for YouTube and Vimeo video URLs in slide desktop/mobile video settings, and added dynamic autoplay checkboxes `video_autoplay` and `mobile_video_autoplay` to let administrators toggle autoplay (muted background loops) vs manual play (with controls enabled).
2. Storefront YouTube/Vimeo Embed support: Updated `StoreFront.tsx` to detect YouTube/Vimeo links using regex parsers, rendering them as clean, responsive `<iframe>` tags. If autoplay is enabled, the embedded videos run muted, inline, and looped. Otherwise, controls are enabled and autoplay is disabled.
3. Fallback video control support: Direct video formats (e.g. `.mp4`, `.webm`) respect the same autoplay settings on storefront.

### [2026-06-12] v2.9.1 — Left/Right sorting arrows, variant scaling, & storefront category sale display
**Files Updated:** [FlashSaleSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/FlashSaleSettings.tsx), [products.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/products.ts), [StoreFront.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/store/StoreFront.tsx), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Horizontal Sorting: Added ChevronLeft and ChevronRight alongside vertical Up/Down buttons in the product list sorting controls of the theme customizer, allowing administrators to sort/reorder items back and forth ("agge peche").
2. Storefront Category Display: Overhauled `StoreFront.tsx`'s FlashSaleSection to query and display all active category discount products alongside the manually selected individual products.
3. Proportional Variant Pricing: Extended database-level `applyFlashSaleDiscounts` to automatically recalculate prices for all variants (either proportionally using the discounted product base price ratio, or by applying the percentage/fixed category discount directly to each variant), ensuring storewide price consistency for all combinations.

### [2026-06-12] v2.9.0 — Customizer Flash Sale Grid, Reordering & Category Rules
**Files Updated:** [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [products.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/products.ts), [sections.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/sections.ts), [CustomizerEditor.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/CustomizerEditor.tsx), [FlashSaleSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/FlashSaleSettings.tsx), [StoreFront.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/store/StoreFront.tsx), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Customizer Section Addition: Added the new `'flash_sale'` section type, permitting administrators to insert a live Flash Sale grid with custom title, start date-time picker, end date-time picker, custom button labels/links, and choose products with specific flash sale prices.
2. Dynamic Pricing Overrides: Implemented server-side pricing resolution helper `applyFlashSaleDiscounts` inside `lib/services/products.ts` called on `getProducts` and `getProductBySlug`. If the current time lies between the flash sale start and end times, matched products dynamically display their flash sale price and save the original price as crossed-out `comparePrice` everywhere (store grids, detail pages, and cart logic).
3. Storefront UI: Created a premium dark-accented horizontal block layout (`FlashSaleSection`) on the home page with a live countdown timer ticking every second, showing starts/ends countdowns and displaying the discounted products.
4. Product Reordering & Sorting: Integrated Up/Down chevron arrows inside the Customizer products list settings, sorting the storefront grid items dynamically based on the customizer's exact array sequence.
5. Category-wide Sales: Added category selection and discount types (Percentage % vs Fixed Amount Rs.) to apply flash sale discounts to all products in a chosen category dynamically.

### [2026-06-12] v2.8.0 — Homepage Product Grid "View All" Button Customization & Social Links
**Files Updated:** [ProductGridSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/ProductGridSettings.tsx), [StoreFront.tsx](file:///Users/shoaib%20e-store/components/store/StoreFront.tsx), [GlobalSettings.tsx](file:///Users/shoaib%20e-store/components/admin/customizer/pages/GlobalSettings.tsx), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib%2520e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Customizer Settings: Added inputs to modify View All button text (`viewAllText`) and custom link URL (`viewAllUrl`) on the homepage Product Grid settings form.
2. Dynamic Linking & Fallback: Configured the customer storefront rendering (`renderProductGrid` in `StoreFront.tsx`) to show customized text and route to the custom URL. If the URL is blank, it dynamically routes to `/shop?category={slug}` matching the selected source category.
3. Social Link Settings: Added missing input fields for Snapchat, Twitter (X), YouTube, and WhatsApp contact numbers inside the Theme Customizer's Global Settings page (`GlobalSettings.tsx`) under Footer & Social tabs, matching the primary Settings page.

### [2026-06-12] v2.7.0 — Product Page Custom Reordering & Announcement Bar Shortcuts
**Files Updated:** [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [20260612011000_add_product_page_layout.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/migrations/20260612011000_add_product_page_layout.sql), [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [settings.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/settings.ts), [CustomizerEditor.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/CustomizerEditor.tsx), [ProductDetailPageSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/pages/ProductDetailPageSettings.tsx), [PreviewClient.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/settings/customizer/preview/PreviewClient.tsx), [Navbar.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/common/Navbar.tsx), [Footer.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/common/Footer.tsx), [PremiumTab.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/settings/PremiumTab.tsx), [SettingsForm.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/SettingsForm.tsx)
**Changes:**
1. Database Schema: Added `product_page_layout` text array column to `store_settings` to persist custom product details sections order.
2. Customizer Reordering: Added up/down reordering controls for Product Page blocks inside `ProductDetailPageSettings.tsx`.
3. Preview Client Sync: Updated preview to render Product Detail Page blocks dynamically in the saved/live layout order.
4. Iframe Click-to-Select: Configured click events on Header, Footer, and Announcement Bar inside `Navbar.tsx` and `Footer.tsx` to communicate with the parent editor via postMessage to auto-select properties.
5. Announcement Bar Editing: Allowed news bar/announcement bar edits directly on the Home Page Customizer stack, the Global Header Customizer settings, and the main Premium Features tab.
6. Real-time Live Preview: Logo width, news text, and all customizer properties sync dynamically in the preview, and are only saved on clicking "Save Layout".

### [2026-06-12] v2.6.0 — Theme Customizer Modular Refactoring & Modularity Guidelines
**Files Updated:** [gemini.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/gemini.md), [CustomizerEditor.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/CustomizerEditor.tsx), [HeroBannerSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/HeroBannerSettings.tsx), [ProductGridSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/ProductGridSettings.tsx), [CategoryListSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/CategoryListSettings.tsx), [CategoryGridSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/CategoryGridSettings.tsx), [PromoBannerSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/PromoBannerSettings.tsx), [RecentReviewsSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/RecentReviewsSettings.tsx), [BrandsLogosSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/BrandsLogosSettings.tsx), [SocialFeedSettings.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/customizer/sections/SocialFeedSettings.tsx), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Added RULE O1 to gemini.md defining strict modularity requirements (separate files for settings tabs/modals, keep files under 500 lines).
2. Refactored the homepage sections theme customizer editor to move inline section fields into dedicated separate components under `components/admin/customizer/sections/`.
3. Reduced CustomizerEditor.tsx size from 1577 lines to ~470 lines for better updateability and speed.
4. Integrated Page Selector dropdown to switch between Home Page, Shop Page, Product Details, and Global Settings within the Theme Customizer.
5. Connected ShopPageSettings, ProductDetailPageSettings, and GlobalSettings components with live state management.
6. Synchronized settings state down to the preview iframe on change and page navigation.
7. Wired up database persistence using updateSettings server action in handleSaveLayout.

---

### [2026-06-08] v2.5.0 — Make product_id Nullable in product_images
**Files Updated:** [20260608135800_make_product_id_nullable_in_product_images.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/migrations/20260608135800_make_product_id_nullable_in_product_images.sql), [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Dropped `NOT NULL` constraint from `product_id` column in `product_images` table to allow general media library/banner image uploads to be registered in the database.

### [2026-06-08] v2.4.0 — Flash Sale Start Dates Scheduling & Timer Robustness
**Files Updated:** [20260608135000_add_flash_sale_start_dates.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/migrations/20260608135000_add_flash_sale_start_dates.sql), [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql), [types.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/types.ts), [settings.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/settings.ts), [products.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/services/products.ts), [ProductDetail.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/store/ProductDetail.tsx), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Database migration added: `flash_sale_start_date` column to `store_settings` and `products` tables.
2. Storefront Flash Sale Logic Upgrade: Fixed conditional logic so storefront detail timer falls back to global settings when product-level timer is not set or expired. Handled Start Date countdown ("Starts In:") and End Date countdown ("Ends In:").

---

### [2026-06-08] v1.5.0 — Dynamic Product Size Guides Preset Creator & Interactive Sizing Table Builder
**Files Updated:** supabase/migrations/20260608010000_add_size_guides_table.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/sizeGuides.ts, lib/services/products.ts, lib/services/storage.ts, components/admin/ProductForm.tsx, components/admin/SettingsForm.tsx, components/store/ProductDetail.tsx, components/common/Icons.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Database Schema additions: Created `size_guides` table storing size charts (`chart_data` JSONB) and associated measurement images. Added `size_guide_id` relationship column to `products` table.
2. Settings Presets Manager: Built a custom Size Guides admin tab featuring a list of presets (with edit/delete), custom chart image uploader, and dynamic sizing table builder where columns are custom defined and cell values are filled in an interactive grid.
3. Product Form selector: Updated product creator form to fetch size guides and support linking presets to individual products.
4. Storefront triggers & modal: Added `Ruler` icon to the action links row next to "Share" and "Ask a question" on the customer storefront. Overhauled the Size Guide modal to dynamically render column headers, table rows, and the reference diagram if uploaded.
5. Fully resolved strict type constraints and verified clean compilation checks with zero errors.

---

### [2026-06-08] v1.4.0 — Advanced Ticker Customizer, Exit Intent Image Uploader & Cookie Consent Customization
**Files Updated:** supabase/migrations/20260608009000_add_recent_buyers_advanced_settings.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/settings.ts, lib/services/orders.ts, components/admin/SettingsForm.tsx, components/store/PremiumFeaturesProvider.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Database migration added advanced columns: `recent_buyers_names`, `recent_buyers_cities`, `recent_buyers_source`, `recent_buyers_product_pool`, `recent_buyers_custom_products`, `recent_buyers_initial_delay`, `recent_buyers_interval`, `recent_buyers_display_duration`, `exit_intent_image_url`, `exit_intent_delay_mobile`, `cookie_consent_text`, `cookie_consent_button_text` to the `store_settings` table.
2. Modified SettingsForm to render fields for Cities list, Names list, simulated/real buyer source radio toggle, product notification pool select, scrollable custom products checklist, delay/interval sliders, cookie consent texts, and exit intent banner image uploader (with dual manual URL pasting and local optimized uploads).
3. Verified full strict TypeScript compilation successfully.

---

### [2026-06-08] v1.3.0 — Storefront Settings respect settings toggles for 12 Premium Features
**Files Updated:** components/admin/SettingsForm.tsx, components/store/PremiumFeaturesProvider.tsx, components/store/CartDrawer.tsx, components/store/CartContainer.tsx, components/store/ProductDetail.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Rendered checkbox toggles in the Settings Form's Premium Features tab to fully control showing/hiding individual features: Cookie Consent, Recent Buyers, Free Shipping Progress Bar, Volume Discounts, Frequently Bought Together, Stock Urgency, Flash Sale, Social Feeds, Cart Expiry, and Size Guide.
2. Updated `PremiumFeaturesProvider.tsx`, `CartDrawer.tsx`, `CartContainer.tsx`, and `ProductDetail.tsx` to respect these toggles before executing calculations, ticking timers, or rendering widgets.
3. Verified strict compile safety using `npx tsc --noEmit` which completed with zero compilation errors.

---

### [2026-06-07] v1.2.0 — Design Token System + Font System
**Files Updated:** tailwind.config.ts, app/globals.css, app/layout.tsx, components/common/Button.tsx, components/common/Badge.tsx, components/common/Typography.tsx, STORE_GUIDE.md, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Plus Jakarta Sans (headings) + Outfit (body) via next/font — zero layout shift
2. Complete color token system: primary green, secondary navy, accent red
3. Dark mode CSS variables in globals.css
4. Button component with 7 variants + 5 sizes, min 44px touch targets
5. Badge component with 7 variants
6. Typography component with consistent scale
7. 1 line change in tailwind.config.ts changes entire site color

---

### [2026-06-08] v2.3.0 — Trust Badges Selectors, Social Media Integrations & Shopify-Style Footer
**Files Updated:** supabase/migrations/20260608003000_add_badges_socials_and_footer_editable_fields.sql, supabase/migrations/20260608004000_add_footer_bottom_text_to_settings.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/settings.ts, components/admin/SettingsForm.tsx, components/store/StoreFront.tsx, components/common/Footer.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Added individual trust badge enable/disable selectors, new social platform URLs (TikTok, Snapchat, Twitter), editable footer column title/text fields, and an editable footer bottom copyright text field to settings.
2. Built a premium 4-column Shopify-style storefront footer showing customizable brand details, line-break-preserving support details, automatic quick links navigation, and an interactive newsletter signup box.
3. Removed hardcoded bottom placeholder texts and integrated dynamic, settings-driven payment method badges (Visa, Mastercard, PayPal, Amex, Klarna, etc.) aligned in the footer bottom.

---

### [2026-06-07] v2.2.0 — Shopify-Style Navigation Menu Customizer
**Files Updated:** supabase/migrations/20260607250000_add_navigation_menu_settings.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/settings.ts, components/admin/SettingsForm.tsx, components/common/Navbar.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Added `navigation_menu` (JSONB, default `[]`) and `header_desktop_menu_align` (TEXT, default `'center'`) columns to `store_settings`.
2. Initialized default menu items (Home, Shop) for the existing settings singleton row.
3. Added `NavigationItem` interface to `lib/types.ts` and `navigationMenu` / `headerDesktopMenuAlign` fields to `StoreSettings`.
4. Updated `lib/services/settings.ts` `mapSettings` to map `navigation_menu` → `navigationMenu` and `updateSettings` to serialize it back.
5. Added full Navigation Menu Customizer UI in `SettingsForm.tsx`: tree view of items with up/down reorder, indent/outdent nesting (max 2 levels), edit/delete per item, and an add/edit modal supporting custom URL, category link, product link, and system page link types.
6. Updated `Navbar.tsx` desktop header to dynamically render the custom nav menu in the configured alignment slot with hover dropdown support for sub-menu items.
7. Updated `Navbar.tsx` mobile drawer to use scrollable layout with categories at top → custom nav items (accordion-style) in middle → Quick Links (Cart/Wishlist/Admin) at bottom.

---

### [2026-06-07] v2.1.0 — Review Statistics Synchronization & Mobile Header Click Fix
**Files Updated:** supabase/migrations/20260607240000_sync_product_reviews_count_and_rating.sql, lib/services/reviews.ts, components/common/Navbar.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Created database migration to update existing product reviews counts and ratings based on approved reviews in the database.
2. Added `trigger_update_product_reviews_stats` in Supabase Postgres to automatically update `products.reviews_count` and `products.rating` whenever reviews are inserted, updated (approved), or deleted.
3. Updated `reviews.ts` server actions (`submitReview`, `approveReview`, `deleteReview`) to call `revalidateTag('products', 'max')` to invalidate the storefront products cache edge tag, immediately updating storefront product cards.
4. Fixed mobile header click interception by changing the layout from a rigid grid to a flexible flexbox layout, ensuring slot bounds do not overlap and the search button receives click events correctly.

---

### [2026-06-07] v2.0.0 — Separate Archive & Product Detail Swatch Sizes and Alignments
**Files Updated:** supabase/migrations/20260607220000_separate_swatch_sizes.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/settings.ts, components/admin/SettingsForm.tsx, components/store/ProductCard.tsx, components/store/VariantSelector.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Created store_settings database columns `archive_swatch_size` (TEXT DEFAULT 'md'), `product_swatch_size` (TEXT DEFAULT 'md'), and `archive_swatch_align` (TEXT DEFAULT 'left').
2. Updated TypeScript interfaces and database mapper/service actions to load and save the new fields.
3. Redesigned Swatch Display Settings inside the Admin Settings Panel to support distinct sizes (sm, md, lg, xl, xxl) for archive (catalog cards) and product details pages.
4. Added left, center, right alignment controls for the Archive swatches in Admin Panel settings.
5. Updated catalog card `ProductCard` to apply `archiveSwatchAlign` class (`justify-start`, `justify-center`, or `justify-end`) and resize catalog swatches to `sm`, `md`, `lg`, `xl`, or `xxl` based on settings.
6. Updated product details page `VariantSelector` to respect `productSwatchSize` (sm, md, lg, xl, xxl) and dynamically scale the touch target button wrappers (`w-11 h-11`, `w-12 h-12`, `w-14 h-14`) to prevent layouts from overflowing.

---

### [2026-06-07] v1.9.0 — Storefront Polish, Badges Manager, Image Ratios & Clamping
**Files Updated:** supabase/migrations/20260607210000_add_badges_and_hover_settings.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/badges.ts (NEW), lib/services/products.ts, lib/services/settings.ts, app/admin/layout.tsx, app/admin/badges/page.tsx (NEW), components/admin/BadgeManager.tsx (NEW), components/admin/SettingsForm.tsx, components/admin/ProductForm.tsx, components/store/ProductCard.tsx, components/store/ProductDetail.tsx, components/store/VariantSelector.tsx, SCHEMA_CHANGE_LOG.md
**Changes:**
1. Created `badges` table with name, background color, text color, and full RLS policies.
2. Added `custom_badge_id` and `badge_enabled` to products. Added `image_hover_style`, `image_aspect_ratio`, and `title_line_limit` to store_settings.
3. Created `badges.ts` service for CRUD. Updated products and settings services to map these fields.
4. Added "Badges" link to admin sidebar and created `/admin/badges` page with a rich BadgeManager interface (live preview).
5. Integrated badge selection dropdown and toggle switch on Add/Edit product tabs.
6. Added settings inputs for Image Hover Style, Image Aspect Ratio, and Title Clamping.
7. Fixed catalog card spacing (swatches no longer touch button) and mobile button sizing (now fits exactly on one line).
8. Implemented catalog hover fade image transition (swaps between 1st and 2nd images) and badge overlays (Sale, Featured, and Custom Badges).
9. Fixed product detail image gallery variant synchronizations by memoizing attributes and wrapping callback handlers in stable useCallback.

---

### [2026-06-07] v1.8.0 — Swatch Card Limits, Default Variant Indexes & Catalog Swatch Toggles
**Files Updated:** supabase/migrations/20260607200000_archive_swatch_settings.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/products.ts, lib/services/settings.ts, components/admin/SettingsForm.tsx, components/admin/ProductForm.tsx, components/store/ProductCard.tsx
**Changes:**
1. Created database columns `swatch_limit` (INTEGER DEFAULT 8) and `default_variant_index` (INTEGER DEFAULT 1) in `store_settings`.
2. Created database column `show_swatches_on_archive` (BOOLEAN DEFAULT true) in `products`.
3. Updated all typescript types and service layers to map and save these settings.
4. Added settings fields in the Admin Settings panel to configure maximum swatch display limit (1-20) and default variant index (1st-5th variant) shown on catalog lists.
5. Added a toggle switch in the Admin Product Form to enable/disable showing swatches on archive cards per product.
6. Overhauled catalog cards (`ProductCard.tsx`) to respect swatch limit slicing, show/hide swatch lists based on per-product catalog visibility, and override the initial card display price/image with the user's default variant choice.

---

### [2026-06-07] v1.7.0 — Swatch Enhancements & Per-Product Swatches Control
**Files Updated:** supabase/migrations/20260607190000_add_enable_swatches_to_products.sql, supabase/schema/SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/products.ts, components/admin/ProductForm.tsx, components/store/VariantSelector.tsx, components/store/ProductDetail.tsx
**Changes:**
1. Created database column `enable_swatches` (BOOLEAN DEFAULT true) on `products` table.
2. Updated TypeScript interfaces and database mapper/service actions to load/save `enableSwatches`.
3. Replaced the `Linked image URL` text input inside the Color Settings section of the product form with a dropdown populated by the product's uploaded/selected images.
4. Added an `Enable Visual Swatches` toggle switch under the Product Variants section in the Admin Panel to control whether color swatches are rendered for that specific product.
5. Updated storefront `VariantSelector` to respect both global and per-product swatch settings, dynamically rendering color circles/squares or falling back to text-based button labels.

---

### [2026-06-07] v1.6.0 — Advanced Variant Swatch System + Media Library
Files Updated: supabase/migrations/20260607180000_variant_color_image.sql, lib/types.ts, lib/services/products.ts, lib/services/settings.ts, lib/services/variantPresets.ts (NEW), components/admin/ProductForm.tsx, components/admin/SettingsForm.tsx, components/store/ProductCard.tsx, components/store/ProductGrid.tsx, app/admin/variants/page.tsx (NEW), app/admin/media/page.tsx (NEW), app/admin/layout.tsx
Changes:
1. Added `color_hex` to `product_variants` table.
2. Added `enable_variant_swatches`, `swatch_shape`, `swatch_size` to `store_settings`.
3. New `variant_presets` table for reusable variant sets.
4. ProductForm: rebuilt variant builder with tag-chip input, hex picker, image URL per color, preset import, cross-product generation.
5. ProductCard: color swatches on catalog cards with hover image preview, settings-driven shape/size.
6. New admin pages: /admin/variants (presets management) and /admin/media (media library).
7. Admin sidebar: Added Variants + Media nav items.
⚠️ Run supabase/migrations/20260607180000_variant_color_image.sql in Supabase SQL Editor!

### [2026-06-07] v1.4.0 — Editable Scrolling Ticker (Infinite Marquee)
Files Updated: supabase/migrations/20260607070000_add_ticker_settings.sql, SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/settings.ts, components/admin/SettingsForm.tsx, app/(store)/product/[slug]/page.tsx
Changes:
1. Added database columns `enable_ticker` (BOOLEAN) and `ticker_text` (TEXT) to the `store_settings` table.
2. Updated TypeScript types in `lib/types.ts` and Supabase settings server actions in `lib/services/settings.ts` to map and update these settings.
3. Implemented settings input components (enable toggle, textarea for line-by-line configuration) in the admin panel `SettingsForm.tsx`.
4. Rendered an infinite scrolling marquee scroller between product details and customer reviews on the product storefront page.

---

### [2026-06-07] v1.3.0 — Customizable Live Viewer Counter & Trust Badges Settings
Files Updated: supabase/migrations/20260607060000_add_settings_trust_and_views.sql, SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/settings.ts, components/admin/SettingsForm.tsx, components/store/ProductDetail.tsx
Changes:
1. Added database columns to `store_settings` to toggle/customize fake viewer counter ranges and custom trust text.
2. Updated Admin settings dashboard (`components/admin/SettingsForm.tsx`) with form inputs for minimum/maximum viewer ranges, toggle state, delivery texts, and safe checkout checkbox lists.
3. Updated storefront detail layout to read settings configuration and dynamically display the custom delivery terms, discount coupons, and payment card logos.

---

### [2026-06-07] v1.2.0 — Manual Ratings, Reviews Count, Wishlisting & Sharing
Files Updated: supabase/migrations/20260607050000_add_product_reviews_count_and_rating.sql, SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/products.ts, components/admin/ProductForm.tsx, components/store/ProductDetail.tsx, components/common/Navbar.tsx, components/store/WishlistContainer.tsx (created), app/(store)/wishlist/page.tsx (created)
Changes:
1. Added `rating`, `reviews_count`, and `short_description` columns to the `products` table.
2. Updated Admin `ProductForm` to edit these three fields, including auto mapping.
3. Enhanced storefront `ProductDetail` component to render star rating, short description, dynamic trust views badge, WhatsApp question button, social share modal (Facebook, X, Pinterest, Instagram intents), and persistent wishlist toggles.
4. Integrated wishlist badge to Navbar and created a dedicated customer `/wishlist` catalog page displaying saved items.

---

### [2026-06-07] v1.1.0 — Product Reviews System
Files Updated: supabase/migrations/20260607000001_add_reviews.sql, SUPER_MASTER_SCHEMA.sql, lib/types.ts, lib/services/reviews.ts, components/store/ReviewsList.tsx, components/store/ReviewForm.tsx, components/store/StarRating.tsx, app/admin/reviews/page.tsx
Changes:
1. reviews table with rating, comment, customer_name, approved flag
2. RLS: public can read approved + insert new, admin full access
3. Admin approve/reject panel at /admin/reviews

---

### [2026-06-07] v1.0.0 — Initial Schema

**Files Updated:**
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (created)
- `lib/types.ts` (created)

**Changes:**
1. **`categories`** table — name, slug, image, sort_order, active
2. **`products`** table — name, slug, price, compare_price, cost, sku, stock, has_variants, is_service, is_featured, active, tags
3. **`product_images`** table — multiple images per product, sort_order, is_primary
4. **`product_variants`** table — color, size, material, custom_option, price override, stock per variant
5. **`product_modifiers`** table — add-ons with price (e.g. Gift Wrap +50)
6. **`store_settings`** table — singleton row, WhatsApp number, currency, feature toggles
7. **`orders`** table — WhatsApp order tracking, auto order_number (ZE-0001 format)
8. **Storage Bucket** — `product-images` public bucket with RLS policies
9. **RLS Policies** — Public read active products, Admin full access (authenticated)
10. **Triggers** — updated_at auto-update, order_number sequence

### [2026-06-07] v1.0.0 — Initial Schema Deployment

**Files Updated:**
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (created & pushed)
- `lib/types.ts` (created)
- `lib/services/*` (created)

**Changes:**
1. Initialized core database schema tables for Zaynahs E-Store (`categories`, `products`, `product_images`, `product_variants`, `product_modifiers`, `store_settings`, `orders`, `schema_version`).
2. Pushed the schema to Supabase hosting using direct psql configuration.
3. Implemented full Next.js App Router application with RLS policies, storage bucket rules, and WhatsApp checkout integration.

---

### [2026-06-07] v1.0.1 — Admin Email Security Restriction

**Files Updated:**
- `.env.local`
- `app/admin/login/page.tsx`
- `middleware.ts`

**Changes:**
1. Configured owner's admin email address `shoaibzaynah@gmail.com` in environment configurations (`NEXT_PUBLIC_ADMIN_EMAIL`).
2. Restricted sign-in attempts on `/admin/login` page so only the verified configured email address is permitted.
3. Added matching check in standard routes `middleware` file to prevent auth session hijacking or bypassing by other accounts.

---

### [2026-06-07] v1.0.2 — Password Forget & Reset System

**Files Updated:**
- `middleware.ts`
- `app/admin/login/page.tsx`
- `app/admin/forgot-password/page.tsx` (created)
- `app/admin/reset-password/page.tsx` (created)

**Changes:**
1. Created `/admin/forgot-password` page to request password reset emails through Supabase Auth, validating that the input email matches the owner's email address.
2. Created `/admin/reset-password` page which parses the redirect authentication token and saves the new password using `supabase.auth.updateUser`.
3. Allowed forgot password and reset password routes to bypass auth middleware redirects so they are reachable during recovery.
4. Added recovery trigger prompt below password input field on `/admin/login` page.

### [2026-06-07] v1.0.3 — Dark Mode, PWA & Brand Asset Upload Panel

**Files Updated:**
- `supabase/migrations/20260607033500_add_favicon_url_to_settings.sql` (created)
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
- `package.json` (modified)
- `lib/types.ts` (modified)
- `lib/services/settings.ts` (modified)
- `lib/services/storage.ts` (modified)
- `lib/utils/imageCompressor.ts` (created)
- `app/globals.css` (modified)
- `components/common/ThemeToggle.tsx` (created)
- `components/common/Navbar.tsx` (modified)
- `app/admin/layout.tsx` (modified)
- `components/admin/SettingsForm.tsx` (modified)
- `app/layout.tsx` (modified)
- `app/(store)/layout.tsx` (modified)
- `gemini.md` (modified)

**Changes:**
1. **Database settings extension** — Created migration script adding `favicon_url` and `logo_width` columns to the `store_settings` table.
2. **HEIC/HEIF & Compressor Utility** — Implemented client-side smart compression using canvas loops, resizing and optimizing all image uploads to WebP files under 50 KB. Integrated iPhone HEIC/HEIF compatibility via client-side `heic2any` dynamic imports.
3. **Settings branding panel** — Completely redesigned the branding assets panel on settings screen, replacing plain text URLs with direct drag-and-drop file uploads for Logo, Banner, and Favicon. Added slider control to adjust and persist the logo display size.
4. **Theme Switcher** — Configured class-based dark mode switching via Tailwind CSS v4 custom variant and added client `ThemeToggle` component to customer and admin headers. Added global form contrast overrides in `globals.css`.
5. **Dynamic Branding** — Updated Next.js metadata dynamically to read current settings name, tagline, and favicon from the database.

### [2026-06-07] v1.0.4 — next-themes Integration, Typos Standardization & Contrast Polish

**Files Updated:**
- `app/globals.css`
- `components/store/CategoryFilter.tsx`
- `components/store/CartContainer.tsx`
- `components/admin/CategoryManager.tsx`
- `components/store/ProductDetail.tsx`
- `app/admin/login/page.tsx`
- `app/admin/forgot-password/page.tsx`
- `app/admin/reset-password/page.tsx`
- `components/admin/OrderLog.tsx`
- `app/admin/layout.tsx`
- `app/admin/dashboard/page.tsx`
- `components/common/Navbar.tsx`
- `components/store/CartBar.tsx`
- `components/store/SearchBar.tsx`
- `components/store/VariantSelector.tsx`
- `components/admin/SettingsForm.tsx`
- `gemini.md`

**Changes:**
1. **Tailwind v4 Variant Standardization**: Replaced `@custom-variant` with the standard `@variant dark (&:where(.dark, .dark *))` directive in `globals.css` for class-based dark mode compatibility.
2. **Standardized Tailwind Overrides**: Configured clean global dark overrides in `globals.css` (e.g. `.dark .bg-white`, `.dark .text-gray-900`, `.dark .text-gray-500`) to act as a dynamic, robust fallback for all standard colors, immediately fixing contrast issues across tables, headers, and form inputs.
3. **Color Typo Standardization**: Cleaned up all non-standard colors (e.g. `gray-250`, `gray-205`, `gray-955`, `gray-755`, `gray-55`, `gray-350`, `gray-550`, `red-550`) and replaced them with standard Tailwind CSS gray scale and color weights.
4. **Dark Mode Contrast Polish**: Fully implemented `dark:` variant support across checkout pages, variant selections, mobile sticky cart bars, dashboards, login pages, and inputs to ensure zero text or layout contrast regressions.

---

### [2026-06-07] v1.0.5 — Next.js ISR Caching for Storefront

**Files Updated:**
- `lib/services/products.ts` (modified)
- `lib/services/categories.ts` (modified)
- `lib/services/settings.ts` (modified)

**Changes:**
1. **Products Cache** — Wrapped `getProducts()` and `getProductBySlug()` with `unstable_cache` using tag `products` and 1-hour TTL. Uses cookie-free `staticSupabase` client to avoid Dynamic Server Usage errors.
2. **Categories Cache** — Wrapped `getCategories()` with `unstable_cache` using tag `categories` and 1-hour TTL. Cookie-free client used inside the cache boundary.
3. **Settings Cache** — Wrapped `getSettings()` with `unstable_cache` using tag `settings` and 1-hour TTL. Cookie-free client used inside the cache boundary.

4. **On-Demand Revalidation** — All admin CRUD mutations call `revalidateTag(...)` to instantly refresh storefront cache.
5. **Admin reads remain dynamic** — `getAllProductsAdmin`, `getProductById`, `getAllCategories` still use cookie-aware SSR client.

---

### [2026-06-07] v1.0.6 — Dark Mode Switching Fix & Admin Page Visibility

**Files Updated:**
- `app/(store)/layout.tsx`
- `components/store/StoreFront.tsx`
- `app/admin/layout.tsx`
- `app/admin/categories/page.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/products/new/page.tsx`
- `app/admin/products/[id]/page.tsx`

**Changes:**
1. **Store layout dark mode** — Added `dark:bg-[#0f0f1b]` and `dark:text-gray-100` to the store layout wrapper div and `<main>` element. Previously the entire content area stayed white in dark mode.
2. **StoreFront component** — Added `dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100` to root div so product grid area switches properly.
3. **Admin main content** — Added `dark:bg-[#0f0f1b]` to the `<main>` element in admin layout so admin pages switch background on theme toggle.
4. **All admin page headings** — Added `dark:text-white` to all `<h1>` elements and `dark:text-gray-400` to subtitle `<p>` elements across categories, orders, settings, new product, and edit product pages.

---

### [2026-06-07] v1.0.7 — next.config Image Domains + Image Compressor Rewrite

**Files Updated:**
- `next.config.ts`
- `lib/utils/imageCompressor.ts`
- `components/admin/ProductForm.tsx`
- `components/admin/ProductList.tsx`
- `components/admin/SettingsForm.tsx`

**Changes:**
1. **next.config.ts** — Added Supabase storage hostname (`jqwqgiqfvjdxaohzvjuv.supabase.co`) to `images.remotePatterns` so `next/image` can render uploaded product images, logos, and banners without "hostname not configured" errors. Added `formats: ['image/webp', 'image/avif']`.
2. **Admin image previews** — Replaced `<Image>` (next/image) with plain `<img>` in `ProductForm` image grid and `ProductList` thumbnail to eliminate domain restriction errors in admin panel.
3. **imageCompressor.ts — Complete Rewrite** — Replaced single-strategy HEIC converter with a 3-strategy fallback chain:
   - **Strategy 1**: `createImageBitmap(file)` — fastest, uses OS HEIC codec natively on macOS/iOS
   - **Strategy 2**: `ObjectURL → <img> → createImageBitmap` — uses OS decoder via img element, works for HEIC on macOS Chrome where Strategy 1 fails
   - **Strategy 3**: `heic2any` → `createImageBitmap` — pure WASM fallback for HEIC on Windows/Linux
   - **Fixed canvas self-draw bug** — now uses a separate temp canvas for resolution reduction passes instead of drawing the canvas onto itself
   - **Clear error messages** — instead of silently uploading a broken HEIC file, throws user-visible errors shown as toast notifications
   - **WebP target**: max 1200px initial dim, iterative quality `0.88→0.15`, resolution reduces 75% every 4 passes, target under 50 KB
4. **Error toasts** — Updated `SettingsForm` and `ProductForm` upload catch blocks to show the actual compressor error message (not a generic string) so users know exactly what action to take.

---

### [2026-06-07] v1.0.8 — Server-Side HEIC Conversion (Sharp API Route)

**Files Updated:**
- `app/api/upload-image/route.ts` (created)
- `lib/services/storage.ts` (modified)
- `next.config.ts` (modified)
- `components/common/Navbar.tsx` (modified)
- `package.json` (modified — `sharp` added)

**Changes:**
1. **Sharp installed** — `sharp@0.34.5` added with libheif `1.20.2` and libvips `8.17.3` providing native HEIC/HEIF decoding server-side.
2. **`/api/upload-image` route** — New Next.js API route that accepts any image file (including HEIC) via FormData, converts to WebP under 50KB using Sharp, and uploads to Supabase Storage using service role key. Iterative quality + resolution reduction loop.
3. **`storage.ts` rewrite** — `uploadProductImage` and `uploadSettingsImage` now use the server API route as primary upload method. Client-side canvas compression is retained as fallback if the API is unreachable.
4. **`next.config.ts`** — Added `serverActions.bodySizeLimit: '25mb'` to allow large HEIC originals (iPhone HEIC files can be 4–12MB).
5. **Navbar hydration fix** — Cart badge count (from Zustand persist/localStorage) caused React SSR/CSR mismatch. Fixed by rendering badge only after `useEffect` mount, eliminating the hydration error.

---

### [2026-06-07] v1.0.9 — Storefront Header Layout & Color Customization Settings

**Files Updated / Created:**
- `supabase/migrations/20260607230000_header_layout_settings.sql` (created)
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
- `lib/types.ts` (modified)
- `lib/services/settings.ts` (modified)
- `components/admin/SettingsForm.tsx` (modified)
- `components/common/Navbar.tsx` (modified)
- `app/(store)/layout.tsx` (modified)

**Changes:**
1. **Database Schema** — Added 20 new configuration columns to the `store_settings` table, including layout flags (`header_show_top_bar`, `header_show_newsletter`), text values (`header_top_bar_phone`, `header_top_bar_email`, `header_newsletter_text`), style values (`header_top_bar_bg`, `header_top_bar_text_color`, `header_bg`, `header_text_color`, `header_border_color`), and alignments for Desktop and Mobile (Logo, Search, Wishlist, Cart, Theme, and Mobile Menu alignments).
2. **Settings Service Serialization** — Updated `mapSettings` mapper and `updateSettings` database queries to fully serialize, save, and edge-cache the new header settings.
3. **Admin settings form visual controls** — Added a premium **"Header Layout & Appearance Customizer"** card inside settings admin form. Features toggles for top bar/newsletter features, contact/news fields, alignment dropdowns for mobile/desktop layout elements, and double-bound type color pickers with hex text inputs.
4. **Dynamic dynamic slot-aligned Header Layouts** — Upgraded `Navbar.tsx` to read settings, render dynamic Left/Center/Right slot containers, group layout elements dynamically based on user preferences, render top-bar contact lists, and output a dynamic marquee text bar.
5. **Mobile Category Menu Drawer** — Implemented an overlay category list navigation drawer toggleable via Menu button, rendering all active database categories on mobile viewports.
6. **Graceful dark mode styling fallback** — If background or border settings are default, the header falls back to Tailwind's default class-based dark mode structures. When modified, inline overrides are applied directly to elements.


---

### [2026-06-07] v1.1.0 — WooCommerce Shop Page & Mobile Navigation Upgrades

**Files Updated / Created:**
- `app/(store)/shop/page.tsx` (created)
- `components/store/ShopPage.tsx` (created)
- `components/common/MobileBottomNav.tsx` (created)
- `components/common/FloatingContacts.tsx` (modified)
- `components/store/ProductCard.tsx` (modified)
- `app/(store)/layout.tsx` (modified)

**Changes:**
1. **Dynamic WooCommerce Shop Page** — Set up `/shop` routing page fetching live products, categories, and settings from cache-aware services. Included detailed filter controls (double range price slider, category counts, product availability checks, featured products list, grid toggles) and layout adapters.
2. **Persistent Mobile Navigation** — Embedded a sticky bottom navigation tab bar containing direct shortcuts to Home, Account, Shop, Wishlist, and Cart. Fully synced counts for Wishlist items (local storage listener) and Cart items (Zustand state).
3. **Floating Social Contacts** — Built quick floating links for WhatsApp chats and Instagram profile URLs, anchored above the bottom nav bar on mobile to prevent overlapping.
4. **Card overlays & Ratings** — Removed standard catalog card CTAs, replacing them with star rating counts below the title and overlay circles inside the image container for Wishlist, Detail view, and Quick Cart add.
5. **Tailwind Standardizations** — Replaced non-standard tailwind gray colors (`gray-955`, `gray-650`, `gray-250`, `gray-755`) with official Tailwind weights (`gray-900`, `gray-600`, `gray-200`, `gray-700`) across components to enforce color standardization.
6. **Search Redirect Update** — Updated search submission input enter event and "View all results" link in the navbar suggestions overlay to route queries to `/shop?search=...` instead of the homepage, integrating global searches directly with the shop catalog page.
7. **Category Menu Redirects** — Re-routed category click navigation links inside the mobile navigation menu drawer to redirect directly to `/shop?category=...` rather than the homepage, unifying category listings onto the WooCommerce-style catalog.
8. **Top Bar Contacts & Announcement Slider** — Hid top-bar contacts on mobile (using `hidden md:flex`) and mapped them inside the mobile navigation menu drawer instead. Converted the marquee announcement ticker text input inside the admin Settings form into a `textarea` supporting multiple announcements (one per line) which are parsed and automatically rotated/faded every 4 seconds on the storefront header top bar.
9. **React Hook Extraction Fix** — Extracted the list card helper method (`renderListCard`) inside `ShopPage.tsx` into a standalone React component `ShopProductListCard` to satisfy the Rules of Hooks and prevent runtime hook ordering errors on search/category filters update.

---

### [2026-06-07] v1.2.0 — Customer Accounts & Admin Customers Directory

**Files Updated / Created:**
- `supabase/migrations/20260607260000_add_customers_table.sql` (created)
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
- `lib/utils/customer-auth.ts` (created)
- `lib/services/customers.ts` (created)
- `app/(store)/login/page.tsx` (created)
- `app/(store)/signup/page.tsx` (created)
- `app/(store)/account/page.tsx` (created)
- `app/admin/customers/page.tsx` (created)
- `app/admin/layout.tsx` (modified)
- `components/common/Navbar.tsx` (modified)

**Changes:**
1. **Customer Database & RLS** — Created `customers` table with secure password hashing and added `customer_id` relation to the `orders` table. Configured granular RLS policies for public signup and admin read.
2. **Old Orders Linker** — Built automatic linking during signup/login which automatically pairs previous orders with matching email/phone to the newly created customer profile.
3. **Session-Isolation Authentication** — Programmed custom, secure HttpOnly cookie session system using Node's `crypto` module to isolate admin sessions from storefront customer accounts.
4. **Shopify-Style Customer Portal** — Added mobile-first `/login`, `/signup`, and `/account` pages where customers can view profile details, order histories, status pills, and tracking updates.
5. **Admin Customers Directory** — Implemented `/admin/customers` page showing registered customers, registration dates, LTV spent, and quick communication buttons (WhatsApp, Phone, Email redirection). Mapped the Users icon link inside the Admin layout sidebar.
6. **Navbar Account Synced** — Synced Customer session with navbar layout slots, displaying "Account" navigation links and updating mobile drawer Quick Links to point to user portal if logged in.

### [2026-06-08 00:13] - Add FAQ and Return/Exchange Policy Settings

**Files Updated / Created:**
- `supabase/migrations/20260608001000_add_faq_and_return_policy_to_settings.sql` (created)
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)

**Changes:**
1. Added `faq_content` and `return_policy_content` columns to `store_settings` to house HTML/rich-text content for Frequently Asked Questions and Return & Exchange policies.

### [2026-06-08 00:30] - Add Homepage Trust Badges Settings

**Files Updated / Created:**
- `supabase/migrations/20260608002000_add_homepage_trust_badges_to_settings.sql` (created)
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)

**Changes:**
1. Added 12 columns for 4 customizable homepage trust badges (`trust_badge_X_title`, `trust_badge_X_desc`, `trust_badge_X_icon`) to `store_settings`.

### [2026-06-08 00:36] - Add Individual Badge Toggles, Socials & Shopify Footer Settings

**Files Updated / Created:**
- `supabase/migrations/20260608003000_add_badges_socials_and_footer_editable_fields.sql` (created)
- `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)

**Changes:**
1. Added individual enable/disable toggles for trust badges (`trust_badge_X_enabled`) to `store_settings`.
2. Added social links for TikTok (`social_tiktok`), Snapchat (`social_snapchat`), and Twitter (`social_twitter`) to settings.
3. Added customizable Shopify-style footer settings fields (`footer_col_X_title` and `footer_col_X_text`) for full admin content control.




## 2026-06-08 - UI Updates: Payment Badges & Header News Slider
- **Files changed:** `components/common/PaymentBadges.tsx`, `components/common/Footer.tsx`, `components/store/ProductDetail.tsx`, `components/common/Navbar.tsx`
- **What changed:** Centralized `PaymentBadges` into a single reusable component. Ensured `enableSafeCheckout` setting globally toggles badges in both Footer and Product Page. Added left/right navigation arrows to Header News (top bar) for multiple announcements. Fixed mobile header logo layout alignment to be perfectly centered.

### [2026-06-08 02:08] - Add Floating Social Contact Customizer Settings
- **Files Updated / Created:**
  - `supabase/migrations/20260608005000_add_floating_contacts_settings.sql` (created)
  - `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
- **What changed:**
  1. Added 13 new database configuration columns to `store_settings` to allow full customization of the floating social buttons (WhatsApp, Instagram, TikTok, Snapchat, Twitter). Toggles, positions (left/right), vertical and horizontal offsets for mobile and desktop, size scale factors, and WhatsApp greeting message preset.

### [2026-06-08 06:20] - Add Header Sticky Customization & Shop Filter/Menu Touch Fixes
- **Files Updated / Created:**
  - `supabase/migrations/20260608006000_add_header_sticky_to_settings.sql` (created)
  - `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
  - `lib/types.ts` (modified)
  - `lib/services/settings.ts` (modified)
  - `components/admin/SettingsForm.tsx` (modified)
  - `components/common/Navbar.tsx` (modified)
  - `components/store/ProductCard.tsx` (modified)
  - `components/store/ProductDetail.tsx` (modified)
  - `components/store/ShopPage.tsx` (modified)
  - `app/layout.tsx` (modified)
- **What changed:**
  1. **Sticky Header Settings** — Added `header_sticky` column to `store_settings` and corresponding Admin settings form toggle. Updated services, mappers, and types. Modified `Navbar.tsx` to dynamically toggle between sticky and relative header based on the user preference.
  2. **Mobile Touch Hover** — Implemented touch event simulation on storefront product cards to trigger image hover (swapping to secondary image or zooming) cleanly on mobile screens.
  3. **Product Gallery Navigation** — Fixed detail page gallery navigation arrows visibility by making them always visible on mobile, since hover triggers are unavailable.
  4. **Description Tabs Collapse** — Implemented an expand/collapse (Read More/Read Less) toggle on product detail description contents with bottom gradients.
  5. **Drawer Theme Switcher** — Moved the light/dark mode switch into the mobile drawer header next to the close button and configured `ThemeProvider` to default to `light` theme.
  6. **Shop Page Filter Scroller** — Configured the shop page mobile filter sheet and categories list layout to support touch-first, top-down scrolling with `overscroll-contain touch-pan-y` and expanded nested scrollbars to prevent gesture hijacking.

### [2026-06-08 06:50] - v1.3.0 — Premium Storefront Feature Enable/Disable Toggles
- **Files Updated / Created:**
  - `supabase/migrations/20260608007000_premium_theme_and_customizer.sql` (created)
  - `supabase/migrations/20260608008000_add_premium_features_toggles.sql` (created)
  - `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
  - `lib/types.ts` (modified)
  - `lib/services/settings.ts` (modified)
  - `components/admin/SettingsForm.tsx` (modified)
- **What changed:**
  1. **Feature toggles** — Added database configuration toggle flags in `store_settings` to enable/disable specific marketing widgets (Recent Buyers ticker, Exit Intent popup, Cookie banner, Spin-to-Win wheel, Progress Bar, Volume Discounts, FBT bundles, Stock Urgency, Flash Sale count, Social feeds, Cart expiration, Size guides).

### [2026-06-08 07:15] - v1.4.0 — Ticker, Exit Intent & Cookie Banner Customization
- **Files Updated / Created:**
  - `supabase/migrations/20260608009000_add_recent_buyers_advanced_settings.sql` (created)
  - `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
  - `lib/types.ts` (modified)
  - `lib/services/settings.ts` (modified)
  - `components/admin/SettingsForm.tsx` (modified)
- **What changed:**
  1. **Dynamic Ticker Controls** — Enabled admin inputs for simulated buyer names/cities or real order tracking from the database, custom product pools (featured, sale, custom checklist selection), and timing delay sliders.
  2. **Exit Intent Popup** — Configured dynamic coupon codes, popup delay slider, and HEIC-native compression image uploader.
  3. **Cookie Consent custom styling** — Integrated custom consent button and description texts.

### [2026-06-08 07:30] - v1.5.0 — Dynamic Product Size Guides Preset System
- **Files Updated / Created:**
  - `supabase/migrations/20260608010000_add_size_guides_table.sql` (created)
  - `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
  - `lib/services/sizeGuides.ts` (created)
  - `components/admin/SettingsForm.tsx` (modified)
  - `components/store/ProductDetail.tsx` (modified)
- **What changed:**
  1. **Sizing Presets Database Table** — Created `size_guides` table storing reusable size charts in JSON columns along with measurement diagrams.
  2. **Interactive Size Table Editor** — Added spreadsheet-style sizing table builder in Admin Settings supporting custom comma-separated columns, row appends, and optimized WebP measurement diagram file uploads.
  3. **Storefront Detail Modal** — Integrated sizing chart modal overlay next to product share icons.

### [2026-06-08 07:45] - v1.6.0 — Coupons Management & E-Commerce Campaign Visuals
- **Files Updated / Created:**
  - `supabase/migrations/20260608020000_coupons_fbt_flash_social_settings.sql` (created)
  - `supabase/schema/SUPER_MASTER_SCHEMA.sql` (modified)
  - `lib/services/coupons.ts` (created)
  - `components/admin/SettingsForm.tsx` (modified)
  - `components/store/CartDrawer.tsx` (modified)
  - `components/store/CartContainer.tsx` (modified)
- **What changed:**
  1. **Coupons Database** — Created `coupons` table supporting percentage/fixed discounts, minimum subtotal checkouts validation, and status flags.
  2. **Admin Coupons Manager** — Created coupons creator with validation states in Settings.
  3. **Visual Customization** — Programmed Admin controls for Frequently Bought Together products, customizable Instagram/social feeds ribbon, and per-product Countdown sales clocks.

---

### [2026-06-11] v2.6.0 — Loading Skeletons Color Scale Standardization & Customizer Loaders
**Files Updated:** [LoadingSkeleton.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/common/LoadingSkeleton.tsx), [app/(store)/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/%28store%29/loading.tsx), [app/admin/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/loading.tsx), [app/admin/dashboard/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/dashboard/loading.tsx), [app/admin/products/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/products/loading.tsx), [app/admin/categories/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/categories/loading.tsx), [app/admin/orders/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/orders/loading.tsx), [app/admin/settings/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/settings/loading.tsx), [app/admin/settings/customizer/loading.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/settings/customizer/loading.tsx), [gemini.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/gemini.md)
**Changes:**
1. Standardized all skeleton loaders in both customer storefront and admin route loaders to use Tailwind standard color weight `bg-gray-100` (and `dark:bg-gray-800`), eliminating non-standard colors (`bg-gray-150`, `bg-gray-155`).
2. Documented the skeleton color scale rules in `RULE K1` inside `gemini.md`.

---

### [2026-06-11] v2.7.0 — Customizer Preview Layout Bypass & Scaled Viewports
**Files Updated:** [layout.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/layout.tsx), [CustomizerEditor.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/CustomizerEditor.tsx), [Icons.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/common/Icons.tsx)
**Changes:**
1. Exempted the `/admin/settings/customizer/preview` path from the admin dashboard layout wrapper in `app/admin/layout.tsx` so that only the storefront landing page renders inside the iframe preview (no nested admin sidebar/navigation).
2. Added `Tablet` icon to centralized `Icons.tsx` registry.
3. Overhauled customizer viewports in `CustomizerEditor.tsx` to support:
   - **Desktop**: A true `1440px` wide desktop view scaled dynamically using `transform: scale()` via ResizeObserver (optimized with a `0.75` scale multiplier to zoom out and center content beautifully in the preview container). Added `mx-auto` and inline margins to ensure perfect horizontal centering.
   - **Tablet**: Unscaled flexible width viewport.
   - **Mobile**: Anchored mobile smartphone frame with added horizontal centering alignment.

---

### [2026-06-11] v2.8.0 — Full-Screen Customizer, 3-Column Layout & Bidirectional Sync
**Files Updated:** [CustomizerEditor.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/admin/CustomizerEditor.tsx), [StoreFront.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/store/StoreFront.tsx), [page.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/admin/settings/customizer/page.tsx), [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
**Changes:**
1. Overhauled the Homepage Customizer layout into a full-screen application. Removed page-level headers to optimize height.
2. Implemented a 3-column layout mimicking Shopify's Theme Customizer: Left Sidebar (Sections list and order), Center Workspace (Live preview iframe), Right Sidebar (active section property inputs).
3. Created a customizer header containing: Exit to Dashboard (`/admin/dashboard`), Viewport segmented switcher, and "Save Layout" button.
4. Set up fluid, non-scaled Desktop preview (`100%` width/height) to match a real desktop monitor naturally.
5. Implemented bi-directional synchronization:
   - Selecting/ordering a section in the left panel automatically triggers a `scroll_to_section` postMessage event to scroll the preview to that section.
   - Clicking a section inside the preview frame posts a `select_section` event to automatically select and focus that section in the customizer editor.



