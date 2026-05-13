import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CADNode } from './store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const findNodeRecursive = (nodes: CADNode[], id: string | null): CADNode | null => {
  if (!id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeRecursive(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  ms: number
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
