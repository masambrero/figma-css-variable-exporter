const toHex = (v: number) => v.toString(16).padStart(2, '0');

export function rgbaToHex(color: RGBA | RGB) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  // Default alpha to 1 if undefined
  const alpha = 'a' in color && typeof color.a === 'number' ? color.a : 1;
  const hexRGB = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // Include alpha channel only when < 1
  if (alpha < 1) {
    const a = Math.round(alpha * 255);
    return `${hexRGB}${toHex(a)}`;
  }

  return hexRGB;
}
