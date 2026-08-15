import { Router } from "express";
import Stripe from "stripe";
import { authenticateToken } from "../middleware/authMiddleware.js";
import AppDataSource from "../config/database.js";
import UserSchema from "../models/UserSchema.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const user = await userRepository.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    user.subscription_tier = "premium";
    await userRepository.save(user);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_mock",
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: user.id.toString(),
        email: user.email,
      },
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/search?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/search?payment=cancel`,
    });

    return res.json({ id: session.id, url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const userRepository = AppDataSource.getRepository(UserSchema);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const stripeCustomerId = session.customer;

    if (userId) {
      const user = await userRepository.findOne({ where: { id: parseInt(userId, 10) } });
      if (user) {
        user.subscription_tier = "premium";
        user.stripe_customer_id = stripeCustomerId;
        await userRepository.save(user);
      }
    }
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const stripeCustomerId = subscription.customer;

    if (stripeCustomerId) {
      const user = await userRepository.findOne({ where: { stripe_customer_id: stripeCustomerId } });
      if (user) {
        user.subscription_tier = "free";
        await userRepository.save(user);
      }
    }
  }

  return res.json({ received: true });
});

export default router;
