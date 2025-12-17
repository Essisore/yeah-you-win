import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../consts";

export async function GET(context: APIContext) {
  const allPosts = await getCollection("posts");

  // 过滤草稿并按日期排序
  const posts = allPosts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`,
      author: post.data.author || AUTHOR.name,
      categories: post.data.tags || [],
    })),
    customData: `<language>zh-CN</language>`,
  });
}
