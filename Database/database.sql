
-- create database studxchange;

-- use studxchange;

-- CREATE TABLE users (
--   id         INT AUTO_INCREMENT PRIMARY KEY,
--   name       VARCHAR(100)        NOT NULL,
--   email      VARCHAR(100) UNIQUE NOT NULL,
--   password   VARCHAR(255)        NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- CREATE TABLE products (
--   id             INT AUTO_INCREMENT PRIMARY KEY,
--   title          VARCHAR(255)  NOT NULL,
--   price          INT           NOT NULL,
--   category       VARCHAR(100),
--   condition_type VARCHAR(100),
--   description    TEXT,
--   contact        VARCHAR(50),
--   seller_name    VARCHAR(100),
--   seller_email   VARCHAR(100),
--   seller_id      INT,
--   image          LONGTEXT,
--   created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
-- );

-- CREATE TABLE wishlist (
--   id         INT AUTO_INCREMENT PRIMARY KEY,
--   user_id    INT NOT NULL,
--   product_id INT NOT NULL,
--   UNIQUE (user_id, product_id),
--   FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
--   FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
-- );

-- CREATE TABLE chat_requests (
--   id          INT AUTO_INCREMENT PRIMARY KEY,
--   sender_id   INT NOT NULL,
--   receiver_id INT NOT NULL,
--   product_id  INT NOT NULL,
--   status      VARCHAR(20) DEFAULT 'pending',
--   created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (sender_id)   REFERENCES users(id)    ON DELETE CASCADE,
--   FOREIGN KEY (receiver_id) REFERENCES users(id)    ON DELETE CASCADE,
--   FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE
-- );

-- CREATE TABLE messages (
--   id         INT AUTO_INCREMENT PRIMARY KEY,
--   sender_id  INT  NOT NULL,
--   receiver_id INT NOT NULL,
--   product_id INT  NOT NULL,
--   message    TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (sender_id)   REFERENCES users(id)    ON DELETE CASCADE,
--   FOREIGN KEY (receiver_id) REFERENCES users(id)    ON DELETE CASCADE,
--   FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE
-- );

-- CREATE TABLE rent_items (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   title        VARCHAR(255)  NOT NULL,
--   category     VARCHAR(100),
--   description  TEXT,
--   contact      VARCHAR(20),
--   rent_per_day INT           NOT NULL,
--   deposit      INT           DEFAULT 0,
--   seller_name  VARCHAR(100),
--   seller_email VARCHAR(100),
--   seller_id    INT,
--   image        LONGTEXT,
--   is_available TINYINT(1)    DEFAULT 1,
--   created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
-- );