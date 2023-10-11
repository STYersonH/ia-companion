"use client";
import { cn } from "@/lib/utils";
import { Home, Plus, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Sidebar = () => {
	const pathname = usePathname();
	const router = useRouter();

	const routes = [
		{
			icon: Home,
			href: "/",
			label: "Home",
			pro: false,
		},
		{
			icon: Plus,
			href: "/companion/new",
			label: "Create",
			pro: true,
		},
		{
			icon: Settings,
			href: "/settings",
			label: "Settings",
			pro: false,
		},
	];

	const onNavigate = (url: string, pro: boolean) => {
		return router.push(url);
	};

	return (
		<div className="text-primary w-full mt-3 bg-secondary space-y-4 flex flex-col h-full">
			<div className="flex ">
				<div className="space-y-3 w-full">
					{routes.map((route) => (
						<div
							onClick={() => router.push(route.href)}
							key={route.label}
							className={cn(
								"text-muted-foreground hover:bg-primary/10 hover:text-primary flex justify-center transition m-2 p-2 rounded-xl cursor-pointer",
								pathname === route.href && "bg-primary/10 text-primary"
							)}
						>
							<div className="flex flex-col items-center">
								<route.icon />
								{route.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
