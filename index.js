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

  // VIEW USERS
  app.get("/users", async (req, res) => {
    let [users] = await connection.execute("SELECT * FROM users");

    res.render("users", {
      users: users,
    });
  });

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
    try {
      const user_id = req.body.user_id;

      if (!user_id) {
        return res.status(400).send(`
        <script>
          alert("Customer's user ID is required.");
          window.history.back();
        </script>
      `);
      }

      const existingUser = "SELECT * FROM users WHERE user_id=?";
      const [user] = await connection.execute(existingUser, [user_id]);

      if (user.length == 0) {
        return res.status(400).send(
          `
          <script>
            alert("Please enter a valid User ID")
            window.history.back();
          </script>
          `
        );
      }

      let query = "INSERT INTO orders (date_time, user_id) VALUES (NOW(), ?)";

      let bindings = [user_id];

      await connection.execute(query, bindings);

      res.redirect("/orders");
    } catch (error) {
      console.error("Error creating order: ", error);
      res.status(500).send("Internal server error.");
    }
  });

  // CREATE ORDER DETAILS
  app.get("/order_details/create", async (req, res) => {
    res.render("create_order_details");
  });

  app.post("/order_details/create", async (req, res) => {
    try {
      const { order_id, product_id, quantity } = req.body;

      if (!order_id) {
        return res.status(400).send(`
        <script>
          alert("Order ID is required.");
          window.history.back();
        </script>
      `);
      }

      if (!product_id) {
        return res.status(400).send(`
        <script>
          alert("Product ID is required.");
          window.history.back();
        </script>
      `);
      }

      if (!quantity) {
        return res.status(400).send(`
        <script>
          alert("Quantity is required.");
          window.history.back();
        </script>
      `);
      }

      const orderIdCheck = "SELECT * FROM orders WHERE order_id=?";

      const [orderId] = await connection.execute(orderIdCheck, [order_id]);

      if (orderId.length == 0) {
        return res.status(400).send(
          `
        <script>
          alert("Please enter a valid Order ID.")
          window.history.back();
        </script>
        `
        );
      }

      const productIdCheck = "SELECT * FROM products WHERE product_id=?";

      const [productId] = await connection.execute(productIdCheck, [
        product_id,
      ]);

      if (productId.length == 0) {
        return res.status(400).send(
          `
        <script>
          alert("Please enter a valid Product ID.")
          window.history.back();
        </script>
        `
        );
      }

      let query =
        "INSERT INTO order_details (order_id, product_id, quantity) VALUES (?,?,?)";

      let bindings = [order_id, product_id, quantity];

      await connection.execute(query, bindings);

      res.redirect("/order_details");
    } catch (error) {
      console.error("Error creating order detail: ", error);
      res.status(500).send("Internal server error.");
    }
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
    try {
      const order_detail_id = req.params.order_detail_id;

      const { order_id, product_id, quantity } = req.body;

      if (!order_id) {
        return res.status(400).send(`
        <script>
          alert("Order ID is required.");
          window.history.back();
        </script>
      `);
      }

      if (!product_id) {
        return res.status(400).send(`
        <script>
          alert("Product ID is required.");
          window.history.back();
        </script>
      `);
      }

      if (!quantity) {
        return res.status(400).send(`
        <script>
          alert("Quantity is required.");
          window.history.back();
        </script>
      `);
      }

      const orderIdCheck = "SELECT * FROM orders WHERE order_id=?";

      const [orderId] = await connection.execute(orderIdCheck, [order_id]);

      if (orderId.length == 0) {
        return res.status(400).send(
          `
        <script>
          alert("Please enter a valid Order ID.")
          window.history.back();
        </script>
        `
        );
      }

      const productIdCheck = "SELECT * FROM products WHERE product_id=?";

      const [productId] = await connection.execute(productIdCheck, [
        product_id,
      ]);

      if (productId.length == 0) {
        return res.status(400).send(
          `
        <script>
          alert("Please enter a valid Product ID.")
          window.history.back();
        </script>
        `
        );
      }

      let query =
        "UPDATE order_details SET order_id=?, product_id=?, quantity=? WHERE order_detail_id=?";

      let bindings = [order_id, product_id, quantity, order_detail_id];

      await connection.execute(query, bindings);

      res.redirect("/order_details");
    } catch (error) {
      console.error("Error updating order detail: ", error);
      res.status(500).send("Internal server error.");
    }
  });

  // DELETE ORDER
  app.get("/orders/:order_id/delete", async (req, res) => {
    const order_id = req.params.order_id;

    res.render("delete_order", {
      order_id: order_id,
    });
  });

  app.post("/orders/:order_id/delete", async (req, res) => {
    try {
      const order_id = req.params.order_id;

      const existingOrderDetails =
        "SELECT * FROM order_details WHERE order_id=?";

      const orderDetails = await connection.execute(existingOrderDetails, [
        order_id,
      ]);

      if (orderDetails.length > 0) {
        return res.status(400).send(`<script>
          alert("Please delete all corresponding order details first");
          window.location.href="/order_details"
          </script>`);
      }

      let query = "DELETE FROM orders WHERE order_id=?";

      let bindings = [order_id];

      await connection.execute(query, bindings);

      res.redirect("/orders");
    } catch (error) {
      console.error("Error deleting order: ", error);
      res.status(500).send("Internal server error.");
    }
  });

  // DELETE ORDER DETAIL
  app.get("/order_details/:order_detail_id/delete", async (req, res) => {
    const order_detail_id = req.params.order_detail_id;

    res.render("delete_order_detail", {
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
- Add ability to delete order
- Solve footer issue
- create folders for hbs files
*/
