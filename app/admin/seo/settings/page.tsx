'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  ChevronRight, 
  Loader2, 
  Save, 
  Settings, 
  Zap, 
  Layout, 
  Globe 
} from '@/components/common/Icons';
import { toast } from 'sonner';

const PROVIDERS = [
  { group: 'FREE', options: ['groq', 'gemini', 'cerebras', 'mistral', 'cloudflare', 'nvidia'] },
  { group: 'CHEAP', options: ['deepseek', 'openrouter', 'together', 'fireworks', 'siliconflow'] },
  { group: 'PREMIUM', options: ['openai', 'anthropic', 'kimi', 'minimax', 'qwen'] }
];

const TEXT_MODELS: Record<string, string[]> = {
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemma-3-27b'],
  cerebras: ['llama-3.3-70b'],
  mistral: ['mistral-small-2506', 'ministral-3b-2512', 'open-mistral-nemo'],
  cloudflare: ['@cf/meta/llama-3.3-70b-instruct', '@cf/google/gemma-4-26b-a4b-it'],
  nvidia: ['meta/llama-3.3-70b-instruct'],
  deepseek: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  openrouter: ['deepseek/deepseek-r1:free', 'meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-3-27b-it:free'],
  together: ['meta-llama/Llama-3.3-70b-Instruct-Turbo'],
  fireworks: ['accounts/fireworks/models/llama-v3p3-70b-instruct'],
  siliconflow: ['vendor/meta-llama/Llama-3.3-70b-Instruct'],
  openai: ['gpt-4o-mini', 'gpt-4o'],
  anthropic: ['claude-3-5-haiku', 'claude-3-5-sonnet'],
  kimi: ['kimi-k2.6'],
  minimax: ['minimax-m2.7'],
  qwen: ['qwen3-122b', 'qwen3-32b']
};

