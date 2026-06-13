'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, Settings, LogOut, Store, Star, Layers, Images, Award, Users, Layout, MessageSquare, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      router.refresh();
      router.push('/admin/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Reporting', href: '/admin/reporting', icon: TrendingUp },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { label: 'Variants', href: '/admin/variants', icon: Layers },
    { label: 'Media', href: '/admin/media', icon: Images },
    { label: 'Orders Log', href: '/admin/orders', icon: ClipboardList },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'WhatsApp Leads', href: '/admin/leads', icon: MessageSquare },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Badges', href: '/admin/badges', icon: Award },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Homepage Customizer', href: '/admin/settings/customizer', icon: Layout },
  ];

  // If we are on the login page, customizer preview page, or customizer page, don't show the dashboard layout
  if (
    pathname === '/admin/login' || 
    pathname === '/admin/settings/customizer/preview' ||
    pathname === '/admin/settings/customizer'
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen flex-col md:flex-row bg-gray-50 dark:bg-[#0f0f1b] overflow-hidden">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#1a1a2e] text-white flex flex-col flex-shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto">
        {/* Brand name */}
        <div className="hidden md:flex h-16 items-center gap-2 px-6 border-b border-white/10">
          <Store className="h-6 w-6 text-[#e94560]" />
          <span className="font-bold text-lg tracking-tight">Admin Console</span>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-3 md:py-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-w-max md:min-w-0 ${
                  isActive
                    ? 'bg-[#e94560] text-white shadow-md'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-white/10 hidden md:block">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-white dark:bg-[#16162a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 md:px-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {navItems.find(item => pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href)))?.label || 'Console'}
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="text-sm font-semibold text-[#e94560] hover:underline">
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="md:hidden text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50 dark:bg-[#0f0f1b] transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
