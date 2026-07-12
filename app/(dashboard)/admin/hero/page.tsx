"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Save, Image as ImageIcon, Loader2, Upload, Database, Trash2, Edit3, Plus, X } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "bylxfdh4"; 
const CLOUDINARY_UPLOAD_PRESET = "dazzling_preset"; 

export default function AdminHeroManager() {
  // ফর্ম স্টেটসমূহ
  const [tagline, setTagline] = useState("");
  const [title, setTitle] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("active"); // নতুন স্ট্যাটাস স্টেট
  const [editId, setEditId] = useState<string | null>(null);
  
  // ইউজার ইন্টারফেস কন্ট্রোল স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ডাটাবেজ থেকে আসা স্লাইডার লিস্ট রাখার স্টেট
  const [sliders, setSliders] = useState<any[]>([]);

  // READ: ডাটাবেজ থেকে স্লাইডার ডেটা লোড করা
  const fetchSliders = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/admin/hero");
      const json = await res.json();
      if (json.success) {
        setSliders(json.data);
      }
    } catch (err) {
      console.error("Failed to load sliders", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Cloudinary ইমেজ আপলোড হ্যান্ডলার
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
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

  // CREATE & UPDATE সাবমিট লজিক
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const isEditing = !!editId;
    const url = "/api/admin/hero";
    const method = isEditing ? "PUT" : "POST";
    
    const payload = {
      id: editId,
      tagline,
      title,
      badgeText,
      imageUrl,
      status // পে-লোডে স্ট্যাটাস পাঠানো হচ্ছে
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: json.message });
        closeAndResetForm();
        fetchSliders(); // টেবিল রিফ্রেশ
      } else {
        setMessage({ type: "error", text: json.message || "Operation failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Database connection error." });
    } finally {
      setLoading(false);
    }
  };

  // DELETE অপারেশন
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slider?")) return;
    
    try {
      const res = await fetch(`/api/admin/hero?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: json.message });
        fetchSliders();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete slider." });
    }
  };

  // এডিট মুড চালু করা
  const startEdit = (slide: any) => {
    setEditId(slide._id);
    setTagline(slide.tagline || "");
    setTitle(slide.title);
    setBadgeText(slide.badgeText || "");
    setImageUrl(slide.imageUrl);
    setStatus(slide.status || "active"); // স্লাইডারের কারেন্ট স্ট্যাটাস সেট
    setIsModalOpen(true);
  };

  // ফর্ম রিসেট ও বন্ধ করা
  const closeAndResetForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setTagline("");
    setTitle("");
    setBadgeText("");
    setImageUrl("");
    setStatus("active");
  };

  if (fetching) {
    return (
      <div className="h-96 flex items-center justify-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> Connecting to Hero Content Core...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-xs gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" /> Main Hero Slider Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Control web hero slides, typography layers, status visibilities, and promotional graphics.</p>
        </div>
        <button
          onClick={() => { closeAndResetForm(); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Slider
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {/* --- LIVE SLIDERS TABLE --- */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Database className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">All Live Sliders ({sliders.length})</h2>
            <p className="text-[11px] text-slate-400">Current layout graphics loaded into the homepage header area.</p>
          </div>
        </div>

        {sliders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Background Image</th>
                  <th className="py-3 px-4">Tagline</th>
                  <th className="py-3 px-4">Main Description</th>
                  <th className="py-3 px-4">Badge Text</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                {sliders.map((slide) => (
                  <tr key={slide._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={slide.imageUrl} alt="slider" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{slide.tagline || "—"}</td>
                    <td className="py-3 px-4 text-slate-500 font-semibold truncate max-w-[180px]">{slide.title}</td>
                    <td className="py-3 px-4">
                      {slide.badgeText ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 border border-slate-200">
                          {slide.badgeText}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        slide.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {slide.status || "active"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => startEdit(slide)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-all">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(slide._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400">No sliders configured. Click "+ Add New Slider" to provision your first banner hero asset!</div>
        )}
      </div>

      {/* --- POPUP MODAL COMPONENT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative space-y-6">
            
            <button onClick={closeAndResetForm} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" /> {editId ? "Modify Hero Cluster Data" : "Provision New Hero Node"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Input precise copy text and high-res dimensions to match front-end client ratios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form inputs */}
              <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slider Tagline</label>
                    <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Eid Special Collection" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Badge Text</label>
                    <input type="text" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="Up to 50% OFF" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Main Description/Title</label>
                  <textarea rows={3} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Discover Luxury Designer Handloom Sarees Engineered with Premium Silk Fabrics." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 resize-none" />
                </div>

                {/* Status Selection Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slider Status Visibility</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold text-slate-700"
                  >
                    <option value="active">🟢 Active (Visible on Homepage)</option>
                    <option value="inactive">🔴 Inactive (Hidden inside Database)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Background Graphic Asset</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-dashed border-amber-300 text-amber-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-100/70 transition-all">
                      {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</> : <><Upload className="w-3.5 h-3.5" /> Upload Image File</>}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                    {imageUrl && <span className="text-[11px] text-green-600 font-semibold">Asset Sync Complete ✓</span>}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="submit" disabled={loading || uploading}
                    className="px-5 py-2.5 bg-[#1E1E2D] hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Committing Nodes...</> : <><Save className="w-4 h-4" /> Save Configuration</>}
                  </button>
                  <button type="button" onClick={closeAndResetForm} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all">Cancel</button>
                </div>
              </form>

              {/* Live Preview UI (Right Aspect Side) */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 shadow-inner">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Realtime Client Preview
                </h4>

                {/* Simulated Front-end Hero Banner */}
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md relative flex items-center p-4">
                  {imageUrl && (
                    <img src={imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                  )}
                  <div className="relative space-y-1.5 z-10 max-w-[80%]">
                    {badgeText && (
                      <span className="bg-amber-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block">
                        {badgeText}
                      </span>
                    )}
                    <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">{tagline || "Your Tagline Here"}</p>
                    <h5 className="text-xs font-black text-white leading-tight line-clamp-2 uppercase">{title || "Main Title Headline Text Display Grid"}</h5>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">🛠️ Engine Deployment Status</p>
                  <p className="text-slate-600 leading-normal">
                    Current visibility is set to <span className="font-bold">{status}</span>.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}