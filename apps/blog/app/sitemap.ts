import type { MetadataRoute } from "next";

type Frequency = "yearly" | "monthly";
const BASE_URL = "https://blog.dex223.io";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allRoutes = [
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "yearly" as Frequency,
      priority: 1,
    },
  ];

  const blogRes = await fetch(
    "https://api.dex223.io/v1/core/api/blog/list-slim?page=1&limit=100&skip=0",
  );
  const blogData: {
    data: {
      id: string;
      slug: string;
    }[];
  } = await blogRes.json();

  for (let i of blogData.data) {
    allRoutes.push({
      url: `${BASE_URL}/en/${i.id}?slug=${i.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as Frequency,
      priority: 0.8,
    });
  }

  return allRoutes;
}
