"use client";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
	src: string;
}

const UserAvatar = () => {
	const { user } = useUser();

	return (
		<Avatar className="h-12 w-12">
			<AvatarImage src={user?.imageUrl} />
		</Avatar>
	);
};

export default UserAvatar;
