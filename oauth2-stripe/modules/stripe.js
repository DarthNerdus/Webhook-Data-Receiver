const fs = require('fs');
const ini = require('ini');
const axios = require('axios');
const Discord = require('discord.js');
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

const stripe_js = require('stripe')(config.STRIPE.live_sk);

const stripe = {};

stripe.customerList = async (database) => {
  const allNewCustomers = await stripe_js.customers.list({limit: 100})
  .autoPagingToArray({limit: 10000});

  console.log(allNewCustomers.length);

}

// https://stripe.com/docs/payments/checkout/client
stripe.checkout = () => {
  stripe_js.redirectToCheckout({
    items: [
      // Replace with the ID of your SKU
      {sku: 'sku_123', quantity: 1}
    ],
    successUrl: 'https://your-website.com/success',
    cancelUrl: 'https://your-website.com/canceled',
    customerEmail: 'customer@example.com'
  }).then(function (result) {
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `result.error.message`.
  });
}

stripe.webhookParse = (data) => {
  console.log(data);
}

// EXPORT OAUTH2
module.exports = stripe;
