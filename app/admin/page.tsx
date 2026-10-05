"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  Search,
  Eye,
  Heart,
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
  Upload,
  Cloud,
  Loader2,
  Download,
  Clock,
  CheckCircle2,
  FileJson,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import {
  PromptItem,
  CategoryType,
  AIModelType,
  StyleType,
  AspectRatioType,
  AnalyticsSummary,
  UserReport,
  CommunitySubmission,
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
  "Other",
];

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = usePixora();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupImportRef = useRef<HTMLInputElement>(null);

  // Developer URL Authentication
  const urlKey = searchParams.get("key") || searchParams.get("secret") || searchParams.get("token");
  const isDevFlag = searchParams.get("dev") === "true";

  const [isAuthorizedDev, setIsAuthorizedDev] = useState<boolean>(false);
  const [manualKeyInput, setManualKeyInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Data
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTable, setSearchTable] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [activeTab, setActiveTab] = useState<"prompts" | "submissions" | "analytics" | "reports" | "database">("prompts");

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Submission Preview Modal
  const [previewSubmission, setPreviewSubmission] = useState<CommunitySubmission | null>(null);

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
      const [overviewRes, subsRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/admin/submissions"),
      ]);

      const data = await overviewRes.json();
      if (data.success) {
        setAnalytics(data.analytics);
        setPrompts(data.prompts);
        setReports(data.reports);
      }

      const subsData = await subsRes.json();
      if (subsData.success) {
        setSubmissions(subsData.submissions || []);
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

  // Cloudinary File Upload Handler
  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormImage(data.url);
        addToast("Cloudinary Upload Complete!", "Image stored on Cloudinary CDN.");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: unknown) {
      console.error("Cloudinary upload failed:", err);
      addToast("Upload Error", err instanceof Error ? err.message : "Failed to upload image to Cloudinary", "warning");
    } finally {
      setUploadingImage(false);
    }
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

  const handleEditSubmission = (sub: CommunitySubmission) => {
    setEditingPrompt(null);
    setFormTitle(sub.title);
    setFormSlug("");
    setFormDesc(sub.description || "");
    setFormImage(sub.imageUrl);
    setFormPromptText(sub.promptText);
    setFormCategory(sub.category);
    setFormModel(sub.aiModel);
    setFormStyle(sub.style);
    setFormRatio(sub.aspectRatio);
    setFormTags(sub.tags.join(", "));
    setFormNegative(sub.parameters?.negativePrompt || "");
    setFormStylize(sub.parameters?.stylize ? String(sub.parameters.stylize) : "");
    setFormSeed(sub.parameters?.seed ? String(sub.parameters.seed) : "");
    setFormFeatured(false);
    setFormTrending(true);
    setFormPublished(true);
    setIsModalOpen(true);
    setPreviewSubmission(null);
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

  // Submissions Actions
  const handleApproveSubmission = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        addToast("Approved & Published!", `"${title}" has been published to Pixora.`);
        setPreviewSubmission(null);
        fetchAdminData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      console.error(err);
      addToast("Error", err instanceof Error ? err.message : "Failed to approve submission", "warning");
    }
  };

  const handleRejectSubmission = async (id: string, title: string) => {
    const reason = prompt(`Enter rejection reason for "${title}":`, "Does not meet aesthetic or prompt guidelines.");
    if (reason === null) return; // user cancelled

    try {
      const res = await fetch(`/api/admin/submissions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("Submission Rejected", `"${title}" marked as rejected.`, "info");
        setPreviewSubmission(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reports Action
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

  // Database Backup Actions
  const handleExportBackup = () => {
    window.location.href = "/api/admin/export";
    addToast("Exporting Database", "Downloading JSON backup file...");
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (data.success) {
        addToast("Database Restored!", data.message);
        fetchAdminData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      console.error(err);
      addToast("Import Failed", err instanceof Error ? err.message : "Invalid JSON file", "warning");
    } finally {
      if (backupImportRef.current) backupImportRef.current.value = "";
    }
  };

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTable.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTable.toLowerCase()) ||
      p.aiModel.toLowerCase().includes(searchTable.toLowerCase())
  );

  const pendingSubmissionsCount = submissions.filter((s) => s.status === "pending").length;
  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === "all") return true;
    return s.status === submissionFilter;
  });

  // If Not Authorized: Discreet Developer Access Gate
  if (!isAuthorizedDev) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#150F2E] rounded-3xl p-8 border border-purple-200/50 dark:border-[#8B5CF6]/30 shadow-2xl shadow-purple-950/40 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-white dark:via-purple-100 dark:to-cyan-200 bg-clip-text text-transparent">
              Developer Access Verification
            </h2>
            <p className="text-xs text-[#554D74] dark:text-[#A59ECA] leading-relaxed">
              This area is restricted to developers. To unlock access, enter your developer secret key or visit using your private URL.
            </p>
          </div>

          {authError && (
            <p className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
              {authError}
            </p>
          )}

          <form onSubmit={handleManualAuth} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-[#1C143B] dark:text-[#A59ECA]">Developer Key / Passcode</label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#8B5CF6] dark:text-[#A59ECA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter secret key or use your URL"
                  value={manualKeyInput}
                  onChange={(e) => setManualKeyInput(e.target.value)}
                  className="w-full bg-purple-50/50 dark:bg-[#0F0C20] border border-purple-200/50 dark:border-[#8B5CF6]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1C143B] dark:text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Verify Developer Key
            </button>
          </form>

          <div className="pt-2 border-t border-purple-200/50 dark:border-[#8B5CF6]/20 flex items-center justify-between text-xs text-[#554D74] dark:text-[#A59ECA]">
            <Link href="/" className="hover:text-[#8B5CF6] dark:hover:text-[#22D3EE] transition-colors">
              ← Return to Home
            </Link>
            <span className="text-[11px] text-[#8B5CF6] dark:text-[#A59ECA] font-mono">
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
      <div className="bg-[#150F2E] text-white p-4 sm:p-5 rounded-2xl border border-[#8B5CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/30 flex items-center justify-center font-bold text-sm">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Developer Mode Active</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                Supabase: {SUPABASE_CONFIG.projectRef}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                Cloudinary: eq0syso9
              </span>
            </div>
            <p className="text-[11px] text-[#A59ECA]">
              Accessed via secret URL. Persistent JSON file storage active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copySecretUrl}
            className="px-3.5 py-1.5 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-white text-xs font-semibold flex items-center gap-1.5 border border-[#8B5CF6]/30 transition-colors cursor-pointer"
            title="Copy your private 1-click access URL"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Secret URL</span>
          </button>

          <button
            onClick={handleRevokeAuth}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-500/30 transition-colors cursor-pointer"
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
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-white dark:via-purple-100 dark:to-cyan-200 bg-clip-text text-transparent">
            Pixora Catalog & Operations
          </h1>
          <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
            Manage prompt blueprints, moderate community submissions, and configure database persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 text-xs font-semibold shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Prompt</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (No Prompt Unlocked metrics as requested) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/20 shadow-md shadow-purple-950/10 space-y-1">
          <span className="text-[11px] font-bold text-[#554D74] dark:text-[#A59ECA] uppercase tracking-wider block">
            Total Prompts
          </span>
          <p className="text-2xl font-extrabold text-[#1C143B] dark:text-white">
            {analytics?.totalPrompts || prompts.length}
          </p>
          <span className="text-[10px] text-purple-500 font-medium">Catalog Items</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/20 shadow-md shadow-purple-950/10 space-y-1">
          <span className="text-[11px] font-bold text-[#554D74] dark:text-[#A59ECA] uppercase tracking-wider block">
            Published Live
          </span>
          <p className="text-2xl font-extrabold text-emerald-400">
            {prompts.filter((p) => p.isPublished).length}
          </p>
          <span className="text-[10px] text-emerald-500 font-medium">Public in Explore</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/20 shadow-md shadow-purple-950/10 space-y-1">
          <span className="text-[11px] font-bold text-[#554D74] dark:text-[#A59ECA] uppercase tracking-wider block">
            Pending Submissions
          </span>
          <p className="text-2xl font-extrabold text-amber-400">
            {pendingSubmissionsCount}
          </p>
          <span className="text-[10px] text-amber-500 font-medium">Needs Review</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/20 shadow-md shadow-purple-950/10 space-y-1">
          <span className="text-[11px] font-bold text-[#554D74] dark:text-[#A59ECA] uppercase tracking-wider block">
            Total Views
          </span>
          <p className="text-2xl font-extrabold text-[#1C143B] dark:text-white">
            {analytics?.totalViews?.toLocaleString() || "0"}
          </p>
          <span className="text-[10px] text-[#22D3EE] font-medium">Image Impressions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/20 shadow-md shadow-purple-950/10 space-y-1">
          <span className="text-[11px] font-bold text-[#554D74] dark:text-[#A59ECA] uppercase tracking-wider block">
            Total Favorites
          </span>
          <p className="text-2xl font-extrabold text-pink-400">
            {analytics?.totalFavorites?.toLocaleString() || "0"}
          </p>
          <span className="text-[10px] text-pink-500 font-medium">Saved Bookmarks</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/20 shadow-md shadow-purple-950/10 space-y-1">
          <span className="text-[11px] font-bold text-[#554D74] dark:text-[#A59ECA] uppercase tracking-wider block">
            Reports Inbox
          </span>
          <p className="text-2xl font-extrabold text-[#1C143B] dark:text-white">
            {reports.length}
          </p>
          <span className="text-[10px] text-red-400 font-medium">
            {reports.filter((r) => r.status === "pending").length} Pending
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-200/50 dark:border-[#8B5CF6]/20 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("prompts")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "prompts"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          Prompt Catalog ({prompts.length})
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "submissions"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          <span>Submissions Queue</span>
          {pendingSubmissionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold animate-pulse">
              {pendingSubmissionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          Model Analytics
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "reports"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          <span>Reports Inbox</span>
          {reports.filter((r) => r.status === "pending").length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "database"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database & Backup</span>
        </button>
      </div>

      {/* Tab 1: Prompt Catalog Table */}
      {activeTab === "prompts" && (
        <div className="bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 overflow-hidden shadow-xl shadow-purple-950/20 space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#8B5CF6] dark:text-[#A59ECA] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog by title, category, or model..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full bg-purple-50/50 dark:bg-[#0F0C20] border border-purple-200/50 dark:border-[#8B5CF6]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C143B] dark:text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
              />
            </div>

            <span className="text-xs text-[#554D74] dark:text-[#A59ECA]">
              Showing {filteredPrompts.length} of {prompts.length} prompts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/70 dark:bg-[#0F0C20] text-[#554D74] dark:text-[#A59ECA] uppercase font-bold text-[10px] tracking-wider border-y border-purple-200/50 dark:border-[#8B5CF6]/20">
                <tr>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">AI Model</th>
                  <th className="py-3 px-4">Ratio</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-center">Favorites</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-[#8B5CF6]/15">
                {filteredPrompts.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-50/50 dark:hover:bg-[#1D153E]/50 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#8B5CF6]/30"
                      />
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-[#1C143B] dark:text-white truncate">{p.title}</p>
                      <p className="text-[11px] text-[#554D74] dark:text-[#A59ECA] truncate font-mono">/{p.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-[#090714] font-semibold text-[#8B5CF6] dark:text-[#22D3EE] border border-[#8B5CF6]/20">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#554D74] dark:text-[#A59ECA]">{p.aiModel}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono text-[#A59ECA]">{p.aspectRatio}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          p.isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[#554D74] dark:text-[#A59ECA]">
                      {p.viewCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-pink-400">
                      {p.favoriteCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/prompt/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[#554D74] dark:text-[#A59ECA] hover:text-[#8B5CF6] dark:hover:text-[#22D3EE] hover:bg-[#8B5CF6]/15 transition-colors"
                          title="Preview live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-[#554D74] dark:text-[#A59ECA] hover:text-[#8B5CF6] dark:hover:text-[#22D3EE] hover:bg-[#8B5CF6]/15 transition-colors cursor-pointer"
                          title="Edit Prompt"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 rounded-lg text-[#554D74] dark:text-[#A59ECA] hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
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

      {/* Tab 2: Community Submissions Moderation Queue */}
      {activeTab === "submissions" && (
        <div className="bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 overflow-hidden shadow-xl shadow-purple-950/20 space-y-5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#1C143B] dark:text-white">
                Community Submissions Moderation Queue
              </h3>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Review submissions uploaded by creators. Approving immediately publishes the prompt to Pixora.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-[#0F0C20] p-1 rounded-xl border border-purple-200/50 dark:border-[#8B5CF6]/20 text-xs">
              {(["pending", "all", "approved", "rejected"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSubmissionFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-colors cursor-pointer ${
                    submissionFilter === filter
                      ? "bg-[#8B5CF6] text-white"
                      : "text-[#554D74] dark:text-[#A59ECA] hover:text-white"
                  }`}
                >
                  {filter} {filter === "pending" && `(${pendingSubmissionsCount})`}
                </button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-purple-50/50 dark:bg-[#0F0C20] border border-purple-200/50 dark:border-[#8B5CF6]/25 space-y-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <img
                      src={sub.imageUrl}
                      alt={sub.title}
                      className="w-20 h-20 rounded-xl object-cover border border-[#8B5CF6]/30 shrink-0"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-[#1C143B] dark:text-white truncate">
                          {sub.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            sub.status === "approved"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : sub.status === "rejected"
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#554D74] dark:text-[#A59ECA]">
                        <span className="font-semibold text-[#8B5CF6] dark:text-[#22D3EE]">{sub.aiModel}</span>
                        <span>·</span>
                        <span>{sub.category}</span>
                        <span>·</span>
                        <span className="font-mono">{sub.aspectRatio}</span>
                      </div>

                      <p className="text-[11px] text-[#554D74] dark:text-[#A59ECA]">
                        By <span className="font-semibold text-white">{sub.author.name}</span> ({sub.author.handle})
                      </p>
                    </div>
                  </div>

                  {/* Prompt Text Snippet */}
                  <div className="p-3 rounded-xl bg-[#090714] border border-[#8B5CF6]/20 font-mono text-[11px] text-[#F3F0FF] leading-relaxed line-clamp-3">
                    {sub.promptText}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-200/50 dark:border-[#8B5CF6]/20">
                    <button
                      onClick={() => setPreviewSubmission(sub)}
                      className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-[#1E1744] hover:bg-white dark:hover:bg-[#281E5B] text-xs font-semibold text-[#1C143B] dark:text-[#F3F0FF] border border-[#DDD6FE] dark:border-[#382875] transition-colors cursor-pointer"
                    >
                      Inspect Full Blueprint
                    </button>

                    <div className="flex items-center gap-2">
                      {sub.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleRejectSubmission(sub.id, sub.title)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleEditSubmission(sub)}
                            className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-white text-xs font-semibold border border-[#8B5CF6]/30 transition-colors cursor-pointer"
                          >
                            Edit & Publish
                          </button>
                          <button
                            onClick={() => handleApproveSubmission(sub.id, sub.title)}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            Approve & Publish
                          </button>
                        </>
                      )}

                      {sub.status === "approved" && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Published to Catalog</span>
                        </span>
                      )}

                      {sub.status === "rejected" && (
                        <button
                          onClick={() => handleApproveSubmission(sub.id, sub.title)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-[#0F0C20] flex items-center justify-center mx-auto text-[#8B5CF6]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1C143B] dark:text-white">No submissions found</h4>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                {submissionFilter === "pending"
                  ? "All community submissions have been reviewed and published!"
                  : "No submissions matching this filter."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Model Analytics */}
      {activeTab === "analytics" && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 space-y-4 shadow-xl shadow-purple-950/20">
            <h3 className="font-bold text-sm text-[#1C143B] dark:text-white uppercase tracking-wider">
              AI Models Breakdown
            </h3>
            <div className="space-y-3">
              {analytics.topModels.map((m) => {
                const maxCount = analytics.topModels[0]?.count || 1;
                const pct = Math.round((m.count / maxCount) * 100);
                return (
                  <div key={m.model} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#1C143B] dark:text-white">{m.model}</span>
                      <span className="text-[#554D74] dark:text-[#A59ECA]">{m.count} prompts</span>
                    </div>
                    <div className="w-full bg-purple-100 dark:bg-[#0F0C20] h-2 rounded-full overflow-hidden border border-[#8B5CF6]/20">
                      <div
                        className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 space-y-4 shadow-xl shadow-purple-950/20">
            <h3 className="font-bold text-sm text-[#1C143B] dark:text-white uppercase tracking-wider">
              Category Distribution
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {analytics.topCategories.map((c) => (
                <div key={c.category} className="p-3 bg-purple-50/50 dark:bg-[#0F0C20] rounded-xl border border-purple-200/50 dark:border-[#8B5CF6]/20">
                  <span className="text-xs text-[#554D74] dark:text-[#A59ECA] block">{c.category}</span>
                  <span className="text-lg font-bold text-[#1C143B] dark:text-white">{c.count} Prompts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Reports */}
      {activeTab === "reports" && (
        <div className="bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 p-6 space-y-4 shadow-xl shadow-purple-950/20">
          <h3 className="font-bold text-base text-[#1C143B] dark:text-white">Community Feedback & Reports</h3>
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-purple-50/50 dark:bg-[#0F0C20] border border-purple-200/50 dark:border-[#8B5CF6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-500 uppercase">
                        {rep.reason.replace("_", " ")}
                      </span>
                      <span className="text-xs text-[#554D74] dark:text-[#A59ECA]">on "{rep.promptTitle}"</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          rep.status === "reviewed"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : rep.status === "dismissed"
                            ? "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#1C143B] dark:text-white">
                      {rep.details || "No additional comments provided."}
                    </p>
                    {rep.userEmail && (
                      <p className="text-[11px] text-[#554D74] dark:text-[#A59ECA]">From: {rep.userEmail}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReportAction(rep.id, "reviewed")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleReportAction(rep.id, "dismissed")}
                      className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#1C143B] dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#554D74] dark:text-[#A59ECA] py-8 text-center">No reports pending.</p>
          )}
        </div>
      )}

      {/* Tab 5: Database Persistence & Backup */}
      {activeTab === "database" && (
        <div className="space-y-6">
          {/* Storage Architecture Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#150F2E] border border-emerald-500/30 space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Local Persistent DB</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Data persists automatically to <code className="text-[#22D3EE] font-mono text-[11px]">lib/data/pixora-db.json</code> on all changes.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#A59ECA]">
                Prompts: {prompts.length} · Submissions: {submissions.length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#150F2E] border border-[#22D3EE]/30 space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#22D3EE] flex items-center gap-1.5">
                  <Cloud className="w-4 h-4" />
                  <span>Cloudinary CDN</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#22D3EE]/15 text-[#22D3EE]">
                  Connected
                </span>
              </div>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Global CDN for prompt visual uploads. Cloud Name: <span className="font-mono text-white">eq0syso9</span>
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#A59ECA]">
                Folder: pixora/prompts
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#150F2E] border border-[#8B5CF6]/30 space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>Supabase Sync</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6]">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Project Ref: <span className="font-mono text-white">{SUPABASE_CONFIG.projectRef}</span>
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#A59ECA]">
                Schema: supabase/schema.sql
              </div>
            </div>
          </div>

          {/* Backup & Restore Controls */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/30 space-y-6 shadow-xl shadow-purple-950/20">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[#1C143B] dark:text-white">
                Database Backup & JSON Migration
              </h3>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Export your full Pixora database (all prompts, submissions, and reports) as an archival JSON file or restore from a backup.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleExportBackup}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Database Backup (JSON)</span>
              </button>

              <input
                type="file"
                ref={backupImportRef}
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />

              <button
                onClick={() => backupImportRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#1E1744] border border-[#DDD6FE] dark:border-[#382875] text-[#1C143B] dark:text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#EDE9FE] dark:hover:bg-[#281D58] transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Database from File</span>
              </button>

              <button
                onClick={fetchAdminData}
                className="px-4 py-2.5 rounded-xl bg-purple-50/50 dark:bg-[#0F0C20] border border-purple-200/50 dark:border-[#8B5CF6]/30 text-[#554D74] dark:text-[#A59ECA] hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Sync</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Detail Preview Modal */}
      {previewSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090714]/85 backdrop-blur-md animate-in fade-in-0 duration-200"
          onClick={() => setPreviewSubmission(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#150F2E] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#8B5CF6]/30 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#8B5CF6]/20">
              <h3 className="font-bold text-xl text-white">Submission Inspection</h3>
              <button
                onClick={() => setPreviewSubmission(null)}
                className="p-1.5 rounded-xl text-[#A59ECA] hover:text-white hover:bg-[#8B5CF6]/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#8B5CF6]/30">
                <img
                  src={previewSubmission.imageUrl}
                  alt={previewSubmission.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A59ECA]">Title</span>
                  <p className="font-bold text-sm text-white">{previewSubmission.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A59ECA]">Model</span>
                    <p className="font-semibold text-[#22D3EE]">{previewSubmission.aiModel}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A59ECA]">Category</span>
                    <p className="font-semibold text-white">{previewSubmission.category}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A59ECA]">Ratio</span>
                    <p className="font-mono text-white">{previewSubmission.aspectRatio}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A59ECA]">Status</span>
                    <p className="font-semibold uppercase text-amber-400">{previewSubmission.status}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A59ECA]">Creator</span>
                  <p className="text-white font-medium">
                    {previewSubmission.author.name} ({previewSubmission.author.handle})
                  </p>
                  {previewSubmission.userEmail && (
                    <p className="text-[#A59ECA] text-[11px]">{previewSubmission.userEmail}</p>
                  )}
                </div>

                {previewSubmission.parameters && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A59ECA]">Parameters</span>
                    <div className="font-mono text-[11px] text-[#A59ECA] space-y-0.5">
                      {previewSubmission.parameters.stylize && <p>--stylize {previewSubmission.parameters.stylize}</p>}
                      {previewSubmission.parameters.chaos && <p>--chaos {previewSubmission.parameters.chaos}</p>}
                      {previewSubmission.parameters.seed && <p>--seed {previewSubmission.parameters.seed}</p>}
                      {previewSubmission.parameters.negativePrompt && (
                        <p>--no {previewSubmission.parameters.negativePrompt}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-white uppercase">Complete Prompt Blueprint</span>
              <div className="p-3 bg-[#090714] rounded-xl border border-[#8B5CF6]/30 font-mono text-xs text-[#F3F0FF] whitespace-pre-wrap leading-relaxed">
                {previewSubmission.promptText}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#8B5CF6]/20">
              <button
                onClick={() => handleRejectSubmission(previewSubmission.id, previewSubmission.title)}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reject Submission
              </button>

              <button
                onClick={() => handleEditSubmission(previewSubmission)}
                className="px-4 py-2 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Edit Parameters
              </button>

              <button
                onClick={() => handleApproveSubmission(previewSubmission.id, previewSubmission.title)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Approve & Publish Immediately
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Prompt Modal with Cloudinary Upload */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090714]/80 backdrop-blur-md animate-in fade-in-0 duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#150F2E] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 border border-[#8B5CF6]/30 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#8B5CF6]/20">
              <h3 className="font-bold text-xl text-white">
                {editingPrompt ? "Edit Prompt Blueprint" : "Create New AI Prompt"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#A59ECA] hover:text-white hover:bg-[#8B5CF6]/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrompt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A59ECA]">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nordic Brutalist Villa"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A59ECA]">Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. nordic-brutalist-villa"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full p-2.5 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs font-mono text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A59ECA]">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of visual composition, lighting, camera..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              {/* Cloudinary Image Upload Section */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#0F0C20]/80 border border-[#8B5CF6]/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-[#22D3EE]" />
                    <span>Image Storage (Cloudinary CDN)</span>
                  </span>
                  <span className="text-[10px] text-[#A59ECA] font-mono">Cloud: eq0syso9</span>
                </div>

                {/* Dropzone & File Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleCloudinaryUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File to Cloudinary</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs text-[#A59ECA]">or paste image URL below</span>
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    required
                    placeholder="https://res.cloudinary.com/eq0syso9/... or https://..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full p-2.5 bg-[#090714] border border-[#8B5CF6]/30 rounded-xl text-xs font-mono text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                {/* Preview Thumbnail */}
                {formImage && (
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={formImage}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-[#8B5CF6]/30 shadow-md"
                    />
                    <div className="text-[11px] text-[#A59ECA] space-y-0.5 min-w-0">
                      <p className="font-semibold text-[#22D3EE] flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Image Ready</span>
                      </p>
                      <p className="truncate font-mono text-[10px]">{formImage}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Prompt Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Complete AI Prompt (Locked Blueprint)</span>
                  <span className="text-[10px] text-amber-400 font-mono">CONFIDENTIAL</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full prompt text including all camera setups and flags..."
                  value={formPromptText}
                  onChange={(e) => setFormPromptText(e.target.value)}
                  className="w-full p-3 bg-[#090714] text-[#F3F0FF] border border-[#8B5CF6]/30 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A59ECA]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                    className="w-full p-2 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#150F2E] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A59ECA]">AI Model</label>
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value as AIModelType)}
                    className="w-full p-2 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {AI_MODELS.map((m) => (
                      <option key={m} value={m} className="bg-[#150F2E] text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A59ECA]">Aspect Ratio</label>
                  <select
                    value={formRatio}
                    onChange={(e) => setFormRatio(e.target.value as AspectRatioType)}
                    className="w-full p-2 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="1:1" className="bg-[#150F2E] text-white">1:1</option>
                    <option value="16:9" className="bg-[#150F2E] text-white">16:9</option>
                    <option value="9:16" className="bg-[#150F2E] text-white">9:16</option>
                    <option value="4:5" className="bg-[#150F2E] text-white">4:5</option>
                    <option value="3:2" className="bg-[#150F2E] text-white">3:2</option>
                    <option value="2:3" className="bg-[#150F2E] text-white">2:3</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A59ECA]">Seed (Optional)</label>
                  <input
                    type="text"
                    value={formSeed}
                    onChange={(e) => setFormSeed(e.target.value)}
                    placeholder="849201"
                    className="w-full p-2 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs font-mono text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A59ECA]">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="portrait, cinematic, editorial, 85mm"
                  className="w-full p-2 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A59ECA]">Negative Prompt (Optional)</label>
                <input
                  type="text"
                  value={formNegative}
                  onChange={(e) => setFormNegative(e.target.value)}
                  placeholder="blurry, distorted hands, low quality"
                  className="w-full p-2 bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl text-xs text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-[#A59ECA]">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer accent-[#8B5CF6]">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span>Featured in Spotlight</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer accent-[#8B5CF6]">
                  <input
                    type="checkbox"
                    checked={formTrending}
                    onChange={(e) => setFormTrending(e.target.checked)}
                    className="rounded"
                  />
                  <span>Mark as Trending</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer accent-[#8B5CF6]">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="rounded"
                  />
                  <span>Published Immediately</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#8B5CF6]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#A59ECA] hover:bg-[#8B5CF6]/15 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
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
