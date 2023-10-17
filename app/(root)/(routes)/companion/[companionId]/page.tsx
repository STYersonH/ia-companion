import prismadb from "@/lib/prismadb";
import CompanionForm from "./components/CompanionForm";
import { auth, redirectToSignIn } from "@clerk/nextjs";

interface CompanionIdPageProps {
	// property called params which is an object
	params: {
		// has a property called companionId which is a string
		companionId: string;
	};
}

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
	const { userId } = auth();
	//TODO: Check subscription

	if (!userId) {
		return redirectToSignIn();
	}
	// tenemos que verificar si el usuario tiene permisos para editar este companion
	const companion = await prismadb.companion.findUnique({
		where: {
			id: params.companionId,
			userId, // si no pasamos esto, cualquier usuario puede editar cualquier companion usando el URL del companion
		},
	});

	const categories = await prismadb.catgory.findMany();

	return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
