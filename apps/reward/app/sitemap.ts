import type { MetadataRoute } from "next";

const BASE_URL = "https://test-app.dex223.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rewardRoutes = [
    {
      url: `${BASE_URL}/en/trade-to-earn/`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 1,
      alternates: {
        languages: {},
      },
    },
    {
      url: `${BASE_URL}/en/social-quests/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/referrals/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/leaderboard/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/claim-center/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  return rewardRoutes;
}
