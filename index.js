require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const cors = require("cors");

// Middleware setup
app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check endpoint (isteğe bağlı ama faydalı)
app.get("/", (_, res) => res.send("Stripe backend is running."));

// Checkout session oluşturma
app.post("/create-checkout-session", async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid or missing amount." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Car Reservation" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: "https://montclairblackcarservice.com/success.html",
      cancel_url: "https://montclairblackcarservice.com/cancel.html",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    return res.status(500).json({ error: "Stripe session creation failed." });
  }
});

// Server başlatma
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
