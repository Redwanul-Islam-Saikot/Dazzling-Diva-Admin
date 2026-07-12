"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, Settings, Mail, Phone, MapPin, Edit3, X } from "lucide-react";

interface FooterData {
  companyName: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  copyrightText: string;
}

export default function FooterConfiguration() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ফর্ম স্টেটসমূহ
  const [companyName, setCompanyName] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [copyrightText, setCopyrightText] = useState("");

  const fetchFooterData = async () => {
    try {
      const res = await fetch("/api/admin/footer");
      const json = await res.json();
      if (json.success && json.data) {
        setFooterData(json.data);
        setCompanyName(json.data.companyName || "");
        setAboutText(json.data.aboutText || "");
        setContactEmail(json.data.contactEmail || "");
        setContactPhone(json.data.contactPhone || "");
        setAddress(json.data.address || "");
        setFacebookUrl(json.data.facebookUrl || "");
        setInstagramUrl(json.data.instagramUrl || "");
        setYoutubeUrl(json.data.youtubeUrl || "");
        setCopyrightText(json.data.copyrightText || "");
      }
    } catch (err) {
      console.error("Failed to load footer data", err);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName, aboutText, contactEmail, contactPhone,
          address, facebookUrl, instagramUrl, youtubeUrl, copyrightText
        }),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: json.message });
        setIsOpen(false);
        fetchFooterData();
      } else {
        setMessage({ type: "error", text: json.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" /> Footer Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Control company information, social links, and copyrights appearing globally at the bottom.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Edit3 className="w-4 h-4" /> Customize Footer
        </button>
      </div>

      {/* Success/Error Alerts */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Settings Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Box 1: Company Profile */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Bio</h3>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{companyName || "Dazzling Diva"}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-4">{aboutText || "No bio text configured yet."}</p>
          </div>
        </div>

        {/* Box 2: Contacts info */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {contactEmail || "Not Set"}</li>
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {contactPhone || "Not Set"}</li>
            <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> <span className="truncate">{address || "Not Set"}</span></li>
          </ul>
        </div>

        {/* Box 3: Social & Meta */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Handles & Legals</h3>
          <div className="flex gap-4 items-center">
            {/* Custom SVG Facebook */}
            <svg className={`w-4 h-4 ${facebookUrl ? 'text-blue-600 fill-current' : 'text-slate-300 fill-current'}`} viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
            </svg>
            {/* Custom SVG Instagram */}
            <svg className={`w-4 h-4 ${instagramUrl ? 'text-pink-600 stroke-current' : 'text-slate-300 stroke-current'}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            {/* Custom SVG Youtube */}
            <svg className={`w-4 h-4 ${youtubeUrl ? 'text-red-600 fill-current' : 'text-slate-300 fill-current'}`} viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Copyright Mark</span>
            <p className="text-xs text-slate-700 mt-0.5 truncate">{copyrightText || "© 2026 Dazzling Diva. All Rights Reserved."}</p>
          </div>
        </div>

      </div>

      {/* FLOATING POPUP FORM MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-100 w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Update Global Footer Parameters</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              
              {/* Row 1: Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Copyright Signature</label>
                  <input type="text" required value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">About Short Description</label>
                <textarea rows={3} value={aboutText} onChange={(e) => setAboutText(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 resize-none" placeholder="Brief pitch about your fashion hub..." />
              </div>

              {/* Row 2: Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Official Email</label>
                  <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hotline Number</label>
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Store Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              {/* Row 3: Socials */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Social Channels URLs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Facebook Link</label>
                    <input type="text" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Instagram Link</label>
                    <input type="text" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Youtube Link</label>
                    <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button" onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-[11px] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={loading}
                  className="px-4 py-2 bg-[#1E1E2D] hover:bg-amber-500 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 
                  Publish Footer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}