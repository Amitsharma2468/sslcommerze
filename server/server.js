const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

const SSLCommerzPayment = require("sslcommerz-lts");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sslcommerz_db",
});

const store_id = process.env.NEXT_PUBLIC_SSL_STORE_ID;
const store_passwd = process.env.NEXT_PUBLIC_SSL_STORE_PASSWORD;
const is_live = false;

app.get("/", (req, res) => {
  res.send({ store_id, store_passwd });
});

app.post("/init", async (req, res) => {
  const { amount, currency, fail_url, cancel_url } = req.body;
  const tran_id = `TRANS_${Date.now()}`;
  const data = {
    store_id,
    store_passwd,
    total_amount: amount,
    cus_email: "customer@example.com",
    cus_phone: "01711111111",
    shipping_method: "NO",
    product_name: "Registration",
    product_category: "N/A",
    product_profile: "Ticket",
    currency,
    tran_id,
    success_url: `http://localhost:5000/success/${tran_id}`,
    fail_url: `http://localhost:5000/fail`,
    cancel_url: `http://localhost:5000/fail`,
    emi_option: 0,
  };
  try {
    const query = `INSERT INTO bills (transaction_id, status, amount, currency) VALUES ('${data.tran_id}','pending',${data.total_amount},'${currency}')`;
    console.log(query);
    await db.execute(query);
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((apiResponse) => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL;
      res.send({ url: GatewayPageURL });
      console.log("Redirecting to: ", GatewayPageURL);
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.post("/success/:tran_id", async (req, res) => {
  const { tran_id } = req.params;
  try {
    const query = `UPDATE bills SET status = 'successfull' WHERE transaction_id = '${tran_id}'`;
    await db.execute(query);
    res.redirect("http://localhost:3000/success");
  } catch (error) {
    res.send(error);
  }
});

app.post("/fail", (req, res) => {
  res.redirect("http://localhost:3000/fail");
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
