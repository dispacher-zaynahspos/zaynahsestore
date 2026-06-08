'use client';

import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  ShoppingBag, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  Package,
  ClipboardList
} from '@/components/common/Icons';
import { Order, StoreSettings } from '@/lib/types';
import { updateOrderStatus } from '@/lib/services/orders';
import { formatPrice } from '@/lib/utils/whatsapp';
import { toast } from 'sonner';

interface OrderLogProps {
  initialOrders: Order[];
  settings: StoreSettings;
}

export default function OrderLog({ initialOrders, settings }: OrderLogProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      toast.success(`Order ${updated.orderNumber} status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const selectedOrderIndex = selectedOrder ? filteredOrders.findIndex(o => o.id === selectedOrder.id) : -1;

  const handlePrevOrder = () => {
    if (selectedOrderIndex > 0) {
      setSelectedOrderId(filteredOrders[selectedOrderIndex - 1].id);
    }
  };

  const handleNextOrder = () => {
    if (selectedOrderIndex >= 0 && selectedOrderIndex < filteredOrders.length - 1) {
      setSelectedOrderId(filteredOrders[selectedOrderIndex + 1].id);
    }
  };

  const handleCopyDetails = (order: Order) => {
    const itemsText = order.items.map(item => {
      const variantParts = [];
      if (item.selectedVariant?.color) variantParts.push(item.selectedVariant.color);
      if (item.selectedVariant?.size) variantParts.push(item.selectedVariant.size);
      const variantStr = variantParts.length ? ` (${variantParts.join(', ')})` : '';
      return `• ${item.product.name}${variantStr} x${item.quantity} = ${formatPrice(item.total, settings.currencySymbol)}`;
    }).join('\n');

    const fullText = [
      `Order: ${order.orderNumber}`,
      `Customer: ${order.customerName || 'N/A'}`,
      `Phone: ${order.customerPhone || 'N/A'}`,
      `Date: ${new Date(order.createdAt).toLocaleString()}`,
      `Status: ${order.status.toUpperCase()}`,
      `\nItems:\n${itemsText}`,
      `\nTotal: ${formatPrice(order.total, settings.currencySymbol)}`,
      order.notes ? `\nNotes/Address: ${order.notes}` : ''
    ].join('\n');

    navigator.clipboard.writeText(fullText);
    setCopiedId(order.id);
    toast.success('Order details copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadgeStyles = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
      case 'pending':
        return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50';
      case 'shipped':
        return 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50';
      default:
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by order no, customer or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-sm focus:outline-none focus:border-[#1a1a2e] text-gray-900 dark:text-white transition-colors"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1a1a2e] text-gray-900 dark:text-white cursor-pointer transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No orders logged in database matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="text-xs font-bold text-gray-400 uppercase bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-4 px-6">Order No.</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items Purchased</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrderId(order.id)}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-all align-top cursor-pointer"
                  >
                    <td className="py-4 px-6 font-bold text-[#1a1a2e] dark:text-white">{order.orderNumber}</td>
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                      <p className="font-bold text-[#1a1a2e] dark:text-white">{order.customerName || 'N/A'}</p>
                      <a 
                        href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#10b981] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                      >
                        <span>{order.customerPhone || 'N/A'}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => {
                          const variantParts = [];
                          if (item.selectedVariant?.color) variantParts.push(item.selectedVariant.color);
                          if (item.selectedVariant?.size) variantParts.push(item.selectedVariant.size);
                          const variantStr = variantParts.length ? ` (${variantParts.join(', ')})` : '';
                          return (
                            <div key={idx} className="text-xs font-semibold text-gray-600 dark:text-gray-400 line-clamp-1">
                              • {item.product.name}{variantStr} x{item.quantity}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#1a1a2e] dark:text-white">{formatPrice(order.total, settings.currencySymbol)}</td>
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={`rounded-lg border px-2 py-1 text-xs font-bold uppercase focus:outline-none cursor-pointer transition-colors ${
                          order.status === 'delivered' ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                          order.status === 'pending' ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' :
                          order.status === 'cancelled' ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' :
                          order.status === 'shipped' ? 'border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400' :
                          'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 max-w-xs text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-2">{order.notes || '—'}</td>
                    <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}<br />
                      <span className="text-gray-400 dark:text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shopify-like Right Slide-over Order Details Panel */}
      {selectedOrder && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
            onClick={() => setSelectedOrderId(null)}
          />

          {/* Slide-over Content Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-gray-50 dark:bg-[#0f0f1e] shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 translate-x-0 overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 bg-white dark:bg-[#16162a] border-b border-gray-200 dark:border-gray-800/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                      Order {selectedOrder.orderNumber}
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadgeStyles(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Navigation and Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyDetails(selectedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {copiedId === selectedOrder.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Info</span>
                    </>
                  )}
                </button>

                <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-855 mx-1" />

                <button
                  onClick={handlePrevOrder}
                  disabled={selectedOrderIndex <= 0}
                  className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-550 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous Order"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextOrder}
                  disabled={selectedOrderIndex < 0 || selectedOrderIndex >= filteredOrders.length - 1}
                  className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-555 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next Order"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left/Main Column - Order Items & Totals (2 Cols) */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Items Card */}
                  <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2">
                      <Package className="h-4.5 w-4.5 text-gray-400" />
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">
                        Items Purchased ({selectedOrder.items.length})
                      </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60 px-5">
                      {selectedOrder.items.map((item, idx) => {
                        const variantParts = [];
                        if (item.selectedVariant?.color) variantParts.push(item.selectedVariant.color);
                        if (item.selectedVariant?.size) variantParts.push(item.selectedVariant.size);
                        const variantStr = variantParts.join(', ');
                        
                        // Find product image
                        const imgUrl = item.product.images?.find((i: any) => i.isPrimary)?.url || item.product.images?.[0]?.url || '';

                        return (
                          <div key={idx} className="py-4 flex gap-4 items-start">
                            {/* Product Thumbnail */}
                            <div className="h-14 w-14 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden flex-shrink-0 relative">
                              {imgUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imgUrl}
                                  alt={item.product.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                  <ShoppingBag className="h-6 w-6" />
                                </div>
                              )}
                            </div>

                            {/* Item details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white hover:underline truncate">
                                {item.product.name}
                              </h4>
                              {variantStr && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                                  {variantStr}
                                </p>
                              )}
                              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                                  + {item.selectedModifiers.map(m => m.name).join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold">
                                {formatPrice(item.unitPrice, settings.currencySymbol)} × {item.quantity}
                              </p>
                            </div>

                            {/* Total per Item */}
                            <div className="text-right">
                              <span className="text-xs font-black text-gray-900 dark:text-white">
                                {formatPrice(item.total, settings.currencySymbol)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment / Summary Card */}
                  <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800/80">
                      Payment Summary
                    </h3>
                    
                    <div className="space-y-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {formatPrice(selectedOrder.subtotal || selectedOrder.total, settings.currencySymbol)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-[#10b981] font-bold">Free Shipping</span>
                      </div>
                      <div className="h-[1px] bg-gray-100 dark:bg-gray-800/80 my-1" />
                      <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>{formatPrice(selectedOrder.total, settings.currencySymbol)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
                      <div className="text-gray-500 dark:text-gray-400 font-semibold">Payment Method</div>
                      <div className="font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                        Cash on Delivery (COD) / WhatsApp Order
                      </div>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {selectedOrder.notes && (
                    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <h3 className="text-sm font-black text-gray-900 dark:text-white">
                          Customer Notes / Order Comments
                        </h3>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {selectedOrder.notes}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column - Customer Info & Actions (1 Col) */}
                <div className="space-y-6">
                  
                  {/* Status Manager */}
                  <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Order Status
                    </h3>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">
                        Update Status
                      </label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-3.5 py-2.5 text-xs font-bold uppercase focus:outline-none text-gray-900 dark:text-white cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2">
                      <UserIcon className="h-4.5 w-4.5 text-gray-400" />
                      <span>Customer Details</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Name</div>
                        <div className="text-xs font-black text-gray-900 dark:text-white mt-0.5">
                          {selectedOrder.customerName || 'Guest Customer'}
                        </div>
                      </div>
                      
                      {selectedOrder.customerPhone && (
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Contact Link</div>
                          <a 
                            href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 mt-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-bold transition-all w-full justify-center"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address Card */}
                  <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2">
                      <MapPin className="h-4.5 w-4.5 text-gray-400" />
                      <span>Shipping Address</span>
                    </h3>
                    
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedOrder.notes || 'No specific shipping instructions or address provided.'}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
