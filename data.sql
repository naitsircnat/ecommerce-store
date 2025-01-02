USE ecommerce;

-- Add users
INSERT INTO users (first_name, last_name, email, address) VALUES ("Roger", "Tan", "roger@roger.com", "123 Roger Road, #02-22");

INSERT INTO users(first_name, last_name, email, address) VALUES ("Mary", "Low", "mary@mary.com", "456 Mary Road, #03-33");

INSERT INTO users (first_name, last_name, email, address) VALUES ("Robert", "Yeo", "robert@robert.com", "789 Robert Road, #-04-44");

-- Add products
INSERT INTO products (name, price) VALUES ("MacBook Air 13-inch", 999.90);
INSERT INTO products (name, price) VALUES ("Sony 1000XM5 Headphones", 299.90);
INSERT INTO products (name, price) VALUES ("Logitech Mouse", 19.90);
INSERT INTO products (name, price) VALUES ("Apple Watch Series 10", 799.90);
INSERT INTO products (name, price) VALUES ("Google Pixel 8a", 799.90);

-- Add orders
INSERT INTO orders (date_time, user_id) VALUES (NOW(),1);
INSERT INTO orders (date_time, user_id) VALUES (NOW(),2);
INSERT INTO orders (date_time, user_id) VALUES (NOW(),3);

-- Add order details
INSERT INTO order_details (order_id, product_id, quantity) VALUES (1, 1, 2);
INSERT INTO order_details (order_id, product_id, quantity) VALUES (1, 2, 3);
INSERT INTO order_details (order_id, product_id, quantity) VALUES (2, 2, 2);
INSERT INTO order_details (order_id, product_id, quantity) VALUES (2, 3, 1);
INSERT INTO order_details (order_id, product_id, quantity) VALUES (3, 1, 4);
INSERT INTO order_details (order_id, product_id, quantity) VALUES (3, 2, 1);
INSERT INTO order_details (order_id, product_id, quantity) VALUES (3, 3, 2);









