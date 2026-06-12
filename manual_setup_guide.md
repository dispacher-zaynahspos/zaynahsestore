# 📖 Zaynahs E-Store — Manual Setup & Tracking Pixels Guide

This guide describes how to configure the newly integrated **Tracking Pixels**, **SEO Variables**, and **AI Settings** on Zaynahs E-Store, along with steps for acquiring IDs and credentials.

---

## 🔗 1. Analytics & Tracking Pixels Setup

You can configure all pixels in the admin dashboard under the **Pixels & SEO** tab. Below is how to obtain the ID for each platform:

### 1.1 Meta Pixel (Facebook)
1. Go to the [Meta Events Manager](https://business.facebook.com/events_manager).
2. Click **Connect Data Sources** and select **Web**.
3. Select **Meta Pixel** and follow the prompts to name it and enter your URL.
4. Copy the **Pixel ID** from the Settings tab (e.g., `123456789012345`).
5. Paste it in the **Meta Pixel ID** field in the store admin panel.

### 1.2 Google Analytics 4 (GA4)
1. Sign in to your [Google Analytics Account](https://analytics.google.com/).
2. Navigate to **Admin** (gear icon) -> **Data Streams** (under the Property column).
3. Click **Add Stream** -> **Web**, enter your website URL, and create the stream.
4. Copy the **Measurement ID** (begins with `G-`, e.g., `G-1A2BC3DE4F`).
5. Paste it in the **GA4 Measurement ID** field in the store admin panel.

### 1.3 Google Tag Manager (GTM)
1. Go to [Google Tag Manager](https://tagmanager.google.com/).
2. Create a container for your website URL.
3. Copy the container ID displayed at the top right of the dashboard (begins with `GTM-`, e.g., `GTM-A1BC2D3`).
4. Paste it in the **GTM Container ID** field in the store admin panel.

### 1.4 TikTok Pixel
1. Access the [TikTok Ads Manager](https://ads.tiktok.com/).
2. Navigate to **Assets** -> **Events** -> **Web Events**.
3. Click **Set Up Web Events**, name your pixel, and choose **TikTok Pixel**.
4. Copy the generated **Pixel ID** (e.g., `C1234567890ABCDEFGH`).
5. Paste it in the **TikTok Pixel ID** field in the store admin panel.

### 1.5 Snapchat Pixel
1. Log into your [Snap Ads Manager](https://ads.snapchat.com/).
2. Go to the top navigation and click **Events Manager**.
3. Click **New Data Source** -> **Web** -> **Snap Pixel**.
4. Copy the **Pixel ID** (a UUID string, e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
5. Paste it in the **Snapchat Pixel ID** field in the store admin panel.

### 1.6 Pinterest Tag
1. Go to [Pinterest Ads Manager](https://ads.pinterest.com/).
2. Select **Ads** -> **Conversions**.
3. Click **Pinterest Tag** -> **Install Pinterest Tag**.
4. Copy the **Tag ID** (e.g., `26XXXXXXXXXXX`).
5. Paste it in the **Pinterest Tag ID** field in the store admin panel.

### 1.7 Twitter / X Pixel
1. Open the [X Ads Manager](https://ads.x.com/).
2. Go to **Tools** -> **Events Manager**.
3. Click **Add Event Source** -> **Universal Pixel**.
4. Copy the generated **Pixel ID** (usually a short code like `xxxxx`).
5. Paste it in the **Twitter / X Pixel ID** field in the store admin panel.

---

## 🎨 2. SEO & Social Meta Configuration

These options are also found under the **Pixels & SEO** tab:

1. **Meta Title Suffix**: A suffix automatically appended to every page title. 
   - **Recommended value**: ` | Zaynahs` or ` | Zaynahs E-Store`.
   - This ensures all product page headers look professional (e.g. `Raw Silk Kurta | Zaynahs`).
2. **Twitter / X Handle**: Your brand's Twitter handle (e.g., `@zaynahs_pk`). 
   - This binds to meta tags so product social shares mention your brand handle.

---

## 🧠 3. AI Settings & Credentials

Configure text copywriting and image vision capabilities in the **AI Settings** tab:

### 3.1 Content Copywriter & SEO Generator
Used to write product titles, descriptions, and SEO details dynamically.
- **Provider**: Select your provider (e.g., Groq, OpenAI, Google Gemini, Anthropic Claude).
- **Model**: Specify the model identifier (e.g., `llama-3.3-70b-versatile` for Groq, `gpt-4o-mini` for OpenAI).
- **API Key**: Enter the respective API key.

### 3.2 Vision & Media Analyzer
Used to analyze product photos, automatically suggest tags, categories, and colors.
- **Provider**: Select your vision provider (e.g., Google Gemini, OpenAI).
- **Model**: Specify the model (e.g., `gemini-2.0-flash` or `gpt-4o`).
- **API Key**: Enter the respective API key.

### 3.3 Persona & Language
- **Tone**: Select the tone of voice (e.g., Bold & Persuasive, Elegant & Luxury-focused).
- **Language**: Choose English, Urdu, or Roman Urdu.
- **Custom System Instructions**: Any specific instructions (e.g., *"Always mention premium fabrics and emphasize the traditional Pakistani craftsmanship"*).

---

## ✉️ 4. Email & SMTP Configuration

You can configure your SMTP credentials in the admin dashboard under the **Email & SMTP** tab:

1. **Gmail SMTP Address**: Your sender Gmail address (e.g. `admin@gmail.com`).
2. **Gmail App Password**: Your generated Google App Password (16-character code, spaces are automatically ignored).
3. **From Name**: The display name shown in email headers (e.g. `Zaynahs E-Store`).
4. **Admin Notification Email**: The address that receives stock warnings, custom order logs, and reviews.
5. **Low Stock Warning Threshold**: The stock limit that triggers low-stock alerts.
6. **Notification Templates**: Enable or disable individual customer/admin email notifications under the **Templates Customizer** sub-settings.

### How to Generate a Gmail App Password:
1. Go to [myaccount.google.com](https://myaccount.google.com/).
2. Select **Security** from the left panel.
3. Under *How you sign in to Google*, ensure **2-Step Verification** is turned **ON**.
4. In the search bar at the top, type **App passwords** and select it.
5. Enter a name for the app password (e.g., `"Zaynahs Store"`) and click **Create**.
6. Copy the 16-character code displayed in the yellow box (spaces are ignored) and paste it into the **Gmail App Password** field in the admin panel.
7. Click **Send Test Email** to verify settings.

> [!NOTE]
> **Email Notifications & WhatsApp Flow:**
> The primary storefront checkout and order confirmations prioritize the WhatsApp messaging flow. Email notifications run concurrently in the background to provide automated order receipts, fulfillment status updates, and admin stock/review alerts.

---

## ⚡ 5. Cache Revalidation & Database Webhooks (Tiered Cache System)

The Zaynahs E-Store uses a multi-layer tiered cache architecture (Browser cache + Cloudflare Edge CDN + Next.js Vercel ISR) to achieve Shopify-level performance and fast page load speeds.

### 5.1 Cloudflare Cache Rules
To optimize static assets and prevent non-static page caching issues, configure the following **Cache Rules** on your Cloudflare dashboard:

1. **Rule 1: No Cache (Cart/Checkout)**
   - **Name**: `no-cache-pages`
   - **Expression**: `(http.request.uri.path contains "/cart") or (http.request.uri.path contains "/checkout") or (http.request.uri.path contains "/account") or (http.request.uri.path contains "/api")`
   - **Settings**: Bypass Cache (Cache status: Bypass)

2. **Rule 2: Static Assets**
   - **Name**: `static-assets`
   - **Expression**: `(http.request.uri.path contains "/_next/static/")`
   - **Settings**: Cache everything, Edge TTL: 1 year

3. **Rule 3: Supabase Storage Images**
   - **Name**: `supabase-images`
   - **Expression**: `(http.host contains "supabase.co")`
   - **Settings**: Cache everything, Edge TTL: 30 days

4. **Rule 4: HTML Pages**
   - **Name**: `html-pages`
   - **Expression**: `/*` (wildcard/remaining paths)
   - **Settings**: Cache everything, Edge TTL: 1 minute

Also, enable **Auto Minify** (HTML, CSS, JS) and **Brotli Compression** under Cloudflare -> Speed -> Optimization.

---

### 5.2 Environment Variables Configuration
Ensure the following variables are set in both your `.env.local` file and **Vercel Dashboard**:

```bash
# === Supabase Core Connection (Required) ===
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres.your-supabase-id:... (Connection Pooler for Prisma/Supa)
DIRECT_URL=postgresql://postgres.your-supabase-id:... (Direct DB Connection)

# === Cache Revalidation & Cloudflare CDN (Required) ===
# Webhook validation token (must match the x-revalidate-secret header in Supabase webhooks)
REVALIDATE_SECRET=your_strong_random_secret_string

# Cloudflare Purge API credentials
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id
CLOUDFLARE_API_TOKEN=your_cloudflare_cache_purge_api_token

# Store public URL (required for purging cache, sitemaps, robots, breadcrumbs)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# === SEO & Search Engine Submission (Optional but Recommended) ===
GOOGLE_SITE_VERIFICATION=your_google_site_verification_code
INDEXNOW_API_KEY=your_indexnow_api_key

# === Brand & Social Configuration (Optional) ===
NEXT_PUBLIC_BRAND_NAME=Zaynahs
NEXT_PUBLIC_TWITTER_HANDLE=@zaynahs_pk

# === Cloudflare Workers AI Credentials (Optional) ===
# Required only if you select Cloudflare as your text or vision provider in admin dashboard
CF_ACCOUNT_ID=your_cloudflare_account_id

# === Automated System Cron (Optional) ===
# Verification secret for background crons (e.g. review request follow-ups)
CRON_SECRET=your_strong_cron_secret_string
```

---

### 5.3 Supabase Database Webhooks Setup
Navigate to your **Supabase Project -> Database -> Webhooks** and configure three webhooks pointing to your deployment's revalidation API:

#### 1. Products Webhook
- **Name**: `revalidate-products`
- **Table**: `products`
- **Events**: `INSERT`, `UPDATE`, `DELETE`
- **HTTP Method**: `POST`
- **URL**: `https://<your-storefront-domain>/api/revalidate`
- **Headers**:
  - Key: `x-revalidate-secret`
  - Value: `your_strong_random_secret_string` (matching `REVALIDATE_SECRET`)

#### 2. Banners Webhook
- **Name**: `revalidate-banners`
- **Table**: `banners` (or `homepage_sections` if managed dynamically)
- **Events**: `INSERT`, `UPDATE`, `DELETE`
- **HTTP Method**: `POST`
- **URL**: `https://<your-storefront-domain>/api/revalidate`
- **Headers**:
  - Key: `x-revalidate-secret`
  - Value: `your_strong_random_secret_string`

#### 3. Categories Webhook
- **Name**: `revalidate-categories`
- **Table**: `categories`
- **Events**: `INSERT`, `UPDATE`, `DELETE`
- **HTTP Method**: `POST`
- **URL**: `https://<your-storefront-domain>/api/revalidate`
- **Headers**:
  - Key: `x-revalidate-secret`
  - Value: `your_strong_random_secret_string`

---

### 5.4 Testing Cache Revalidation
1. **Verify Endpoint Presence**: Open `https://<your-storefront-domain>/api/revalidate` in a browser. It should return a **405 Method Not Allowed** error (since it only accepts POST requests). If it returns a 404, check that Vercel is deployed correctly.
2. **Verify Security**: Trigger a POST to the endpoint using a REST client (like Postman or curl) without the `x-revalidate-secret` header. It should return a **401 Unauthorized** error.
3. **Verify Webhook Logs**: Go to **Supabase -> Database -> Webhooks -> [webhook name] -> Logs** to ensure requests return a **200 OK** response on DB modifications.

---

## 🔍 6. Search Engine Submission Setup (Manual Actions)

To enable automatic Google and Bing indexing (as well as Perplexity/ChatGPT AI Search engines), complete these one-time manual steps:

### 6.1 Google Search Console Verification
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and enter your production domain (e.g. `https://your-domain.vercel.app`).
3. Select **HTML tag** as your verification method.
4. Copy the code in the tag (specifically the value inside `content="..."`).
5. Open your Vercel Dashboard/`.env.local` and set `GOOGLE_SITE_VERIFICATION` to this value.
6. Once deployed/saved, click **Verify** in the Search Console.
7. Go to **Sitemaps** in the left menu and submit your sitemap URL: `https://your-domain.vercel.app/sitemap.xml`.

### 6.2 Bing Webmaster Tools & IndexNow Verification
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Sign in and select **Import from Google Search Console** (this automatically imports your domain and verification settings in one click).
3. If importing is not used, verify using the HTML tag or DNS record.
4. Set up **IndexNow** (instant ping for Bing, Yandex, Naver):
   - Go to [IndexNow Get Started](https://www.bing.com/indexnow/getstarted).
   - Generate your API Key.
   - Set the `INDEXNOW_API_KEY` variable in Vercel to this key value.
   - Create a text file named exactly `[your-api-key].txt` inside the `/public` folder of your project (containing only the key value as text). This allows search bots to verify ownership during API pings.
   - The store will now automatically ping IndexNow whenever new products or categories are modified.

---

## 👥 7. Meta Catalog Real-time Sync Setup (Manual Actions)

To synchronize your storefront catalog automatically with your Facebook Shop, Instagram Shop, and WhatsApp Catalog, follow these manual configuration steps:

### 7.1 Meta Business Manager & Commerce Manager Setup
1. Go to the [Meta Business Manager](https://business.facebook.com/).
2. Navigate to the **Commerce Manager** -> **Catalogs** and click **Create Catalog**.
3. Select **E-Commerce** -> **Online Products** -> click **Next**.
4. Enter a catalog name (e.g. `Zaynahs Store Catalog`) and select your Business Account.
5. Copy the **Catalog ID** shown in Commerce Manager (a string of numbers).
6. Set the `META_CATALOG_ID` environment variable in Vercel/`.env.local` to this ID.

### 7.2 System User and Permanent Access Token
1. Go to **Business Settings** -> **Users** -> **System Users**.
2. Click **Add** -> Name it `Zaynahs Sync Bot` and select **Admin** role.
3. Click **Add Assets** -> Select **Catalogs** -> Choose your catalog -> Check **Full Control** -> click **Save**.
4. Click **Generate New Token**:
   - Select your Meta App (Create one of type **Business** at [developers.facebook.com](https://developers.facebook.com/) if not already done).
   - Check the permissions:
     - `catalog_management`
     - `business_management`
   - Click **Generate Token** and immediately copy the permanent token (it will only be shown once).
5. Set the `META_ACCESS_TOKEN` environment variable in Vercel/`.env.local` to this token.
6. (Optional) Set `META_GRAPH_API_VERSION` to `v21.0`.

### 7.3 Category Mapping in Store Settings
1. Log into your store's Admin Panel and navigate to **Settings** -> **Meta Sync** tab.
2. For each store category, select the standard Meta Google Product Category path from the dropdown, or select **Custom...** and enter the custom path.
3. Click **Save Mappings**. Products in these categories will now sync using the mapped Meta category.

### 7.4 Bulk Initial Sync
1. Navigate to **Admin Panel** -> **Products**.
2. Click **Sync All to Meta** to perform the initial bulk catalog push. It chunks products in batches of 50 and submits them to your Facebook catalog.
3. Check the status badge under the **Meta Sync** column for each product. If any products display `Error`, hover/click the badge to read the error message returned from Meta's API.
