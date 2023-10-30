import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { CallbackManager } from "langchain/callbacks";
import { Replicate } from "langchain/llms/replicate";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
	request: Request,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { prompt } = await request.json();
		const user = await currentUser();

		if (!user || !user.firstName || !user.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const identifier = request.url + "-" + user.id;
		const { success } = await rateLimit(identifier);

		if (!success) {
			// error 429: too many requests
			return new NextResponse("Rate limit exceded", { status: 429 });
		}

		const companion = await prismadb.companion.update({
			where: {
				id: params.chatId,
			},
			data: {
				messages: {
					// crear un nuevo mensaje en esa relacion
					create: {
						content: prompt,
						role: "user",
						userId: user.id,
					},
				},
			},
		});

		if (!companion) {
			return new NextResponse("Companion not found", { status: 404 });
		}

		const name = companion.id;
		const companion_file_name = name + ".txt";

		// aqu vamos a usar memory.ts
		const companionKey = {
			companionName: name,
			userId: user.id,
			modelName: "llama2-13b",
		};

		const memoryManager = await MemoryManager.getInstance();

		// ver si nuestro companioin existe
		const records = await memoryManager.readLatestHistory(companionKey);

		if (records.length == 0) {
			// si records.length es 0 significa que no hay registros en la BD Redis
			await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey); // usaremos esto para crear el comportamiento de la IA
			// ya que se dividira el mensaje usando saltos de linea es importante escribir con ese formato la semilla de un companion
		}

		await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

		const recentChatHistory = await memoryManager.readLatestHistory(
			companionKey
		);

		const similarDocs = await memoryManager.vectorSearch(
			recentChatHistory,
			companion_file_name
		);

		let relevantHistory = "";
		if (!!similarDocs && similarDocs.length !== 0) {
			relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
		}

		const { handlers } = LangChainStream();

		// call Replicate for inference
		const model = new Replicate({
			// si no funciona, ir al github de Antonio y cambiar lo que sea necesario
			model:
				"a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5", //"meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d",
			input: {
				max_length: 2048,
			},
			apiKey: process.env.REPLICATE_API_KEY,
			callbackManager: CallbackManager.fromHandlers(handlers),
		});

		model.verbose = true;

		const resp = String(
			await model
				.call(
					`
					ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix.

					${companion.instructions}

					Below are the relevant details about ${companion.name}'s past the conversation you are in.
					${relevantHistory}

					${recentChatHistory}\n${companion.name}: 
				`
				)
				.catch(console.error)
		);

		// mover de Redis a la BD vectorial
		const cleaned = resp.replaceAll(",", "");
		const chunks = cleaned.split("\n");
		const response = chunks[0];

		await memoryManager.writeToHistory("" + response.trim(), companionKey);
		var Readable = require("stream").Readable;

		let s = new Readable();
		s.push(response);
		s.push(null);

		if (response !== undefined && response.length > 1) {
			memoryManager.writeToHistory("" + response.trim(), companionKey);

			await prismadb.companion.update({
				where: {
					id: params.chatId,
				},
				data: {
					messages: {
						create: {
							content: response.trim(),
							role: "system",
							userId: user.id,
						},
					},
				},
			});
		}

		return new StreamingTextResponse(s);
	} catch (error) {
		console.log("[CHAT_POST", error);
		return new NextResponse("Internal error", { status: 500 });
	}
}
