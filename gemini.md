# 🏪 Zaynahs E-Store — MASTER GEMINI RULES
> Replace your entire gemini.md file with this. Gemini Agent is fully autonomous — no manual steps.

## 🔗 Quick Links
- [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)
- [STORE_GUIDE.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/STORE_GUIDE.md) (Contains GitHub & Supabase Credentials)

---

# ⛔ RULE #0 — ABSOLUTE PRIME DIRECTIVE

1. **Fulfill the Request**: Modify, refactor, or create exactly what is asked without hesitation.
2. **Mobile First ALWAYS**: Every single component, page, layout must be designed mobile-first. Desktop is secondary.
3. **Direct Action**: Find relevant files and implement fixes directly — no asking unnecessary questions.
4. **DATA INTEGRITY FIRST**: Product, stock, order data is NEVER approximated. If uncertain → throw error.
5. **TypeScript Strict**: Every file is `.tsx` or `.ts`. No `any` types ever.
6. **No Email System**: This store uses WhatsApp only. Never suggest or implement email flows.
7. **Agent Executes**: Gemini agent runs all terminal commands autonomously. Never ask user to run commands manually unless absolutely required.
8. **Fast & Direct Work**: Work directly and quickly. Do not waste tokens on MCP tools, browser interactions, or reading unnecessary files. Resolve issues with direct code analysis and implementation.

---

# 🎨 DESIGN SYSTEM RULES (NON-NEGOTIABLE)

## Aesthetic: "Modern Pakistani E-Commerce — Premium Mobile"
- **Mobile First**: 375px base, scale up to tablet/desktop
- **Touch Targets**: Minimum 44px for all interactive elements
- **Font**: Geist (headings) + Inter (body) — loaded via next/font
- **Colors**: 
  ```css
  --primary: #1a1a2e        /* Deep Navy */
  --accent: #e94560         /* Bold Red */
  --surface: #ffffff
  --surface-2: #f8f8f8
  --text: #1a1a1a
  --text-muted: #6b7280
  --border: #e5e7eb
  --success: #10b981
  --warning: #f59e0b
  ```
- **Border Radius**: `rounded-2xl` for cards, `rounded-xl` for buttons
- **Shadows**: Soft elevation system — never hard box shadows
- **Animations**: Subtle — fade-in on load, scale on tap, slide-up for modals
- **Theme Switching (`next-themes`)**: Full class-based switcher using `next-themes` and a standard client-side `<ThemeToggle />` component. Declare class-based dark mode in Tailwind v4 with `@variant dark (&:where(.dark, .dark *))` in `globals.css`.
- **Text & Cart Contrast Integrity**: Always apply proper dark mode classes (e.g., `dark:bg-[#16162a]`, `dark:border-gray-800`, `dark:text-white`, `dark:text-gray-300`) directly on elements. Never use broad global utility overrides (like `.dark .bg-white`) inside `globals.css` to prevent specificity and contrast bugs.
- **Color Scale Standardization**: Never use non-standard Tailwind class numbers (e.g., `gray-250`, `gray-205`, `gray-955`, `gray-755`, `gray-55`, `gray-350`, `gray-550`, `red-550`). Only use standard, documented tailwind color weights (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950).

## Centralized Icons Rule
- **Single Source of Truth**: All icons MUST be imported from the centralized registry file: [Icons.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/common/Icons.tsx) (e.g., `import { ShoppingCart, User } from '@/components/common/Icons'`). Never import directly from `lucide-react` or any other icon library in individual pages or components.

## Component Rules
- Every product card: image top, name, price, "Add to Cart" button
- Bottom sticky cart bar on mobile (always visible when cart has items, styled with responsive dark backgrounds)
- Skeleton loaders on every data fetch
- Toast notifications (sonner) for all actions
- No page without loading state
- **Category Links**: All category links MUST open on the shop page with the category filter applied (e.g. `/shop?category=slug`). Never link to a dedicated `/category/[slug]` route unless it redirects to the shop page.

---

# 🗄️ DATABASE RULES

## Tables (Source of Truth)
```
products          → core product data
product_variants  → color/size/material combinations with price+stock
product_images    → multiple images per product
categories        → product categories
store_settings    → WhatsApp number, store name, logo, currency
orders            → WhatsApp orders tracking (optional)
```

