import { Categories } from "@/components/Categories";
import SearchInput from "@/components/SearchInput";
import prismadb from "@/lib/prismadb";
import { UserButton } from "@clerk/nextjs";
import React from "react";

const RootPage = async () => {
	const categories = await prismadb.catgory.findMany();

	return (
		<div className="h-full p-4 space-y-2">
			<SearchInput />
			<Categories data={categories} />
		</div>
	);
};

export default RootPage;
