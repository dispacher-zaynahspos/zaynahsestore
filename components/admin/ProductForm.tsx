'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Upload, Star, Bold, Italic, Underline, List, ListOrdered, Code, Eye, X, FolderOpen, Search, Check, Image as ImageIcon, ChevronDown } from '@/components/common/Icons';
import { Product, ProductImage, ProductVariant, ProductModifier, Category, VariantPreset, VariantPresetValue, Badge, SizeGuide } from '@/lib/types';
import { createProduct, updateProduct } from '@/lib/services/products';
import { deleteProductImage } from '@/lib/services/storage';
import { uploadImage } from '@/lib/uploadImage';
import MediaSelectorModal from './MediaSelectorModal';
import { getVariantPresets } from '@/lib/services/variantPresets';
import { getSizeGuides } from '@/lib/services/sizeGuides';
import { getBadges } from '@/lib/services/badges';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';


interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product | null;
}

const standardColorMap: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#e94560',
  blue: '#1a1a2e',
  navy: '#1a1a2e',
  grey: '#9ca3af',
  gray: '#9ca3af',
  green: '#10b981',
  yellow: '#f59e0b',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  beige: '#f5f5dc',
  brown: '#a52a2a',
  gold: '#ffd700',
  silver: '#c0c0c0',
  cream: '#fffdd0'
};

