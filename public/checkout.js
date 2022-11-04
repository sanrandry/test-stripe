// This is your test publishable API key.
const stripe = Stripe(
  'pk_test_51IDktyE7AIWtSubop2BSH1zJzWzuISyHYqR6HBk8fpfJIFD5y69ObJQFw8mk1KyRqOROenkGyb4xHvp1VCfgTzX600zBI0WDPh'
);

// The items the customer wants to buy
const items = [{ id: 'xl-tshirt' }];

let elements;

initialize();
checkStatus();

document.querySelector('#payment-form').addEventListener('submit', handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {
  const response = await fetch('http://localhost:4242/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'none',
    variables: {
      fontSize: '100px',
      color: '#32325d',
      colorBackground: '#F6F8FA',
      colorPrimaryText: '#262626',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
    },
    rules: {
      '.Input': {
        backgroundColor: '#ffffff',
        boxShadow: 'inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080',
      },
      '.Input--invalid': {
        color: '#DF1B41',
      },
      // ".Tab, .Block": {
      //   boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
      // },
      '.Tab:hover': {
        backgroundColor: '#eee',
      },
      '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
        backgroundColor: '#ccc',
      },
    },
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElement = elements.create('payment', {
    // fields: {
    //   billingDetails: {
    //     address: {
    //       country: "never",
    //     },
    //   },
    // },
  });
  paymentElement.mount('#payment-element');
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const postal_code = document.querySelector('#postal_code').value;

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: 'http://localhost:4242/checkout.html',
      payment_method_data: {
        billing_details: {
          name,
          email,
          address: { postal_code },
        },
      },
    },
    redirect: 'if_required',
  });
  console.log(error, paymentIntent);

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === 'card_error' || error.type === 'validation_error') {
    showMessage(error.message);
  } else {
    showMessage('An unexpected error occurred.');
  }

  setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case 'succeeded':
      showMessage('Payment succeeded!');
      break;
    case 'processing':
      showMessage('Your payment is processing.');
      break;
    case 'requires_payment_method':
      showMessage('Your payment was not successful, please try again.');
      break;
    default:
      showMessage('Something went wrong.');
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector('#payment-message');

  messageContainer.classList.remove('hidden');
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add('hidden');
    messageText.textContent = '';
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector('#submit').disabled = true;
    document.querySelector('#spinner').classList.remove('hidden');
    document.querySelector('#button-text').classList.add('hidden');
  } else {
    document.querySelector('#submit').disabled = false;
    document.querySelector('#spinner').classList.add('hidden');
    document.querySelector('#button-text').classList.remove('hidden');
  }
}
