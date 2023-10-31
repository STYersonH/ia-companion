import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
	const body = await req.json(); //parsing the body of the request
	// stripe-signature is a header that stripe sends to us to verify that the request is coming from stripe
	const signature = headers().get("stripe-signature") as string;

	// Stripe sends events to your server to notify you about changes to objects in your account (like a charge being updated, a subscription being cancelled, etc.)
	let event: Stripe.Event; //event that we are going to receive from stripe

	try {
		// it is taken the body and the signature and a secret to construct the event
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!
		);
	} catch (error: any) {
		// if the event can't be verified it is going to return an error
		return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
	}

	// is extracting the session from the event
	const session = event.data.object as Stripe.Checkout.Session;

	// if the event is checkout.session.completed which means that the user has completed the checkout
	if (event.type === "checkout.session.completed") {
		// it is going to retrieve (recuperar) the subscription from stripe
		const subscription = await stripe.subscriptions.retrieve(
			session.subscription as string
		);

		// if the user id is not in the metadata of the session
		if (!session?.metadata?.userId) {
			return new NextResponse("User id is required", { status: 400 });
		}

		// in other case it is going to create a new user subscription
		await prismadb.userSubscription.create({
			data: {
				userId: session?.metadata?.userId,
				StripeSubscriptionId: subscription.id,
				StripeCustomerId: subscription.customer as string,
				StripePriceId: subscription.items.data[0].price.id,
				StripeCurrentPeriodEnd: new Date(
					subscription.current_period_end * 1000
				),
			},
		});
	}

	// if the event is invoice.payment_succeeded which means that the user has paid the invoice
	if (event.type === "invoice.payment_succeeded") {
		// it is going to retrieve (recuperar) the subscription from stripe
		const subscription = await stripe.subscriptions.retrieve(
			session.subscription as string
		);

		// it will be updated the user subscription with the new data
		await prismadb.userSubscription.update({
			where: {
				StripeCustomerId: subscription.id,
			},
			data: {
				StripePriceId: subscription.items.data[0].price.id,
				StripeCurrentPeriodEnd: new Date(
					subscription.current_period_end * 1000
				),
			},
		});
	}

	return new NextResponse(null, { status: 200 });
}
