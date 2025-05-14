
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Adds custom scrollbar styling to an element
 * @param element The DOM element to add styling to
 */
export function addCustomScrollbar(element: HTMLElement | null) {
  if (!element) return;
  
  // Apply smooth scrolling
  element.style.scrollBehavior = 'smooth';
  
  // In a real implementation, you would use CSS classes instead of inline styles
  // This is just for demonstration purposes
  element.classList.add('custom-scrollbar');
}

/**
 * Checks if the browser supports scroll snapping
 */
export function supportsScrollSnap(): boolean {
  return CSS.supports('scroll-snap-type', 'x mandatory');
}
