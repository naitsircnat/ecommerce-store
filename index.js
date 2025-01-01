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

  // SEARCH
  app.get("/order_details", async (req, res) => {
    let query =
      "SELECT * FROM order_details JOIN orders ON order_details.order_id=orders.order_id JOIN products ON order_details.product_id=products.product_id WHERE 1";

    let bindings = [];

    const { order_detail_id, order_id, name } = req.query;

    if (order_detail_id) {
      query += " AND order_detail_id=?";
      bindings.push(order_detail_id);
    }

    if (order_id) {
      query += " AND orders.order_id=?";
      bindings.push(order_id);
    }

    if (name) {
      query += " AND name LIKE ?";
      bindings.push("%" + name + "%");
    }

    console.log("query params:", { order_id, name });

    const [order_details] = await connection.execute(query, bindings);

    res.render("order_details", {
      order_details: order_details,
      searchTerms: req.query,
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
- display order details table X
- search order details table ..

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
