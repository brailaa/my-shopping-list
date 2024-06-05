CREATE DATABASE IF NOT EXISTS `shoppinglist`;
USE `shoppinglist`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`) USING BTREE
);
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `name` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`) USING BTREE,
  KEY `categoryId` (`categoryId`) USING BTREE,
  FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS `shopping_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `text` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `shopping_list_rows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `listId` int NOT NULL,
  `productId` int NOT NULL,
  `rowIndex` int NOT NULL,
  `quantity` tinyint UNSIGNED NOT NULL,
  `isChecked` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `prod_ind` (`productId`),
  KEY `list_ind` (`listId`),
  KEY `row_ind` (`rowIndex`),
  FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`listId`) REFERENCES `shopping_list` (`id`) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS `old_shopping_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `text` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `old_shopping_list_rows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `listId` int NOT NULL,
  `productId` int NOT NULL,
  `rowIndex` int NOT NULL,
  `quantity` tinyint UNSIGNED NOT NULL,
  `isChecked` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `prod_ind` (`productId`),
  INDEX `list_ind` (`listId`),
  INDEX `row_ind` (`rowIndex`),
  FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`listId`) REFERENCES `shopping_list` (`id`) ON DELETE RESTRICT
);