export default function ProductForm({ categories, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  // 1. Core States
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '0');
  const [comparePrice, setComparePrice] = useState(initialProduct?.comparePrice?.toString() || '');
  const [cost, setCost] = useState(initialProduct?.cost?.toString() || '0');
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '0');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [tagInput, setTagInput] = useState(initialProduct?.tags?.join(', ') || '');
  const [active, setActive] = useState(initialProduct?.active ?? true);
  const [enableSwatches, setEnableSwatches] = useState<boolean>(initialProduct?.enableSwatches ?? true);
  const [showSwatchesOnArchive, setShowSwatchesOnArchive] = useState<boolean>(initialProduct?.showSwatchesOnArchive ?? true);
  const [activeImageSelector, setActiveImageSelector] = useState<{ axisIdx: number; valIdx: number } | null>(null);
  const [hasVariants, setHasVariants] = useState(initialProduct?.hasVariants ?? false);
  const [isService, setIsService] = useState(initialProduct?.isService ?? false);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? false);
  const [rating, setRating] = useState(initialProduct?.rating?.toString() || '5.0');
  const [reviewsCount, setReviewsCount] = useState(initialProduct?.reviewsCount?.toString() || '0');
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [customBadgeId, setCustomBadgeId] = useState(initialProduct?.customBadgeId || '');
  const [badgeEnabled, setBadgeEnabled] = useState(initialProduct?.badgeEnabled ?? true);
  const [sizeGuideId, setSizeGuideId] = useState(initialProduct?.sizeGuideId || '');
  const [sizeGuidesList, setSizeGuidesList] = useState<SizeGuide[]>([]);

  const [flashSaleEnabled, setFlashSaleEnabled] = useState(initialProduct?.flashSaleEnabled ?? false);
  const [flashSaleStartDate, setFlashSaleStartDate] = useState(initialProduct?.flashSaleStartDate ? new Date(initialProduct.flashSaleStartDate).toISOString().slice(0, 16) : '');
  const [flashSaleEndDate, setFlashSaleEndDate] = useState(initialProduct?.flashSaleEndDate ? new Date(initialProduct.flashSaleEndDate).toISOString().slice(0, 16) : '');
  const [frequentlyBoughtTogetherIds, setFrequentlyBoughtTogetherIds] = useState(initialProduct?.frequentlyBoughtTogetherIds || []);
  const [productList, setProductList] = useState<Product[]>([]);

  useEffect(() => {
    async function loadBadgesAndSizeGuides() {
      try {
        const supabaseClient = createClient();
        const [b, sg, prods] = await Promise.all([
          getBadges(),
          getSizeGuides(),
          supabaseClient.from('products').select('id, name, price').eq('active', true)
        ]);
        setAllBadges(b);
        setSizeGuidesList(sg);
        setProductList((prods.data || []).filter((p: any) => p.id !== initialProduct?.id) as any);
      } catch (err) {
        console.error('Failed to load badges, size guides or products:', err);
      }
    }
    loadBadgesAndSizeGuides();
  }, []);

  // Rich Text Editor States and Helpers
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHtmlMode && editorRef.current) {
      editorRef.current.innerHTML = description || '';
    }
  }, [isHtmlMode]);

  const execCommand = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  // 2. Images List
  const [images, setImages] = useState<Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[]>(
    initialProduct?.images.map(img => ({
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary
    })) || []
  );
  const [uploading, setUploading] = useState(false);

  // 3. Variants List
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'productId'>[]>(
    initialProduct?.variants.map(v => ({
      color: v.color,
      size: v.size,
      material: v.material,
      customOption: v.customOption,
      customValue: v.customValue,
      price: v.price,
      comparePrice: v.comparePrice,
      stock: v.stock,
      sku: v.sku,
      imageUrl: v.imageUrl,
      active: v.active,
      sortOrder: v.sortOrder
    })) || []
  );

  // Variant Axes (the new tag-based system)
  interface AxisValue { label: string; hex?: string; imageUrl?: string; }
  interface VariantAxis { name: string; type: 'color' | 'size' | 'material' | 'custom'; values: AxisValue[]; }

  // Initialize axes from existing variants
  const initAxes = (): VariantAxis[] => {
    if (!initialProduct?.variants?.length) {
      return [
        { name: 'Color', type: 'color', values: [] },
        { name: 'Size', type: 'size', values: [] }
      ];
    }
    const colorValues = Array.from(new Set(initialProduct.variants.filter(v => v.color).map(v => v.color!)));
    const sizeValues = Array.from(new Set(initialProduct.variants.filter(v => v.size).map(v => v.size!)));
    const axes: VariantAxis[] = [];
    if (colorValues.length > 0) {
      axes.push({
        name: 'Color', type: 'color',
        values: colorValues.map(label => {
          const match = initialProduct.variants.find(v => v.color === label);
          return { label, hex: match?.colorHex, imageUrl: match?.imageUrl };
        })
      });
    }
    if (sizeValues.length > 0) {
      axes.push({ name: 'Size', type: 'size', values: sizeValues.map(label => ({ label })) });
    }
    if (axes.length === 0) {
      axes.push({ name: 'Color', type: 'color', values: [] }, { name: 'Size', type: 'size', values: [] });
    }
    return axes;
  };

  const [variantAxes, setVariantAxes] = useState<VariantAxis[]>(initAxes);
  const [axisInputs, setAxisInputs] = useState<string[]>(() => initAxes().map(() => ''));
  const [presets, setPresets] = useState<VariantPreset[]>([]);

  useEffect(() => {
    getVariantPresets().then(setPresets).catch(() => {});
  }, []);

  // 4. Modifiers List
  const [modifiers, setModifiers] = useState<Omit<ProductModifier, 'id' | 'productId'>[]>(
    initialProduct?.modifiers.map(m => ({
      name: m.name,
      price: m.price,
      active: m.active,
      sortOrder: m.sortOrder
    })) || []
  );
  const [modName, setModName] = useState('');
  const [modPrice, setModPrice] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && name) {
      const timer = setTimeout(() => {
        setSlug(
          name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [name, isEdit]);

  // Handle Image Uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const tempId = initialProduct?.id || 'temp-product-id';
      
      const newImages = await Promise.all(
        files.map(async (file, idx) => {
          const url = await uploadImage(file, 'product-images');
          return {
            url,
            alt: file.name,
            sortOrder: images.length + idx,
            isPrimary: images.length === 0 && idx === 0
          };
        })
      );

      setImages(prev => [...prev, ...newImages]);
      toast.success('Images uploaded successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload images';
      toast.error(msg);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Set Primary Image
  const handleSetPrimaryImage = (index: number) => {
    setImages(prev =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    );
  };

  // Remove Image
  const handleRemoveImage = async (index: number, url: string) => {
    try {
      setImages(prev => {
        const filtered = prev.filter((_, i) => i !== index);
        // Recalculate sortOrder and ensure at least one is primary if list is not empty
        const updated = filtered.map((img, i) => ({
          ...img,
          sortOrder: i
        }));
        
        // If the removed image was primary, set the first one of the remaining as primary
        const wasPrimary = prev[index]?.isPrimary;
        if (wasPrimary && updated.length > 0) {
          updated[0].isPrimary = true;
        }
        return updated;
      });

      // Clear references in variant axes (color images)
      setVariantAxes(prev => 
        prev.map(axis => {
          if (axis.type === 'color') {
            return {
              ...axis,
              values: axis.values.map(val => 
                val.imageUrl === url ? { ...val, imageUrl: undefined } : val
              )
            };
          }
          return axis;
        })
      );

      // Clear references in variants list
      setVariants(prev => 
        prev.map(v => 
          v.imageUrl === url ? { ...v, imageUrl: undefined } : v
        )
      );

      toast.success('Image removed from product');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove image');
    }
  };

  // Media Library State for Modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  const handleAddSelectedLibraryImages = (urls: string[]) => {
    if (urls.length === 0) return;

    const currentUrls = new Set(images.map(img => img.url));
    const newImages = urls
      .filter(url => !currentUrls.has(url))
      .map((url, idx) => {
        return {
          url,
          alt: '',
          sortOrder: images.length + idx,
          isPrimary: images.length === 0 && idx === 0
        };
      });

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      toast.success(`Added ${newImages.length} image(s) from media library`);
    } else {
      toast.info('Selected images are already added to this product');
    }
    setIsMediaModalOpen(false);
  };


  // Generate Variants — cross-product of all axes
  const handleGenerateVariants = () => {
    const basePrice = parseFloat(price) || 0;

    // Collect all axes that have values
    const activeAxes = variantAxes.filter(a => a.values.length > 0);
    if (activeAxes.length === 0) {
      toast.error('Please add values to at least one attribute');
      return;
    }

    // Compute cross-product
    const combinations: Record<string, string | undefined>[] = [{}];
    for (const axis of activeAxes) {
      const newCombinations: Record<string, string | undefined>[] = [];
      for (const combo of combinations) {
        for (const val of axis.values) {
          newCombinations.push({ ...combo, [axis.type]: val.label });
        }
      }
      combinations.splice(0, combinations.length, ...newCombinations);
    }

    const newVariants: Omit<ProductVariant, 'id' | 'productId'>[] = combinations.map((combo, idx) => {
      const colorLabel = combo['color'];
      const colorAxis = variantAxes.find(a => a.type === 'color');
      const colorVal = colorAxis?.values.find(v => v.label === colorLabel);
      return {
        color: combo['color'],
        size: combo['size'],
        material: combo['material'],
        customValue: combo['custom'],
        colorHex: colorVal?.hex,
        imageUrl: colorVal?.imageUrl,
        stock: 10,
        price: basePrice,
        active: true,
        sortOrder: idx
      };
    });

    setVariants(prev => [...prev, ...newVariants]);
    toast.success(`Generated ${newVariants.length} variant${newVariants.length !== 1 ? 's' : ''}!`);
  };

  // Update variant row
  const handleUpdateVariant = (index: number, fields: Partial<Omit<ProductVariant, 'id' | 'productId'>>) => {
    setVariants(prev =>
      prev.map((v, i) => (i === index ? { ...v, ...fields } : v))
    );
  };

  // Remove variant
  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Add Custom Modifier
  const handleAddModifier = () => {
    if (!modName.trim()) return;
    const priceVal = parseFloat(modPrice) || 0;
    setModifiers(prev => [
      ...prev,
      {
        name: modName.trim(),
        price: priceVal,
        active: true,
        sortOrder: prev.length
      }
    ]);
    setModName('');
    setModPrice('');
  };

  const handleRemoveModifier = (index: number) => {
    setModifiers(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Product Name is required');
    if (!slug.trim()) return toast.error('Product Slug is required');

    try {
      const parsedTags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const computedStock = hasVariants
        ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : parseInt(stock) || 0;

      const productPayload = {
        name: name.trim(),
        slug: slug.trim(),
        sku: sku.trim() || undefined,
        price: parseFloat(price) || 0,
        comparePrice: comparePrice.trim() ? parseFloat(comparePrice) : undefined,
        cost: parseFloat(cost) || 0,
        categoryId: categoryId || undefined,
        stock: computedStock,
        hasVariants,
        isService,
        isFeatured,
        active,
        enableSwatches,
        showSwatchesOnArchive,
        customBadgeId: customBadgeId || undefined,
        badgeEnabled: badgeEnabled,
        sizeGuideId: sizeGuideId || undefined,
        frequentlyBoughtTogetherIds: frequentlyBoughtTogetherIds,
        flashSaleEnabled: flashSaleEnabled,
        flashSaleStartDate: flashSaleStartDate ? new Date(flashSaleStartDate).toISOString() : undefined,
        flashSaleEndDate: flashSaleEndDate ? new Date(flashSaleEndDate).toISOString() : undefined,
        tags: parsedTags,
        description: description.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        rating: parseFloat(rating) || 5.0,
        reviewsCount: parseInt(reviewsCount) || 0
      };

      let savedProduct;
      if (isEdit && initialProduct) {
        await updateProduct(
          initialProduct.id,
          productPayload,
          images,
          variants,
          modifiers
        );
        savedProduct = { id: initialProduct.id, slug: productPayload.slug };
        toast.success('Product updated successfully!');
        router.refresh();
      } else {
        const newProduct = await createProduct(
          productPayload,
          images,
          variants,
          modifiers
        );
        savedProduct = { id: newProduct.id, slug: newProduct.slug };
        toast.success('Product created successfully!');
        router.push(`/admin/products/${newProduct.id}`);
        router.refresh();
      }

      // Fetch settings to check auto_content_seo
      const supabase = createClient();
      const { data: aiSettings } = await supabase
        .from('ai_settings')
        .select('auto_content_seo')
        .eq('id', '00000000-0000-4000-8000-000000000002')
        .single();
      
      const isAutoSeoOn = aiSettings?.auto_content_seo ?? true;
      const productIdToOptimize = savedProduct.id;
      const productSlugToOptimize = savedProduct.slug;

      // Asynchronously trigger SEO optimization or IndexNow ping in the background
      (async () => {
        try {
          if (isAutoSeoOn) {
            toast.info('Generating AI SEO content and pinging IndexNow...');
            const optRes = await fetch('/api/seo/optimize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entity_type: 'product',
                entity_id: productIdToOptimize
              })
            });
            if (optRes.ok) {
              toast.success('AI SEO optimization complete & IndexNow notified for product!');
            } else {
              console.error('Auto SEO optimization failed on save for product');
            }
          } else {
            // Just trigger IndexNow
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaynahs.pk';
            const pageUrl = `${siteUrl}/product/${productSlugToOptimize}`;
            const pingRes = await fetch('/api/indexnow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                urls: [pageUrl]
              })
            });
            if (pingRes.ok) {
              toast.success('IndexNow notified of updated product!');
            }
          }
        } catch (bgErr) {
          console.error('Error running background SEO tasks:', bgErr);
        }
      })();
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Failed to save product';
      toast.error(errMsg);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Core Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-gray-900">Product Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Slug (URL friendly) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
                {slug && (
                  <p className="mt-1 text-[10px] text-gray-550 dark:text-gray-400 font-bold">
                    Preview Path: <span className="text-[#e94560] font-mono">/product/{slug}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">SKU / Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Size Guide Preset</label>
                <select
                  value={sizeGuideId}
                  onChange={(e) => setSizeGuideId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                >
                  <option value="">No Size Guide</option>
                  {sizeGuidesList.map(sg => (
                    <option key={sg.id} value={sg.id}>{sg.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="new, sale, cotton"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Short Description</label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                placeholder="A brief overview of the product (shown above variations)"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
              <div className="mt-1.5 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#16162a] shadow-sm">
                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-800 p-2 bg-gray-50 dark:bg-[#1f1f3a] gap-2 select-none">
                  <div className="flex flex-wrap items-center gap-0.5">
                    {!isHtmlMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => execCommand('bold')}
                          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Bold"
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand('italic')}
                          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Italic"
                        >
                          <Italic className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand('underline')}
                          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Underline"
                        >
                          <Underline className="h-4 w-4" />
                        </button>
                        
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                        
                        <button
                          type="button"
                          onClick={() => execCommand('formatBlock', '<h2>')}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand('formatBlock', '<h3>')}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Heading 3"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand('formatBlock', '<p>')}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Normal Paragraph"
                        >
                          Normal
                        </button>
                        
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                        
                        <button
                          type="button"
                          onClick={() => execCommand('insertUnorderedList')}
                          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Bullet List"
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execCommand('insertOrderedList')}
                          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors"
                          title="Numbered List"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </button>

                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

                        <button
                          type="button"
                          onClick={() => execCommand('removeFormat')}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2c2c4d] hover:text-red-500 dark:hover:text-red-500 transition-colors"
                          title="Clear Formatting"
                        >
                          Clear Format
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 px-2 py-1">HTML Code View</span>
                    )}
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => setIsHtmlMode(!isHtmlMode)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-[#2c2c4d] hover:text-[#e94560] dark:hover:text-[#e94560] transition-colors cursor-pointer shadow-sm active:scale-95"
                  >
                    {isHtmlMode ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>Visual Editor</span>
                      </>
                    ) : (
                      <>
                        <Code className="h-3.5 w-3.5" />
                        <span>HTML View</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Editor Content Area */}
                {isHtmlMode ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={10}
                    className="w-full bg-white dark:bg-[#16162a] px-4 py-3 text-sm font-mono text-gray-800 dark:text-gray-100 focus:outline-none transition-all resize-y border-0 min-h-[220px]"
                    placeholder="<p>Write raw HTML here...</p>"
                  />
                ) : (
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                    onBlur={(e) => setDescription(e.currentTarget.innerHTML)}
                    className="w-full bg-white dark:bg-[#16162a] px-4 py-3 text-sm font-medium focus:outline-none transition-all overflow-y-auto min-h-[220px] prose dark:prose-invert max-w-none border-0"
                    style={{ outline: 'none' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-gray-900">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Selling Price *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Compare Price</label>
                <input
                  type="number"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="Original price for strikethrough"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Purchase Cost</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Rating (0.0 to 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Reviews Count Override</label>
                <input
                  type="number"
                  min="0"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {!hasVariants && !isService && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">In Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Variants Block — Enhanced */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 text-gray-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Product Variants</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-5 pt-1">
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Enable Visual Swatches</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Show color circles and images instead of text button tags on storefront</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableSwatches}
                      onChange={(e) => setEnableSwatches(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Show Swatches on Catalog Cards</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Show variant color circles under the product image on the archive/catalog page</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSwatchesOnArchive}
                      onChange={(e) => setShowSwatchesOnArchive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
                  </label>
                </div>


                {/* Attribute Axes */}
                {variantAxes.map((axis, axisIdx) => (
                  <div key={axisIdx} className="bg-gray-50 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                    {/* Axis header */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={axis.name}
                        onChange={(e) => {
                          setVariantAxes(prev => prev.map((a, i) => i === axisIdx ? { ...a, name: e.target.value } : a));
                        }}
                        placeholder="Attribute name (e.g. Color, Size, Material)"
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#e94560]"
                      />
                      <select
                        value={axis.type}
                        onChange={(e) => setVariantAxes(prev => prev.map((a, i) => i === axisIdx ? { ...a, type: e.target.value as 'color' | 'size' | 'material' | 'custom' } : a))}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-semibold focus:outline-none"
                      >
                        <option value="color">Color</option>
                        <option value="size">Size</option>
                        <option value="material">Material</option>
                        <option value="custom">Custom</option>
                      </select>
                      {variantAxes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setVariantAxes(prev => prev.filter((_, i) => i !== axisIdx))}
                          className="p-2 text-red-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Import Preset */}
                    {presets.filter(p => p.attribute === axis.type).length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-gray-400">Load Preset:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {presets.filter(p => p.attribute === axis.type).map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                const newValues = preset.values.map(v => ({
                                  label: v.label,
                                  hex: v.hex,
                                  imageUrl: v.imageUrl
                                }));
                                setVariantAxes(prev => prev.map((a, i) =>
                                  i === axisIdx ? { ...a, values: [...a.values, ...newValues.filter(nv => !a.values.find(av => av.label === nv.label))] } : a
                                ));
                                setVariants(prev => prev.map(v => {
                                  const match = newValues.find(nv => nv.label === v.color);
                                  if (match) {
                                    return {
                                      ...v,
                                      colorHex: match.hex || v.colorHex,
                                      imageUrl: match.imageUrl || v.imageUrl
                                    };
                                  }
                                  return v;
                                }));
                                toast.success(`Loaded: ${preset.name}`);
                              }}
                              className="px-2 py-1 rounded-lg bg-[#1a1a2e] text-white text-[10px] font-bold hover:bg-[#e94560] transition-colors cursor-pointer"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tag chip input */}
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                        {axis.values.map((val, valIdx) => (
                          <div
                            key={valIdx}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-xs font-semibold text-gray-800 dark:text-gray-200 group"
                          >
                            {/* Color dot/hex indicator */}
                            {axis.type === 'color' && (
                              <span
                                className="flex-shrink-0 h-3.5 w-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                                style={{ background: val.hex || '#ccc' }}
                              />
                            )}
                            <span>{val.label}</span>
                            <button
                              type="button"
                              onClick={() => setVariantAxes(prev => prev.map((a, i) =>
                                i === axisIdx ? { ...a, values: a.values.filter((_, vi) => vi !== valIdx) } : a
                              ))}
                              className="text-gray-400 hover:text-red-500 cursor-pointer ml-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add value row */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Add ${axis.name || axis.type} value, press Enter`}
                          value={axisInputs[axisIdx] || ''}
                          onChange={(e) => setAxisInputs(prev => { const n = [...prev]; n[axisIdx] = e.target.value; return n; })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const raw = (axisInputs[axisIdx] || '').trim().replace(/,$/, '');
                              if (!raw) return;
                              const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
                              parts.forEach(label => {
                                if (!axis.values.find(v => v.label === label)) {
                                  const lowerLabel = label.toLowerCase();
                                  const hex = axis.type === 'color' ? (standardColorMap[lowerLabel] || '#888888') : undefined;
                                  setVariantAxes(prev => prev.map((a, i) =>
                                    i === axisIdx ? { ...a, values: [...a.values, { label, hex }] } : a
                                  ));
                                }
                              });
                              setAxisInputs(prev => { const n = [...prev]; n[axisIdx] = ''; return n; });
                            }
                          }}
                          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-3 py-2 text-sm focus:outline-none focus:border-[#e94560]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const raw = (axisInputs[axisIdx] || '').trim();
                            if (!raw) return;
                            const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
                            parts.forEach(label => {
                              if (!axis.values.find(v => v.label === label)) {
                                const lowerLabel = label.toLowerCase();
                                const hex = axis.type === 'color' ? (standardColorMap[lowerLabel] || '#888888') : undefined;
                                setVariantAxes(prev => prev.map((a, i) =>
                                  i === axisIdx ? { ...a, values: [...a.values, { label, hex }] } : a
                                ));
                              }
                            });
                            setAxisInputs(prev => { const n = [...prev]; n[axisIdx] = ''; return n; });
                          }}
                          className="flex h-9 items-center gap-1 px-3 rounded-lg bg-[#1a1a2e] dark:bg-[#e94560] text-white text-xs font-bold cursor-pointer hover:bg-[#e94560] dark:hover:bg-[#d8344e] transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Color extras: hex + image URL per value */}
                    {axis.type === 'color' && axis.values.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-[10px] font-black uppercase text-gray-400">Color Settings (hex + linked image)</span>
                        {axis.values.map((val, valIdx) => (
                          <div key={valIdx} className="flex items-center gap-2 bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-700 rounded-lg p-2">
                            <input
                              type="color"
                              value={val.hex || '#888888'}
                              onChange={(e) => {
                                const newHex = e.target.value;
                                setVariantAxes(prev => prev.map((a, i) =>
                                  i === axisIdx ? {
                                    ...a,
                                    values: a.values.map((v, vi) =>
                                      vi === valIdx ? { ...v, hex: newHex } : v
                                    )
                                  } : a
                                ));
                                // SYNC TO VARIANTS
                                setVariants(prev => prev.map(v => 
                                  v.color === val.label ? { ...v, colorHex: newHex } : v
                                ));
                              }}
                              className="h-8 w-8 rounded cursor-pointer border-0 p-0.5 bg-transparent"
                              title="Pick color"
                            />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 min-w-[70px]">{val.label}</span>
                            {/* Custom Image Selector Dropdown */}
                            <div className="relative flex-1">
                              <button
                                type="button"
                                onClick={() => setActiveImageSelector(
                                  activeImageSelector?.axisIdx === axisIdx && activeImageSelector?.valIdx === valIdx
                                    ? null
                                    : { axisIdx, valIdx }
                                )}
                                className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#16162a] transition-all"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {val.imageUrl ? (
                                    <>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={val.imageUrl}
                                        alt={val.label}
                                        className="h-6 w-6 rounded object-cover border border-gray-200 dark:border-gray-700"
                                      />
                                      <span className="truncate text-gray-700 dark:text-gray-300">
                                        {images.find(img => img.url === val.imageUrl)?.alt || val.imageUrl.split('/').pop() || 'Linked Image'}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        📷
                                      </span>
                                      <span className="text-gray-400">No linked image</span>
                                    </>
                                  )}
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              </button>

                              {activeImageSelector?.axisIdx === axisIdx && activeImageSelector?.valIdx === valIdx && (
                                <>
                                  <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setActiveImageSelector(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-64 max-h-60 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] p-1.5 shadow-xl z-40 space-y-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVariantAxes(prev => prev.map((a, i) =>
                                          i === axisIdx ? {
                                            ...a,
                                            values: a.values.map((v, vi) =>
                                              vi === valIdx ? { ...v, imageUrl: undefined } : v
                                            )
                                          } : a
                                        ));
                                        // SYNC TO VARIANTS
                                        setVariants(prev => prev.map(v => 
                                          v.color === val.label ? { ...v, imageUrl: undefined } : v
                                        ));
                                        setActiveImageSelector(null);
                                      }}
                                      className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors text-left text-xs font-bold cursor-pointer ${
                                        !val.imageUrl
                                          ? 'bg-gray-100 dark:bg-[#0f0f1b] text-[#e94560]'
                                          : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#0f0f1b]'
                                      }`}
                                    >
                                      <span className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        ❌
                                      </span>
                                      No linked image
                                    </button>
                                    
                                    {images.map((img, imgIdx) => {
                                      const isSelected = val.imageUrl === img.url;
                                      const filename = img.alt || img.url.split('/').pop() || `Image ${imgIdx + 1}`;
                                      return (
                                        <button
                                          key={imgIdx}
                                          type="button"
                                          onClick={() => {
                                            const newUrl = img.url;
                                            setVariantAxes(prev => prev.map((a, i) =>
                                              i === axisIdx ? {
                                                ...a,
                                                values: a.values.map((v, vi) =>
                                                  vi === valIdx ? { ...v, imageUrl: newUrl } : v
                                                )
                                              } : a
                                            ));
                                            // SYNC TO VARIANTS
                                            setVariants(prev => prev.map(v => 
                                              v.color === val.label ? { ...v, imageUrl: newUrl } : v
                                            ));
                                            setActiveImageSelector(null);
                                          }}
                                          className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg transition-colors text-left text-xs font-bold cursor-pointer ${
                                            isSelected
                                              ? 'bg-gray-100 dark:bg-[#0f0f1b] text-[#e94560]'
                                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0f0f1b]'
                                          }`}
                                        >
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={img.url}
                                            alt={filename}
                                            className="h-8 w-8 rounded object-cover border border-gray-200 dark:border-gray-800 flex-shrink-0"
                                          />
                                          <span className="truncate flex-1">{filename}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add another attribute axis */}
                <button
                  type="button"
                  onClick={() => {
                    setVariantAxes(prev => [...prev, { name: '', type: 'size', values: [] }]);
                    setAxisInputs(prev => [...prev, '']);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#e94560] hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Another Attribute (e.g. Material)
                </button>

                {/* Generate + Clear buttons */}
                <div className="flex items-center gap-3 pt-1 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleGenerateVariants}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a2e] hover:bg-[#e94560] text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Generate All Combinations
                  </button>
                  {variants.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { if (confirm('Clear all variants?')) setVariants([]); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-bold cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear All
                    </button>
                  )}
                  <span className="text-xs text-gray-400 font-semibold ml-auto">
                    {variants.length} variant{variants.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Variants Table */}
                {variants.length > 0 && (
                  <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
                    <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                      <thead className="bg-gray-50 dark:bg-[#0f0f1b] border-b border-gray-100 dark:border-gray-800 font-bold uppercase text-gray-500">
                        <tr>
                          <th className="py-2.5 px-3">Variant</th>
                          <th className="py-2.5 px-3">Color</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Stock *</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3 text-center">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {variants.map((variant, idx) => {
                          const label = [variant.color, variant.size, variant.material, variant.customValue].filter(Boolean).join(' / ') || `Var ${idx + 1}`;
                          return (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#0f0f1b]/50">
                              <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {variant.colorHex && (
                                    <span className="h-3 w-3 rounded-full flex-shrink-0 border border-gray-300" style={{ background: variant.colorHex }} />
                                  )}
                                  {label}
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                {variant.color && (
                                  <input
                                    type="color"
                                    value={variant.colorHex || '#888888'}
                                    onChange={(e) => handleUpdateVariant(idx, { colorHex: e.target.value })}
                                    className="h-6 w-6 rounded cursor-pointer border-0 p-0.5 bg-transparent"
                                  />
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={variant.price || ''}
                                  placeholder={price}
                                  onChange={(e) => handleUpdateVariant(idx, { price: parseFloat(e.target.value) || undefined })}
                                  className="w-20 rounded border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b] p-1 font-semibold text-xs"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  required
                                  value={variant.stock}
                                  onChange={(e) => handleUpdateVariant(idx, { stock: parseInt(e.target.value) || 0 })}
                                  className="w-16 rounded border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b] p-1 font-semibold text-xs"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={variant.sku || ''}
                                  onChange={(e) => handleUpdateVariant(idx, { sku: e.target.value })}
                                  className="w-24 rounded border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b] p-1 text-xs"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(idx)}
                                  className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}
          </div>


          {/* Custom Modifiers (Add-ons) */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-gray-900">Custom Modifiers (Add-ons)</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Gift Wrap, Custom printing etc"
                value={modName}
                onChange={(e) => setModName(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm focus:outline-none focus:border-[#1a1a2e]"
              />
              <input
                type="number"
                placeholder="+ Rs."
                value={modPrice}
                onChange={(e) => setModPrice(e.target.value)}
                className="w-24 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:border-[#1a1a2e]"
              />
              <button
                type="button"
                onClick={handleAddModifier}
                className="bg-[#1a1a2e] text-white p-2.5 rounded-xl flex items-center justify-center cursor-pointer"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {modifiers.length > 0 && (
              <div className="space-y-2 pt-2">
                {modifiers.map((mod, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/30">
                    <div className="text-sm font-semibold text-gray-800">
                      {mod.name} <span className="text-xs font-bold text-gray-400 ml-1">(+ Rs. {mod.price})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveModifier(i)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Status & Images */}
        <div className="space-y-6">
          {/* Status Settings */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-gray-900">Status & Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700">Active (Visible in shop)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700">Featured Product</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isService}
                  onChange={(e) => setIsService(e.target.checked)}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700">Service (No stock tracking)</span>
              </label>
            </div>
          </div>

          {/* Flash Sale Options Card */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Flash Sale Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={flashSaleEnabled}
                  onChange={(e) => setFlashSaleEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Flash Sale for Product</span>
              </label>

              {flashSaleEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Start Time</label>
                    <input
                      type="datetime-local"
                      value={flashSaleStartDate}
                      onChange={(e) => setFlashSaleStartDate(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">End Time</label>
                    <input
                      type="datetime-local"
                      value={flashSaleEndDate}
                      onChange={(e) => setFlashSaleEndDate(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frequently Bought Together (FBT) Card */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Bought Together Recommendations</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Select up to 2 items to bundle and offer discounts at storefront.</p>
            
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl max-h-60 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-[#0f0f1b] overscroll-contain">
              {productList.length === 0 ? (
                <span className="text-xs text-gray-500">No other active products available.</span>
              ) : (
                productList.map((product) => {
                  const isChecked = frequentlyBoughtTogetherIds.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isChecked && frequentlyBoughtTogetherIds.length >= 2}
                        onChange={() => {
                          if (isChecked) {
                            setFrequentlyBoughtTogetherIds(prev => prev.filter(id => id !== product.id));
                          } else {
                            if (frequentlyBoughtTogetherIds.length < 2) {
                              setFrequentlyBoughtTogetherIds(prev => [...prev, product.id]);
                            } else {
                              toast.warning('You can choose a maximum of 2 bought-together items.');
                            }
                          }
                        }}
                        className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-850 dark:text-gray-200 truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">Rs. {product.price}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Badge Options Card */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Badge Options</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={badgeEnabled}
                  onChange={(e) => setBadgeEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Badge on Product Card</span>
              </label>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Select Badge</label>
                <select
                  value={customBadgeId}
                  onChange={(e) => setCustomBadgeId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                >
                  <option value="">None (No custom badge)</option>
                  {allBadges.map(badge => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Images Panel */}
          <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Product Images</h3>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="flex items-center gap-1 text-xs font-bold text-[#e94560] hover:text-[#d8344e] transition-colors cursor-pointer"
              >
                <FolderOpen className="h-4 w-4" />
                Select from Library
              </button>
            </div>
            
            {images.length === 0 ? (
              <div 
                onClick={() => setIsMediaModalOpen(true)}
                className="flex flex-col items-center justify-center border border-dashed border-gray-200 hover:border-gray-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-gray-50/20 dark:bg-[#0f0f1b]/20 dark:border-gray-800"
              >
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Media</span>
                <span className="text-[10px] text-gray-400 mt-1">Select images from your media library</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Select Media</span>
                </button>
              </div>
            )}

            {/* Uploaded Images preview grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {images.map((img, i) => (
                  <div key={i} className="group relative aspect-square rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`Preview ${i}`} className="absolute inset-0 w-full h-full object-cover" />

                    
                    {/* Controls overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(i)}
                        className={`p-1.5 rounded-lg text-white hover:bg-white/10 ${img.isPrimary ? 'text-amber-400' : ''}`}
                        title="Make Primary"
                      >
                        <Star className="h-4.5 w-4.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i, img.url)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-white/10"
                        title="Delete Image"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {img.isPrimary && (
                      <span className="absolute top-1 right-1 bg-amber-400 text-[9px] font-extrabold text-[#1a1a2e] px-1.5 py-0.5 rounded-md shadow-sm">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="flex-1 text-center border border-gray-200 text-gray-700 bg-white rounded-xl py-3.5 text-sm font-semibold transition-all hover:bg-gray-50 active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 text-center bg-[#1a1a2e] hover:bg-[#e94560] text-white rounded-xl py-3.5 text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Save Product
            </button>
          </div>

        </div>

      </div>
    </form>

    {/* Media Library Modal */}
    <MediaSelectorModal
      isOpen={isMediaModalOpen}
      onClose={() => setIsMediaModalOpen(false)}
      onSelect={handleAddSelectedLibraryImages}
      multiple={true}
    />
  </>
  );
}
