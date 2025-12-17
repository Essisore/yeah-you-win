/**
 * 全局类型定义
 */

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  date: Date;
  image?: string;
  tags?: string[];
  draft?: boolean;
  author?: string;
}

export interface SiteConfig {
  url: string;
  title: string;
  description: string;
  author: {
    name: string;
    email: string;
  };
  postsPerPage: number;
  dateFormat: string;
  defaultImage: string;
}
