-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: modaluxo
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `modaluxo`
--

/*!40000 DROP DATABASE IF EXISTS `modaluxo`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `modaluxo` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `modaluxo`;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conv` (`buyer_id`,`seller_id`,`product_id`),
  KEY `seller_id` (`seller_id`),
  KEY `fk_conv_product` (`product_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,5,4,1,'2026-06-11 16:11:11'),(2,9,5,5,'2026-06-11 17:36:05'),(3,9,5,6,'2026-06-11 23:13:58');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fav` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,5,'oi','2026-06-11 16:11:14'),(2,2,9,'Essa peca e muito interessante. Gostaria de saber se entrega no meu endereco rua joao andrade 19000','2026-06-11 17:36:58');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `fk_oi_product` (`product_id`),
  CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,5,'Scarpin Pumps 85mm','Christian Louboutin',3200.00,'https://placehold.co/600x750/0d0d0d/ac872a?text=Christian%20Louboutin'),(2,1,6,'Clutch Minaudière','Bottega Veneta',9500.00,'https://placehold.co/600x750/0d0d0d/ac872a?text=Bottega%20Veneta');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'confirmed',
  `total` decimal(10,2) NOT NULL,
  `shipping` decimal(10,2) DEFAULT '0.00',
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_total` CHECK ((`total` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,9,'confirmed',12700.00,0.00,'rua bulevart 10000000000','2026-06-11 17:39:04');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (10,1,'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=750&fit=crop&q=80',1),(11,1,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop&q=80',0),(12,3,'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=750&fit=crop&q=80',1),(13,4,'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop&q=80',1),(14,2,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=750&fit=crop&q=80',1),(15,5,'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&h=750&fit=crop&q=80',1),(16,6,'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=750&fit=crop&q=80',1),(17,7,'https://images.unsplash.com/photo-1624222247344-550fb60fe261?w=600&h=750&fit=crop&q=80',1),(18,8,'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=750&fit=crop&q=80',1);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `seller_id` int NOT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_price` CHECK ((`price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Bolsa Kelly 25','Hermès','bolsas','Único','Excelente',48000.00,'Kelly 25 em couro Togo preto com ferragens douradas. Acompanha cadeado, chave, chuva e alça. Adquirida na boutique de Paris em 2019. Raramente usada.',4,0,'2026-06-11 16:07:32'),(2,'Sapatilha Ballet Flat','Chanel','sapatos','37','Muito bom',4200.00,'Sapatilha clássica bicolor bege e preta com biqueira cap-toe. Couro legítimo, solado interno em couro. Usada poucas vezes, sem reparos.',5,0,'2026-06-11 16:07:42'),(3,'Casaco Teddy','Totème','roupas','S','Como novo',3800.00,'Casaco oversized em faux fur branco. Modelagem relaxada, fechamento por botões ocultos. Lavagem a seco. Peça da coleção AW23.',4,0,'2026-06-11 16:20:01'),(4,'Blazer Oversized','Saint Laurent','roupas','38','Muito bom',5800.00,'Blazer em lã preta com ombros estruturados. Modelagem masculinizada com lapela em pico. Duas fileiras de botões dourados.',4,0,'2026-06-11 16:20:01'),(5,'Scarpin Pumps 85mm','Christian Louboutin','sapatos','38','Bom',3200.00,'Scarpin clássico em couro preto com salto agulha 85mm. Sola vermelha característica. Palmilha renovada. Pequenos riscos no salto.',5,0,'2026-06-11 16:20:16'),(6,'Clutch Minaudière','Bottega Veneta','bolsas','Único','Excelente',9500.00,'Clutch intrecciato em couro preto. Interior em suede. Fecho magnético. Peça icônica da marca, em perfeito estado.',5,0,'2026-06-11 16:20:16'),(7,'Cinto Monograma','Louis Vuitton','acessorios','80','Bom',2600.00,'Cinto clássico monogram com fivela dourada. Largura 3,5 cm. Acompanha caixa e dustbag originais. Pequenos sinais de uso natural.',6,0,'2026-06-11 16:20:16'),(8,'Óculos Cat-Eye','Celine','acessorios','Único','Como novo',2100.00,'Armação acetato preto com lentes degradê. Acompanha estojo e pano originais. Sem riscos nas lentes.',6,0,'2026-06-11 16:20:16');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reviewer_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review` (`reviewer_id`,`product_id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `member_since` year DEFAULT (year(now())),
  `verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verification_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `is_admin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Isabela Monteiro','isabela@demo.com','$2b$10$pQGkKb0Y5gTfyeo9ehBKaOPuk1IS9n3W8TA7eO9c/szU2zCOv5go6','',NULL,2026,0,'2026-05-30 00:16:51','none',0),(2,'Ana','usuario2@modaluxo.com','$2b$10$ZqWo9/7NCeHNZKQniETva.ZuMtPks3ab7XaFmuzVYj3xSH/cx8PCi','',NULL,2026,0,'2026-05-30 00:24:39','none',0),(3,'Teste User','teste@test.com','$2b$10$L/AeO3k5fQqusP3JVfPy5e2cqDJlkmoAZsZZFQlQGLMHXVPbiSlV.','',NULL,2026,0,'2026-06-11 03:24:21','pending',0),(4,'Isabela Monteiro','isabela@modaluxo.com','$2b$10$ZqWo9/7NCeHNZKQniETva.ZuMtPks3ab7XaFmuzVYj3xSH/cx8PCi','',NULL,2026,0,'2026-06-11 16:07:21','none',0),(5,'Fernanda Lima','fernanda@modaluxo.com','$2b$10$/gbkYEwZUNd4Pjhnwxmui.P14yA6roRvBejNrsssEbNADlQ2OqYYy','',NULL,2026,0,'2026-06-11 16:07:21','none',0),(6,'Carolina Bassi','carolina@modaluxo.com','$2b$10$gb2ZoZeJMclcca6xOzxvEeqc73WwtuzgOLYIpl1cTEAkrzxc8ihze','',NULL,2026,0,'2026-06-11 16:19:47','none',0),(7,'Teste Review','teste.review.99@example.com','$2b$10$pKCQTHyeXN4Jmy2bb/nnT.QZhLgabBdQ10dYjQ7wmnSiMLbBaiwzi','',NULL,2026,0,'2026-06-11 16:45:30','none',0),(9,'Luan Alfredo Lugarini','brasilcampeao@gmail.com','$2b$10$/261H0qiKpSwmdJUcqFJguas4qXMxrLjb7T0AhHyW2ahHFaTOZdd6','',NULL,2026,0,'2026-06-11 17:29:54','pending',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'modaluxo'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-12 11:53:51
