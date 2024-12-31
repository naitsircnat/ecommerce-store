const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const { createConnection } = require("mysql2/promise");

let app = express();

app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

const helpers = require("handlebars-helpers");

helpers({
  handlebars: hbs.handlebars,
});

let connection;

async function main() {
  connection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });

  app.get("/products", async (req, res) => {
    let [products] = await connection.execute("SELECT * FROM products");

    res.render("products", {
      products: products,
    });
  });

  app.get("/orders", async (req, res) => {
    let [orders] = await connection.execute(
      "SELECT * FROM orders JOIN users ON orders.user_id=users.user_id"
    );

    res.render("orders", {
      orders: orders,
    });
  });

  app.get("/order_details", async (req, res) => {
    let [order_details] = await connection.execute(
      "SELECT * FROM order_details JOIN orders ON order_details.order_id=orders.order_id JOIN products ON order_details.product_id=products.product_id ORDER BY order_detail_id"
    );

    res.render("order_details", {
      order_details: order_details,
    });
  });

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
}

main();

app.listen(3000, () => {
  console.log("Server started");
});

/*
R
- display products table X
- display orders & users (table join) X
- display order details table 
- search order details table

C
- create order
- create order detail

U
- update order details

D
- delete order details

Nav bar & footer;
ui/ux - actual interface for search/edit/delete?
*/
