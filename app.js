const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AYwFEHt1vqUFPl3CVbkvy8KwalPheQKK2uhJW0-06KlWzXPSGh0U3L1JGPviRiZOGsRHHJ9pWtET1IYi",
  client_secret:
    "ECZgiA5JxS2_sRe5bJYc7RKoFTsFyWdl4XmVdAjm3-j8mWwb6vWfJy0j289nS2PY6gd0xrsg3Z7Yyg4w"
});

//1.Rota inicial
app.get("/", (req, res) => {
  res.render("index");
});

//2.Rota do paypal, retorna os dados da compra no console.log
//Clicando no botão irá para o redirect da url
app.get("/paypal", (req, res) => {
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    //3. redirect da url -> login do paypal
    //4. mostra os dados da compra
    //5. clicando em continuar -> irá para pagina de success.
    redirect_urls: {
      return_url: "http://localhost:3008/success",
      cancel_url: "http://localhost:3008/cancel"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "item",
              sku: "item",
              price: "1.00",
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          currency: "USD",
          total: "1.00"
        },
        description: "This is the payment description."
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      // res.send("OK");
      res.redirect(payment.links[1].href);
    }
  });
});

app.get("/success", (req, res) => {
  // res.send("Success");
  var PayerID = req.query.PayerID;
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "1.00"
        }
      }
    ]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
      res.render("success");
    }
  });
});

app.get("/cancel", (req, res) => {
  res.render("cancel");
});

app.listen(3008, () => {
  console.log("Server is running");
});

// Create Payment Response
// { id: 'PAYID-LUKMGMY18948251YV811002X',
//   intent: 'sale',
//   state: 'created',
//   payer: { payment_method: 'paypal' },
//   transactions:
//    [ { amount: [Object],
//        description: 'This is the payment description.',
//        item_list: [Object],
//        related_resources: [] } ],
//   create_time: '2019-06-27T13:22:58Z',
//   links:
//    [ { href: 'https://api.sandbox.paypal.com/v1/payments/payment/PAYID-LUKMGMY18948251YV811002X',
//        rel: 'self',
//        method: 'GET' },
//      { href: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-3PE97426767977711',
//        rel: 'approval_url',
//        method: 'REDIRECT' },
//      { href: 'https://api.sandbox.paypal.com/v1/payments/payment/PAYID-LUKMGMY18948251YV811002X/execute',
//        rel: 'execute',
//        method: 'POST' } ],
//   httpStatusCode: 201 }
