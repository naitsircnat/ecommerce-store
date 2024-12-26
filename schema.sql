CREATE DATABASE ecommerce;

USE ecommerce;

CREATE TABLE users (
  user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name varchar(255) NOT NULL,
  last_name varchar(255),
  email varchar(255) NOT NULL,
  address varchar(500) NOT NULL
) engine=innodb;

CREATE TABLE products(
  product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name varchar(255) NOT NULL,
  price double NOT NULL 
) engine=innodb;

CREATE TABLE orders(
  order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date_time datetime NOT NULL,
  user_id INT UNSIGNED,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) engine=innodb;

CREATE TABLE order_details(
  order_detail_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
)engine=innodb;