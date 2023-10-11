import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { UserButton } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ui/mode-toggle";
import MobileSidebar from "./MobileSidebar";

const font = Poppins({
	weight: "600",
	subsets: ["latin"],
});

const Navbar = () => {
	return (
		<div className=" fixed w-full z-50 flex bg-secondary justify-between items-center p-4 border-b border-primary/10 h-16">
			<div className="flex">
				<MobileSidebar />
				<Link href={`/`}>
					<h1
						className={cn(
							"hidden md:flex text-2xl font-bold text-primary items-center",
							font.className
						)}
					>
						companion.ai
					</h1>
				</Link>
			</div>
			<div className="flex items-center gap-5">
				<ModeToggle />
				<Button>
					Upgrate
					<Sparkles className="h-4 w-4 ml-2" />
				</Button>
				<UserButton />
			</div>
		</div>
	);
};

export default Navbar;
