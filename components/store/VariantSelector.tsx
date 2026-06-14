'use client';

import React from 'react';
import { ProductVariant, StoreSettings } from '@/lib/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onChangeSelectedVariant: (variant: ProductVariant) => void;
  enableSwatches?: boolean;
  settings?: StoreSettings | null;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onChangeSelectedVariant,
  enableSwatches,
  settings
}: VariantSelectorProps) {
  const activeVariants = React.useMemo(() => variants.filter(v => v.active), [variants]);

  const colors = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.color).filter(Boolean))) as string[], [activeVariants]);
  const sizes = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.size).filter(Boolean))) as string[], [activeVariants]);
  const materials = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.material).filter(Boolean))) as string[], [activeVariants]);

  const customOptionName = activeVariants[0]?.customOption;
  const customValues = React.useMemo(() => Array.from(new Set(activeVariants.map(v => v.customValue).filter(Boolean))) as string[], [activeVariants]);

  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(selectedVariant?.color || colors[0]);
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>(selectedVariant?.size || sizes[0]);
  const [selectedMaterial, setSelectedMaterial] = React.useState<string | undefined>(selectedVariant?.material || materials[0]);
  const [selectedCustomValue, setSelectedCustomValue] = React.useState<string | undefined>(selectedVariant?.customValue || customValues[0]);

  React.useEffect(() => {
    if (selectedVariant) {
      setSelectedColor(selectedVariant.color || colors[0]);
      setSelectedSize(selectedVariant.size || sizes[0]);
      setSelectedMaterial(selectedVariant.material || materials[0]);
      setSelectedCustomValue(selectedVariant.customValue || customValues[0]);
    }
  }, [selectedVariant, colors, sizes, materials, customValues]);

  React.useEffect(() => {
    const match = activeVariants.find(v => {
      const colorMatch = !colors.length || v.color === selectedColor;
      const sizeMatch = !sizes.length || v.size === selectedSize;
      const materialMatch = !materials.length || v.material === selectedMaterial;
      const customMatch = !customValues.length || v.customValue === selectedCustomValue;
      return colorMatch && sizeMatch && materialMatch && customMatch;
    });
    if (match && (!selectedVariant || match.id !== selectedVariant.id)) {
      onChangeSelectedVariant(match);
    }
  }, [selectedColor, selectedSize, selectedMaterial, selectedCustomValue, activeVariants, colors.length, sizes.length, materials.length, customValues.length, selectedVariant, onChangeSelectedVariant]);

  const showSwatches = (enableSwatches !== false) && (settings?.enableVariantSwatches ?? true);
  const productSwatchSize = settings?.productSwatchSize ?? settings?.swatchSize ?? 'md';
  const swatchShape = settings?.swatchShape || 'circle';

  const swatchSizeMap: Record<string, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14',
    xxl: 'h-16 w-16'
  };
  const shapeMap: Record<string, string> = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  const sizeClass = swatchSizeMap[productSwatchSize] || swatchSizeMap.md;
  const shapeClass = shapeMap[swatchShape] || shapeMap.circle;

  // Helper: pick a color variant by color name click
  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    const match = activeVariants.find(v => {
      return v.color === color &&
        (!sizes.length || v.size === selectedSize) &&
        (!materials.length || v.material === selectedMaterial) &&
        (!customValues.length || v.customValue === selectedCustomValue);
    });
    if (match) {
      onChangeSelectedVariant(match);
    } else {
      const fallback = activeVariants.find(v => v.color === color);
      if (fallback) {
        if (fallback.size) setSelectedSize(fallback.size);
        if (fallback.material) setSelectedMaterial(fallback.material);
        if (fallback.customValue) setSelectedCustomValue(fallback.customValue);
        onChangeSelectedVariant(fallback);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* COLOR */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Color</span>
            {selectedColor && (
              <span className="text-xs font-bold text-[#1a1a2e]">: {selectedColor}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {colors.map(color => {
              const matchVar = activeVariants.find(v => v.color === color);
              const isSelected = selectedColor === color;

              // Image or hex swatch
              if (showSwatches && matchVar && (matchVar.colorHex || matchVar.imageUrl)) {
                const bg = matchVar.colorHex || undefined;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorClick(color)}
                    title={color}
                    aria-label={color}
                    className={`
                      relative flex items-center justify-center cursor-pointer
                      transition-all duration-200
                      ${sizeClass} ${shapeClass}
                      ${isSelected
                        ? 'ring-2 ring-offset-2 ring-[#e94560] scale-110 shadow-md'
                        : 'ring-1 ring-gray-200 hover:ring-gray-400 hover:scale-105'
                      }
                      overflow-hidden
                    `}
                    style={{ backgroundColor: bg }}
                  >
                    {matchVar.imageUrl && !matchVar.colorHex && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={matchVar.imageUrl}
                        alt={color}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Selected checkmark overlay for image swatches */}
                    {isSelected && matchVar.imageUrl && !matchVar.colorHex && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg className="w-4 h-4 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              }

              // Text pill fallback
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorClick(color)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SIZE */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Size</span>
            {selectedSize && (
              <span className="text-xs font-bold text-[#1a1a2e]">: {selectedSize}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-w-sm sm:max-w-md">
            {sizes.map(size => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    const match = activeVariants.find(v =>
                      (!colors.length || v.color === selectedColor) &&
                      v.size === size &&
                      (!materials.length || v.material === selectedMaterial) &&
                      (!customValues.length || v.customValue === selectedCustomValue)
                    );
                    if (match) {
                      onChangeSelectedVariant(match);
                    } else {
                      const fallback = activeVariants.find(v => v.size === size);
                      if (fallback) {
                        if (fallback.color) setSelectedColor(fallback.color);
                        if (fallback.material) setSelectedMaterial(fallback.material);
                        if (fallback.customValue) setSelectedCustomValue(fallback.customValue);
                        onChangeSelectedVariant(fallback);
                      }
                    }
                  }}
                  className={`min-w-[52px] py-2.5 px-3 text-center rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] ring-2 ring-[#1a1a2e]/20 scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MATERIAL */}
      {materials.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Material</span>
            {selectedMaterial && (
              <span className="text-xs font-bold text-[#1a1a2e]">: {selectedMaterial}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-w-sm sm:max-w-md">
            {materials.map(mat => {
              const isSelected = selectedMaterial === mat;
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => {
                    setSelectedMaterial(mat);
                    const match = activeVariants.find(v =>
                      (!colors.length || v.color === selectedColor) &&
                      (!sizes.length || v.size === selectedSize) &&
                      v.material === mat &&
                      (!customValues.length || v.customValue === selectedCustomValue)
                    );
                    if (match) {
                      onChangeSelectedVariant(match);
                    } else {
                      const fallback = activeVariants.find(v => v.material === mat);
                      if (fallback) {
                        if (fallback.color) setSelectedColor(fallback.color);
                        if (fallback.size) setSelectedSize(fallback.size);
                        if (fallback.customValue) setSelectedCustomValue(fallback.customValue);
                        onChangeSelectedVariant(fallback);
                      }
                    }
                  }}
                  className={`min-w-[52px] py-2.5 px-3 text-center rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] ring-2 ring-[#1a1a2e]/20 scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {mat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CUSTOM OPTION */}
      {customOptionName && customValues.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{customOptionName}</span>
            {selectedCustomValue && (
              <span className="text-xs font-bold text-[#1a1a2e]">: {selectedCustomValue}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-w-sm sm:max-w-md">
            {customValues.map(val => {
              const isSelected = selectedCustomValue === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setSelectedCustomValue(val);
                    const match = activeVariants.find(v =>
                      (!colors.length || v.color === selectedColor) &&
                      (!sizes.length || v.size === selectedSize) &&
                      (!materials.length || v.material === selectedMaterial) &&
                      v.customValue === val
                    );
                    if (match) {
                      onChangeSelectedVariant(match);
                    } else {
                      const fallback = activeVariants.find(v => v.customValue === val);
                      if (fallback) {
                        if (fallback.color) setSelectedColor(fallback.color);
                        if (fallback.size) setSelectedSize(fallback.size);
                        if (fallback.material) setSelectedMaterial(fallback.material);
                        onChangeSelectedVariant(fallback);
                      }
                    }
                  }}
                  className={`min-w-[52px] py-2.5 px-3 text-center rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] ring-2 ring-[#1a1a2e]/20 scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
