"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Save, Image as ImageIcon, Loader2, Upload, Database, Trash2, Edit3, Plus, X, Tag, Package, Layers } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "bylxfdh4"; 
const CLOUDINARY_UPLOAD_PRESET = "dazzling_preset"; 

export default function AdminProductsManager() {
  // ফর্ম স্টেটসমূহ
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("10");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // ইউজার ইন্টারফেস কন্ট্রোল স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ডেটা রাখার স্টেট
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // ড্রপডাউনের জন্য

  // READ: ডাটাবেজ থেকে প্রোডাক্ট এবং ক্যাটাগরি লোড করা
  const fetchData = async () => {
    try {
      setFetching(true);
      // ১. প্রোডাক্ট নিয়ে আসা
      const prodRes = await fetch("/api/admin/products");
      const prodJson = await prodRes.json();
      if (prodJson.success) setProducts(prodJson.data);

      // ২. ক্যাটাগরি নিয়ে আসা (ড্রপডাউনে দেখানোর জন্য)
      const catRes = await fetch("/api/admin/category");
      const catJson = await catRes.json();
      if (catJson.success) {
        setCategories(catJson.data);
        if (catJson.data.length > 0) setCategory(catJson.data[0].slug); // ডিফল্ট প্রথম ক্যাটাগরি
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // অটোম্যাটিকভাবে নাম থেকে স্ল্যাগ (Slug) তৈরি করা
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

  // CREATE & UPDATE সাবমিট লজিক
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const isEditing = !!editId;
    const url = "/api/admin/products";
    const method = isEditing ? "PUT" : "POST";
    
    const payload = {
      id: editId,
      name,
      slug,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category,
      stock: Number(stock),
      imageUrl,
      isFeatured
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
        fetchData(); // টেবিল রিফ্রেশ
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
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: json.message });
        fetchData();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete product." });
    }
  };

  // এডিট মুড চালু করা
  const startEdit = (prod: any) => {
    setEditId(prod._id);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setOldPrice(prod.oldPrice ? prod.oldPrice.toString() : "");
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setImageUrl(prod.imageUrl);
    setIsFeatured(prod.isFeatured || false);
    setIsModalOpen(true);
  };

  // ফর্ম রিসেট ও বন্ধ করা
  const closeAndResetForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrice("");
    setOldPrice("");
    setStock("10");
    setImageUrl("");
    setIsFeatured(false);
    if (categories.length > 0) setCategory(categories[0].slug);
  };

  if (fetching) {
    return (
      <div className="h-96 flex items-center justify-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> Booting Core Inventory Systems...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-xs gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" /> Live Products Grid
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage stock availability, custom catalog prices, and product visibility settings.</p>
        </div>
        <button
          onClick={() => { closeAndResetForm(); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {/* --- LIVE INVENTORY TABLE --- */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Database className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">All Master Products ({products.length})</h2>
            <p className="text-[11px] text-slate-400">Current active catalog listing compiled from MongoDB.</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Item View</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                        <img src={prod.imageUrl} alt="prod-img" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">/{prod.slug}</p>
                      {prod.isFeatured && <span className="inline-block bg-amber-100 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded-sm mt-1">Featured Item</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-semibold text-[11px]">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">৳{prod.price}</p>
                      {prod.oldPrice && <p className="text-slate-400 line-through text-[11px]">৳{prod.oldPrice}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${prod.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {prod.stock > 0 ? `${prod.stock} Items Left` : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => startEdit(prod)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-all" title="Edit Product">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(prod._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Delete Product">
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
          <div className="text-center py-10 text-xs text-slate-400">No products inside catalog yet. Click "+ Add New Product" to start selling!</div>
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
                <ShoppingBag className="w-5 h-5 text-amber-500" /> {editId ? "Update Product Master Data" : "Provision New Catalog Product"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Input accurate metadata nodes to update your front-end store collection grids.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form Input Container */}
              <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Title</label>
                    <input type="text" required value={name} onChange={handleNameChange} placeholder="Premium Georgette Saree" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">URL Slug</label>
                    <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Description</label>
                  <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write high converting product specifications here..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selling Price (৳)</label>
                    <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1850" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Regular/Old Price (৳)</label>
                    <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="2400" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Quantity</label>
                    <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} placeholder="15" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assign Category Module</label>
                    <select
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold text-slate-700"
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-4 flex items-center gap-2">
                    <input type="checkbox" id="feat" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-amber-500 border-slate-300 rounded-md focus:ring-amber-500" />
                    <label htmlFor="feat" className="text-xs font-bold text-slate-700 select-none cursor-pointer">Mark as Featured Product</label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Image Asset</label>
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
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Committing Nodes...</> : <><Save className="w-4 h-4" /> {editId ? "Update Product" : "Publish Product"}</>}
                  </button>
                  <button type="button" onClick={closeAndResetForm} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all">Cancel</button>
                </div>
              </form>

              {/* Live Preview Cards (ডানপাশে) */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 shadow-inner">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Storefront Card Preview
                </h4>

                {/* Simulated Grid Card Item */}
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs max-w-[240px] mx-auto w-full">
                  <div className="h-44 bg-slate-100 relative flex items-center justify-center p-2">
                    {imageUrl ? (
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    )}
                    {oldPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-sm uppercase">Sale</span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{category || "Category"}</span>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{name || "Product Title Name"}</h5>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-black text-slate-900">৳{price || "00"}</span>
                      {oldPrice && <span className="text-[10px] text-slate-400 line-through">৳{oldPrice}</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Pipeline Verification Status</p>
                  <p className="text-slate-600 leading-normal">Ready to hook dynamically into Homepage Products Grid system.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}