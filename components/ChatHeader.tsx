import { Companion, Message } from "@prisma/client";
import React from "react";
import { Button } from "./ui/button";
import {
	ChevronLeftIcon,
	Edit,
	MessageSquareIcon,
	MessagesSquare,
	MoreVertical,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BotAvatar from "./BotAvatar";
import { useUser } from "@clerk/nextjs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import axios from "axios";

interface ChatHeaderProps {
	companion: Companion & {
		messages: Message[];
		_count: {
			messages: number;
		};
	};
}

const ChatHeader = ({ companion }: ChatHeaderProps) => {
	const router = useRouter();
	const { user } = useUser(); // estoy extraendo el usuario logeado de clerk
	const { toast } = useToast();

	const onDelete = async () => {
		try {
			await axios.delete(`/api/companion/${companion.id}`);

			toast({
				description: "Success deleting chat",
			});

			router.refresh();
			router.push("/");
		} catch (error) {
			console.log(error);
			toast({
				description: "Something went wrong",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
			<div className="flex gap-2 items-center">
				{/* router.back() es una funcion que redirecciona a la pagina anterior */}
				<Button onClick={() => router.back()} variant="ghost" size="icon">
					<ChevronLeftIcon className="h-8 w-8" />
				</Button>
				<BotAvatar src={companion.src} />
				<div className="flex flex-col gap-y-1">
					<div className="flex gap-x-2 items-center">
						<p className="font-bold">{companion.name}</p>
						<div className="flex items-center text-xs text-muted-foreground">
							<MessagesSquare className="h-3 w-3 mr-1 " />
							{companion._count.messages}
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						Created by {companion.userName}
					</p>
				</div>
			</div>
			{user?.id === companion.userId && (
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="secondary" size={`icon`}>
							<MoreVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => router.push(`/companion/${companion.id}`)}
						>
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onDelete}>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
};

export default ChatHeader;
