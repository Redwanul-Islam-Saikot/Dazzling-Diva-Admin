"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sliders, 
  Grid, 
  Clock, 
  ShoppingBag, 
  Image as ImageIcon, 
  LogOut, 
  Bell, 
  Search,
  ChevronDown,
  FolderOpen,
  Menu,
  X
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [homeOpen, setHomeOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const isHomeModuleRoute =
      pathname?.startsWith("/admin/hero") ||
      pathname?.startsWith("/admin/flash-sale") ||
      pathname?.startsWith("/admin/split-banners") ||
      pathname?.startsWith("/admin/bottom-banner");

    if (isHomeModuleRoute) {
      setHomeOpen(true);
    }
  }, [pathname]);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden text-slate-800 font-sans">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between bg-[#1E1E2D] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-lg font-bold text-white shadow-md">
                DD
              </div>
              <div>
                <h2 className="text-sm font-bold leading-none tracking-wide text-white">DAZZLING DIVA</h2>
                <span className="text-[10px] font-medium text-amber-500/80">CMS Manager v1.0</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/60 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 p-4">
            {/* Dashboard Link */}
            <button
              onClick={() => router.push("/admin")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                isActive("/admin") ? "bg-amber-500 font-semibold text-white" : "text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </button>

            {/* Home Page Modules (Dropdown) */}
            <div className="space-y-1 pt-2">
              <button
                onClick={() => setHomeOpen(!homeOpen)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/60"
              >
                <span className="flex items-center gap-3"><Sliders className="h-4 w-4" /> Home Content</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${homeOpen ? "rotate-180" : ""}`} />
              </button>

              {homeOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l border-slate-800 pl-9">
                  <button onClick={() => router.push("/admin/hero")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/hero") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>Main Hero Slider</button>
                  <button onClick={() => router.push("/admin/flash-sale")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/flash-sale") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>Flash Sale Timer</button>
                  <button onClick={() => router.push("/admin/split-banners")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/split-banners") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>Split Promo Banners</button>
                  <button onClick={() => router.push("/admin/new-arrivals")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/new-arrivals") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>New Arrivals</button>
                  <button onClick={() => router.push("/admin/promo-grid")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/promo-grid") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>PromoGrid</button>
                  <button onClick={() => router.push("/admin/featured-collection")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/featured-collection") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>FeaturedCollection</button>
                  <button onClick={() => router.push("/admin/shop-now")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/shop-now") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>ShopNow</button>
                  <button onClick={() => router.push("/admin/delivery")} className={`block w-full py-1.5 text-left text-xs transition-all ${isActive("/admin/delivery") ? "font-bold text-amber-400" : "text-slate-400 hover:text-amber-400"}`}>Delivery</button>
                </div>
              )}
            </div>

            {/* Core E-commerce Systems */}
            <div className="space-y-1 pt-4">
              <span className="mb-2 block px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Store Management</span>

              <button
                onClick={() => router.push("/admin/category")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive("/admin/category") ? "bg-amber-500 font-semibold text-white" : "text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                <FolderOpen className="h-4 w-4" /> Manage Categories
              </button>

              <button
                onClick={() => router.push("/admin/products")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive("/admin/products") ? "bg-amber-500 font-semibold text-white" : "text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> Flash Sale Products
              </button>

              <button
                onClick={() => router.push("/admin/footer-configuration")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive("/admin/footer-configuration") ? "bg-amber-500 font-semibold text-white" : "text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                <Grid className="h-4 w-4" /> Footer Configuration
              </button>
            </div>
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => router.push("/")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Logout Panel
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-60 sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search sections..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-4 text-xs text-slate-700 focus:border-amber-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            </button>
            <div className="flex items-center gap-2.5 border-l border-slate-100 pl-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-700">A</div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold leading-none text-slate-800">Admin Controller</p>
                <span className="text-[10px] font-medium text-slate-400">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Canvas Display */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* @ts-ignore */}
          {children}
        </main>
      </div>
    </div>
  );
}