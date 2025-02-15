export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export async function calculateContentHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatDate(date: Date | string, format: 'short' | 'full' = 'full'): string {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
    }).replace(/\//g, '.');
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.');
}

export function calculateGrowthRate(values: number[]): number {
  if (!values.length) return 0;
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  return ((lastValue / firstValue - 1) * 100);
}

export function getLatestValue(values: number[]): number {
  return values[values.length - 1] || 0;
} 