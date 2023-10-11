import prismadb from "@/lib/prismadb";
import CompanionForm from "./components/CompanionForm";

interface CompanionIdPageProps {
	// property called params which is an object
	params: {
		// has a property called companionId which is a string
		companionId: string;
	};
}

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
	//TODO: Check subscription

	const companion = await prismadb.companion.findUnique({
		where: {
			id: params.companionId,
		},
	});

	const categories = await prismadb.catgory.findMany();

	return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
