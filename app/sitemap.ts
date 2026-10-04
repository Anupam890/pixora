import { MetadataRoute } from "next";
import { INITIAL_PROMPTS } from "@/lib/data/prompts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pixora.ai";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Category pages
  const categories = [
    "fashion",
    "cinematic",
    "product",
    "portrait",
    "anime",
    "interior",
    "fantasy",
    "3d",
    "photography",
  ];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Model pages
  const models = ["midjourney", "flux", "stable-diffusion", "chatgpt-image", "ideogram"];
  const modelRoutes: MetadataRoute.Sitemap = models.map((mod) => ({
    url: `${baseUrl}/ai/${mod}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Prompt detail pages
  const promptRoutes: MetadataRoute.Sitemap = INITIAL_PROMPTS.map((p) => ({
    url: `${baseUrl}/prompt/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...categoryRoutes, ...modelRoutes, ...promptRoutes];
}
