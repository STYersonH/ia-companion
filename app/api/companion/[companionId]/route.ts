import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// PUT method is typically used to update an entirce source, while the patch METHOD IS USED TO UPDATE A PARTIAL RESOURCE
// more flexible when the  cloient wants to update a resource that it has partially changed and when he has partial access
export async function PATCH(
	req: Request,
	{ params }: { params: { companionId: string } }
) {
	try {
		const body = await req.json();
		const user = await currentUser();
		const { src, name, description, instructions, seed, categoryId } = body;

		if (!params.companionId) {
			return new NextResponse("Bad Request : Missing requested fields", {
				status: 400,
			});
		}

		if (!user || !user.id || !user.firstName) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (
			!src ||
			!name ||
			!description ||
			!instructions ||
			!seed ||
			!categoryId
		) {
			return new NextResponse("Bad Request : Missing requested fields", {
				status: 400,
			});
		}

		// TODO: Check for subscription
		const companion = await prismadb.companion.update({
			where: { id: params.companionId },
			data: {
				categoryId,
				userId: user.id,
				userName: user.firstName,
				src,
				name,
				description,
				instructions,
				seed,
			},
		});
		return NextResponse.json(companion);
	} catch (error) {
		console.log("[COMPANION_PATCH]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { companionId: string } }
) {
	try {
		const { userId } = auth();

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		const companion = await prismadb.companion.delete({
			where: {
				userId,
				id: params.companionId,
			},
		});
		return NextResponse.json(companion);
	} catch (error) {
		console.log("[COMPANION_DELETE]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
