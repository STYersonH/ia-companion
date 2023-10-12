import { Categories } from "@/components/Categories";
import Companions from "@/components/Companions";
import SearchInput from "@/components/SearchInput";
import prismadb from "@/lib/prismadb";
import { UserButton } from "@clerk/nextjs";
import React from "react";

// necesitamos capturar los datos del url para mostrar lo que es debido mostrar

interface RootPageProps {
	searchParams: {
		categoryId: string;
		name: string;
	};
}

const RootPage = async ({ searchParams }: RootPageProps) => {
	const data = await prismadb.companion.findMany({
		where: {
			categoryId: searchParams.categoryId,
			name: {
				search: searchParams.name,
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		//count all the messages this companion has
		include: {
			_count: {
				// _count is a special property that allows us to count the number of messages
				select: {
					messages: true,
				},
			},
		},
	});

	const categories = await prismadb.catgory.findMany();

	return (
		<div className="h-full p-4 space-y-2">
			<SearchInput />
			<Categories data={categories} />
			<Companions data={data} />
		</div>
	);
};

export default RootPage;
