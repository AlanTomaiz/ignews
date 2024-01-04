import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";

import { saveSubscription } from "../../../_lib/managerSubscription";
import { stripe } from "../../../services/stripe";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  // 'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method !== 'POST') {
    return response
      .setHeader('Allow', 'POST')
      .status(405)
      .end('Method not allowed');
  }

  let event: Stripe.Event;

  try {
    const stream = await buffer(request);
    const signature = request.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(stream, signature, process.env.STRIPE_WEBHOOK_KEY);
  } catch (error) {
    return response.status(400).send(`Webhook ${error}`);
  }

  const { type } = event;

  if (!relevantEvents.has(type)) {
    return response.json({ received: true });
  }

  try {
    switch (type) {
      // case 'checkout.session.completed':
      //   const checkoutSession = event.data.object as Stripe.Checkout.Session;

      //   await saveSubscription(
      //     checkoutSession.subscription.toString(),
      //     checkoutSession.customer.toString()
      //   );

      //   break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;

        await saveSubscription(
          subscription.id,
          subscription.customer.toString(),
          type === 'customer.subscription.created'
        );

        break;
      default:
        throw new Error('Unhandled event.');
    }
  } catch {
    return response.json({ error: 'Webhook handler failed.' });
  }

  return response.json({ received: true });
}