"use client";

import React from "react";
import { Sliders, ShoppingBag, Clock, CheckCircle, RefreshCcw } from "lucide-react";

export default function AdminDashboardMain() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dazzling Diva Studio Control</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage live sections, promotional sliders, and ethnic collections from one place.</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50">
          <RefreshCcw className="w-3.5 h-3.5" /> Clear Frontend Cache
        </button>
      </div>

      {/* Grid Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sliders Card */}
        <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hero Canvas</span>
            <h3 className="text-xl font-bold text-slate-800">Dynamic Slider Active</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        {/* Flash Sale Card */}
        <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flash Deal Hub</span>
            <h3 className="text-xl font-bold text-slate-800">23:03:59 Live</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Inventory</span>
            <h3 className="text-xl font-bold text-slate-800">12 Luxe Outfits</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Section Connection Monitor */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Frontend Component Status</h3>
        <div className="space-y-3">
          {[
            { name: "Super Saving Fest (Main Carousel Slider)", status: "Connected & Syncing" },
            { name: "Top Row Collections (Saree, Lehenga, 3-Piece)", status: "Connected & Syncing" },
            { name: "Flash Sale Counter and Banner", status: "Connected & Syncing" },
            { name: "Timeless Elegance Grid (8 Catalog Products Grid)", status: "Connected & Syncing" },
            { name: "Boutique Dual Promo Section", status: "Connected & Syncing" },
            { name: "Brand Footer & Store Info Guidelines", status: "Connected & Syncing" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-100/80 text-xs">
              <span className="font-semibold text-slate-700">{item.name}</span>
              <span className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-[11px]">
                <CheckCircle className="w-3 h-3" /> {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}