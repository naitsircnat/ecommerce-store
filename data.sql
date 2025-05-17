-- Add users
INSERT INTO users (first_name, last_name, email, address) VALUES ('Paul', 'Lee', 'paul@mail.com', '16 Exeter Road, #02-22');

INSERT INTO users(first_name, last_name, email, address) VALUES ('Mary', 'Low', 'mary@mail.com', '45 Chester Road, #03-16');

INSERT INTO users (first_name, last_name, email, address) VALUES ('Edward', 'Thomas', 'edward@mail.com', '789 Berkshire Road, #17-21');

-- Add products
INSERT INTO products (name, price) VALUES ('MacBook Air 13-inch', 1099);
INSERT INTO products (name, price) VALUES ('Sony 1000XM5 Headphones', 399.90);
INSERT INTO products (name, price) VALUES ('Logitech MX Master 2S Mouse', 59.90);
INSERT INTO products (name, price) VALUES ('Apple Watch Series 10', 699.90);
INSERT INTO products (name, price) VALUES ('Google Pixel 8a', 499.90);

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









