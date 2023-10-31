import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// absoluteUrl("/settings") -> "https://localhost:3000/settings"
export function absoluteUrl(path: string) {
	return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
}
