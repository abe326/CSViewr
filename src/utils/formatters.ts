/**
 * 値のフォーマッター関数群
 */

/**
 * URLを自動リンク化
 */
export const formatUrl = (value: string): string => {
  if (!value) return '';
  
  // URLかメールアドレスかを判定
  const isEmail = value.includes('@');
  const href = isEmail ? `mailto:${value}` : value.startsWith('http') ? value : `https://${value}`;
  
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${value}</a>`;
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

/**
 * フォーマッター関数のマップ
 */
export const formatters: Record<string, (value: string) => string> = {
  url: formatUrl,
  date: formatDate
};