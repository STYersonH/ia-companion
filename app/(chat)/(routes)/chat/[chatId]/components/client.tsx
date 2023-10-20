"use client";
import { useCompletion } from "ai/react";

import { Companion, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import ChatHeader from "@/components/ChatHeader";
import ChatForm from "@/components/ChatForm";
import ChatMessages from "@/components/ChatMessages";
import { ChatMessageProps } from "@/components/ChatMessage";

interface ChatClientProps {
	companion: Companion & {
		messages: Message[];
		_count: {
			messages: number;
		};
	};
}

export const ChatClient = ({ companion }: ChatClientProps) => {
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessageProps[]>(
		companion.messages
	);

	// we wait for response from our API and then store that in our systemMessage
	const { input, isLoading, handleInputChange, handleSubmit, setInput } =
		// the useCompletion hook is used to handle completion of the user's input and display a system messages in response
		// very useful in appps that sends messages to a sercer and recieves a response
		useCompletion({
			api: `/api/chat/${companion.id}`,
			// the callback f. is called when the API call is finished
			onFinish(prompt, completion) {
				// this systemMessage will be displayed in the chat
				const systemMessage: ChatMessageProps = {
					role: "system",
					content: completion,
				};

				// setMessages updates the state of messages by adding new messages to the end of the array
				setMessages((current) => [...current, systemMessage]);
				setInput(""); // cleanthe input field

				router.refresh(); // refresh the page to update the messages
			},
		});

	// here we create our user message
	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		const userMessage: ChatMessageProps = {
			role: "user",
			content: input,
		};

		setMessages((current) => [...current, userMessage]);

		// from the useCompletion hook
		handleSubmit(e); // this will call the onFinish callback function
	};

	return (
		<div className="flex flex-col h-full p-4 space-y-2">
			<ChatHeader companion={companion} />
			<ChatMessages
				companion={companion}
				isLoading={isLoading}
				messages={messages}
			/>
			<ChatForm
				isLoading={isLoading}
				input={input}
				handleInputChange={handleInputChange}
				onSubmit={onSubmit}
			/>
		</div>
	);
};
