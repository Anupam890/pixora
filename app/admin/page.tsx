"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  Search,
  Eye,
  Unlock,
  Heart,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  X,
  Check,
  Lock,
  Key,
  Copy,
  LogOut,
  Database,
} from "lucide-react";
import {
  PromptItem,
  CategoryType,
  AIModelType,
  StyleType,
  AspectRatioType,
  AnalyticsSummary,
  UserReport,
} from "@/lib/types";
import { usePixora } from "@/lib/context/PixoraContext";
import { isDeveloperKeyValid, SUPABASE_CONFIG } from "@/lib/supabase";

const CATEGORIES: CategoryType[] = [
  "Fashion",
  "Cinematic",
  "Product",
  "Portrait",
  "Anime",
  "Interior",
  "Fantasy",
  "Photography",
  "3D",
  "Art",
  "Social Media",
  "E-commerce",
];

const AI_MODELS: AIModelType[] = [
  "Midjourney",
  "Flux",
  "Stable Diffusion",
  "ChatGPT Image",
  "Ideogram",
  "Leonardo",
];

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = usePixora();

  // Developer URL Authentication
  const urlKey = searchParams.get("key") || searchParams.get("secret") || searchParams.get("token");
  const isDevFlag = searchParams.get("dev") === "true";

  const [isAuthorizedDev, setIsAuthorizedDev] = useState<boolean>(false);
  const [manualKeyInput, setManualKeyInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Data
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTable, setSearchTable] = useState("");
  const [activeTab, setActiveTab] = useState<"prompts" | "analytics" | "reports">("prompts");

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formPromptText, setFormPromptText] = useState("");
  const [formCategory, setFormCategory] = useState<CategoryType>("Fashion");
  const [formModel, setFormModel] = useState<AIModelType>("Midjourney");
  const [formStyle, setFormStyle] = useState<StyleType>("Editorial");
  const [formRatio, setFormRatio] = useState<AspectRatioType>("4:5");
  const [formTags, setFormTags] = useState("");
  const [formNegative, setFormNegative] = useState("");
  const [formStylize, setFormStylize] = useState("");
  const [formSeed, setFormSeed] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formPublished, setFormPublished] = useState(true);

  // Check URL Key & Local Session on mount
  useEffect(() => {
    const savedDevAuth = localStorage.getItem("pixora_dev_authenticated");

    if (isDeveloperKeyValid(urlKey) || isDevFlag || savedDevAuth === "true") {
      setIsAuthorizedDev(true);
      localStorage.setItem("pixora_dev_authenticated", "true");
      fetchAdminData();
    } else {
      setIsAuthorizedDev(false);
      setLoading(false);
    }
  }, [urlKey, isDevFlag]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
        setPrompts(data.prompts);
        setReports(data.reports);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeveloperKeyValid(manualKeyInput)) {
      setIsAuthorizedDev(true);
      localStorage.setItem("pixora_dev_authenticated", "true");
      setAuthError(null);
      addToast("Developer Authenticated", "Full access granted via Secret Key.");
      fetchAdminData();
    } else {
      setAuthError("Invalid access key. Please check your developer URL or key.");
    }
  };

  const handleRevokeAuth = () => {
    localStorage.removeItem("pixora_dev_authenticated");
    setIsAuthorizedDev(false);
    addToast("Developer Session Ended", "Dashboard is locked.", "info");
    router.push("/");
  };

  const copySecretUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const secretUrl = `${origin}/admin?key=pixora_dev_resqvbekntvuvmxkuyvm`;
    navigator.clipboard.writeText(secretUrl);
    addToast("URL Copied to Clipboard!", "Bookmark this private URL for 1-click access.");
  };

  const openCreateModal = () => {
    setEditingPrompt(null);
    setFormTitle("");
    setFormSlug("");
    setFormDesc("");
    setFormImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85");
    setFormPromptText("");
    setFormCategory("Fashion");
    setFormModel("Midjourney");
    setFormStyle("Editorial");
    setFormRatio("4:5");
    setFormTags("editorial, high-fashion, studio");
    setFormNegative("cartoon, low quality, bad hands");
    setFormStylize("250");
    setFormSeed("8491024");
    setFormFeatured(false);
    setFormTrending(true);
    setFormPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PromptItem) => {
    setEditingPrompt(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormDesc(p.description);
    setFormImage(p.imageUrl);
    setFormPromptText(p.promptText || "");
    setFormCategory(p.category);
    setFormModel(p.aiModel);
    setFormStyle(p.style);
    setFormRatio(p.aspectRatio);
    setFormTags(p.tags.join(", "));
    setFormNegative(p.parameters?.negativePrompt || "");
    setFormStylize(p.parameters?.stylize ? String(p.parameters.stylize) : "");
    setFormSeed(p.parameters?.seed ? String(p.parameters.seed) : "");
    setFormFeatured(p.isFeatured);
    setFormTrending(p.isTrending);
    setFormPublished(p.isPublished);
    setIsModalOpen(true);
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPromptText.trim()) {
      addToast("Validation Error", "Title and Prompt Text are required.", "warning");
      return;
    }

    try {
      const payload: Partial<PromptItem> = {
        id: editingPrompt ? editingPrompt.id : undefined,
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        description: formDesc.trim(),
        imageUrl: formImage.trim(),
        category: formCategory,
        aiModel: formModel,
        style: formStyle,
        aspectRatio: formRatio,
        tags: formTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        promptText: formPromptText.trim(),
        parameters: {
          version: formModel === "Midjourney" ? "v 6.1" : formModel === "Flux" ? "Flux.1 Pro" : "SDXL",
          negativePrompt: formNegative.trim() || undefined,
          stylize: formStylize ? Number(formStylize) : undefined,
          seed: formSeed ? Number(formSeed) : undefined,
        },
        isFeatured: formFeatured,
        isTrending: formTrending,
        isPublished: formPublished,
      };

      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast(
          editingPrompt ? "Prompt Updated" : "Prompt Created",
          `"${data.prompt.title}" saved successfully.`
        );
        setIsModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      addToast("Error", "Failed to save prompt", "warning");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/prompts?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        addToast("Deleted", `"${title}" removed from catalog.`, "info");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (p: PromptItem) => {
    try {
      await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          title: p.title,
          promptText: p.promptText || "Default prompt text",
          isPublished: !p.isPublished,
        }),
      });
      fetchAdminData();
      addToast(p.isPublished ? "Unpublished" : "Published", `Updated status for ${p.title}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportAction = async (reportId: string, status: "reviewed" | "dismissed") => {
    try {
      await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      fetchAdminData();
      addToast("Report Updated", `Status changed to ${status}`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTable.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTable.toLowerCase()) ||
      p.aiModel.toLowerCase().includes(searchTable.toLowerCase())
  );

  // If Not Authorized: Discreet Developer Access Gate
  if (!isAuthorizedDev) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E8E8E5] shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#111111] text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#111111]">Developer Access Verification</h2>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              This area is restricted to developers. To unlock access, enter your developer secret key or visit using your private URL.
            </p>
          </div>

          {authError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
              {authError}
            </p>
          )}

          <form onSubmit={handleManualAuth} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-[#111111]">Developer Key / Passcode</label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter secret key or use your URL"
                  value={manualKeyInput}
                  onChange={(e) => setManualKeyInput(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E8E5] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#6D5DFB]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-colors"
            >
              Verify Developer Key
            </button>
          </form>

          <div className="pt-2 border-t border-[#F3F3F1] flex items-center justify-between text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              ← Return to Home
            </Link>
            <span className="text-[11px] text-[#999999] font-mono">
              Ref: {SUPABASE_CONFIG.projectRef}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Developer Authorized View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Developer Private Mode Header Banner */}
      <div className="bg-[#111111] text-white p-4 sm:p-5 rounded-2xl border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Developer Mode Active</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Connected: {SUPABASE_CONFIG.projectRef}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Accessed via secret URL. Hidden completely from normal customer UI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copySecretUrl}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Copy your private 1-click access URL"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Secret URL</span>
          </button>

          <button
            onClick={handleRevokeAuth}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Exit and lock developer console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Main Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">
            Pixora Catalog & Operations
          </h1>
          <p className="text-xs text-[#6B6B6B]">
            Manage prompt blueprints, view real-time monetization analytics, and review reports.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold shadow-sm transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Prompt</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E8E8E5] space-y-1">
            <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Total Prompts
            </span>
            <p className="text-2xl font-extrabold text-[#111111]">{analytics.totalPrompts}</p>
            <span className="text-[10px] text-emerald-600 font-medium">
              {analytics.publishedPrompts} Published
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E8E5] space-y-1">
            <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Total Unlocks
            </span>
            <p className="text-2xl font-extrabold text-[#111111]">
              {analytics.totalUnlocks.toLocaleString()}
            </p>
            <span className="text-[10px] text-[#6D5DFB] font-medium">
              +{analytics.todayUnlocks.toLocaleString()} Today
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E8E5] space-y-1">
            <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Unlock Conv. %
            </span>
            <p className="text-2xl font-extrabold text-[#111111]">
              {analytics.unlockConversionRate}%
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">
              Ad Rate: {analytics.adCompletionRate}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E8E5] space-y-1">
            <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Total Favorites
            </span>
            <p className="text-2xl font-extrabold text-[#111111]">
              {analytics.totalFavorites.toLocaleString()}
            </p>
            <span className="text-[10px] text-red-500 font-medium">High Intent</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E8E5] space-y-1">
            <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Active Creators
            </span>
            <p className="text-2xl font-extrabold text-[#111111]">
              {analytics.totalUsers.toLocaleString()}
            </p>
            <span className="text-[10px] text-[#6B6B6B] font-medium">Global visitors</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E8E5] space-y-1">
            <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Est. Ad Revenue
            </span>
            <p className="text-2xl font-extrabold text-emerald-600">
              ${analytics.estimatedRevenueUsd.toLocaleString()}
            </p>
            <span className="text-[10px] text-[#6B6B6B] font-medium">$18.50 eCPM</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E8E5] pb-2">
        <button
          onClick={() => setActiveTab("prompts")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "prompts"
              ? "bg-[#111111] text-white"
              : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F3F3F1]"
          }`}
        >
          Prompt Catalog ({prompts.length})
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "analytics"
              ? "bg-[#111111] text-white"
              : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F3F3F1]"
          }`}
        >
          Model Analytics
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "reports"
              ? "bg-[#111111] text-white"
              : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F3F3F1]"
          }`}
        >
          <span>Reports Inbox</span>
          {reports.filter((r) => r.status === "pending").length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px]">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Prompt Catalog Table */}
      {activeTab === "prompts" && (
        <div className="bg-white rounded-3xl border border-[#E8E8E5] overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog by title, category, or model..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full bg-[#FAFAF9] border border-[#E8E8E5] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#6D5DFB]"
              />
            </div>

            <span className="text-xs text-[#6B6B6B]">
              Showing {filteredPrompts.length} of {prompts.length} prompts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF9] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider border-y border-[#E8E8E5]">
                <tr>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">AI Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Unlocks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F3F1]">
                {filteredPrompts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAF9]/80 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E8E8E5]"
                      />
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-[#111111] truncate">{p.title}</p>
                      <p className="text-[11px] text-[#999999] truncate font-mono">/{p.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#F3F3F1] font-semibold text-[#111111]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#6B6B6B]">{p.aiModel}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          p.isPublished
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#111111]">
                      {p.unlockCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/prompt/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#111111] hover:bg-[#F3F3F1]"
                          title="Preview live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#6D5DFB] hover:bg-[#F3F3F1]"
                          title="Edit Prompt"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete Prompt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Analytics */}
      {activeTab === "analytics" && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-[#E8E8E5] space-y-4">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Popular AI Models by Unlock Volume
            </h3>
            <div className="space-y-3">
              {analytics.topModels.map((m) => {
                const maxUnlocks = analytics.topModels[0]?.unlocks || 1;
                const pct = Math.round((m.unlocks / maxUnlocks) * 100);
                return (
                  <div key={m.model} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{m.model}</span>
                      <span className="text-[#6B6B6B]">{m.unlocks.toLocaleString()} unlocks</span>
                    </div>
                    <div className="w-full bg-[#F3F3F1] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#6D5DFB] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-[#E8E8E5] space-y-4">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Category Distribution
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {analytics.topCategories.map((c) => (
                <div key={c.category} className="p-3 bg-[#FAFAF9] rounded-xl border border-[#E8E8E5]">
                  <span className="text-xs text-[#6B6B6B] block">{c.category}</span>
                  <span className="text-lg font-bold text-[#111111]">{c.count} Prompts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reports */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-3xl border border-[#E8E8E5] p-6 space-y-4">
          <h3 className="font-bold text-base text-[#111111]">Community Feedback & Reports</h3>
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E8E8E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600 uppercase">
                        {rep.reason.replace("_", " ")}
                      </span>
                      <span className="text-xs text-[#6B6B6B]">on "{rep.promptTitle}"</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          rep.status === "reviewed"
                            ? "bg-emerald-100 text-emerald-800"
                            : rep.status === "dismissed"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#111111]">
                      {rep.details || "No additional comments provided."}
                    </p>
                    {rep.userEmail && (
                      <p className="text-[11px] text-[#999999]">From: {rep.userEmail}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReportAction(rep.id, "reviewed")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleReportAction(rep.id, "dismissed")}
                      className="px-3 py-1.5 rounded-lg bg-[#EBEBE7] text-[#111111] text-xs font-semibold hover:bg-[#D5D5D0]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B6B6B] py-8 text-center">No reports pending.</p>
          )}
        </div>
      )}

      {/* Create / Edit Prompt Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E8E5] space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E5]">
              <h3 className="font-bold text-xl text-[#111111]">
                {editingPrompt ? "Edit Prompt Blueprint" : "Create New AI Prompt"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrompt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nordic Brutalist Villa"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#FAFAF9] border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111]">Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. nordic-brutalist-villa"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full p-2.5 bg-[#FAFAF9] border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of visual composition, lighting, camera..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#FAFAF9] border rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full p-2.5 bg-[#FAFAF9] border rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                  <span>Complete AI Prompt (Locked Blueprint)</span>
                  <span className="text-[10px] text-amber-600 font-mono">CONFIDENTIAL</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full prompt text including all camera setups and flags..."
                  value={formPromptText}
                  onChange={(e) => setFormPromptText(e.target.value)}
                  className="w-full p-3 bg-[#111111] text-gray-100 border border-[#222222] rounded-xl text-xs font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                    className="w-full p-2 bg-[#FAFAF9] border rounded-xl text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">AI Model</label>
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value as AIModelType)}
                    className="w-full p-2 bg-[#FAFAF9] border rounded-xl text-xs"
                  >
                    {AI_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Aspect Ratio</label>
                  <select
                    value={formRatio}
                    onChange={(e) => setFormRatio(e.target.value as AspectRatioType)}
                    className="w-full p-2 bg-[#FAFAF9] border rounded-xl text-xs"
                  >
                    <option value="1:1">1:1</option>
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="4:5">4:5</option>
                    <option value="3:2">3:2</option>
                    <option value="2:3">2:3</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Seed (Optional)</label>
                  <input
                    type="text"
                    value={formSeed}
                    onChange={(e) => setFormSeed(e.target.value)}
                    placeholder="849201"
                    className="w-full p-2 bg-[#FAFAF9] border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="portrait, cinematic, editorial, 85mm"
                  className="w-full p-2 bg-[#FAFAF9] border rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold">Negative Prompt (Optional)</label>
                <input
                  type="text"
                  value={formNegative}
                  onChange={(e) => setFormNegative(e.target.value)}
                  placeholder="blurry, distorted hands, low quality"
                  className="w-full p-2 bg-[#FAFAF9] border rounded-xl text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span>Featured in Spotlight</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formTrending}
                    onChange={(e) => setFormTrending(e.target.checked)}
                    className="rounded"
                  />
                  <span>Mark as Trending</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="rounded"
                  />
                  <span>Published Immediately</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#E8E8E5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-[#F3F3F1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-bold transition-colors"
                >
                  {editingPrompt ? "Save Changes" : "Publish Prompt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-xs text-[#6B6B6B]">
          Verifying developer session...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
