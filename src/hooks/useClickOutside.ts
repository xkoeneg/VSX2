import { useEffect } from 'react';
import type React from 'react';

export function useClickOutside(ref: React.RefObject<HTMLElement>, onOutsideClick: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [active, onOutsideClick, ref]);
}

// Draggable Popup Calculator Component

