import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="h-full">
			<Navbar />
			<div className="hidden md:flex flex-col fixed h-full inset-y-0 bottom-0 mt-16 w-24">
				<Sidebar />
			</div>
			<main className="md:pl-24 pt-16 h-full bg-secondary">{children}</main>
		</div>
	);
};

export default RootLayout;
