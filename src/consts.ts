/**
 * 全局站点配置
 * 包含站点元数据、作者信息和社交链接
 */

export const SITE_URL = "https://longfei.space" as const;
export const SITE_TITLE = "Longfei's Miniblog" as const;
export const SITE_DESCRIPTION =
  "Miniblog is an opinionated and extremely minimal blogging template built with Astro and Tailwind CSS." as const;

export const AUTHOR = {
  name: "Longfei",
  email: "essisore@gmail.com",
} as const;

// 站点配置
export const SITE_CONFIG = {
  postsPerPage: 10,
  dateFormat: "YYYY-MM-DD",
  defaultImage: "/static/blog-placeholder.png",
} as const;
