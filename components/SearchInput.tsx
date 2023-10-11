"use client";

import { SearchIcon } from "lucide-react";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import qs from "query-string";

const SearchInput = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const categoryId = searchParams.get("categoryId");
	const name = searchParams.get("name");

	const [value, setValue] = useState(name || "");
	const debouncedValue = useDebounce(value, 500);

	const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		setValue(e.target.value);
	};

	useEffect(() => {
		const query = {
			name: debouncedValue,
			categoryId: categoryId,
		};

		//create the URL with query parameterst that are not empty or null
		const url = qs.stringifyUrl(
			// an object containing the URL
			{
				url: window.location.href, //the current URL of the page
				query, // the query string to be parsed and stringified
			},
			// options
			{
				skipEmptyString: true, // se removera el query si esta vacio
				skipNull: true, // se removera el query si esta null
			}
		);
		router.push(url);
	}, [debouncedValue, router, categoryId]);

	return (
		<div className="relative">
			<SearchIcon className="absolute h-4 w-4 left-4 top-3 text-muted-foreground" />
			<Input
				className=" pl-10 bg-primary/10"
				placeholder="Search..."
				onChange={onChange}
				value={value}
			/>
		</div>
	);
};

export default SearchInput;
