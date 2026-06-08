'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Category } from '@/lib/types';
import { createCategory, updateCategory, deleteCategory } from '@/lib/services/categories';
import { toast } from 'sonner';
import MediaSelectorModal from './MediaSelectorModal';

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Auto-fill slug
  React.useEffect(() => {
    if (!editId && name) {
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
  }, [name, editId]);

  const handleOpenNew = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setSortOrder('0');
    setActive(true);
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setSortOrder(cat.sortOrder.toString());
    setActive(cat.active);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disable/delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, active: false } : c));
      toast.success('Category disabled successfully');
    } catch (err) {
      toast.error('Failed to disable category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category Name is required');
    if (!slug.trim()) return toast.error('Category Slug is required');

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      sortOrder: parseInt(sortOrder) || 0,
      active
    };

    try {
      if (editId) {
        const updated = await updateCategory(editId, payload);
        setCategories(prev => prev.map(c => c.id === editId ? updated : c));
        toast.success('Category updated successfully');
      } else {
        const created = await createCategory(payload);
        setCategories(prev => [...prev, created]);
        toast.success('Category created successfully');
      }
      setIsOpen(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save category';
      toast.error(errMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] text-white px-5 py-2.5 text-sm font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4 text-gray-900 dark:text-white transition-colors">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-950 text-base">{cat.name}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                  cat.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1">Slug: {cat.slug}</p>
              {cat.description && (
                <p className="text-sm text-gray-600 mt-2.5 line-clamp-2">{cat.description}</p>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100 justify-end">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#1a1a2e] bg-gray-50 px-3 py-2 rounded-lg cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide / Inline Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16162a] w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden animate-scale-in text-gray-900 dark:text-white">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category Image</label>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-[#0f0f1b]/20">
                  {imageUrl ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative h-14 w-14 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Category Image Preview" className="h-full w-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400">
                      <Plus className="h-6 w-6" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="relative self-start flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Select Media
                    </button>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Select or upload WebP &lt; 50 KB</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:border-[#1a1a2e] focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <label htmlFor="cat-active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Active (Show to customers)
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center border border-gray-200 text-gray-700 bg-white rounded-xl py-3 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-center bg-[#1a1a2e] hover:bg-[#e94560] text-white rounded-xl py-3 text-sm font-bold shadow-md cursor-pointer transition-all"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(urls) => {
          if (urls.length > 0) {
            setImageUrl(urls[0]);
          }
        }}
        multiple={false}
      />
    </div>
  );
}
