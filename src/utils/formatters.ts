/**
 * 値のフォーマッター関数群
 */

import DOMPurify from 'dompurify';
import { FormatterFunction } from '../types';

/**
 * URLを自動リンク化
 */
export const formatUrl = (value: string): string => {
  if (!value) return '';
  
  // URLかメールアドレスかを判定
  const isEmail = value.includes('@');
  const href = isEmail ? `mailto:${value}` : value.startsWith('http') ? value : `https://${value}`;
  
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; cursor: pointer;">${value}</a>`;
};

// カスタムURLフォーマッター
export const formatCustomUrl = (value: string, displayText: string = 'リンクを開く'): string => {
  if (!value) return '';
  
  const href = value.startsWith('http') ? value : `https://${value}`;
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; cursor: pointer;">${displayText}</a>`;
};

/**
 * 日付を yyyy/mm/dd 形式に整形
 */
export const formatDate = (value: string): string => {
  if (!value) return '';
  
  try {
    const date = new Date(value);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
  } catch {
    return value;
  }
};

// HTMLをサニタイズして安全に表示するためのヘルパー関数
const createSafeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['a', 'br', 'p', 'span', 'strong', 'em', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'class', 'rel']
  });
};

// URLかどうかを判定する関数
const isValidUrl = (value: string): boolean => {
  try {
    // URLとして解析可能か確認
    new URL(value);
    // プロトコルがhttp(s)で始まるか確認
    return value.startsWith('http://') || value.startsWith('https://');
  } catch {
    return false;
  }
};

// フォーマッター関数のマップ
export const formatters: Record<string, FormatterFunction> = {
  // URLをリンクとして表示（有効なURLの場合のみ）
  url: (value: string) => {
    if (!value || value.trim() === '') return '';
    if (value === 'リンクを開く') return '';
    if (!isValidUrl(value)) return '';

    return `<a href="${value ? value : ''}" target="_blank" rel="noopener noreferrer">リンクを開く</a>`;
  },

  // 日付フォーマット（YYYY-MM-DD）
  date: (value: string) => {
    if (!value || value.trim() === '') return '';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return value;
    }
  },

  // カスタムURLフォーマッター（テキストとURLを分けて表示）
  customUrl: (value: string) => {
    if (!value || value.trim() === '') return '';
    try {
      const [text, url] = value.split('|');
      if (url && url.trim() && isValidUrl(url.trim())) {
        const html = `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">${text.trim()}</a>`;
        return createSafeHTML(html);
      }
    } catch {
      // パースエラーの場合は元の値を返す
    }
    return value;
  },

  // 改行を<br>タグに変換（明細表示用）
  multiline: (value: string) => {
    if (!value || value.trim() === '') return '';
    const html = value.replace(/\n/g, '<br>');
    return createSafeHTML(html);
  }
};

// フォーマッター関数の型定義
export type FormatterFunction = (value: string) => string;
export type FormatterMap = Record<string, FormatterFunction>;