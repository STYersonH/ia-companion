"use client";

import { useTheme } from "next-themes";
import { BeatLoader } from "react-spinners";

import { useToast } from "./ui/use-toast";
import BotAvatar from "./BotAvatar";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";

export interface ChatMessageProps {
	role: "system" | "user";
	content?: string;
	isLoading?: boolean;
	src?: string;
}

export const ChatMessage = ({
	role,
	content,
	isLoading,
	src,
}: ChatMessageProps) => {
	const { toast } = useToast();
	const { theme } = useTheme();

	const onCopy = () => {
		if (!content) {
			return;
		}

		navigator.clipboard.writeText(content);
		toast({
			description: "Message copied to clipboard!",
		});
	};

	return (
		// items-start is used to align the content to the top, it avoids give a container default height from another item
		<div
			className={cn(
				"group flex items-start gap-x-3 py-4 w-full",
				role === "user" && "justify-end"
			)}
		>
			{role !== "user" && src && <BotAvatar src={src} />}
			<div className="bg-primary/10 rounded-md px-4 py-2 max-w-sm text-sm ">
				{isLoading ? (
					<BeatLoader size={5} color={theme === "light" ? "black" : "white"} />
				) : (
					content
				)}
			</div>
			{role === "user" && <UserAvatar />}
			{role !== "user" && !isLoading && (
				<Button
					onClick={onCopy}
					className="opacity-0 group-hover:opacity-100 transition"
					size={"icon"}
					variant={"ghost"}
				>
					<Copy className="w-4 h-4" />
				</Button>
			)}
		</div>
	);
};

export default ChatMessage;
