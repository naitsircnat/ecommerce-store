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
  // for running locally
  connection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });

  // for connecting to aiven
  // connection = await createConnection({
  //   host: process.env.DB_HOST,
  //   port: process.env.DB_PORT,
  //   user: process.env.DB_USER,
  //   database: process.env.DB_NAME,
  //   password: process.env.DB_PASSWORD,
  // });

  // VIEW PRODUCTS
  app.get("/products", async (req, res) => {
    let [products] = await connection.execute("SELECT * FROM products");

    res.render("products", {
      products: products,
    });
  });

  // VIEW ORDERS
  app.get("/orders", async (req, res) => {
    let [orders] = await connection.execute(
      "SELECT * FROM orders JOIN users ON orders.user_id=users.user_id ORDER BY order_id"
    );

    res.render("orders", {
      orders: orders,
    });
  });

  // VIEW/SEARCH ORDER DETAILS
  app.get("/order_details", async (req, res) => {
    let query =
      "SELECT * FROM order_details JOIN orders ON order_details.order_id=orders.order_id JOIN products ON order_details.product_id=products.product_id WHERE 1";

    let bindings = [];

    const { order_detail_id, order_id, product_id, name } = req.query;

    if (order_detail_id) {
      query += " AND order_detail_id=?";
      bindings.push(order_detail_id);
    }

    if (order_id) {
      query += " AND orders.order_id=?";
      bindings.push(order_id);
    }

    if (product_id) {
      query += " AND order_details.product_id=?";
      bindings.push(product_id);
    }

    if (name) {
      query += " AND name LIKE ?";
      bindings.push("%" + name + "%");
    }

    query += " ORDER BY order_detail_id";

    const [order_details] = await connection.execute(query, bindings);

    res.render("order_details", {
      order_details: order_details,
      searchTerms: req.query,
    });
  });

  // CREATE ORDER
  app.get("/orders/create", async (req, res) => {
    res.render("create_order");
  });

  app.post("/orders/create", async (req, res) => {
    const user_id = req.body.user_id;

    let query = "INSERT INTO orders (date_time, user_id) VALUES (NOW(), ?)";

    let bindings = [user_id];

    await connection.execute(query, bindings);

    res.redirect("/orders");
  });

  // CREATE ORDER DETAILS
  app.get("/order_details/create", async (req, res) => {
    res.render("create_order_details");
  });

  app.post("/order_details/create", async (req, res) => {
    const { order_id, product_id, quantity } = req.body;

    let query =
      "INSERT INTO order_details (order_id, product_id, quantity) VALUES (?,?,?)";

    let bindings = [order_id, product_id, quantity];

    await connection.execute(query, bindings);

    res.redirect("/order_details");
  });

  // UPDATE ORDER DETAILS
  app.get("/order_details/:order_detail_id/update", async (req, res) => {
    const order_detail_id = req.params.order_detail_id;

    let query = "SELECT * FROM order_details WHERE order_detail_id=?";

    let bindings = [order_detail_id];

    let [order_details] = await connection.execute(query, bindings);

    let order_detail = order_details[0];

    res.render("update_order_details", {
      order_detail: order_detail,
    });
  });

  app.post("/order_details/:order_detail_id/update", async (req, res) => {
    const order_detail_id = req.params.order_detail_id;

    const { order_id, product_id, quantity } = req.body;

    let query =
      "UPDATE order_details SET order_id=?, product_id=?, quantity=? WHERE order_detail_id=?";

    let bindings = [order_id, product_id, quantity, order_detail_id];

    await connection.execute(query, bindings);

    res.redirect("/order_details");
  });

  // DELETE ORDER DETAIL
  app.get("/order_details/:order_detail_id/delete", async (req, res) => {
    const order_detail_id = req.params.order_detail_id;

    res.render("delete", {
      order_detail_id: order_detail_id,
    });
  });

  app.post("/order_details/:order_detail_id/delete", async (req, res) => {
    const order_detail_id = req.params.order_detail_id;

    let query = "DELETE FROM order_details WHERE order_detail_id=?";

    let bindings = [order_detail_id];

    await connection.execute(query, bindings);

    res.redirect("/order_details");
  });

  // TEST
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
}

main();

app.listen(3000, () => {
  console.log("Server started");
});

/*
Other follow-ups:
- Solve footer issue
- Add error handling
- Add other functions
- create folders for hbs files?
*/
