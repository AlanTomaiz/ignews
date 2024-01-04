import { query as Query } from 'faunadb';
import { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "next-auth/react";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

interface IUser {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string;
  }
}

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method !== 'POST') {
    return response
      .setHeader('Allow', 'POST')
      .status(405)
      .end('Method not allowed');
  }

  const session = await getSession({ req: request });;

  const user = await fauna.query<IUser>(
    Query.Get(
      Query.Match(
        Query.Index('user_by_email'),
        Query.Casefold(session.user.email)
      )
    )
  );

  let customerId = user.data.stripe_customer_id;
  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      name: session.user.name,
      email: session.user.email,
    });

    await fauna.query(
      Query.Update(
        Query.Ref(Query.Collection('users'), user.ref.id),
        {
          data: { stripe_customer_id: stripeCustomer.id }
        }
      )
    );

    customerId = stripeCustomer.id;
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    allow_promotion_codes: true,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    success_url: `${process.env.BASE_URL}/posts`,
    cancel_url: process.env.BASE_URL,
    customer: customerId,
    line_items: [
      { price: process.env.STRIPE_PRODUCT_ID, quantity: 1 }
    ]
  });

  return response.json({ sessionId: stripeCheckoutSession.id });
}