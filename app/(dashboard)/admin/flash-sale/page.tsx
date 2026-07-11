"use client";

import React, { useState, useEffect } from "react";
import { Clock, Save, Image as ImageIcon, Loader2, Upload, Database, Trash2, Edit3, Plus, X } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "bylxfdh4"; 
const CLOUDINARY_UPLOAD_PRESET = "dazzling_preset"; 

export default function AdminFlashSaleManager() {
  // ফর্ম স্টেটসমূহ
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [endTime, setEndTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  
  // ইউজার ইন্টারফেস কন্ট্রোল স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false); // ফর্ম ওপেন/ক্লোজ করার জন্য
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // সব ক্যাম্পেইন লিস্ট রাখার স্টেট
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // READ: ডাটাবেজ থেকে সব ক্যাম্পেইন লোড করা
  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/flash-sale");
      const json = await res.json();
      if (json.success && json.data) {
        setCampaigns(json.data);
      }
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // ক্লাউডিনারি ইমেজ আপলোড
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

  // CREATE & UPDATE: সাবমিট হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const isEditing = !!editId;
    const url = "/api/admin/flash-sale";
    const method = isEditing ? "PUT" : "POST";
    const payload = isEditing ? { id: editId, title, subtitle, endTime, imageUrl } : { title, subtitle, endTime, imageUrl };

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: json.message });
        closeAndResetForm();
        fetchCampaigns(); // টেবিল রিফ্রেশ করা
      } else {
        setMessage({ type: "error", text: json.message || "Operation failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Database connection error." });
    } finally {
      setLoading(false);
    }
  };

  // DELETE: ডাটা ডিলিট করা
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      const res = await fetch(`/api/admin/flash-sale?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: json.message });
        fetchCampaigns();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete campaign." });
    }
  };

  // শুধুমাত্র ফর্ম ক্লিয়ার করার জন্য হেল্পার ফাংশন
  const resetFormOnly = () => {
    setEditId(null);
    setTitle("");
    setSubtitle("");
    setEndTime("");
    setImageUrl("");
  };

  // এডিট করার জন্য পপআপে ডাটা পাঠানো
  const startEdit = (campaign: any) => {
    setEditId(campaign._id);
    setTitle(campaign.title);
    setSubtitle(campaign.subtitle);
    setImageUrl(campaign.imageUrl);
    if (campaign.endTime) {
      const localDate = new Date(campaign.endTime).toISOString().slice(0, 16);
      setEndTime(localDate);
    }
    setIsModalOpen(true); // ফর্ম ওপেন করা হলো
  };

  // ফর্ম বন্ধ এবং ক্লিয়ার করা
  const closeAndResetForm = () => {
    setIsModalOpen(false);
    resetFormOnly();
  };

  if (fetching) {
    return (
      <div className="h-96 flex items-center justify-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> Connecting Flash Sale Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl relative">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-xs gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Flash Sale Countdown Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage live countdown campaigns on your e-commerce store.</p>
        </div>
        <button
          onClick={() => { resetFormOnly(); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Campaign
        </button>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {/* --- FIRST COMPONENT: LIVE DATABASE TABLE (সবার উপরে) --- */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Database className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">All Active Campaigns ({campaigns.length})</h2>
            <p className="text-[11px] text-slate-400">Database rows synced live with MongoDB repository.</p>
          </div>
        </div>

        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Banner Graphic</th>
                  <th className="py-3 px-4">Campaign Title</th>
                  <th className="py-3 px-4">Short Subtitle</th>
                  <th className="py-3 px-4">Expiration Time</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                {campaigns.map((camp) => (
                  <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={camp.imageUrl || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=150&q=80"} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{camp.title}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{camp.subtitle}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(camp.endTime).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => startEdit(camp)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-all" title="Edit row">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(camp._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Delete row">
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
          <div className="text-center py-10 text-xs text-slate-400">No campaigns found. Click "+ Add New Campaign" button to launch one!</div>
        )}
      </div>

      {/* --- POPUP MODAL COMPONENT (বাটনে চাপ দিলে ভেসে উঠবে) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative space-y-6">
            
            {/* Modal Close Button */}
            <button onClick={closeAndResetForm} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> {editId ? "Update Existing Flash Sale" : "Create New Flash Sale"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Fill out the variables below to publish configuration states inside MongoDB.</p>
            </div>

            {/* Form and Live Typing Card Box */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left: Input Form */}
              <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Flash Sale Title</label>
                  <input
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mid-Summer Flash Deal!"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Short Sub-title / Tagline</label>
                  <input
                    type="text" required value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g., Flat 60% off for next 24 hours only."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Offer Expire Date & Time</label>
                  <input
                    type="datetime-local" required value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Promo Banner Graphic</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-dashed border-amber-300 text-amber-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-100/70 transition-all">
                      {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Banner</>}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                    {imageUrl && <span className="text-[11px] text-green-600 font-semibold">Banner Loaded ✓</span>}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="submit" disabled={loading || uploading}
                    className="px-5 py-2.5 bg-[#1E1E2D] hover:bg-amber-600 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Save className="w-4 h-4" /> {editId ? "Update Row" : "Save to Database"}</>}
                  </button>
                  <button
                    type="button" onClick={closeAndResetForm}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Right: Typing Preview Inside Form */}
              <div className="lg:col-span-2 bg-slate-50 p-4 border border-slate-100 rounded-2xl shadow-inner space-y-3 h-fit">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Card Display Preview
                </h4>

                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col justify-between p-4 shadow-sm">
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 z-0" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
                  <div className="z-10 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-xs self-start uppercase tracking-widest">LIVE</div>

                  <div className="z-10 text-white space-y-2 mt-auto">
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {["02", "14", "35", "59"].map((num, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md py-1 rounded-md border border-white/10">
                          <span className="block text-xs font-black text-amber-400">{num}</span>
                          <span className="text-[7px] uppercase tracking-wider text-slate-300">{["Days", "Hrs", "Mins", "Secs"][i]}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white truncate">{title || "Eid Ultimate Deals"}</h5>
                      <p className="text-[10px] text-slate-300 font-medium line-clamp-2 leading-tight mt-0.5">{subtitle || "Campaign descriptions placeholder."}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}