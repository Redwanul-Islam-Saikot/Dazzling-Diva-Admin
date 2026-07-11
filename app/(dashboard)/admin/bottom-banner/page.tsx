"use client";

import React, { useState, useEffect } from "react";
import { Upload, Loader2, Save, Image as ImageIcon, StretchHorizontal, Trash2, Edit3, Plus, X } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "bylxfdh4"; 
const CLOUDINARY_UPLOAD_PRESET = "dazzling_preset";

interface Banner {
  _id?: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  imageUrl: string;
}

export default function BottomWideBannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Modal এবং Form স্টেট
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form ইনপুট স্টেট
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // ডাটা লোড করা
  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/bottom-banner");
      const json = await res.json();
      if (json.success && json.data) {
        // যদি ব্যাকএন্ড একটা অবজেক্ট পাঠায়, সেটাকে অ্যারে বানিয়ে নিচ্ছি টেবিলের জন্য
        setBanners(Array.isArray(json.data) ? json.data : [json.data]);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error("Failed to fetch banners", err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ফর্ম ওপেন করার ফাংশন (+ Add New)
  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    setImageUrl("");
    setIsOpen(true);
  };

  // এডিট মোড ওপেন করার ফাংশন
  const openEditModal = (banner: Banner) => {
    setEditingId(banner._id || null);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setLinkUrl(banner.linkUrl);
    setImageUrl(banner.imageUrl);
    setIsOpen(true);
  };

  // ইমেজ আপলোড
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Image upload failed." });
    } finally {
      setUploading(false);
    }
  };

  // সেভ বা আপডেট সাবমিট
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/bottom-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, linkUrl, imageUrl }),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Banner configuration saved successfully!" });
        setIsOpen(false);
        fetchBanners();
      } else {
        setMessage({ type: "error", text: json.message || "Something went wrong." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Database connection failed." });
    } finally {
      setLoading(false);
    }
  };

  // ডিলিট হ্যান্ডলার
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch("/api/admin/bottom-banner", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Banner deleted successfully!" });
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl relative">
      
      {/* Top Header Card with "+ Add New Button" */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <StretchHorizontal className="w-5 h-5 text-amber-500" /> Bottom Wide Banner Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure the single wide marquee mega-banner positioned right above the footer layout.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Banner
        </button>
      </div>

      {/* Alert Notification */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {/* Table Section: All Live Banners */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">All Active Banners ({banners.length})</h3>
        </div>

        {banners.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            No banners active. Click "+ Add New Banner" button to create one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Background Image</th>
                  <th className="p-4">Banner Title</th>
                  <th className="p-4">Short Subtitle</th>
                  <th className="p-4">Target Link</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {banners.map((b, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-24 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.imageUrl} alt="banner" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{b.title}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{b.subtitle || "—"}</td>
                    <td className="p-4 text-amber-600 font-mono text-[11px]">{b.linkUrl}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEditModal(b)} className="text-slate-400 hover:text-amber-500 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={handleDelete} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FLOATING POPUP MODAL FORM (ভেসে ওঠা ফর্ম) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 w-full max-w-xl shadow-xl overflow-hidden scale-100 transition-all">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StretchHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {editingId ? "Edit Wide Banner Configuration" : "Create New Wide Banner Layout"}
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Dynamic Live Preview Box inside Modal */}
              <div className="relative w-full aspect-[21/6] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex flex-col justify-center p-4">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
                <div className="z-10 text-white space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-tight">{title || "Headline Preview"}</h4>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{subtitle || "Subtitle short detail placeholder..."}</p>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Banner Main Title</label>
                  <input
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Saree Offer" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub-title / Details</label>
                  <input
                    type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g., Flat 50% Off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Destination Link (URL)</label>
                <input
                  type="text" required value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g., /shop" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons inside Popup */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <label className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-dashed border-amber-300 text-amber-700 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-amber-100 transition-all">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} 
                  {uploading ? "Uploading..." : "Upload Graphics"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button" onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-[11px] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={loading || uploading}
                    className="px-4 py-2 bg-[#1E1E2D] hover:bg-amber-500 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 
                    Push Database
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}