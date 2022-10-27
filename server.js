const express = require("express");
var cors = require("cors");
const app = express();
console.log("qfds");
app.use(
  cors({
    origin: function (origin, callback) {
      console.log(origin);
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // if (allowedOrigins.indexOf(origin) === -1) {
      //   var msg = "The CORS policy for this site does not " + "allow access from the specified Origin.";
      //   return callback(new Error(msg), false);
      // }
      return callback(null, true);
    },
  })
);

// This is your test secret API key.
const stripe = require("stripe")(
  "sk_test_51IDktyE7AIWtSuboKuko4lMcEp96iUJE3Ql8NX4snql4fpdVOFJhBuSmawAiZQ4tIwCdwKjLKGzKiVrn5wjBbvmE006ywBpZIC"
);

app.use(express.static("public"));
app.use(express.json());
const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.get("/", (req, res) => {
  return res.send("Hello World");
});

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
