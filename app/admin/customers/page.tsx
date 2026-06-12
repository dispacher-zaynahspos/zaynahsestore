'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Phone, Mail, MessageSquare, ExternalLink, 
  TrendingUp, DollarSign, ShoppingBag, Calendar, ArrowUpRight
} from '@/components/common/Icons';
import { getAdminCustomers } from '@/lib/services/customers';
import { getWhatsAppSubscribers } from '@/lib/services/sections';
import { WhatsAppSubscriber } from '@/lib/types';
import { formatPrice, cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { toast } from 'sonner';

interface CustomerRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [leads, setLeads] = useState<WhatsAppSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buyers' | 'leads'>('buyers');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [buyersData, leadsData] = await Promise.all([
          getAdminCustomers(),
          getWhatsAppSubscribers()
        ]);
        setCustomers(buyersData);
        setLeads(leadsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load customer or leads data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(l => 
      (l.name || '').toLowerCase().includes(q) ||
      (l.phone || '').toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpent = total > 0 ? totalSpent / total : 0;
    const totalOrders = customers.reduce((sum, c) => sum + c.ordersCount, 0);
    return {
      total,
      totalSpent,
      avgSpent,
      totalOrders
    };
  }, [customers]);

  const getCleanPhone = (phone: string | null) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Customers Directory</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage and contact your e-store customers</p>
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

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Customers</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{stats.total}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Lifetime Revenue */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">LTV Revenue</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{formatPrice(stats.totalSpent)}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Avg LTV Value */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Avg Spent per User</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{formatPrice(stats.avgSpent)}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Lifetime Orders */}
        <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Customer Orders</span>
            <span className="text-xl font-black text-gray-950 dark:text-white">{stats.totalOrders}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setActiveTab('buyers')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'buyers'
              ? 'border-[#e94560] text-[#e94560]'
              : 'border-transparent text-gray-400 hover:text-gray-605 dark:hover:text-gray-300'
          }`}
        >
          Registered Buyers ({customers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'leads'
              ? 'border-[#e94560] text-[#e94560]'
              : 'border-transparent text-gray-400 hover:text-gray-605 dark:hover:text-gray-300'
          }`}
        >
          WhatsApp Leads (Wheel/Popups) ({leads.length})
        </button>
      </div>

      {/* Main Customers List Panel */}
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden">
        {loading ? (
          /* Skeleton List Loading */
          <div className="p-6 divide-y divide-gray-100 dark:divide-gray-800 animate-pulse space-y-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                </div>
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : activeTab === 'buyers' ? (
          filteredCustomers.length === 0 ? (
            /* Empty List State */
            <div className="p-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] border border-gray-150 dark:border-gray-800 mx-auto flex items-center justify-center text-gray-300 dark:text-gray-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No customers found</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto mt-1">
                  {searchQuery ? 'Adjust your search query and try again.' : 'Registered customer profiles will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            /* Customers Table (responsive scrollable list) */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/10 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    <th className="py-4 px-6">Customer Info</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-center">Orders</th>
                    <th className="py-4 px-6 text-right">Lifetime Spent</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {filteredCustomers.map(customer => {
                    const joinDate = new Date(customer.createdAt).toLocaleDateString('en-PK', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });

                    return (
                      <tr key={customer.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                        {/* Name, email, phone */}
                        <td className="py-4.5 px-6">
                          <div className="font-bold text-gray-950 dark:text-white text-sm">
                            {customer.name}
                          </div>
                          <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                            {customer.email && <span>{customer.email}</span>}
                            {customer.phone && <span>{customer.phone}</span>}
                          </div>
                        </td>

                        {/* Created date */}
                        <td className="py-4.5 px-6 font-medium text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{joinDate}</span>
                          </div>
                        </td>

                        {/* Orders count */}
                        <td className="py-4.5 px-6 text-center font-bold text-gray-900 dark:text-white">
                          {customer.ordersCount}
                        </td>

                        {/* Total LTV Spent */}
                        <td className="py-4.5 px-6 text-right font-black text-gray-950 dark:text-white">
                          {formatPrice(customer.totalSpent)}
                        </td>

                        {/* Quick Contact Redirect Buttons */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {/* WhatsApp message redirect */}
                            {customer.phone ? (
                              <a
                                href={`https://wa.me/${cleanWhatsAppPhone(customer.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 flex items-center justify-center transition-all cursor-pointer"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </a>
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 flex items-center justify-center cursor-not-allowed">
                                <MessageSquare className="h-4 w-4" />
                              </div>
                            )}

                            {/* Direct Phone Call Redirect */}
                            {customer.phone ? (
                              <a
                                href={`tel:${getCleanPhone(customer.phone)}`}
                                className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 flex items-center justify-center transition-all cursor-pointer"
                                title="Place Phone Call"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 flex items-center justify-center cursor-not-allowed">
                                <Phone className="h-4 w-4" />
                              </div>
                            )}

                            {/* Direct Mail Redirect */}
                            {customer.email ? (
                              <a
                                href={`mailto:${customer.email}`}
                                className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 flex items-center justify-center transition-all cursor-pointer"
                                title="Send Email"
                              >
                                <Mail className="h-4 w-4" />
                              </a>
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 flex items-center justify-center cursor-not-allowed">
                                <Mail className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredLeads.length === 0 ? (
            /* Empty Leads State */
            <div className="p-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] border border-gray-150 dark:border-gray-800 mx-auto flex items-center justify-center text-gray-300 dark:text-gray-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No WhatsApp leads found</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto mt-1">
                  {searchQuery ? 'Adjust your search query and try again.' : 'Subscribers from the spin wheel and exit popups will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            /* Leads Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/10 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">WhatsApp Phone</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {filteredLeads.map(lead => {
                    const optInDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-PK', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : '-';

                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4.5 px-6 font-bold text-gray-900 dark:text-white">
                          {lead.name || 'Anonymous Guest'}
                        </td>
                        <td className="py-4.5 px-6 text-gray-600 dark:text-gray-400 font-mono">
                          {lead.phone}
                        </td>
                        <td className="py-4.5 px-6 font-medium text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{optInDate}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex items-center justify-center gap-2">
                             <a
                              href={`https://wa.me/${cleanWhatsAppPhone(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 flex items-center justify-center transition-all cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </a>
                            <a
                              href={`tel:${getCleanPhone(lead.phone)}`}
                              className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 flex items-center justify-center transition-all cursor-pointer"
                              title="Call Lead"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
