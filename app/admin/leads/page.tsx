'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Phone, Mail, MessageSquare, Calendar, Users, 
  Zap, Copy, ExternalLink, SlidersHorizontal, Clock, ArrowUpRight 
} from '@/components/common/Icons';
import { getWhatsAppSubscribers } from '@/lib/services/sections';
import { WhatsAppSubscriber } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<WhatsAppSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'wheel' | 'exit_intent'>('all');

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        const data = await getWhatsAppSubscribers();
        setLeads(data);
      } catch (err) {
        console.error('Failed to load leads:', err);
        toast.error('Failed to load WhatsApp leads.');
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, []);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (lead.name || '').toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Source Filter
      const matchedSource = sourceFilter === 'all' || 
        (lead.source_type || 'wheel') === sourceFilter;
      
      if (!matchedSource) return false;

      // 3. Time Filter
      if (timeFilter === 'all') return true;
      if (!lead.created_at) return false;

      const leadDate = new Date(lead.created_at);
      const now = new Date();
      
      // Start of today
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // Start of yesterday
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      // 7 days ago
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      // 30 days ago
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      if (timeFilter === 'today') {
        return leadDate >= startOfToday;
      } else if (timeFilter === 'yesterday') {
        return leadDate >= startOfYesterday && leadDate < startOfToday;
      } else if (timeFilter === 'week') {
        return leadDate >= sevenDaysAgo;
      } else if (timeFilter === 'month') {
        return leadDate >= thirtyDaysAgo;
      }

      return true;
    });
  }, [leads, searchQuery, sourceFilter, timeFilter]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let todayCount = 0;
    let wheelCount = 0;
    let exitCount = 0;

    leads.forEach(l => {
      if (l.created_at && new Date(l.created_at) >= startOfToday) {
        todayCount++;
      }
      if ((l.source_type || 'wheel') === 'wheel') {
        wheelCount++;
      } else if (l.source_type === 'exit_intent') {
        exitCount++;
      }
    });

    return {
      total: leads.length,
      today: todayCount,
      wheel: wheelCount,
      exit: exitCount
    };
  }, [leads]);

  const getCleanPhone = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const handleCopyLead = (lead: WhatsAppSubscriber) => {
    const text = `Name: ${lead.name || 'N/A'}\nPhone: ${lead.phone}\nEmail: ${lead.email || 'N/A'}\nSource: ${lead.source_type || 'wheel'}`;
    navigator.clipboard.writeText(text);
    toast.success('Lead details copied to clipboard!');
  };

  const getWhatsAppURL = (lead: WhatsAppSubscriber) => {
    const phone = getCleanPhone(lead.phone);
    const greeting = lead.name ? `Dear ${lead.name}` : 'Hello';
    const message = `${greeting}, thank you for subscribing at Zaynah's E-Store! We noticed you claimed a special coupon on our store. Let us know if you need any assistance placing your order.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">WhatsApp & Email Leads</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track subscribers captured via the Spin-to-Win wheel and Exit-Intent popup
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Subscribers</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{stats.total}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Today's Leads */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Joined Today</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{stats.today}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Wheel Spins */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Spin Wheel Leads</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{stats.wheel}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Exit Intent */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Exit-Intent Leads</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{stats.exit}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'all'
                ? 'bg-[#e94560] text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'today'
                ? 'bg-[#e94560] text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('yesterday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'yesterday'
                ? 'bg-[#e94560] text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'week'
                ? 'bg-[#e94560] text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'month'
                ? 'bg-[#e94560] text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            Last 30 Days
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

        {/* Source Filters */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === 'all'
                ? 'bg-[#1a1a2e] dark:bg-amber-600 text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setSourceFilter('wheel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === 'wheel'
                ? 'bg-[#1a1a2e] dark:bg-amber-600 text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            Spin Wheel
          </button>
          <button
            onClick={() => setSourceFilter('exit_intent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === 'exit_intent'
                ? 'bg-[#1a1a2e] dark:bg-amber-600 text-white'
                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            Exit Popup
          </button>
        </div>
      </div>

      {/* Main Table panel */}
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 divide-y divide-gray-100 dark:divide-gray-800 animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(idx => (
              <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                </div>
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-24" />
              </div>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] border border-gray-150 dark:border-gray-800 mx-auto flex items-center justify-center text-gray-300 dark:text-gray-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No subscriber leads found</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto mt-1">
                {searchQuery || sourceFilter !== 'all' || timeFilter !== 'all' 
                  ? 'Adjust your filters or search terms and try again.' 
                  : 'Subscriber details from Spin Wheel and Exit Popup will display here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/10 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  <th className="py-4 px-6">Subscriber Details</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Source Widget</th>
                  <th className="py-4 px-6">Opt-In Date</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
                {filteredLeads.map(lead => {
                  const optInDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-PK', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : '-';
                  
                  const isWheel = (lead.source_type || 'wheel') === 'wheel';

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-950 dark:text-white text-sm">
                          {lead.name || 'Anonymous Guest'}
                        </div>
                        {lead.email ? (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{lead.email}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 dark:text-gray-600 italic block mt-0.5">No email provided</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-6 font-mono text-gray-900 dark:text-gray-300 text-sm">
                        {lead.phone}
                      </td>

                      {/* Source Type Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isWheel
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {isWheel ? <Zap className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {isWheel ? 'Spin Wheel' : 'Exit Popup'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{optInDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* Chat on WhatsApp */}
                          <a
                            href={getWhatsAppURL(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 flex items-center justify-center transition-all cursor-pointer"
                            title="Open prefilled WhatsApp chat"
                          >
                            <MessageSquare className="h-4.5 w-4.5" />
                          </a>

                          {/* Call Lead */}
                          <a
                            href={`tel:${getCleanPhone(lead.phone)}`}
                            className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 flex items-center justify-center transition-all cursor-pointer"
                            title="Place regular call"
                          >
                            <Phone className="h-4.5 w-4.5" />
                          </a>

                          {/* Copy Lead Details */}
                          <button
                            onClick={() => handleCopyLead(lead)}
                            className="h-9 w-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer"
                            title="Copy Lead Details"
                          >
                            <Copy className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
