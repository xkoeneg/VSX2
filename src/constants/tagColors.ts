import type { TagColor, TagColorStyle } from '../types';



export const TAG_COLOR_PALETTE: TagColorStyle[] = [
  { id: 'gray', label: 'Gray', swatch: 'bg-zinc-400', chip: 'bg-[#1f202c] text-zinc-300 border border-[#303245]' },
  { id: 'blue', label: 'Blue', swatch: 'bg-blue-500', chip: 'bg-blue-950/40 text-blue-300 border border-blue-500/50' },
  { id: 'purple', label: 'Purple', swatch: 'bg-purple-500', chip: 'bg-purple-950/40 text-purple-300 border border-purple-500/50' },
  { id: 'green', label: 'Green', swatch: 'bg-emerald-500', chip: 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/50' },
  { id: 'yellow', label: 'Yellow', swatch: 'bg-yellow-500', chip: 'bg-yellow-950/40 text-yellow-300 border border-yellow-500/50' },
  { id: 'orange', label: 'Orange', swatch: 'bg-orange-500', chip: 'bg-orange-950/40 text-orange-300 border border-orange-500/50' },
  { id: 'red', label: 'Red', swatch: 'bg-rose-500', chip: 'bg-rose-950/40 text-rose-300 border border-rose-500/50' },
  { id: 'pink', label: 'Pink', swatch: 'bg-pink-500', chip: 'bg-pink-950/40 text-pink-300 border border-pink-500/50' },
];

export const DEFAULT_TAG_COLOR: TagColor = 'gray';

export const getTagColorStyle = (color?: string): TagColorStyle =>
  TAG_COLOR_PALETTE.find(c => c.id === color) || TAG_COLOR_PALETTE[0];
