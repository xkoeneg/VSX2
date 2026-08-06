export const detectSymbolType = (symbol: string): 'INDEX' | 'GOLD' | 'MANUAL' => {
  const s = symbol.toUpperCase();
  if (s.includes('NQ') || s.includes('NASDAQ') || s === 'ES' || s.includes('ES (') || s.includes('S&P') || s.includes('SPX')) return 'INDEX';
  if (s.includes('XAU') || s.includes('GOLD')) return 'GOLD';
  return 'MANUAL';
};

export const calculatePoints = (symbol: string, price: number, ref: number): number => {
  if (price === 0 || ref === 0) return 0;
  const diff = Math.abs(price - ref);
  const type = detectSymbolType(symbol);
  switch (type) {
    case 'INDEX':
      return Math.round(diff);
    case 'GOLD':
      return Math.round(diff * 10) / 10;
    default:
      return 0;
  }
};

// Compress base64 image
export const compressImage = (base64: string, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = img.width / img.height;
      const width = Math.min(img.width, maxWidth);
      const height = width / ratio;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64);
      }
    };
    img.onerror = () => resolve(base64);
  });
};

// Calculate account metrics