## RULE D1 — VARIANT STOCK IS MANDATORY
Every product with variants MUST track stock per variant in `product_variants.stock`.
`products.stock` = sum of all variant stocks (or direct stock if no variants).

## RULE D2 — IMAGE STORAGE
All images go to Supabase Storage bucket: `product-images`
Public URL stored in `product_images.url`
Never store base64 in DB.

## RULE D3 — SETTINGS SINGLETON
`store_settings` always has exactly ONE row.
ID: `00000000-0000-4000-8000-000000000001`
Never create second row.

## RULE D4 — SOFT DELETE
Never hard delete products. Use `products.active = false`.
Admin can restore. Customer catalog never shows `active = false` products.

## RULE D5 — SCHEMA CHANGE LOG
Every DB change MUST be logged in [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md) with date, files changed, what changed.

---

# 📁 PROJECT STRUCTURE

```
zaynahs-estore/
├── app/
│   ├── (store)/                    ← Customer facing
│   │   ├── page.tsx                ← Homepage / Catalog
│   │   ├── product/[slug]/page.tsx ← Product Detail
│   │   ├── cart/page.tsx           ← Cart Review
│   │   └── layout.tsx
│   ├── admin/                      ← Admin Panel
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── revalidate/route.ts     ← ISR revalidation
│   └── layout.tsx                  ← Root layout
├── components/
│   ├── store/                      ← Customer components
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── CartBar.tsx             ← Sticky bottom cart
│   │   ├── CartSheet.tsx           ← Slide-up cart drawer
│   │   ├── CategoryFilter.tsx
│   │   ├── SearchBar.tsx
│   │   ├── VariantSelector.tsx
│   │   └── WhatsAppButton.tsx
│   ├── admin/                      ← Admin components
│   │   ├── ProductForm.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── VariantBuilder.tsx
│   │   ├── CategoryModal.tsx
│   │   └── StatsCard.tsx
│   └── common/
│       ├── Navbar.tsx
│       ├── LoadingSkeleton.tsx
│       ├── EmptyState.tsx
│       └── MobileNav.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Browser client
│   │   ├── server.ts               ← Server client
│   │   └── admin.ts                ← Service role client
│   ├── services/
│   │   ├── products.ts             ← All product CRUD
│   │   ├── categories.ts
│   │   ├── storage.ts              ← Image upload/delete
│   │   ├── settings.ts
│   │   └── orders.ts
│   ├── hooks/
│   │   ├── useCart.ts              ← Cart state (zustand)
│   │   ├── useProducts.ts
│   │   └── useSettings.ts
│   ├── utils/
│   │   ├── whatsapp.ts             ← Message generator
│   │   ├── price.ts                ← Format PKR
│   │   └── slug.ts
│   └── types.ts                    ← All TypeScript interfaces
├── store/
│   └── cartStore.ts                ← Zustand cart store
├── supabase/
│   ├── schema/
│   │   └── SUPER_MASTER_SCHEMA.sql ← Single source of truth
│   └── migrations/                 ← Incremental migrations
├── public/
│   └── icons/
├── .env.local
├── gemini.md
├── STORE_GUIDE.md
└── SCHEMA_CHANGE_LOG.md
```

---

# 🛒 WHATSAPP ORDER FLOW RULES

## RULE W1 — MESSAGE FORMAT
```typescript
// lib/utils/whatsapp.ts
export const generateWhatsAppMessage = (cart: CartItem[], settings: StoreSettings): string => {
  const lines = cart.map(item => {
    const variant = item.selectedVariant 
      ? ` (${Object.values(item.selectedVariant).join(', ')})` 
      : '';
    const modifiers = item.selectedModifiers?.length 
      ? ` + ${item.selectedModifiers.map(m => m.name).join(', ')}` 
      : '';
    return `• ${item.product.name}${variant}${modifiers} x${item.quantity} = ${formatPrice(item.total)}`;
  });
  
  const total = cart.reduce((sum, item) => sum + item.total, 0);
  
  return [
    `*${settings.storeName} — New Order*`,
    ``,
    ...lines,
    ``,
    `*Total: ${formatPrice(total)}*`,
    ``,
    `Please confirm my order. Thank you! 🙏`
  ].join('\n');
};

export const buildWhatsAppURL = (phone: string, message: string): string => {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};
```

