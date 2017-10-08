DROP DATABASE IF EXISTS `moodApp`;
CREATE DATABASE `moodApp`;

USE moodApp;

CREATE TABLE users (
	ID int NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(100),
    password VARCHAR(200),
    date DATE,
		createdAt DATE,
		updatedAt DATE,
    PRIMARY KEY (ID)
);
