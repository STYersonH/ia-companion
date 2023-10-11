import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay?: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay || 500); // default delay 500ms
		// the cleanup function will run every time when value or delay changes, cancel the timerc
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}
