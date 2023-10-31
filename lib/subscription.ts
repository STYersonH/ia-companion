import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
	const { userId } = auth();

	if (!userId) {
		return false;
	}

	const userSubscription = await prismadb.userSubscription.findUnique({
		where: {
			userId: userId,
		},
		// select is used to only return the fields we need
		select: {
			StripeCurrentPeriodEnd: true,
			StripeCustomerId: true,
			StripePriceId: true,
			StripeSubscriptionId: true,
		},
	});

	if (!userSubscription) {
		return false;
	}

	const isValid =
		userSubscription.StripePriceId &&
		//expression gets the timestamp of the StripeCurrentPeriodEnd date and adds one day's worth of milliseconds to it
		//The ! operator is used to force the result of the expression to be a number, even if getTime() returns null or undefined.
		userSubscription.StripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
			Date.now();

	return !!isValid; // !! is used to force the result to be a boolean
};
