"use client";

import React, { useState, useEffect } from "react";
import { FolderPlus, Save, Image as ImageIcon, Loader2, Upload, Database, Trash2, Edit3, Plus, X, Layers } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "bylxfdh4"; 
const CLOUDINARY_UPLOAD_PRESET = "dazzling_preset"; 

export default function AdminCategoryManager() {
  // ফর্ম স্টেটসমূহ
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  
  // ইউজার ইন্টারফেস কন্ট্রোল স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // সব ক্যাটাগরি রাখার স্টেট
  const [categories, setCategories] = useState<any[]>([]);

  // READ: ডাটাবেজ থেকে ক্যাটাগরি লোড করা
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/category");
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // অটোম্যাটিকভাবে নাম থেকে স্ল্যাগ (Slug) তৈরি করার ফাংশন
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  // Cloudinary ইমেজ আপলোড
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

  // CREATE & UPDATE সাবমিট
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const isEditing = !!editId;
    const url = "/api/admin/category";
    const method = isEditing ? "PUT" : "POST";
    const payload = isEditing ? { id: editId, name, slug, imageUrl } : { name, slug, imageUrl };

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
        fetchCategories(); // টেবিল রিফ্রেশ
      } else {
        setMessage({ type: "error", text: json.message || "Operation failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Database connection error." });
    } finally {
      setLoading(false);
    }
  };

  // DELETE Operation
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const res = await fetch(`/api/admin/category?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: json.message });
        fetchCategories();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete category." });
    }
  };

  // এডিট মুড চালু করা
  const startEdit = (cat: any) => {
    setEditId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.imageUrl);
    setIsModalOpen(true);
  };

  // ফর্ম বন্ধ এবং ক্লিয়ার করা
  const closeAndResetForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setName("");
    setSlug("");
    setImageUrl("");
  };

  if (fetching) {
    return (
      <div className="h-96 flex items-center justify-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> Connecting Category Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl relative">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-xs gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" /> Store Category Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Organize your store products into clean and browsable categories.</p>
        </div>
        <button
          onClick={() => { resetFormOnly(); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {/* --- LIVE DATABASE TABLE (সবার উপরে) --- */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Database className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">All Categories ({categories.length})</h2>
            <p className="text-[11px] text-slate-400">Current category mapping loaded into the database.</p>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Icon/Thumbnail</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cat.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=80&q=80"} alt="thumb" className="w-full h-full object-contain" />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">/{cat.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => startEdit(cat)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-all" title="Edit row">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(cat._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Delete row">
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
          <div className="text-center py-10 text-xs text-slate-400">No categories found. Click "+ Add New Category" button to begin!</div>
        )}
      </div>

      {/* --- POPUP MODAL COMPONENT (বাটনে বা এডিটে চাপ দিলে আসবে) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative space-y-6">
            
            {/* Close Button */}
            <button onClick={closeAndResetForm} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" /> {editId ? "Update Category Node" : "Create New Store Category"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Fill out parameters below to append or rewrite categories in database.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Form Input Side */}
              <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category Name</label>
                  <input
                    type="text" required value={name} onChange={handleNameChange}
                    placeholder="e.g., Womens Traditional Wear"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">URL Slug (Auto Generated)</label>
                  <input
                    type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                    placeholder="womens-traditional-wear"
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category Graphic Icon</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-dashed border-amber-300 text-amber-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-100/70 transition-all">
                      {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Icon</>}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                    {imageUrl && <span className="text-[11px] text-green-600 font-semibold">Image Ready ✓</span>}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="submit" disabled={loading || uploading}
                    className="px-5 py-2.5 bg-[#1E1E2D] hover:bg-amber-600 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Save className="w-4 h-4" /> {editId ? "Update Category" : "Save Node"}</>}
                  </button>
                  <button
                    type="button" onClick={closeAndResetForm}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Live Round Circle Mini Preview Side */}
              <div className="md:col-span-2 bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-inner">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-start flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Circle Item Preview
                </h4>

                <div className="flex flex-col items-center space-y-2 py-4">
                  <div className="w-20 h-20 rounded-full bg-white border border-slate-200 shadow-xs p-2 flex items-center justify-center overflow-hidden group">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="Category View" className="w-full h-full object-contain" />
                    ) : (
                      <Layers className="w-7 h-7 text-slate-300" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 text-center max-w-[120px] truncate">
                    {name || "Category Name"}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );

  function resetFormOnly() {
    setEditId(null);
    setName("");
    setSlug("");
    setImageUrl("");
  }
}