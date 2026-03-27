CREATE DATABASE IF NOT EXISTS haupokemon_db;
USE haupokemon_db;

CREATE TABLE IF NOT EXISTS playerstbl (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monsterstbl (
    monster_id INT AUTO_INCREMENT PRIMARY KEY,
    monster_name VARCHAR(100) NOT NULL,
    monster_type VARCHAR(50) NOT NULL,
    spawn_latitude DECIMAL(10, 8) NOT NULL,
    spawn_longitude DECIMAL(11, 8) NOT NULL,
    spawn_radius_meters INT NOT NULL,
    picture_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS locationstbl (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    center_latitude DECIMAL(10, 8) NOT NULL,
    center_longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INT NOT NULL
);

CREATE TABLE IF NOT EXISTS monster_catchestbl (
    catch_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    monster_id INT NOT NULL,
    location_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    catch_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES playerstbl(player_id),
    FOREIGN KEY (monster_id) REFERENCES monsterstbl(monster_id),
    FOREIGN KEY (location_id) REFERENCES locationstbl(location_id)
);
