import { Menu } from "lucide-react";
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Sidebar from "./Sidebar";

const MobileSidebar = () => {
	return (
		<Sheet>
			<SheetTrigger>
				<div className="md:hidden md:h-0">
					<Menu />
				</div>
			</SheetTrigger>
			<SheetContent className="w-24 pt-7 px-0 bg-secondary" side="left">
				<Sidebar />
			</SheetContent>
		</Sheet>
	);
};

export default MobileSidebar;