## RULE W2 — REDIRECT TARGET
- Mobile: opens WhatsApp app directly
- Desktop: opens web.whatsapp.com
- Always use `wa.me` format — never `api.whatsapp.com`
- Phone number stored WITHOUT + or spaces in DB

---

# 🖼️ SUPABASE STORAGE RULES

## RULE S1 — BUCKET SETUP
```sql
-- Run once in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Public read policy
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admin upload policy  
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Admin delete policy
CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

## RULE S2 — IMAGE UPLOAD PATTERN
```typescript
// lib/services/storage.ts
export const uploadProductImage = async (
  file: File,
  productId: string
): Promise<string> => {
  const ext = file.name.split('.').pop();
  const fileName = `${productId}/${Date.now()}.${ext}`;
  
  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false });
    
  if (error) throw error;
  
  const { data } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(fileName);
    
  return data.publicUrl;
};

export const deleteProductImage = async (url: string): Promise<void> => {
  // Extract path from URL
  const path = url.split('/product-images/')[1];
  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .remove([path]);
  if (error) throw error;
};
```

## RULE S3 — IMAGE OPTIMIZATION
Always use Next.js `<Image>` component with:
```tsx
<Image
  src={imageUrl}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, 33vw"
  className="object-cover"
  priority={isAboveFold}
/>
```


## RULE A1 — ADMIN MIDDLEWARE
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const supabase = createServerClient(/* ... */);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}
```

## RULE A2 — NO CUSTOMER ACCOUNTS
Customers do NOT register or login.
Cart is stored in localStorage via Zustand persist.
Orders go via WhatsApp only.

---

# 📱 MOBILE FIRST RULES

## RULE M1 — BREAKPOINTS
```
Default (mobile): 375px+
sm: 640px+   ← tablet portrait
md: 768px+   ← tablet landscape  
lg: 1024px+  ← desktop
xl: 1280px+  ← wide desktop
```

## RULE M2 — STICKY CART BAR
Always visible on mobile when cart has items:
```tsx
// Fixed bottom bar — above everything
<div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
  <CartBar />
</div>
```

## RULE M3 — TOUCH GESTURES
- Product images: swipeable gallery (use embla-carousel)
- Cart sheet: swipe down to close
- Category filter: horizontal scroll, no wrap

## RULE M4 — TOUCH-FIRST SCROLLABLE OVERLAYS
All overlays, popups, filters, and mobile drawer menus that open on mobile must have touch-first scrolling starting from the top down. These components must use `overscroll-contain`, `touch-pan-y` enabled, and be structured to scroll naturally from the top without nested scroll containers that hijack touch gestures.

---

# 🔧 FEATURE IMPLEMENTATION WORKFLOW

Always follow this order:

1. **SQL Migration** → create file in `supabase/migrations/`
2. **Update SUPER_MASTER_SCHEMA.sql** → keep in sync
3. **Update types.ts** → TypeScript interfaces
4. **Services** → CRUD in `lib/services/`
5. **Hooks** → React hooks in `lib/hooks/`
6. **UI Component** → Mobile first, follow design rules
7. **Update [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)** → document everything

---

# 🚨 ERROR HANDLING

```typescript
// Standard pattern for all service functions
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), categories(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[products] getProducts failed:', error);
    throw error;
  }
};
```

---

# 🚀 MIGRATION RULES

Every DB change:
1. Create `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Update `supabase/schema/SUPER_MASTER_SCHEMA.sql`
3. Log in [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/SCHEMA_CHANGE_LOG.md)

---

# ⚡ NEXT.JS CACHING RULES

## Caching Strategy
For Zaynahs E-Store, use **Next.js built-in cache + revalidateTag** (ISR) as the primary caching strategy.

- **Kyun (Rationale):**
  - Zero extra cost or third-party infrastructure.
  - Vercel automated global CDN edge caching.
  - On-demand revalidation: When products/categories are updated in the admin panel, trigger `revalidateTag` or `revalidatePath` to instantly refresh the storefront.

## Implementation Standard
```typescript
// Fetching data with revalidation tags (Server Component or service)
const getProducts = await fetch('...', { 
  next: { tags: ['products'], revalidate: 3600 } // Cache for 1 hour with tag
})

