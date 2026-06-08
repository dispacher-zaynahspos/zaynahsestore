'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, Trash2, Image as ImageIcon, Loader2, Plus, CreditCard, Truck, Edit2, Check, X, Shield, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Settings, Layout, Navigation, Package, Zap, MessageCircle, Globe, ShoppingBag, HelpCircle } from 'lucide-react';
import { StoreSettings, ShippingMethod, PaymentMethod, Category, Product, NavigationItem } from '@/lib/types';
import { updateSettings } from '@/lib/services/settings';
import * as CentralIcons from '@/components/common/Icons';
import { uploadSettingsImage } from '@/lib/services/storage';
import { getCategories } from '@/lib/services/categories';
import { getAllProductsAdmin } from '@/lib/services/products';
import {
  getShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod
} from '@/lib/services/shipping';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from '@/lib/services/paymentMethods';
import { toast } from 'sonner';

interface SettingsFormProps {
  initialSettings: StoreSettings;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  
  // Settings Form States
  const [storeName, setStoreName] = useState(initialSettings.storeName);
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber);
  const [currency, setCurrency] = useState(initialSettings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(initialSettings.currencySymbol);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || '');
  const [logoWidth, setLogoWidth] = useState(initialSettings.logoWidth ?? 120);
  const [bannerUrl, setBannerUrl] = useState(initialSettings.bannerUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(initialSettings.faviconUrl || '');
  const [tagline, setTagline] = useState(initialSettings.tagline || '');
  const [address, setAddress] = useState(initialSettings.address || '');
  
  const [showStock, setShowStock] = useState(initialSettings.showStock);
  const [showComparePrice, setShowComparePrice] = useState(initialSettings.showComparePrice);
  const [enableSearch, setEnableSearch] = useState(initialSettings.enableSearch);
  const [enableCategoryFilter, setEnableCategoryFilter] = useState(initialSettings.enableCategoryFilter);
  
  const [whatsappGreeting, setWhatsappGreeting] = useState(initialSettings.whatsappGreeting);
  const [whatsappFooter, setWhatsappFooter] = useState(initialSettings.whatsappFooter);

  // Footer & Social States
  const [footerText, setFooterText] = useState(initialSettings.footerText || '');
  const [socialFacebook, setSocialFacebook] = useState(initialSettings.socialFacebook || '');
  const [socialInstagram, setSocialInstagram] = useState(initialSettings.socialInstagram || '');
  const [socialWhatsapp, setSocialWhatsapp] = useState(initialSettings.socialWhatsapp || '');
  const [socialYoutube, setSocialYoutube] = useState(initialSettings.socialYoutube || '');

  // Fake Views & Trust States
  const [enableFakeViews, setEnableFakeViews] = useState(initialSettings.enableFakeViews ?? true);
  const [minViews, setMinViews] = useState(initialSettings.minViews ?? 10);
  const [maxViews, setMaxViews] = useState(initialSettings.maxViews ?? 50);
  const [enableTrustBadges, setEnableTrustBadges] = useState(initialSettings.enableTrustBadges ?? true);
  const [deliveryEstimateText, setDeliveryEstimateText] = useState(initialSettings.deliveryEstimateText ?? 'Estimate delivery times: 3-5 days International.');
  const [freeShippingText, setFreeShippingText] = useState(initialSettings.freeShippingText ?? 'Free shipping & returns: On all orders over $150.');
  const [promoCodeText, setPromoCodeText] = useState(initialSettings.promoCodeText ?? 'Use code "WELCOME15" for discount 15% on your first order.');
  const [enableSafeCheckout, setEnableSafeCheckout] = useState(initialSettings.enableSafeCheckout ?? true);
  const [safeCheckoutText, setSafeCheckoutText] = useState(initialSettings.safeCheckoutText ?? 'Guarantee Safe Checkout:');
  const [safeCheckoutMethods, setSafeCheckoutMethods] = useState<string[]>(initialSettings.safeCheckoutMethods ?? ['visa', 'mastercard', 'paypal', 'amex', 'klarna', 'cirrus', 'westernunion']);
  const [enableTicker, setEnableTicker] = useState(initialSettings.enableTicker ?? false);
  const [tickerText, setTickerText] = useState(initialSettings.tickerText ?? 'Free returns within 30 days\nUnlimited delivery for only $175');
  const [enableVariantSwatches, setEnableVariantSwatches] = useState(initialSettings.enableVariantSwatches ?? true);
  const [swatchShape, setSwatchShape] = useState<'circle' | 'square'>(initialSettings.swatchShape ?? 'circle');
  const [swatchSize, setSwatchSize] = useState<'sm' | 'md' | 'lg'>(initialSettings.swatchSize ?? 'md');
  const [swatchLimit, setSwatchLimit] = useState<number>(initialSettings.swatchLimit ?? 8);
  const [defaultVariantIndex, setDefaultVariantIndex] = useState<number>(initialSettings.defaultVariantIndex ?? 1);
  const [imageHoverStyle, setImageHoverStyle] = useState<'second_image' | 'zoom' | 'none'>(initialSettings.imageHoverStyle ?? 'second_image');
  const [imageAspectRatio, setImageAspectRatio] = useState(initialSettings.imageAspectRatio ?? '1:1');
  const [titleLineLimit, setTitleLineLimit] = useState<'1' | '2' | 'none'>(initialSettings.titleLineLimit ?? '2');
  const [archiveSwatchSize, setArchiveSwatchSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'xxl'>(initialSettings.archiveSwatchSize ?? 'md');
  const [productSwatchSize, setProductSwatchSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'xxl'>(initialSettings.productSwatchSize ?? 'md');
  const [archiveSwatchAlign, setArchiveSwatchAlign] = useState<'left' | 'center' | 'right'>(initialSettings.archiveSwatchAlign ?? 'left');
  const [faqContent, setFaqContent] = useState(initialSettings.faqContent || '');
  const [returnPolicyContent, setReturnPolicyContent] = useState(initialSettings.returnPolicyContent || '');

  const [trustBadge1Title, setTrustBadge1Title] = useState(initialSettings.trustBadge1Title || 'Free Delivery');
  const [trustBadge1Desc, setTrustBadge1Desc] = useState(initialSettings.trustBadge1Desc || 'On all orders above Rs. 2,000');
  const [trustBadge1Icon, setTrustBadge1Icon] = useState(initialSettings.trustBadge1Icon || 'Truck');
  
  const [trustBadge2Title, setTrustBadge2Title] = useState(initialSettings.trustBadge2Title || 'Secure Payments');
  const [trustBadge2Desc, setTrustBadge2Desc] = useState(initialSettings.trustBadge2Desc || '100% protected checkout payments');
  const [trustBadge2Icon, setTrustBadge2Icon] = useState(initialSettings.trustBadge2Icon || 'Shield');
  
  const [trustBadge3Title, setTrustBadge3Title] = useState(initialSettings.trustBadge3Title || 'Easy Exchange');
  const [trustBadge3Desc, setTrustBadge3Desc] = useState(initialSettings.trustBadge3Desc || 'No questions asked return policy');
  const [trustBadge3Icon, setTrustBadge3Icon] = useState(initialSettings.trustBadge3Icon || 'RefreshCw');
  
  const [trustBadge4Title, setTrustBadge4Title] = useState(initialSettings.trustBadge4Title || '24/7 Support');
  const [trustBadge4Desc, setTrustBadge4Desc] = useState(initialSettings.trustBadge4Desc || 'Call/WhatsApp anytime for assistance');
  const [trustBadge4Icon, setTrustBadge4Icon] = useState(initialSettings.trustBadge4Icon || 'Phone');

  // Badge individual toggle switches
  const [trustBadge1Enabled, setTrustBadge1Enabled] = useState(initialSettings.trustBadge1Enabled ?? true);
  const [trustBadge2Enabled, setTrustBadge2Enabled] = useState(initialSettings.trustBadge2Enabled ?? true);
  const [trustBadge3Enabled, setTrustBadge3Enabled] = useState(initialSettings.trustBadge3Enabled ?? true);
  const [trustBadge4Enabled, setTrustBadge4Enabled] = useState(initialSettings.trustBadge4Enabled ?? true);

  // New social media platforms
  const [socialTiktok, setSocialTiktok] = useState(initialSettings.socialTiktok || '');
  const [socialSnapchat, setSocialSnapchat] = useState(initialSettings.socialSnapchat || '');
  const [socialTwitter, setSocialTwitter] = useState(initialSettings.socialTwitter || '');

  // Editable Shopify Footer columns
  const [footerCol1Title, setFooterCol1Title] = useState(initialSettings.footerCol1Title || 'About Our Store');
  const [footerCol2Title, setFooterCol2Title] = useState(initialSettings.footerCol2Title || 'Customer Support');
  const [footerCol2Text, setFooterCol2Text] = useState(initialSettings.footerCol2Text || 'Call/WhatsApp: 0328-4114551\nEmail: Totvoguepk@gmail.com\nTimings: 10 AM - 10 PM');
  const [footerCol3Title, setFooterCol3Title] = useState(initialSettings.footerCol3Title || 'Quick Links');
  const [footerCol4Title, setFooterCol4Title] = useState(initialSettings.footerCol4Title || 'Newsletter');
  const [footerCol4Text, setFooterCol4Text] = useState(initialSettings.footerCol4Text || 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.');
  const [footerBottomText, setFooterBottomText] = useState(initialSettings.footerBottomText || 'All rights reserved.');

  // Header settings states
  const [headerSticky, setHeaderSticky] = useState(initialSettings.headerSticky ?? true);
  const [headerShowTopBar, setHeaderShowTopBar] = useState(initialSettings.headerShowTopBar ?? true);
  const [headerTopBarPhone, setHeaderTopBarPhone] = useState(initialSettings.headerTopBarPhone ?? '0328-4114551');
  const [headerTopBarEmail, setHeaderTopBarEmail] = useState(initialSettings.headerTopBarEmail ?? 'Totvoguepk@gmail.com');
  const [headerShowNewsletter, setHeaderShowNewsletter] = useState(initialSettings.headerShowNewsletter ?? true);
  const [headerNewsletterText, setHeaderNewsletterText] = useState(initialSettings.headerNewsletterText ?? 'Summer sale discount off 50%. Shop Sale');

  const [headerTopBarBg, setHeaderTopBarBg] = useState(initialSettings.headerTopBarBg ?? '#d97706');
  const [headerTopBarTextColor, setHeaderTopBarTextColor] = useState(initialSettings.headerTopBarTextColor ?? '#ffffff');
  const [headerBg, setHeaderBg] = useState(initialSettings.headerBg ?? '#ffffff');
  const [headerTextColor, setHeaderTextColor] = useState(initialSettings.headerTextColor ?? '#1a1a2e');
  const [headerBorderColor, setHeaderBorderColor] = useState(initialSettings.headerBorderColor ?? '#e5e7eb');

  const [headerDesktopLogoAlign, setHeaderDesktopLogoAlign] = useState<'left' | 'center' | 'right'>(initialSettings.headerDesktopLogoAlign as any ?? 'left');
  const [headerDesktopSearchAlign, setHeaderDesktopSearchAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerDesktopSearchAlign as any ?? 'right');
  const [headerDesktopWishlistAlign, setHeaderDesktopWishlistAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerDesktopWishlistAlign as any ?? 'right');
  const [headerDesktopCartAlign, setHeaderDesktopCartAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerDesktopCartAlign as any ?? 'right');
  const [headerDesktopThemeAlign, setHeaderDesktopThemeAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerDesktopThemeAlign as any ?? 'right');

  const [headerMobileLogoAlign, setHeaderMobileLogoAlign] = useState<'left' | 'center' | 'right'>(initialSettings.headerMobileLogoAlign as any ?? 'center');
  const [headerMobileMenuAlign, setHeaderMobileMenuAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerMobileMenuAlign as any ?? 'left');
  const [headerMobileSearchAlign, setHeaderMobileSearchAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerMobileSearchAlign as any ?? 'right');
  const [headerMobileCartAlign, setHeaderMobileCartAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerMobileCartAlign as any ?? 'right');
  const [headerMobileWishlistAlign, setHeaderMobileWishlistAlign] = useState<'left' | 'right' | 'hidden'>(initialSettings.headerMobileWishlistAlign as any ?? 'hidden');

  // Navigation Menu States
  const [navigationMenu, setNavigationMenu] = useState<NavigationItem[]>(initialSettings.navigationMenu || []);
  const [headerDesktopMenuAlign, setHeaderDesktopMenuAlign] = useState<'left' | 'center' | 'right' | 'hidden'>(initialSettings.headerDesktopMenuAlign as any ?? 'center');
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Floating social / contact states
  const [floatingContactsEnabled, setFloatingContactsEnabled] = useState(initialSettings.floatingContactsEnabled ?? true);
  const [floatingContactsPosition, setFloatingContactsPosition] = useState<'left' | 'right'>(initialSettings.floatingContactsPosition ?? 'left');
  const [floatingContactsBottomMobile, setFloatingContactsBottomMobile] = useState<number>(initialSettings.floatingContactsBottomMobile ?? 80);
  const [floatingContactsBottomDesktop, setFloatingContactsBottomDesktop] = useState<number>(initialSettings.floatingContactsBottomDesktop ?? 24);
  const [floatingContactsSideMobile, setFloatingContactsSideMobile] = useState<number>(initialSettings.floatingContactsSideMobile ?? 16);
  const [floatingContactsSideDesktop, setFloatingContactsSideDesktop] = useState<number>(initialSettings.floatingContactsSideDesktop ?? 24);
  const [floatingContactsScale, setFloatingContactsScale] = useState<number>(initialSettings.floatingContactsScale ?? 1.0);
  const [floatingWhatsappPreset, setFloatingWhatsappPreset] = useState(initialSettings.floatingWhatsappPreset ?? 'Hello! I am visiting your store and have a question.');
  const [floatingWhatsappEnabled, setFloatingWhatsappEnabled] = useState(initialSettings.floatingWhatsappEnabled ?? true);
  const [floatingInstagramEnabled, setFloatingInstagramEnabled] = useState(initialSettings.floatingInstagramEnabled ?? true);
  const [floatingTiktokEnabled, setFloatingTiktokEnabled] = useState(initialSettings.floatingTiktokEnabled ?? false);
  const [floatingSnapchatEnabled, setFloatingSnapchatEnabled] = useState(initialSettings.floatingSnapchatEnabled ?? false);
  const [floatingTwitterEnabled, setFloatingTwitterEnabled] = useState(initialSettings.floatingTwitterEnabled ?? false);

  // Menu modal form state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItemState, setEditingMenuItemState] = useState<{ pIndex: number; childId: string | null; cIndex: number | null; id: string } | null>(null);
  const [menuItemLabel, setMenuItemLabel] = useState('');
  const [menuItemUrl, setMenuItemUrl] = useState('');
  const [menuItemLinkType, setMenuItemLinkType] = useState<'custom' | 'category' | 'product' | 'system'>('custom');
  const [menuItemCategoryId, setMenuItemCategoryId] = useState('');
  const [menuItemProductId, setMenuItemProductId] = useState('');
  const [menuItemSystemPage, setMenuItemSystemPage] = useState<'home' | 'shop' | 'cart' | 'wishlist'>('home');

  // Shipping & Payment lists states
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // New shipping form
  const [newShipName, setNewShipName] = useState('');
  const [newShipCost, setNewShipCost] = useState('');
  const [newShipDays, setNewShipDays] = useState('');

  // New payment form
  const [newPayName, setNewPayName] = useState('');
  const [newPayCode, setNewPayCode] = useState('cod');

  // Inline editing row states
  const [editingShipId, setEditingShipId] = useState<string | null>(null);
  const [editShipName, setEditShipName] = useState('');
  const [editShipCost, setEditShipCost] = useState('');
  const [editShipDays, setEditShipDays] = useState('');

  const [editingPayId, setEditingPayId] = useState<string | null>(null);
  const [editPayName, setEditPayName] = useState('');
  const [editPayCode, setEditPayCode] = useState('');

  useEffect(() => {
    async function loadLists() {
      try {
        const [shipList, payList, catList, prodList] = await Promise.all([
          getShippingMethods(),
          getPaymentMethods(),
          getCategories(),
          getAllProductsAdmin()
        ]);
        setShippingMethods(shipList);
        setPaymentMethods(payList);
        setCategoriesList(catList || []);
        setProductsList(prodList || []);
      } catch (err) {
        console.error('Failed to load settings lists:', err);
        toast.error('Failed to load shipping, payment, or categories/products lists');
      } finally {
        setLoadingLists(false);
      }
    }
    loadLists();
  }, []);

  const handleAddShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipName.trim()) return toast.error('Shipping Name is required');
    const costVal = parseFloat(newShipCost) || 0;
    
    try {
      const newMethod = await createShippingMethod({
        name: newShipName.trim(),
        cost: costVal,
        estimatedDays: newShipDays.trim() || undefined,
        active: true
      });
      setShippingMethods(prev => [...prev, newMethod]);
      setNewShipName('');
      setNewShipCost('');
      setNewShipDays('');
      toast.success('Shipping method added successfully!');
    } catch (err) {
      toast.error('Failed to add shipping method');
    }
  };

  const handleToggleShippingActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await updateShippingMethod(id, { active: !currentActive });
      setShippingMethods(prev => prev.map(item => item.id === id ? updated : item));
      toast.success(`Shipping method ${!currentActive ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update shipping method status');
    }
  };

  const handleDeleteShipping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) return;
    try {
      await deleteShippingMethod(id);
      setShippingMethods(prev => prev.filter(item => item.id !== id));
      toast.success('Shipping method deleted');
    } catch (err) {
      toast.error('Failed to delete shipping method');
    }
  };

  const startEditShipping = (method: ShippingMethod) => {
    setEditingShipId(method.id);
    setEditShipName(method.name);
    setEditShipCost(method.cost.toString());
    setEditShipDays(method.estimatedDays || '');
  };

  const handleSaveShippingEdit = async (id: string) => {
    if (!editShipName.trim()) return toast.error('Shipping Name is required');
    const costVal = parseFloat(editShipCost) || 0;
    try {
      const updated = await updateShippingMethod(id, {
        name: editShipName.trim(),
        cost: costVal,
        estimatedDays: editShipDays.trim() || undefined
      });
      setShippingMethods(prev => prev.map(item => item.id === id ? updated : item));
      setEditingShipId(null);
      toast.success('Shipping method updated successfully!');
    } catch (err) {
      toast.error('Failed to update shipping method');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayName.trim()) return toast.error('Payment Method Name is required');
    if (!newPayCode.trim()) return toast.error('Badge Code is required');

    try {
      const newMethod = await createPaymentMethod({
        name: newPayName.trim(),
        code: newPayCode.trim(),
        active: true
      });
      setPaymentMethods(prev => [...prev, newMethod]);
      setNewPayName('');
      setNewPayCode('cod');
      toast.success('Payment method added successfully!');
    } catch (err) {
      toast.error('Failed to add payment method');
    }
  };

  const handleTogglePaymentActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await updatePaymentMethod(id, { active: !currentActive });
      setPaymentMethods(prev => prev.map(item => item.id === id ? updated : item));
      toast.success(`Payment method ${!currentActive ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update payment method status');
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      await deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(item => item.id !== id));
      toast.success('Payment method deleted');
    } catch (err) {
      toast.error('Failed to delete payment method');
    }
  };

  const startEditPayment = (method: PaymentMethod) => {
    setEditingPayId(method.id);
    setEditPayName(method.name);
    setEditPayCode(method.code);
  };

  const handleSavePaymentEdit = async (id: string) => {
    if (!editPayName.trim()) return toast.error('Payment Name is required');
    if (!editPayCode.trim()) return toast.error('Badge Code is required');
    try {
      const updated = await updatePaymentMethod(id, {
        name: editPayName.trim(),
        code: editPayCode.trim()
      });
      setPaymentMethods(prev => prev.map(item => item.id === id ? updated : item));
      setEditingPayId(null);
      toast.success('Payment method updated successfully!');
    } catch (err) {
      toast.error('Failed to update payment method');
    }
  };

  // Uploading states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'logo') setUploadingLogo(true);
      if (type === 'favicon') setUploadingFavicon(true);
      if (type === 'banner') setUploadingBanner(true);

      const url = await uploadSettingsImage(file, type);

      if (type === 'logo') setLogoUrl(url);
      if (type === 'favicon') setFaviconUrl(url);
      if (type === 'banner') setBannerUrl(url);

      toast.success(`${type.toUpperCase()} uploaded and optimized successfully!`);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : `Failed to upload ${type}`;
      toast.error(msg);
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'favicon') setUploadingFavicon(false);
      if (type === 'banner') setUploadingBanner(false);
    }
  };

  const handleRemoveImage = (type: 'logo' | 'favicon' | 'banner') => {
    if (type === 'logo') setLogoUrl('');
    if (type === 'favicon') setFaviconUrl('');
    if (type === 'banner') setBannerUrl('');
    toast.success(`${type.toUpperCase()} reference removed`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return toast.error('Store Name is required');
    if (!whatsappNumber.trim()) return toast.error('WhatsApp Number is required');

    // Rule W2 Check: Clean WhatsApp number
    const cleanPhone = whatsappNumber.replace(/\D/g, '');

    try {
      const payload: Partial<StoreSettings> = {
        storeName: storeName.trim(),
        whatsappNumber: cleanPhone,
        currency: currency.trim(),
        currencySymbol: currencySymbol.trim(),
        logoUrl: logoUrl.trim() || undefined,
        logoWidth: Number(logoWidth),
        bannerUrl: bannerUrl.trim() || undefined,
        faviconUrl: faviconUrl.trim() || undefined,
        tagline: tagline.trim() || undefined,
        address: address.trim() || undefined,
        showStock,
        showComparePrice,
        enableSearch,
        enableCategoryFilter,
        whatsappGreeting: whatsappGreeting.trim(),
        whatsappFooter: whatsappFooter.trim(),
        footerText: footerText.trim() || undefined,
        socialFacebook: socialFacebook.trim() || undefined,
        socialInstagram: socialInstagram.trim() || undefined,
        socialWhatsapp: socialWhatsapp.trim() || undefined,
        socialYoutube: socialYoutube.trim() || undefined,
        enableFakeViews,
        minViews: Number(minViews),
        maxViews: Number(maxViews),
        enableTrustBadges,
        deliveryEstimateText: deliveryEstimateText.trim(),
        freeShippingText: freeShippingText.trim(),
        promoCodeText: promoCodeText.trim(),
        enableSafeCheckout: enableTrustBadges,
        safeCheckoutText: safeCheckoutText.trim(),
        safeCheckoutMethods,
        enableTicker,
        tickerText: tickerText.trim(),
        enableVariantSwatches,
        swatchShape,
        swatchSize,
        swatchLimit: Number(swatchLimit) || 8,
        defaultVariantIndex: Number(defaultVariantIndex) || 1,
        imageHoverStyle,
        imageAspectRatio,
        titleLineLimit,
        archiveSwatchSize,
        productSwatchSize,
        archiveSwatchAlign,
        headerSticky,
        headerShowTopBar,
        headerTopBarPhone,
        headerTopBarEmail,
        headerShowNewsletter,
        headerNewsletterText,
        headerTopBarBg,
        headerTopBarTextColor,
        headerBg,
        headerTextColor,
        headerBorderColor,
        headerDesktopLogoAlign,
        headerDesktopSearchAlign,
        headerDesktopWishlistAlign,
        headerDesktopCartAlign,
        headerDesktopThemeAlign,
        headerMobileLogoAlign,
        headerMobileMenuAlign,
        headerMobileSearchAlign,
        headerMobileCartAlign,
        headerMobileWishlistAlign,
        navigationMenu,
        headerDesktopMenuAlign,
        faqContent: faqContent.trim(),
        returnPolicyContent: returnPolicyContent.trim(),
        trustBadge1Title: trustBadge1Title.trim(),
        trustBadge1Desc: trustBadge1Desc.trim(),
        trustBadge1Icon: trustBadge1Icon.trim(),
        trustBadge2Title: trustBadge2Title.trim(),
        trustBadge2Desc: trustBadge2Desc.trim(),
        trustBadge2Icon: trustBadge2Icon.trim(),
        trustBadge3Title: trustBadge3Title.trim(),
        trustBadge3Desc: trustBadge3Desc.trim(),
        trustBadge3Icon: trustBadge3Icon.trim(),
        trustBadge4Title: trustBadge4Title.trim(),
        trustBadge4Desc: trustBadge4Desc.trim(),
        trustBadge4Icon: trustBadge4Icon.trim(),
        
        trustBadge1Enabled,
        trustBadge2Enabled,
        trustBadge3Enabled,
        trustBadge4Enabled,
        
        socialTiktok: socialTiktok.trim(),
        socialSnapchat: socialSnapchat.trim(),
        socialTwitter: socialTwitter.trim(),
        
        footerCol1Title: footerCol1Title.trim(),
        footerCol2Title: footerCol2Title.trim(),
        footerCol2Text: footerCol2Text.trim(),
        footerCol3Title: footerCol3Title.trim(),
        footerCol4Title: footerCol4Title.trim(),
        footerCol4Text: footerCol4Text.trim(),
        footerBottomText: footerBottomText.trim(),
        floatingContactsEnabled,
        floatingContactsPosition,
        floatingContactsBottomMobile: Number(floatingContactsBottomMobile),
        floatingContactsBottomDesktop: Number(floatingContactsBottomDesktop),
        floatingContactsSideMobile: Number(floatingContactsSideMobile),
        floatingContactsSideDesktop: Number(floatingContactsSideDesktop),
        floatingContactsScale: Number(floatingContactsScale),
        floatingWhatsappPreset: floatingWhatsappPreset.trim(),
        floatingWhatsappEnabled,
        floatingInstagramEnabled,
        floatingTiktokEnabled,
        floatingSnapchatEnabled,
        floatingTwitterEnabled
      };

      await updateSettings(payload);
      toast.success('Settings updated successfully!');
      router.refresh();
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const renderSettingsBadgeIcon = (iconName: string) => {
    const IconComponent = (CentralIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="h-5 w-5 text-[#e94560]" />;
  };

  // ============================================================
  // Navigation Menu Helper Functions
  // ============================================================

  const moveMenuItemUp = (pIndex: number, childId: string | null, cIndex: number | null) => {
    const updatedMenu = [...navigationMenu];
    if (childId === null) {
      if (pIndex === 0) return;
      const temp = updatedMenu[pIndex];
      updatedMenu[pIndex] = updatedMenu[pIndex - 1];
      updatedMenu[pIndex - 1] = temp;
    } else if (cIndex !== null && cIndex > 0) {
      const parent = { ...updatedMenu[pIndex] };
      const children = [...(parent.children || [])];
      const temp = children[cIndex];
      children[cIndex] = children[cIndex - 1];
      children[cIndex - 1] = temp;
      parent.children = children;
      updatedMenu[pIndex] = parent;
    }
    setNavigationMenu(updatedMenu);
  };

  const moveMenuItemDown = (pIndex: number, childId: string | null, cIndex: number | null) => {
    const updatedMenu = [...navigationMenu];
    if (childId === null) {
      if (pIndex === updatedMenu.length - 1) return;
      const temp = updatedMenu[pIndex];
      updatedMenu[pIndex] = updatedMenu[pIndex + 1];
      updatedMenu[pIndex + 1] = temp;
    } else if (cIndex !== null) {
      const parent = { ...updatedMenu[pIndex] };
      const children = [...(parent.children || [])];
      if (cIndex === children.length - 1) return;
      const temp = children[cIndex];
      children[cIndex] = children[cIndex + 1];
      children[cIndex + 1] = temp;
      parent.children = children;
      updatedMenu[pIndex] = parent;
    }
    setNavigationMenu(updatedMenu);
  };

  const indentMenuItem = (pIndex: number) => {
    if (pIndex === 0) return;
    const updatedMenu = [...navigationMenu];
    const targetItem = updatedMenu[pIndex];
    
    if (targetItem.children && targetItem.children.length > 0) {
      toast.error("Cannot nest items that already have sub-menus.");
      return;
    }
    
    const prevSibling = { ...updatedMenu[pIndex - 1] };
    const children = [...(prevSibling.children || [])];
    children.push(targetItem);
    prevSibling.children = children;
    
    updatedMenu[pIndex - 1] = prevSibling;
    updatedMenu.splice(pIndex, 1);
    
    setNavigationMenu(updatedMenu);
  };

  const outdentMenuItem = (pIndex: number, cIndex: number) => {
    const updatedMenu = [...navigationMenu];
    const parent = { ...updatedMenu[pIndex] };
    const children = [...(parent.children || [])];
    const targetItem = children[cIndex];
    
    children.splice(cIndex, 1);
    parent.children = children;
    updatedMenu[pIndex] = parent;
    
    updatedMenu.splice(pIndex + 1, 0, targetItem);
    setNavigationMenu(updatedMenu);
  };

  const deleteMenuItem = (pIndex: number, childId: string | null, cIndex: number | null) => {
    const updatedMenu = [...navigationMenu];
    if (childId === null) {
      if (!confirm('Are you sure you want to delete this menu item and all its sub-menu items?')) return;
      updatedMenu.splice(pIndex, 1);
    } else if (cIndex !== null) {
      const parent = { ...updatedMenu[pIndex] };
      const children = [...(parent.children || [])];
      children.splice(cIndex, 1);
      parent.children = children;
      updatedMenu[pIndex] = parent;
    }
    setNavigationMenu(updatedMenu);
  };

  const openAddMenuModal = () => {
    setEditingMenuItemState(null);
    setMenuItemLabel('');
    setMenuItemUrl('');
    setMenuItemLinkType('custom');
    setMenuItemCategoryId('');
    setMenuItemProductId('');
    setMenuItemSystemPage('home');
    setIsMenuModalOpen(true);
  };

  const openEditMenuModal = (item: NavigationItem, pIndex: number, childId: string | null, cIndex: number | null) => {
    setEditingMenuItemState({ pIndex, childId, cIndex, id: item.id });
    setMenuItemLabel(item.label);
    setMenuItemUrl(item.url);
    
    if (item.url === '/') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('home');
    } else if (item.url === '/shop') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('shop');
    } else if (item.url === '/cart') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('cart');
    } else if (item.url === '/wishlist') {
      setMenuItemLinkType('system');
      setMenuItemSystemPage('wishlist');
    } else if (item.url.startsWith('/shop?category=')) {
      setMenuItemLinkType('category');
      const slug = item.url.replace('/shop?category=', '');
      const cat = categoriesList.find(c => c.slug === slug);
      setMenuItemCategoryId(cat?.id || '');
    } else if (item.url.startsWith('/product/')) {
      setMenuItemLinkType('product');
      const slug = item.url.replace('/product/', '');
      const prod = productsList.find(p => p.slug === slug);
      setMenuItemProductId(prod?.id || '');
    } else {
      setMenuItemLinkType('custom');
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = () => {
    if (!menuItemLabel.trim()) {
      toast.error('Menu Label is required');
      return;
    }

    let finalUrl = menuItemUrl.trim();
    if (menuItemLinkType === 'system') {
      if (menuItemSystemPage === 'home') finalUrl = '/';
      else if (menuItemSystemPage === 'shop') finalUrl = '/shop';
      else if (menuItemSystemPage === 'cart') finalUrl = '/cart';
      else if (menuItemSystemPage === 'wishlist') finalUrl = '/wishlist';
    } else if (menuItemLinkType === 'category') {
      const cat = categoriesList.find(c => c.id === menuItemCategoryId);
      if (!cat) {
        toast.error('Please select a category');
        return;
      }
      finalUrl = `/shop?category=${cat.slug}`;
    } else if (menuItemLinkType === 'product') {
      const prod = productsList.find(p => p.id === menuItemProductId);
      if (!prod) {
        toast.error('Please select a product');
        return;
      }
      finalUrl = `/product/${prod.slug}`;
    }

    if (!finalUrl) {
      toast.error('URL/Link is required');
      return;
    }

    const updatedMenu = [...navigationMenu];

    if (editingMenuItemState) {
      const { pIndex, childId, cIndex } = editingMenuItemState;
      if (childId === null) {
        updatedMenu[pIndex] = {
          ...updatedMenu[pIndex],
          label: menuItemLabel.trim(),
          url: finalUrl
        };
      } else if (cIndex !== null) {
        const parent = { ...updatedMenu[pIndex] };
        const children = [...(parent.children || [])];
        children[cIndex] = {
          ...children[cIndex],
          label: menuItemLabel.trim(),
          url: finalUrl
        };
        parent.children = children;
        updatedMenu[pIndex] = parent;
      }
    } else {
      const newItem: NavigationItem = {
        id: Math.random().toString(36).substr(2, 9),
        label: menuItemLabel.trim(),
        url: finalUrl,
        children: []
      };
      updatedMenu.push(newItem);
    }

    setNavigationMenu(updatedMenu);
    setIsMenuModalOpen(false);
    setEditingMenuItemState(null);
    toast.success('Menu item saved to local settings (click Save Settings to persist)');
  };

  const TABS = [
    { id: 'general',    label: 'General',        icon: Settings },
    { id: 'header',     label: 'Header',          icon: Layout },
    { id: 'navigation', label: 'Navigation',      icon: Navigation },
    { id: 'products',   label: 'Products',        icon: Package },
    { id: 'trust',      label: 'Trust & Badges',  icon: Zap },
    { id: 'whatsapp',   label: 'WhatsApp',        icon: MessageCircle },
    { id: 'policies',   label: 'Policies & FAQ',  icon: HelpCircle },
    { id: 'footer',     label: 'Footer & Social', icon: Globe },
    { id: 'shipping',   label: 'Shipping & Pay',  icon: ShoppingBag },
  ] as const;
  type TabId = typeof TABS[number]['id'];
  const [activeTab, setActiveTab] = useState<TabId>('general');

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl pb-16">

      {/* ====== TAB BAR ====== */}
      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-sm">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-wrap sm:flex-nowrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                activeTab === id
                  ? 'bg-[#1a1a2e] dark:bg-[#e94560] text-white shadow-md scale-[1.02]'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ====== TAB: GENERAL ====== */}
      {activeTab === 'general' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core Settings */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">General Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Store Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Number * (Format: 923001234567)</label>
              <input
                type="text"
                required
                placeholder="e.g. 923001234567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Currency Code</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tagline / Subheading</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Feature & Branding Settings */}
        <div className="space-y-6">
          {/* Feature Toggles */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Feature Toggles</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={showStock}
                  onChange={(e) => setShowStock(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Show stock indicator to customers</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={showComparePrice}
                  onChange={(e) => setShowComparePrice(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable compare-at pricing (sale display)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable search bar</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={enableCategoryFilter}
                  onChange={(e) => setEnableCategoryFilter(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable categories filter row</span>
              </label>
            </div>
          </div>

          {/* Logo, Favicon, Banner Uploads */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Store Branding Assets</h3>
            
            <div className="space-y-6">
              {/* Logo Upload Zone */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Store Logo</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-[#0f0f1b]/20">
                  {logoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="relative border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] flex items-center justify-center p-2"
                        style={{ width: `${logoWidth}px`, height: 'auto', minHeight: '60px' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="Store Logo Preview" className="max-w-full max-h-24 object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('logo')}
                        className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
                    <label className="relative flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Logo</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'logo')} 
                        disabled={uploadingLogo} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Optimized to WebP &lt; 50 KB</span>
                  </div>
                </div>

                {/* Logo Width Adjuster */}
                {logoUrl && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                      <span>Logo Display Width</span>
                      <span>{logoWidth}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="60" 
                      max="240" 
                      step="10"
                      value={logoWidth}
                      onChange={(e) => setLogoWidth(Number(e.target.value))}
                      className="w-full mt-1.5 accent-[#e94560]"
                    />
                  </div>
                )}
              </div>

              {/* Favicon Upload Zone */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Store Favicon</label>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-[#0f0f1b]/20">
                  {faviconUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative h-12 w-12 border border-gray-200 dark:border-gray-850 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] flex items-center justify-center p-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={faviconUrl} alt="Store Favicon Preview" className="h-full w-full object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('favicon')}
                        className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-2">
                    <label className="relative self-start flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                      {uploadingFavicon ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Favicon</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'favicon')} 
                        disabled={uploadingFavicon} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Small icon for tab headers</span>
                  </div>
                </div>
              </div>

              {/* Shop Banner Upload Zone */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Shop Banner / Hero Image</label>
                <div className="flex flex-col items-stretch gap-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-[#0f0f1b]/20">
                  {bannerUrl ? (
                    <div className="space-y-2">
                      <div className="relative aspect-video w-full border border-gray-200 dark:border-gray-850 rounded-lg overflow-hidden bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bannerUrl} alt="Store Banner Preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Banner dimensions compressed</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('banner')}
                          className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" /> Remove Banner
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-gray-800">
                      <div className="text-center space-y-1">
                        <ImageIcon className="h-8 w-8 mx-auto" />
                        <span className="block text-xs font-semibold">No Shop Banner Uploaded</span>
                      </div>
                    </div>
                  )}

                  <label className="relative flex justify-center items-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading & Compressing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Shop Banner</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'banner')} 
                      disabled={uploadingBanner} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      )} {/* end general tab */}

      {/* ====== TAB: WHATSAPP ====== */}
      {activeTab === 'whatsapp' && (
      <div className="space-y-8">
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">WhatsApp Message Customization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Greeting / Header</label>
              <textarea
                value={whatsappGreeting}
                onChange={(e) => setWhatsappGreeting(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">This goes above the cart item list in the WhatsApp message text</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Footer / Confirmation line</label>
              <textarea
                value={whatsappFooter}
                onChange={(e) => setWhatsappFooter(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">This goes at the very end of the message as a confirmation prompt</p>
            </div>
          </div>
        </div>
      </div>
      )} {/* end whatsapp tab */}

      {/* ====== TAB: FOOTER & SOCIAL ====== */}
      {activeTab === 'footer' && (
      <div className="space-y-8">
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Shopify-Style Footer Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1 & 2 Config */}
            <div className="space-y-4 border-r border-gray-100 dark:border-gray-800/80 pr-0 md:pr-6">
              <span className="text-xs font-bold text-[#e94560] block uppercase tracking-wider">Footer Columns 1 & 2</span>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 1 Title (Brand / About)</label>
                <input
                  type="text"
                  value={footerCol1Title}
                  onChange={(e) => setFooterCol1Title(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 1 Description (Footer Text)</label>
                <textarea
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  rows={4}
                  placeholder="Brief information about your brand, address, or customer support details."
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 2 Title (Customer Support)</label>
                  <input
                    type="text"
                    value={footerCol2Title}
                    onChange={(e) => setFooterCol2Title(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 2 Text (Support Details)</label>
                  <textarea
                    value={footerCol2Text}
                    onChange={(e) => setFooterCol2Text(e.target.value)}
                    rows={4}
                    placeholder="Enter phone/email/timing lines. Support multiline."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Column 3 & 4 Config */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#e94560] block uppercase tracking-wider">Footer Columns 3 & 4</span>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 3 Title (Quick Links)</label>
                <input
                  type="text"
                  value={footerCol3Title}
                  onChange={(e) => setFooterCol3Title(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Column 3 renders your storefront navigation menu links automatically.</p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 4 Title (Newsletter)</label>
                  <input
                    type="text"
                    value={footerCol4Title}
                    onChange={(e) => setFooterCol4Title(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 4 Text (Newsletter Prompt)</label>
                  <textarea
                    value={footerCol4Text}
                    onChange={(e) => setFooterCol4Text(e.target.value)}
                    rows={4}
                    placeholder="Enter newsletter subscription instructions."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Bottom copyright text editor */}
            <div className="col-span-1 md:col-span-2 border-t border-gray-150 dark:border-gray-800 pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Footer Bottom Copyright Subtext</label>
              <input
                type="text"
                value={footerBottomText}
                onChange={(e) => setFooterBottomText(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                placeholder="e.g. All rights reserved."
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Appended after your store copyright text: &copy; {new Date().getFullYear()} {storeName || 'Zaynahs E-Store'}. [Your Text]</p>
            </div>

          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Social Media Links</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add URLs to your active social channels. Supported icons will be displayed in Column 4 of the footer.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Facebook Page URL</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Instagram Profile URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourusername"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">YouTube Channel URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@yourchannel"
                  value={socialYoutube}
                  onChange={(e) => setSocialYoutube(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Contact Number</label>
                <input
                  type="text"
                  placeholder="e.g. 923001234567"
                  value={socialWhatsapp}
                  onChange={(e) => setSocialWhatsapp(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Format: 923001234567 (no spaces or +).</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">TikTok Profile URL</label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@yourusername"
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Snapchat Profile URL</label>
                <input
                  type="url"
                  placeholder="https://snapchat.com/add/yourusername"
                  value={socialSnapchat}
                  onChange={(e) => setSocialSnapchat(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Twitter (X) Profile URL</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/yourusername"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Contacts Adjustment System */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Floating Contact Buttons Customizer</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configure floating contact buttons at the bottom corners of your storefront.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={floatingContactsEnabled}
                onChange={(e) => setFloatingContactsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          {floatingContactsEnabled && (
            <div className="space-y-6 animate-fade-in">
              {/* Toggles for Individual Platforms */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#e94560] block uppercase tracking-wider font-semibold">Active Platforms</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {/* WhatsApp */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/30 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">WhatsApp</span>
                    <input
                      type="checkbox"
                      checked={floatingWhatsappEnabled}
                      onChange={(e) => setFloatingWhatsappEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                    />
                  </label>
                  {/* Instagram */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/30 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Instagram</span>
                    <input
                      type="checkbox"
                      checked={floatingInstagramEnabled}
                      onChange={(e) => setFloatingInstagramEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                    />
                  </label>
                  {/* TikTok */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/30 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">TikTok</span>
                    <input
                      type="checkbox"
                      checked={floatingTiktokEnabled}
                      onChange={(e) => setFloatingTiktokEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                    />
                  </label>
                  {/* Snapchat */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/30 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Snapchat</span>
                    <input
                      type="checkbox"
                      checked={floatingSnapchatEnabled}
                      onChange={(e) => setFloatingSnapchatEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                    />
                  </label>
                  {/* Twitter */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/30 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Twitter (X)</span>
                    <input
                      type="checkbox"
                      checked={floatingTwitterEnabled}
                      onChange={(e) => setFloatingTwitterEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                    />
                  </label>
                </div>
              </div>

              {/* Layout Alignment & Scale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 dark:border-gray-800/80 pt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Position Placement</label>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFloatingContactsPosition('left')}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        floatingContactsPosition === 'left'
                          ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white dark:border-[#e94560] dark:bg-[#e94560]'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      Left Corner
                    </button>
                    <button
                      type="button"
                      onClick={() => setFloatingContactsPosition('right')}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        floatingContactsPosition === 'right'
                          ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white dark:border-[#e94560] dark:bg-[#e94560]'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      Right Corner
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Icon Scale (Size)</label>
                    <span className="text-xs font-extrabold text-[#e94560]">{Math.round(floatingContactsScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={floatingContactsScale}
                    onChange={(e) => setFloatingContactsScale(parseFloat(e.target.value))}
                    className="mt-3.5 w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1">
                    <span>Small (50%)</span>
                    <span>Standard (100%)</span>
                    <span>Large (200%)</span>
                  </div>
                </div>
              </div>

              {/* Offset Adjustments */}
              <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4 space-y-4">
                <span className="text-xs font-bold text-[#e94560] block uppercase tracking-wider font-semibold">Position Offset Coordinates</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Vertical Offset Mobile */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Vertical Offset - Mobile</label>
                      <span className="text-xs font-bold text-gray-950 dark:text-white">{floatingContactsBottomMobile}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="4"
                      value={floatingContactsBottomMobile}
                      onChange={(e) => setFloatingContactsBottomMobile(parseInt(e.target.value))}
                      className="mt-2.5 w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">Distance from bottom of mobile screen (prevents overlapping bottom bar).</p>
                  </div>

                  {/* Vertical Offset Desktop */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Vertical Offset - Desktop</label>
                      <span className="text-xs font-bold text-gray-950 dark:text-white">{floatingContactsBottomDesktop}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="4"
                      value={floatingContactsBottomDesktop}
                      onChange={(e) => setFloatingContactsBottomDesktop(parseInt(e.target.value))}
                      className="mt-2.5 w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                    />
                  </div>

                  {/* Side Offset Mobile */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Side Side-Offset - Mobile</label>
                      <span className="text-xs font-bold text-gray-950 dark:text-white">{floatingContactsSideMobile}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="2"
                      value={floatingContactsSideMobile}
                      onChange={(e) => setFloatingContactsSideMobile(parseInt(e.target.value))}
                      className="mt-2.5 w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">Distance from left/right screen edges on mobile.</p>
                  </div>

                  {/* Side Offset Desktop */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Side Side-Offset - Desktop</label>
                      <span className="text-xs font-bold text-gray-950 dark:text-white">{floatingContactsSideDesktop}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="2"
                      value={floatingContactsSideDesktop}
                      onChange={(e) => setFloatingContactsSideDesktop(parseInt(e.target.value))}
                      className="mt-2.5 w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Preset Msg */}
              {floatingWhatsappEnabled && (
                <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Floating Greeting Preset Message</label>
                  <input
                    type="text"
                    value={floatingWhatsappPreset}
                    onChange={(e) => setFloatingWhatsappPreset(e.target.value)}
                    placeholder="Hello! I am visiting your store and have a question."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Pre-filled text message loaded when a customer starts a WhatsApp chat from the floating button.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )} {/* end footer tab */}

      {/* ====== TAB: POLICIES & FAQ ====== */}
      {activeTab === 'policies' && (
      <div className="space-y-8">
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Policies & FAQ Content</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frequently Asked Questions (FAQ) Content</label>
              <textarea
                value={faqContent}
                onChange={(e) => setFaqContent(e.target.value)}
                rows={12}
                placeholder="<h3>Q: What is the delivery time?</h3><p>A: 3-5 working days.</p>"
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Supports HTML syntax. Displayed on the product detail page tabs.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Return & Exchange Policy Content</label>
              <textarea
                value={returnPolicyContent}
                onChange={(e) => setReturnPolicyContent(e.target.value)}
                rows={12}
                placeholder="<h3>Return Policy</h3><p>We offer 30 days free returns and exchanges.</p>"
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Supports HTML syntax. Displayed on the product detail page tabs.</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ====== TAB: TRUST & BADGES ====== */}
      {activeTab === 'trust' && (
      <div className="space-y-8">
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Live Views & Trust Badge Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Fake Views Config */}
            <div className="space-y-4 border-r border-gray-100 dark:border-gray-800/80 pr-0 md:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Enable Live Viewer Counter</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableFakeViews}
                    onChange={(e) => setEnableFakeViews(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
                </label>
              </div>

              {enableFakeViews && (
                <div className="grid grid-cols-2 gap-4 pt-2 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Minimum Viewers</label>
                    <input
                      type="number"
                      min="1"
                      value={minViews}
                      onChange={(e) => setMinViews(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Maximum Viewers</label>
                    <input
                      type="number"
                      min="1"
                      value={maxViews}
                      onChange={(e) => setMaxViews(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges Config */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Enable Trust Badges</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableTrustBadges}
                    onChange={(e) => setEnableTrustBadges(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
                </label>
              </div>

              {enableTrustBadges && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Delivery Estimate Text</label>
                    <input
                      type="text"
                      value={deliveryEstimateText}
                      onChange={(e) => setDeliveryEstimateText(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Free Shipping & Returns Text</label>
                    <input
                      type="text"
                      value={freeShippingText}
                      onChange={(e) => setFreeShippingText(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Promo Code Discount Text</label>
                    <input
                      type="text"
                      value={promoCodeText}
                      onChange={(e) => setPromoCodeText(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                    />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Safe Checkout Title</label>
                    <input
                      type="text"
                      value={safeCheckoutText}
                      onChange={(e) => setSafeCheckoutText(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                    />

                    {/* Checkboxes for payment methods */}
                    <div className="pt-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Badges to Display</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                        {([
                          { code: 'visa', label: 'Visa' },
                          { code: 'mastercard', label: 'Mastercard' },
                          { code: 'amex', label: 'Amex' },
                          { code: 'paypal', label: 'PayPal' },
                          { code: 'klarna', label: 'Klarna' },
                          { code: 'cirrus', label: 'Cirrus' },
                          { code: 'westernunion', label: 'Western Union' },
                          { code: 'cod', label: '💵 Cash on Delivery' },
                          { code: 'easypaisa', label: 'EasyPaisa' },
                          { code: 'jazzcash', label: 'JazzCash' },
                          { code: 'banktransfer', label: '🏦 Bank Transfer' },
                        ] as { code: string; label: string }[]).map(({ code, label }) => {
                          const isChecked = safeCheckoutMethods.includes(code);
                          return (
                            <label key={code} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSafeCheckoutMethods(prev =>
                                    isChecked ? prev.filter(m => m !== code) : [...prev, code]
                                  );
                                }}
                                className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5"
                              />
                              <span>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                    {/* Scrolling Ticker Editor Section */}
                    <div className="border-t border-gray-150 dark:border-gray-800 pt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Enable Scrolling Ticker</label>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block mt-0.5">Show an infinite scrolling banner below description</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={enableTicker}
                            onChange={(e) => setEnableTicker(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
                        </label>
                      </div>

                      {enableTicker && (
                        <div className="space-y-2 animate-fade-in pt-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ticker Content (One item per line)</label>
                          <textarea
                            value={tickerText}
                            onChange={(e) => setTickerText(e.target.value)}
                            rows={3}
                            placeholder="e.g. Free returns within 30 days&#10;Unlimited delivery for only $175"
                            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] resize-none"
                          />
                          <p className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold leading-relaxed">
                            Write one phrase per line. They will automatically loop infinitely and be separated by ✦ symbols.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
              )}
            </div>            {/* Homepage Trust Badges Config */}
            <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Shopify-Style Homepage Trust Badges</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure the 4 feature/trust badge cards displayed above the footer on the storefront landing page.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setTrustBadge1Enabled(true);
                      setTrustBadge2Enabled(true);
                      setTrustBadge3Enabled(true);
                      setTrustBadge4Enabled(true);
                      toast.success('All homepage trust badges enabled');
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Enable All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTrustBadge1Enabled(false);
                      setTrustBadge2Enabled(false);
                      setTrustBadge3Enabled(false);
                      setTrustBadge4Enabled(false);
                      toast.success('All homepage trust badges disabled');
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Card 1 */}
                <div className={`p-4 border rounded-xl space-y-3 transition-all ${trustBadge1Enabled ? 'border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-white/5' : 'border-gray-105 dark:border-gray-800/40 bg-gray-50/5 dark:bg-white/1 opacity-50'}`}>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-xs font-bold text-[#e94560] uppercase tracking-wider">Badge Card 1</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={trustBadge1Enabled}
                        onChange={(e) => setTrustBadge1Enabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="mt-4 p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center shrink-0">
                          {renderSettingsBadgeIcon(trustBadge1Icon)}
                        </div>
                        <div className="flex-grow">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Title</label>
                          <input
                            type="text"
                            disabled={!trustBadge1Enabled}
                            value={trustBadge1Title}
                            onChange={(e) => setTrustBadge1Title(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Icon</label>
                      <select
                        disabled={!trustBadge1Enabled}
                        value={trustBadge1Icon}
                        onChange={(e) => setTrustBadge1Icon(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                      >
                        {['Truck', 'Shield', 'RefreshCw', 'Phone', 'HelpCircle', 'Award', 'Star', 'Lock', 'Clock', 'Gift', 'Headphones'].map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</label>
                    <input
                      type="text"
                      disabled={!trustBadge1Enabled}
                      value={trustBadge1Desc}
                      onChange={(e) => setTrustBadge1Desc(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Card 2 */}
                <div className={`p-4 border rounded-xl space-y-3 transition-all ${trustBadge2Enabled ? 'border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-white/5' : 'border-gray-105 dark:border-gray-800/40 bg-gray-50/5 dark:bg-white/1 opacity-50'}`}>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-xs font-bold text-[#e94560] uppercase tracking-wider">Badge Card 2</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={trustBadge2Enabled}
                        onChange={(e) => setTrustBadge2Enabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="mt-4 p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center shrink-0">
                          {renderSettingsBadgeIcon(trustBadge2Icon)}
                        </div>
                        <div className="flex-grow">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Title</label>
                          <input
                            type="text"
                            disabled={!trustBadge2Enabled}
                            value={trustBadge2Title}
                            onChange={(e) => setTrustBadge2Title(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Icon</label>
                      <select
                        disabled={!trustBadge2Enabled}
                        value={trustBadge2Icon}
                        onChange={(e) => setTrustBadge2Icon(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                      >
                        {['Truck', 'Shield', 'RefreshCw', 'Phone', 'HelpCircle', 'Award', 'Star', 'Lock', 'Clock', 'Gift', 'Headphones'].map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</label>
                    <input
                      type="text"
                      disabled={!trustBadge2Enabled}
                      value={trustBadge2Desc}
                      onChange={(e) => setTrustBadge2Desc(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Card 3 */}
                <div className={`p-4 border rounded-xl space-y-3 transition-all ${trustBadge3Enabled ? 'border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-white/5' : 'border-gray-105 dark:border-gray-800/40 bg-gray-50/5 dark:bg-white/1 opacity-50'}`}>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-xs font-bold text-[#e94560] uppercase tracking-wider">Badge Card 3</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={trustBadge3Enabled}
                        onChange={(e) => setTrustBadge3Enabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="mt-4 p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center shrink-0">
                          {renderSettingsBadgeIcon(trustBadge3Icon)}
                        </div>
                        <div className="flex-grow">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Title</label>
                          <input
                            type="text"
                            disabled={!trustBadge3Enabled}
                            value={trustBadge3Title}
                            onChange={(e) => setTrustBadge3Title(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Icon</label>
                      <select
                        disabled={!trustBadge3Enabled}
                        value={trustBadge3Icon}
                        onChange={(e) => setTrustBadge3Icon(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                      >
                        {['Truck', 'Shield', 'RefreshCw', 'Phone', 'HelpCircle', 'Award', 'Star', 'Lock', 'Clock', 'Gift', 'Headphones'].map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</label>
                    <input
                      type="text"
                      disabled={!trustBadge3Enabled}
                      value={trustBadge3Desc}
                      onChange={(e) => setTrustBadge3Desc(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Card 4 */}
                <div className={`p-4 border rounded-xl space-y-3 transition-all ${trustBadge4Enabled ? 'border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-white/5' : 'border-gray-105 dark:border-gray-800/40 bg-gray-50/5 dark:bg-white/1 opacity-50'}`}>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-xs font-bold text-[#e94560] uppercase tracking-wider">Badge Card 4</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={trustBadge4Enabled}
                        onChange={(e) => setTrustBadge4Enabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="mt-4 p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center shrink-0">
                          {renderSettingsBadgeIcon(trustBadge4Icon)}
                        </div>
                        <div className="flex-grow">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Title</label>
                          <input
                            type="text"
                            disabled={!trustBadge4Enabled}
                            value={trustBadge4Title}
                            onChange={(e) => setTrustBadge4Title(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Icon</label>
                      <select
                        disabled={!trustBadge4Enabled}
                        value={trustBadge4Icon}
                        onChange={(e) => setTrustBadge4Icon(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                      >
                        {['Truck', 'Shield', 'RefreshCw', 'Phone', 'HelpCircle', 'Award', 'Star', 'Lock', 'Clock', 'Gift', 'Headphones'].map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</label>
                    <input
                      type="text"
                      disabled={!trustBadge4Enabled}
                      value={trustBadge4Desc}
                      onChange={(e) => setTrustBadge4Desc(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )} {/* end trust tab */}
      {/* ====== TAB: PRODUCTS ====== */}
      {activeTab === 'products' && (
      <div className="space-y-8">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Variant Swatch Display</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Control how color swatches appear in catalog lists and product details pages</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableVariantSwatches}
              onChange={(e) => setEnableVariantSwatches(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {enableVariantSwatches && (
          <div className="space-y-6">
            {/* Common Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Swatch Shape</label>
                <div className="flex gap-3">
                  {(['circle', 'square'] as const).map(shape => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setSwatchShape(shape)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer flex-1 ${
                        swatchShape === shape
                          ? 'border-[#e94560] bg-[#e94560]/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`h-6 w-6 bg-[#1a1a2e] dark:bg-white ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
                      />
                      <span className={`text-xs font-bold capitalize ${swatchShape === shape ? 'text-[#e94560]' : 'text-gray-500'}`}>
                        {shape}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Swatch Limit on Cards</label>
                <select
                  value={swatchLimit}
                  onChange={(e) => setSwatchLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                    <option key={num} value={num}>{num} swatches</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Maximum swatches shown on product catalog cards.</p>
              </div>
            </div>

            {/* Archive Specific Settings */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Archive (Catalog Cards) swatches</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Archive Swatch Size</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['sm', 'md', 'lg', 'xl', 'xxl'] as const).map(size => {
                      const dimClass = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : size === 'xl' ? 'h-6 w-6' : 'h-7 w-7';
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setArchiveSwatchSize(size)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                            archiveSwatchSize === size
                              ? 'border-[#e94560] bg-[#e94560]/5'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`${dimClass} bg-[#1a1a2e] dark:bg-white rounded-full`} />
                          <span className={`text-[10px] font-bold uppercase ${archiveSwatchSize === size ? 'text-[#e94560]' : 'text-gray-500'}`}>
                            {size}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Archive Swatch Alignment</label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setArchiveSwatchAlign(align)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold capitalize transition-all cursor-pointer ${
                          archiveSwatchAlign === align
                            ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-500'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">Align variant swatch items to the left, center, or right of the product cards.</p>
                </div>
              </div>
            </div>

            {/* Product Page Specific Settings */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Product details page swatches</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Product Swatch Size</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['sm', 'md', 'lg', 'xl', 'xxl'] as const).map(size => {
                      const dimClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : size === 'lg' ? 'h-6 w-6' : size === 'xl' ? 'h-7 w-7' : 'h-8 w-8';
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setProductSwatchSize(size)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                            productSwatchSize === size
                              ? 'border-[#e94560] bg-[#e94560]/5'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`${dimClass} bg-[#1a1a2e] dark:bg-white rounded-full`} />
                          <span className={`text-[10px] font-bold uppercase ${productSwatchSize === size ? 'text-[#e94560]' : 'text-gray-500'}`}>
                            {size}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Default Variant on Catalog</label>
                  <select
                    value={defaultVariantIndex}
                    onChange={(e) => setDefaultVariantIndex(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num === 1 ? '1st Variant (Default)' : num === 2 ? '2nd Variant' : num === 3 ? '3rd Variant' : `${num}th Variant`}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Show this variant index's specific price and image as initial card view in catalog.</p>
                </div>
              </div>
            </div>

          </div>
        )}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Design & Catalog Layout</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure product image styles, aspect ratios, and card layouts in lists</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Image Hover Style</label>
              <select
                value={imageHoverStyle}
                onChange={(e) => setImageHoverStyle(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                <option value="second_image">Show Second Image</option>
                <option value="zoom">Zoom Effect</option>
                <option value="none">None</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Select the visual effect when hovering over product catalog images.</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Image Aspect Ratio</label>
              <select
                value={imageAspectRatio}
                onChange={(e) => setImageAspectRatio(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                <option value="1:1">1:1 (Square - Recommended)</option>
                <option value="3:4">3:4 (Portrait - Fashion)</option>
                <option value="4:3">4:3 (Landscape)</option>
                <option value="16:9">16:9 (Wide)</option>
                <option value="auto">Auto (Original height)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Specify aspect sizing for product card images in grids.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Archive Title Line Limit</label>
              <select
                value={titleLineLimit}
                onChange={(e) => setTitleLineLimit(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                <option value="1">1 Line Limit</option>
                <option value="2">2 Lines Limit (Default)</option>
                <option value="none">Unlimited / Full Title</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Clamp long titles to save space or display the full product title.</p>
            </div>
          </div>
        </div>
      </div>

      </div>
      )} {/* end products tab */}

      {/* ====== TAB: HEADER ====== */}
      {activeTab === 'header' && (
      <div className="space-y-8">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Header Layout & Appearance Customizer</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customize your storefront header's mobile and desktop structures, top bar info, newsletter, and color styling.</p>
        </div>

        {/* Sticky Behavior Option */}
        <div className="space-y-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Sticky Behavior</h4>
          <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
            <input
              type="checkbox"
              checked={headerSticky}
              onChange={(e) => setHeaderSticky(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Sticky Header (Desktop & Mobile)</span>
          </label>
        </div>

        {/* Part 1: Top Bar & Announcement */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Top Contact & Announcement Bar</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
              <input
                type="checkbox"
                checked={headerShowTopBar}
                onChange={(e) => setHeaderShowTopBar(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Contact Top Bar</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
              <input
                type="checkbox"
                checked={headerShowNewsletter}
                onChange={(e) => setHeaderShowNewsletter(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Announcement Ticker</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Top Bar Phone / WhatsApp</label>
              <input
                type="text"
                disabled={!headerShowTopBar}
                value={headerTopBarPhone}
                onChange={(e) => setHeaderTopBarPhone(e.target.value)}
                placeholder="e.g. 0328-4114551"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Top Bar Email</label>
              <input
                type="email"
                disabled={!headerShowTopBar}
                value={headerTopBarEmail}
                onChange={(e) => setHeaderTopBarEmail(e.target.value)}
                placeholder="e.g. support@store.com"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between items-center">
              <span>Announcement Ticker Text</span>
              <span className="text-[10px] text-gray-400 font-semibold lowercase">Enter multiple lines (one per line) to rotate them</span>
            </label>
            <textarea
              disabled={!headerShowNewsletter}
              value={headerNewsletterText}
              onChange={(e) => setHeaderNewsletterText(e.target.value)}
              placeholder="e.g. Free Delivery across Pakistan!&#10;Summer Sale Off 50%!&#10;Shop our new arrivals now!"
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white disabled:opacity-50 font-semibold"
            />
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Part 2: Desktop Layout Customizer */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Desktop Header Element Placement</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Logo</label>
              <select
                value={headerDesktopLogoAlign}
                onChange={(e) => setHeaderDesktopLogoAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-950 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Search Icon</label>
              <select
                value={headerDesktopSearchAlign}
                onChange={(e) => setHeaderDesktopSearchAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Wishlist Icon</label>
              <select
                value={headerDesktopWishlistAlign}
                onChange={(e) => setHeaderDesktopWishlistAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Cart Icon</label>
              <select
                value={headerDesktopCartAlign}
                onChange={(e) => setHeaderDesktopCartAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Theme Toggle</label>
              <select
                value={headerDesktopThemeAlign}
                onChange={(e) => setHeaderDesktopThemeAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Part 3: Mobile Layout Customizer */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Mobile Header Element Placement</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Menu Button</label>
              <select
                value={headerMobileMenuAlign}
                onChange={(e) => setHeaderMobileMenuAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Logo</label>
              <select
                value={headerMobileLogoAlign}
                onChange={(e) => setHeaderMobileLogoAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Search Icon</label>
              <select
                value={headerMobileSearchAlign}
                onChange={(e) => setHeaderMobileSearchAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Cart Icon</label>
              <select
                value={headerMobileCartAlign}
                onChange={(e) => setHeaderMobileCartAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Wishlist Icon</label>
              <select
                value={headerMobileWishlistAlign}
                onChange={(e) => setHeaderMobileWishlistAlign(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Part 4: Header Aesthetics & Styling */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Header Color Palette Customizer</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Color Item */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                <input
                  type="color"
                  value={headerTopBarBg}
                  onChange={(e) => setHeaderTopBarBg(e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Top Bar Background</label>
                <input
                  type="text"
                  value={headerTopBarBg}
                  onChange={(e) => setHeaderTopBarBg(e.target.value)}
                  className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
                />
              </div>
            </div>

            {/* Color Item */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                <input
                  type="color"
                  value={headerTopBarTextColor}
                  onChange={(e) => setHeaderTopBarTextColor(e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Top Bar Text / Icons</label>
                <input
                  type="text"
                  value={headerTopBarTextColor}
                  onChange={(e) => setHeaderTopBarTextColor(e.target.value)}
                  className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
                />
              </div>
            </div>

            {/* Color Item */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                <input
                  type="color"
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                  />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Header Background</label>
                <input
                  type="text"
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
                />
              </div>
            </div>

            {/* Color Item */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                <input
                  type="color"
                  value={headerTextColor}
                  onChange={(e) => setHeaderTextColor(e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Header Text / Icons</label>
                <input
                  type="text"
                  value={headerTextColor}
                  onChange={(e) => setHeaderTextColor(e.target.value)}
                  className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
                />
              </div>
            </div>

            {/* Color Item */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                <input
                  type="color"
                  value={headerBorderColor}
                  onChange={(e) => setHeaderBorderColor(e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Header Border Color</label>
                <input
                  type="text"
                  value={headerBorderColor}
                  onChange={(e) => setHeaderBorderColor(e.target.value)}
                  className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      )} {/* end header tab */}

      {/* ====== TAB: NAVIGATION ====== */}
      {activeTab === 'navigation' && (
      <div className="space-y-8">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Store Navigation Menu Customizer</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Build nested menus, sort items up/down, and link directly to categories, products, or custom URLs.</p>
          </div>
          <button
            type="button"
            onClick={openAddMenuModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e94560] text-white hover:bg-[#d83a52] transition-colors text-xs font-bold shrink-0 self-start sm:self-center cursor-pointer active:scale-95 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        <div className="max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Desktop Menu Alignment</label>
          <select
            value={headerDesktopMenuAlign}
            onChange={(e) => setHeaderDesktopMenuAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="left">Left Aligned</option>
            <option value="center">Center Aligned (Default)</option>
            <option value="right">Right Aligned</option>
            <option value="hidden">Hidden / No Desktop Menu</option>
          </select>
        </div>

        <div className="space-y-3">
          {navigationMenu.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-[#0f0f1b]/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              No custom menu items. Add items to build your menu.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/5 dark:bg-white/1">
              {navigationMenu.map((parent, pIndex) => {
                const hasChildren = parent.children && parent.children.length > 0;
                
                return (
                  <React.Fragment key={parent.id}>
                    {/* Parent Row */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-white/1 transition-colors gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>{parent.label}</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate max-w-md">{parent.url}</div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={pIndex === 0}
                          onClick={() => moveMenuItemUp(pIndex, null, null)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pIndex === navigationMenu.length - 1}
                          onClick={() => moveMenuItemDown(pIndex, null, null)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-550 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pIndex === 0 || hasChildren}
                          onClick={() => indentMenuItem(pIndex)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-550 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="Indent (Make Submenu)"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditMenuModal(parent, pIndex, null, null)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-amber-500 hover:border-amber-500 dark:hover:bg-amber-500 dark:hover:border-amber-500 text-amber-500 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMenuItem(pIndex, null, null)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-500 dark:hover:border-red-500 text-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Children Rows */}
                    {parent.children?.map((child, cIndex) => (
                      <div key={child.id} className="flex items-center justify-between p-4 pl-12 bg-gray-50/50 dark:bg-white/1 hover:bg-gray-50 dark:hover:bg-white/2 border-t border-gray-100 dark:border-gray-800/50 transition-colors gap-4">
                        <div className="flex-1 min-w-0 relative">
                          {/* Indent Guide Line */}
                          <div className="absolute left-[-20px] top-[-16px] bottom-1/2 w-[12px] border-l-2 border-b-2 border-gray-200 dark:border-gray-850 rounded-bl-lg" />
                          <div className="text-xs font-bold text-gray-800 dark:text-gray-300 flex items-center gap-1.5">
                            <span className="bg-gray-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Submenu</span>
                            <span>{child.label}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate max-w-md">{child.url}</div>
                        </div>

                        {/* Action Buttons for Child */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={cIndex === 0}
                            onClick={() => moveMenuItemUp(pIndex, child.id, cIndex)}
                            className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={cIndex === parent.children!.length - 1}
                            onClick={() => moveMenuItemDown(pIndex, child.id, cIndex)}
                            className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-550 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => outdentMenuItem(pIndex, cIndex)}
                            className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-550 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Outdent (Make Parent)"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditMenuModal(child, pIndex, child.id, cIndex)}
                            className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-amber-500 hover:border-amber-500 dark:hover:bg-amber-500 dark:hover:border-amber-500 text-amber-500 hover:text-white transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMenuItem(pIndex, child.id, cIndex)}
                            className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-500 dark:hover:border-red-500 text-red-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Menu Item Form Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16162a] w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-150 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                {editingMenuItemState ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="text-gray-400 hover:text-gray-550 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Menu Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Track Suits"
                  value={menuItemLabel}
                  onChange={(e) => setMenuItemLabel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Link Destination Type</label>
                <select
                  value={menuItemLinkType}
                  onChange={(e) => setMenuItemLinkType(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                >
                  <option value="custom">Custom URL Address</option>
                  <option value="category">Link to a Category</option>
                  <option value="product">Link to a Product</option>
                  <option value="system">Standard System Page</option>
                </select>
              </div>

              {menuItemLinkType === 'custom' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">URL / Link Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /custom-page or https://..."
                    value={menuItemUrl}
                    onChange={(e) => setMenuItemUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-950 dark:text-white"
                  />
                </div>
              )}

              {menuItemLinkType === 'category' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Select Category *</label>
                  <select
                    value={menuItemCategoryId}
                    onChange={(e) => setMenuItemCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                  >
                    <option value="">-- Choose Category --</option>
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {menuItemLinkType === 'product' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Select Product *</label>
                  <select
                    value={menuItemProductId}
                    onChange={(e) => setMenuItemProductId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                  >
                    <option value="">-- Choose Product --</option>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {menuItemLinkType === 'system' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Select Page *</label>
                  <select
                    value={menuItemSystemPage}
                    onChange={(e) => setMenuItemSystemPage(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                  >
                    <option value="home">Home Page (Catalog Storefront)</option>
                    <option value="shop">Shop Page (All Products & Filters)</option>
                    <option value="cart">Cart Page</option>
                    <option value="wishlist">Wishlist Page</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMenuItem}
                  className="px-4 py-2 rounded-xl bg-[#e94560] text-white text-xs font-bold hover:bg-[#d83a52] transition-all cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      )} {/* end navigation tab */}

      {/* ====== TAB: SHIPPING & PAYMENTS ====== */}
      {activeTab === 'shipping' && (
      <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Methods Card */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#e94560]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Shipping Methods</h3>
          </div>

          {loadingLists ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-xs font-bold">Loading shipping methods...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* List */}
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <div key={method.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/30 flex items-center justify-between gap-3 text-sm">
                    {editingShipId === method.id ? (
                      /* Editing Row */
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editShipName}
                          onChange={(e) => setEditShipName(e.target.value)}
                          placeholder="Name (e.g. Express Delivery)"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={editShipCost}
                            onChange={(e) => setEditShipCost(e.target.value)}
                            placeholder="Cost (Rs.)"
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editShipDays}
                            onChange={(e) => setEditShipDays(e.target.value)}
                            placeholder="Estimated Days (e.g. 1-2 days)"
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveShippingEdit(method.id)}
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingShipId(null)}
                            className="p-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Row */
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-800 dark:text-gray-200 truncate">{method.name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                            Cost: Rs. {method.cost.toLocaleString()} {method.estimatedDays ? `| ${method.estimatedDays}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Active Toggle */}
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={method.active}
                              onChange={() => handleToggleShippingActive(method.id, method.active)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                          </label>
                          <button
                            type="button"
                            onClick={() => startEditShipping(method)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteShipping(method.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {shippingMethods.length === 0 && (
                  <div className="text-center py-6 text-xs italic text-gray-400">No shipping methods defined. Add one below!</div>
                )}
              </div>

              {/* Add form */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Add New Shipping Method</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Method Name (e.g. Standard Delivery)"
                    value={newShipName}
                    onChange={(e) => setNewShipName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                  />
                  <input
                    type="number"
                    placeholder="Cost in Rs. (e.g. 200)"
                    value={newShipCost}
                    onChange={(e) => setNewShipCost(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                  />
                  <input
                    type="text"
                    placeholder="Estimated Days (e.g. 3-5 business days)"
                    value={newShipDays}
                    onChange={(e) => setNewShipDays(e.target.value)}
                    className="w-full sm:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddShipping}
                  className="flex items-center justify-center gap-1.5 w-full bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Shipping Method</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Card */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#e94560]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Payment Methods & Badges</h3>
          </div>

          {loadingLists ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-xs font-bold">Loading payment methods...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* List */}
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/30 flex items-center justify-between gap-3 text-sm">
                    {editingPayId === method.id ? (
                      /* Editing Row */
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editPayName}
                          onChange={(e) => setEditPayName(e.target.value)}
                          placeholder="Name (e.g. Visa)"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                        />
                        <select
                          value={editPayCode}
                          onChange={(e) => setEditPayCode(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-950 dark:text-white focus:outline-none"
                        >
                          <option value="visa">Visa</option>
                          <option value="mastercard">MasterCard</option>
                          <option value="cod">Cash on Delivery (COD)</option>
                          <option value="easypaisa">EasyPaisa</option>
                          <option value="jazzcash">JazzCash</option>
                          <option value="banktransfer">Bank Transfer</option>
                          <option value="paypal">PayPal</option>
                          <option value="amex">AMEX</option>
                          <option value="klarna">Klarna</option>
                          <option value="cirrus">Cirrus</option>
                          <option value="westernunion">Western Union</option>
                          <option value="custom">Custom Badge (Text only)</option>
                        </select>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSavePaymentEdit(method.id)}
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPayId(null)}
                            className="p-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Row */
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-800 dark:text-gray-200 truncate">{method.name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5 uppercase">
                            Badge Code: {method.code}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Active Toggle */}
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={method.active}
                              onChange={() => handleTogglePaymentActive(method.id, method.active)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                          </label>
                          <button
                            type="button"
                            onClick={() => startEditPayment(method)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(method.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {paymentMethods.length === 0 && (
                  <div className="text-center py-6 text-xs italic text-gray-400">No payment methods defined. Add one below!</div>
                )}
              </div>

              {/* Add form */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Add New Payment Method</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Method Name (e.g. EasyPaisa)"
                    value={newPayName}
                    onChange={(e) => setNewPayName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
                  />
                  <select
                    value={newPayCode}
                    onChange={(e) => setNewPayCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-950 dark:text-white focus:outline-none focus:border-[#e94560]"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">MasterCard</option>
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="banktransfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="amex">AMEX</option>
                    <option value="klarna">Klarna</option>
                    <option value="cirrus">Cirrus</option>
                    <option value="westernunion">Western Union</option>
                    <option value="custom">Custom Badge (Text only)</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="flex items-center justify-center gap-1.5 w-full bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Payment Method</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      )} {/* end shipping tab */}

      {/* ====== ALWAYS VISIBLE SAVE BUTTON ====== */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-4 shadow-sm sticky bottom-4 z-30">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold hidden sm:block">
          Changes apply to: <span className="text-[#e94560] font-bold capitalize">{activeTab}</span> settings
        </span>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] dark:hover:bg-[#e94560]/90 active:scale-95 text-white px-8 py-3.5 text-sm font-bold shadow-md transition-all cursor-pointer ml-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </form>
  );
}
