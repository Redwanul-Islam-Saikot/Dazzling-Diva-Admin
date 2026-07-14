"use client";

import { useEffect, useState } from "react";
import { Sliders, Save, Image as ImageIcon, Loader2, Upload, Database, Trash2, Edit3, Plus, X } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "bylxfdh4";
const CLOUDINARY_UPLOAD_PRESET = "dazzling_preset";

type ArrivalItem = {
  _id: string;
  name: string;
  price: string;
  image: string;
  status: string;
};

export default function NewArrivalsAdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");
  const [editId, setEditId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [items, setItems] = useState<ArrivalItem[]>([]);

  async function fetchItems() {
    try {
      setFetching(true);
      const res = await fetch("/api/admin/new-arrivals");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(function () {
    fetchItems();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/upload",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) setImage(data.secure_url);
    } catch (err) {
      setMessage({ type: "error", text: "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  function closeAndResetForm() {
    setIsModalOpen(false);
    setEditId(null);
    setName("");
    setPrice("");
    setImage("");
    setStatus("active");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const payload = { name, price, image, status, order: editId ? undefined : items.length };

    try {
      if (editId) {
        const res = await fetch("/api/admin/new-arrivals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        const json = await res.json();
        setMessage({ type: json.success ? "success" : "error", text: json.message });
      } else {
        const res = await fetch("/api/admin/new-arrivals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        setMessage({ type: json.success ? "success" : "error", text: json.message });
      }
      closeAndResetForm();
      fetchItems();
    } catch (err) {
      setMessage({ type: "error", text: "Database connection error." });
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: ArrivalItem) {
    setEditId(item._id);
    setName(item.name);
    setPrice(item.price);
    setImage(item.image);
    setStatus(item.status || "active");
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch("/api/admin/new-arrivals?id=" + id, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: json.message });
        fetchItems();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete product." });
    }
  }

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Connecting to New Arrivals Core...
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Sliders className="h-5 w-5 text-amber-500" /> New Arrivals Manager
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Control the &quot;New Arrivals&quot; product grid shown on the homepage.
          </p>
        </div>
        <button
          onClick={function () { closeAndResetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" /> Add New Product
        </button>
      </div>

      {message.text && (
        <div
          className={
            "rounded-xl border p-4 text-xs font-semibold " +
            (message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600")
          }
        >
          {message.text}
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="h-5 w-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Live Products Grid ({items.length})</h2>
            <p className="text-[11px] text-slate-400">Products currently loaded into the New Arrivals homepage section.</p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {items.map(function (item) {
                  return (
                    <tr key={item._id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="h-10 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-slate-500">{item.price}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider " +
                            (item.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")
                          }
                        >
                          {item.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={function () { startEdit(item); }} className="rounded-lg p-1.5 text-amber-600 transition-all hover:bg-amber-50">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={function () { handleDelete(item._id); }} className="rounded-lg p-1.5 text-red-500 transition-all hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            No products configured. Click &quot;+ Add New Product&quot; to add your first item!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-4xl space-y-6 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            <button onClick={closeAndResetForm} className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Sliders className="h-5 w-5 text-amber-500" /> {editId ? "Modify Product Data" : "Provision New Product"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">Add product details for the New Arrivals homepage grid.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <form onSubmit={handleSubmit} className="space-y-4 md:col-span-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={function (e) { setName(e.target.value); }}
                    placeholder="Mauve Pink Embroidered Tissue Lehenga"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</label>
                  <input
                    required
                    type="text"
                    value={price}
                    onChange={function (e) { setPrice(e.target.value); }}
                    placeholder="BDT 17,325.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={status}
                    onChange={function (e) { setStatus(e.target.value); }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="active">🟢 Active (Visible on Homepage)</option>
                    <option value="inactive">🔴 Inactive (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-100/70">
                      {uploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" /> Upload Image File
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                    {image && <span className="text-[11px] font-semibold text-green-600">Asset Sync Complete ✓</span>}
                  </div>
                </div>

                <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex items-center gap-2 rounded-xl bg-[#1E1E2D] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-amber-600 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Publish Product
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeAndResetForm}
                    className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
                <h4 className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <ImageIcon className="h-3.5 w-3.5" /> Storefront Card Preview
                </h4>

                <div className="relative aspect-[319/484] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {image && <img src={image} alt="preview" className="absolute inset-0 h-full w-full object-cover" />}
                  <div className="absolute bottom-2 left-1/2 flex w-[90%] -translate-x-1/2 flex-col gap-0.5 bg-white px-2.5 py-2">
                    <p className="truncate text-[10px] font-medium text-black">{name || "Product Title Name"}</p>
                    <span className="text-[11px] font-semibold text-black/50">{price || "BDT 0.00"}</span>
                  </div>
                </div>

                <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
                  <p className="flex items-center gap-1 font-bold">🛠️ Deployment Status</p>
                  <p className="leading-normal text-slate-600">
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