// On-demand revalidation on update (in admin actions/api)
import { revalidateTag } from 'next/cache';

export async function updateProductAction(id: string, data: any) {
  // 1. Update database
  // 2. Revalidate storefront cache tag
  revalidateTag('products');
}
```

---

# 🤖 AGENT OPERATING RULES

1. Read existing files BEFORE creating new ones
2. Never rewrite a working file unnecessarily
3. Always check `app/` routing before creating pages
4. Run `npm run build` only when explicitly asked
5. Mobile-first is non-negotiable — desktop is enhancement
6. Every UI component needs loading + error + empty states
7. Images always through Supabase Storage — never local
8. WhatsApp is the ONLY order channel — no exceptions
9. **Dual-Sided Feature Integrity**: Whenever any feature is added or updated on either the customer Storefront or the Admin Panel, it MUST be fully implemented on the other side as well (e.g., if a feature is added to the storefront, its management/editor fields must be added to the Admin Panel, and vice versa), ensuring full database integration, service synchronization, and type-safety throughout the application.

---

## RULE S4 — SMART IMAGE COMPRESSOR & BRAND UPLOADS (UPDATED v1.0.7)
- All uploads pass through `lib/utils/imageCompressor.ts` which uses a **3-strategy fallback chain**:
  1. `createImageBitmap(file)` — OS-native HEIC decoding on macOS/iOS (fastest)
  2. `ObjectURL → <img> → createImageBitmap` — uses OS decoder via img tag (works for HEIC on macOS Chrome)
  3. `heic2any → createImageBitmap` — pure WASM fallback for HEIC on Windows/Linux (last resort)
- If all strategies fail → **throw user-visible Error** (shown as toast). NEVER silently upload a broken file.
- Output: `.webp`, max 1200px, target **under 50 KB**. Iterative quality + resolution reduction.
- Admin panel image previews use plain `<img>` tags (not `next/image`) to avoid domain restriction errors.
- `next.config.ts` must have Supabase hostname in `images.remotePatterns` for `next/image` to work on storefront.
- Favicon, Logo, and Banner uploadable/removable in Settings; logo display width is adjustable via range slider.
- Store favicon and document titles bind dynamically via `generateMetadata()` in `app/layout.tsx`.

## RULE S5 — NEXT.CONFIG IMAGE DOMAINS
```typescript
// next.config.ts — REQUIRED for next/image with Supabase
images: {
  remotePatterns: [{
    protocol: 'https',
    hostname: 'jqwqgiqfvjdxaohzvjuv.supabase.co',
    pathname: '/storage/v1/object/public/**',
  }],
  formats: ['image/webp', 'image/avif'],
}
```

## RULE S6 — UNIVERSAL MEDIA SELECTOR
- All admin panel image upload features MUST use the shared `MediaSelectorModal` component instead of direct `<input type="file">`.
- This ensures a unified experience where users can both upload new images and select from existing uploaded media in the Supabase `product-images` bucket.
- The modal provides built-in upload logic, compression integration, and search/filtering of existing media.

---

## RULE K1 — INSTANT PAGE-LEVEL SKELETONS
- Every directory/route group must have a corresponding `loading.tsx` to handle async page transitions instantly.
- **Customer Storefront (`app/(store)/loading.tsx`)**: Default loader using `GridSkeleton` from `@/components/common/LoadingSkeleton` to represent grids of product cards.
- **Product Details (`app/(store)/product/[slug]/loading.tsx`)**: Specific loader using `DetailSkeleton` showing product details structure (two-column layout).
- **Admin Dashboard (`app/admin/loading.tsx`)**: Generic loader displaying statistics cards and list tables skeleton layouts.
- **Contrast Integrity**: Skeletons must support both light and dark mode colors (e.g. `dark:bg-[#16162a]`, `dark:border-gray-800/80`, `bg-gray-100`, `dark:bg-gray-800`).


