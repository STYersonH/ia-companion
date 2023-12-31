import { Companion } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { Card, CardFooter, CardHeader } from "./ui/card";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface CompanionsProps {
	// declaramos que data es un array de objetos Companion y que adicionalmente tienen la propiedad _count
	data: (Companion & {
		_count: {
			messages: number;
		};
	})[];
}

const Companions = ({ data }: CompanionsProps) => {
	if (data.length === 0) {
		return (
			<div className="pt-10 flex flex-col items-center justify-center space-y-3">
				<div className="relative w-60 h-60">
					<Image fill className="grayscale" alt="Empty" src="/empty.png" />
				</div>
				<p className="text-sm text-muted-foreground">No companions found.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10">
			{data.map((item) => (
				<Card
					key={item.id}
					className="bg-primary/10 rounded-xl text-center text-muted-foreground h-full "
				>
					<Link href={`/chat/${item.id}`}>
						<div className="h-full flex flex-col justify-between">
							<CardHeader className="flex justify-center items-center bg">
								<div className="relative w-32 h-32">
									<Image
										src={item.src}
										alt="companion"
										fill
										className=" rounded-lg"
									/>
								</div>
								<p className="font-bold">{item.name}</p>
								<p className="text-xs">{item.description}</p>
							</CardHeader>
							<CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
								<p className="lowercase">@{item.userName}</p>
								<div className="flex items-center">
									<MessageSquare className="w-3 h-3 mr-1" />
									{item._count.messages}
								</div>
							</CardFooter>
						</div>
					</Link>
				</Card>
			))}
		</div>
	);
};

export default Companions;
