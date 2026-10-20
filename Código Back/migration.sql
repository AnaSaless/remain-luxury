-- Moda Luxo — Migration: novos recursos
USE modaluxo;

-- Feature 5: Status de verificação
ALTER TABLE users ADD COLUMN verification_status VARCHAR(20) DEFAULT 'none';
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0;

-- Feature 2: Favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Feature 7: Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id   INT NOT NULL,
  status     VARCHAR(20)   DEFAULT 'confirmed',
  total      DECIMAL(10,2) NOT NULL,
  shipping   DECIMAL(10,2) DEFAULT 0,
  address    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT,
  title      VARCHAR(200),
  brand      VARCHAR(100),
  price      DECIMAL(10,2) NOT NULL,
  image_url  VARCHAR(500),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Feature 4: Avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  reviewer_id INT NOT NULL,
  seller_id   INT NOT NULL,
  product_id  INT,
  rating      INT NOT NULL,
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review (reviewer_id, product_id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id)   REFERENCES users(id) ON DELETE CASCADE
);

-- Feature 3: Conversas e mensagens
CREATE TABLE IF NOT EXISTS conversations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id   INT NOT NULL,
  seller_id  INT NOT NULL,
  product_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conv (buyer_id, seller_id, product_id),
  FOREIGN KEY (buyer_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id       INT NOT NULL,
  body            TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)       REFERENCES users(id) ON DELETE CASCADE
);
