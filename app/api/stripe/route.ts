import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
	try {
		const { userId } = auth(); //returns an object that contains information about the authenticated user
		const user = await currentUser(); // returns an object that represents the current user, such as their profile information or subscription status.

		if (!userId || !user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// only when the usr is logged in
		const userSubscription = await prismadb.userSubscription.findUnique({
			where: {
				userId,
			},
		});

		// if exist an stripe customer id it creates a new Stripe billing portal sesion for the customer
		if (userSubscription && userSubscription.StripeCustomerId) {
			const stripeSession = await stripe.billingPortal.sessions.create({
				customer: userSubscription.StripeCustomerId,
				return_url: settingsUrl,
			});

			// returns a response containing the URL of the Stripe billing portal session
			return new NextResponse(JSON.stringify({ url: stripeSession.url }));
		}

		// if no userSubscription with a StripeCustomerId is found, it creates a new Stripe checkout session
		const stripeSession = await stripe.checkout.sessions.create({
			success_url: settingsUrl, // redirect to settingsUrl if the payment is successful
			cancel_url: settingsUrl, // redirect to settingsUrl if the payment is canceled
			payment_method_types: ["card"], // only accept credit cards
			mode: "subscription", // checkout session is for a subscription product
			billing_address_collection: "auto", //with this Stripe will automatically collect the customer's billing address
			customer_email: user.emailAddresses[0].emailAddress, //it grabs the first email in the user's emailAddresses array and uses it as the customer's email address

			//this array specifies the products that the customer is purchasing
			line_items: [
				{
					// information about the product's price
					price_data: {
						currency: "USD", // the currency of the price
						// information about the product
						product_data: {
							name: "Companion Pro",
							description: "Create Custom AI companions",
						},
						unit_amount: 999, // the price in cents
						// this especifies that the product is a subscription that renews every month
						recurring: {
							interval: "month",
						},
					},
					quantity: 1,
				},
			],
			// if we don't put the metadata the web hook and you will have no idea who actually subscribed and whom have to create the user subscription database column
			metadata: {
				userId,
			},
		});

		return new NextResponse(JSON.stringify({ url: stripeSession.url }));
	} catch (error) {
		console.log("[STRIPE_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
