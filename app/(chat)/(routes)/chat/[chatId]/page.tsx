import prismadb from "@/lib/prismadb";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { ChatClient } from "./components/client";

// se recibira params que contiene el id del chat que es string
interface ChatIdPageProps {
	params: {
		chatId: string;
	};
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
	const { userId } = auth(); // userId es el id del usuario logeado obtenido de clerk con auth()

	if (!userId) {
		return redirectToSignIn(); // si no hay usuario logeado redirecciona a la pagina de login
	}

	// se busca el chat con el id que se recibio en params
	const companion = await prismadb.companion.findUnique({
		where: {
			id: params.chatId,
		},
		// se incluyen los mensajes del chat
		include: {
			messages: {
				orderBy: {
					createdAt: "asc", // se ordenan por fecha de creacion de forma ascendente
				},
				where: {
					userId, // se filtran los mensajes por el usuario logeado ya que sino se podrian ver los mensajes de otros usuarios
				},
			},
			// _count es para obtener la cantidad de mensajes del chat
			_count: {
				select: {
					messages: true,
				},
			},
		},
	});

	if (!companion) {
		return redirect("/"); // si no se encuentra el chat se redirecciona a la pagina principal
	}

	return <ChatClient companion={companion} />;
};

export default ChatIdPage;
