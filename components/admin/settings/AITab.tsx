'use client';

import React from 'react';

interface AITabProps {
  contentProvider: string;
  setContentProvider: (val: string) => void;
  contentModel: string;
  setContentModel: (val: string) => void;
  contentKeys: string;
  setContentKeys: (val: string) => void;
  visionProvider: string;
  setVisionProvider: (val: string) => void;
  visionModel: string;
  setVisionModel: (val: string) => void;
  visionKeys: string;
  setVisionKeys: (val: string) => void;
  aiTone: string;
  setAiTone: (val: string) => void;
  aiLanguage: string;
  setAiLanguage: (val: string) => void;
  aiCustomInstructions: string;
  setAiCustomInstructions: (val: string) => void;
  autoContentSeo: boolean;
  setAutoContentSeo: (val: boolean) => void;
  autoMediaAi: boolean;
  setAutoMediaAi: (val: boolean) => void;
}

const CONTENT_PROVIDERS = [
  { id: 'groq', name: 'Groq (Fastest)' },
  { id: 'openai', name: 'OpenAI (GPT-4o/mini)' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'anthropic', name: 'Anthropic Claude' },
];

const VISION_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini (Best for Images)' },
  { id: 'openai', name: 'OpenAI (GPT-4o)' },
  { id: 'anthropic', name: 'Anthropic Claude 3.5 Sonnet' },
];

const AI_TONES = [
  { id: 'Professional', name: 'Professional & Informative' },
  { id: 'Casual', name: 'Casual & Friendly' },
  { id: 'Bold', name: 'Bold & Persuasive' },
  { id: 'Elegant', name: 'Elegant & Luxury-focused' },
  { id: 'Urgent', name: 'Urgent & Sale-driven' },
];

const AI_LANGUAGES = [
  { id: 'English', name: 'English' },
  { id: 'Urdu', name: 'Urdu (اردو)' },
  { id: 'Roman Urdu', name: 'Roman Urdu (Urdu written in English alphabets)' },
];

export default function AITab({
  contentProvider,
  setContentProvider,
  contentModel,
  setContentModel,
  contentKeys,
  setContentKeys,
  visionProvider,
  setVisionProvider,
  visionModel,
  setVisionModel,
  visionKeys,
  setVisionKeys,
  aiTone,
  setAiTone,
  aiLanguage,
  setAiLanguage,
  aiCustomInstructions,
  setAiCustomInstructions,
  autoContentSeo,
  setAutoContentSeo,
  autoMediaAi,
  setAutoMediaAi,
}: AITabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Provider Details Card */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">AI Models & Credentials</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select model providers and supply your API credentials. API keys are stored securely in the database.
        </p>

        {/* Text/SEO Provider */}
        <div className="space-y-4 pt-2 border-t border-gray-150 dark:border-gray-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Text & SEO Copywriter</h4>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-450">Model Provider</label>
            <select
              value={contentProvider}
              onChange={(e) => setContentProvider(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
            >
              {CONTENT_PROVIDERS.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-450">Model Identifier</label>
            <input
              type="text"
              value={contentModel}
              onChange={(e) => setContentModel(e.target.value)}
              placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile"
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-450">API Key / Access Secret</label>
            <input
              type="password"
              value={contentKeys}
              onChange={(e) => setContentKeys(e.target.value)}
              placeholder="Enter your text provider API key"
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Vision/Image Analyzer Provider */}
        <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Media & Vision Analyzer</h4>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-450">Vision Provider</label>
            <select
              value={visionProvider}
              onChange={(e) => setVisionProvider(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
            >
              {VISION_PROVIDERS.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-450">Vision Model Identifier</label>
            <input
              type="text"
              value={visionModel}
              onChange={(e) => setVisionModel(e.target.value)}
              placeholder="e.g. gemini-2.0-flash, gpt-4o"
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-450">API Key / Access Secret</label>
            <input
              type="password"
              value={visionKeys}
              onChange={(e) => setVisionKeys(e.target.value)}
              placeholder="Enter your vision provider API key"
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* AI Persona & Behavior Card */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Copywriting Persona & Language</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tailor how the AI sounds and communicates when creating copywriting, SEO titles, and descriptions.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Tone of Voice</label>
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
            >
              {AI_TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Output Language</label>
            <select
              value={aiLanguage}
              onChange={(e) => setAiLanguage(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
            >
              {AI_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Custom System Instructions</label>
            <textarea
              rows={4}
              value={aiCustomInstructions}
              onChange={(e) => setAiCustomInstructions(e.target.value)}
              placeholder="e.g. Always write descriptions targeting young Pakistani fashion enthusiasts, using keywords like premium fabrics, modern look, elegant wear..."
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* AI Auto Automation Toggles */}
        <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Automation Switches</h4>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoContentSeo}
                onChange={(e) => setAutoContentSeo(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Enable auto-generation of SEO titles/meta descriptions on save
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoMediaAi}
                onChange={(e) => setAutoMediaAi(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Enable auto-tagging & description analysis for uploaded product media
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
