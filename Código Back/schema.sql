-- ============================================================
-- Moda Luxo — Schema do banco de dados
-- ============================================================

CREATE DATABASE IF NOT EXISTS modaluxo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE modaluxo;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  location      VARCHAR(100)  DEFAULT '',
  bio           TEXT,
  member_since  YEAR          DEFAULT (YEAR(NOW())),
  verified      TINYINT(1)    DEFAULT 0,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)   NOT NULL,
  brand       VARCHAR(100)   NOT NULL,
  category    VARCHAR(50)    NOT NULL,
  size        VARCHAR(20)    NOT NULL,
  `condition` VARCHAR(50)    NOT NULL,
  price       DECIMAL(10,2)  NOT NULL,
  description TEXT,
  seller_id   INT            NOT NULL,
  featured    TINYINT(1)     DEFAULT 0,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de imagens dos produtos
CREATE TABLE IF NOT EXISTS product_images (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT          NOT NULL,
  url        VARCHAR(500) NOT NULL,
  is_primary TINYINT(1)   DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
