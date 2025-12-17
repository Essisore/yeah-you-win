import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名，自动处理冲突
 * @param inputs - 类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date - 要格式化的日期对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 计算阅读时间（分钟）
 * @param content - 文章内容
 * @param wordsPerMinute - 每分钟阅读字数，默认 200
 * @returns 估算的阅读时间（分钟）
 */
export function getReadingTime(
  content: string,
  wordsPerMinute: number = 200,
): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * 生成文章摘要
 * @param content - 文章内容
 * @param maxLength - 最大长度，默认 160
 * @returns 摘要文本
 */
export function generateExcerpt(content: string, maxLength = 160): string {
  const plainText = content.replace(/<[^>]*>/g, "").trim();
  return plainText.length > maxLength
    ? `${plainText.slice(0, maxLength)}...`
    : plainText;
}
