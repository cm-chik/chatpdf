//api/stripe
import { NextResponse } from "next/server";
import { getUser } from "@/lib/lucia";
import { db } from "@/lib/db";
import stripe from "@/lib/stripe";

const returnUrl = `${process.env.NEXT_BASE_URL}/`;

export async function get(req: Request, res: Response) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const _userSubscriptions = await db.query.userSubscriptions.findFirst({
      where: { userId: user.id },
    });
    if (_userSubscriptions[0] && _userSubscriptions.stripePriceId) {
      //trying to cancel at the billing portal
      const stripeSession = await stripe.BillingPortal.sessions.create({
        customer: _userSubscriptions.stripeCustomerId,
        return_url: `${returnUrl}/settings`,
      });
      return NextResponse.json({ url: stripeSession.url });
    }
    const stripeSession = await stripe.BillingPortal.sessions.create({
      success_url: returnUrl,
      return_url: returnUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email,
      line_items: {
        price_data: {
          currency: "USD",
          product_data: {
            name: "ChatPDF Pro",
            description: "Unlimited PDF uploads",
          },
          unit_amount: 2000,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
      metadata: {
        userId: user.id,
      },
    });
    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}