const VISION_MODELS: Record<string, string[]> = {
  groq: ['meta-llama/llama-4-scout-17b-16e-instruct'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  cerebras: ['llama-4-scout-17b-16e-instruct'],
  mistral: ['mistral-small-2506', 'ministral-8b-2512', 'mistral-medium-2508'],
  cloudflare: ['@cf/meta/llama-3.2-11b-vision-instruct', '@cf/meta/llama-4-scout-17b-16e-instruct', '@cf/mistralai/mistral-small-3.1-24b-instruct'],
  nvidia: ['meta/llama-3.2-11b-vision-instruct', 'meta/llama-3.2-90b-vision-instruct', 'meta/llama-4-maverick-17b-128e-instruct'],
  deepseek: ['deepseek-v4-flash'],
  openrouter: ['google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.2-11b-vision-instruct:free'],
  together: ['meta-llama/Llama-3.2-11b-Vision-Instruct'],
  fireworks: ['accounts/fireworks/models/llama-v3p2-11b-vision-instruct'],
  siliconflow: ['vendor/meta-llama/Llama-3.2-11b-Vision-Instruct'],
  openai: ['gpt-4o'],
  anthropic: ['claude-3-5-sonnet'],
  kimi: ['kimi-k2.6'],
  minimax: ['minimax-m2.7-vision'],
  qwen: ['qwen3-vl']
};

export default function SEOSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    content_provider: 'groq',
    content_model: 'llama-3.3-70b-versatile',
    content_keys: '',
    vision_provider: 'gemini',
    vision_model: 'gemini-2.0-flash',
    vision_keys: '',
    brand_name: '',
    store_type: 'General',
    target_market: 'Pakistan',
    tone: 'Professional',
    language: 'English',
    custom_instructions: '',
    auto_content_seo: true,
    auto_media_ai: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('id', '00000000-0000-4000-8000-000000000002')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setForm({
          content_provider: data.content_provider || 'groq',
          content_model: data.content_model || 'llama-3.3-70b-versatile',
          content_keys: data.content_keys || '',
          vision_provider: data.vision_provider || 'gemini',
          vision_model: data.vision_model || 'gemini-2.0-flash',
          vision_keys: data.vision_keys || '',
          brand_name: data.brand_name || '',
          store_type: data.store_type || 'General',
          target_market: data.target_market || 'Pakistan',
          tone: data.tone || 'Professional',
          language: data.language || 'English',
          custom_instructions: data.custom_instructions || '',
          auto_content_seo: data.auto_content_seo ?? true,
          auto_media_ai: data.auto_media_ai ?? true
        });
      }
    } catch (err: any) {
      console.error('[SEO Settings] Load failed:', err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (field: 'content_provider' | 'vision_provider', val: string) => {
    const defaultModel = field === 'content_provider' 
      ? TEXT_MODELS[val]?.[0] || ''
      : VISION_MODELS[val]?.[0] || '';

    setForm(prev => ({
      ...prev,
      [field]: val,
      [field === 'content_provider' ? 'content_model' : 'vision_model']: defaultModel
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          id: '00000000-0000-4000-8000-000000000002',
          ...form,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('AI & SEO Settings saved successfully!');
    } catch (err: any) {
      console.error('[SEO Settings] Save failed:', err);
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 max-w-xl mx-auto mt-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
        <span>Loading AI Configurations...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <Link href="/admin/seo" className="hover:text-blue-600">SEO Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-950 dark:text-white">AI Config Settings</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">AI Copywriting Configuration</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Select text/vision models, set brand voice properties, and configure API keys.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Content SEO AI Settings */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            CONTENT SEO AI SETTINGS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Provider</label>
              <select
                value={form.content_provider}
                onChange={(e) => handleProviderChange('content_provider', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                {PROVIDERS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Text Model</label>
              <select
                value={form.content_model}
                onChange={(e) => setForm(prev => ({ ...prev, content_model: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                {(TEXT_MODELS[form.content_provider] || []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">API Keys (1 per line for rotation)</label>
            <textarea
              value={form.content_keys}
              onChange={(e) => setForm(prev => ({ ...prev, content_keys: e.target.value }))}
              placeholder="Paste API keys here..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Image SEO AI Settings */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            IMAGE SEO VISION SETTINGS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Vision Provider</label>
              <select
                value={form.vision_provider}
                onChange={(e) => handleProviderChange('vision_provider', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                {PROVIDERS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Vision Model</label>
              <select
                value={form.vision_model}
                onChange={(e) => setForm(prev => ({ ...prev, vision_model: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                {(VISION_MODELS[form.vision_provider] || []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Vision API Keys (1 per line)</label>
            <textarea
              value={form.vision_keys}
              onChange={(e) => setForm(prev => ({ ...prev, vision_keys: e.target.value }))}
              placeholder="Paste Vision API keys here..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Store Settings & Brand voice */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            BRAND GUIDELINES & VOICE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Brand Name</label>
              <input
                type="text"
                value={form.brand_name}
                onChange={(e) => setForm(prev => ({ ...prev, brand_name: e.target.value }))}
                placeholder="e.g. TotVogue"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Store Type</label>
              <select
                value={form.store_type}
                onChange={(e) => setForm(prev => ({ ...prev, store_type: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                <option value="Kids">Kids</option>
                <option value="Adults">Adults</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target Market</label>
              <select
                value={form.target_market}
                onChange={(e) => setForm(prev => ({ ...prev, target_market: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                <option value="Pakistan">Pakistan</option>
                <option value="Global">Global</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tone of Voice</label>
              <select
                value={form.tone}
                onChange={(e) => setForm(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                <option value="Professional">Professional</option>
                <option value="Catchy & Salesy">Catchy & Salesy</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
              >
                <option value="English">English</option>
                <option value="Urdu Roman">Urdu Roman</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Custom Brand Instructions (e.g., We specialize in Eid Wear)</label>
            <textarea
              value={form.custom_instructions}
              onChange={(e) => setForm(prev => ({ ...prev, custom_instructions: e.target.value }))}
              placeholder="Describe your brand features, delivery parameters, etc..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Auto modes */}
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-500" />
            AUTOMATION MODE TOGGLES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white block">Auto Content SEO</span>
                <span className="text-xs text-gray-500">Run LLM copy generation on product/category creation/save.</span>
              </div>
              <input
                type="checkbox"
                checked={form.auto_content_seo}
                onChange={(e) => setForm(prev => ({ ...prev, auto_content_seo: e.target.checked }))}
                className="w-10 h-6 rounded-full bg-gray-200 checked:bg-blue-600 appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white block">Auto Media AI</span>
                <span className="text-xs text-gray-500">Run vision models to fill tags when an image is uploaded.</span>
              </div>
              <input
                type="checkbox"
                checked={form.auto_media_ai}
                onChange={(e) => setForm(prev => ({ ...prev, auto_media_ai: e.target.checked }))}
                className="w-10 h-6 rounded-full bg-gray-200 checked:bg-blue-600 appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/seo"
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm cursor-pointer min-h-[44px]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm text-sm cursor-pointer min-h-[44px] active:scale-95"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
