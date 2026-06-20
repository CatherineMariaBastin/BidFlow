CREATE DATABASE auction_system;
USE auction_system;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE auctions (

    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(100) NOT NULL,

    description TEXT,

    starting_price DECIMAL(10,2) NOT NULL,

    current_highest_bid DECIMAL(10,2),

    creator_id INT NOT NULL,

    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,

    end_time DATETIME NOT NULL,

    status ENUM('ACTIVE','ENDED') DEFAULT 'ACTIVE',

    FOREIGN KEY (creator_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE TABLE bids (

    id INT AUTO_INCREMENT PRIMARY KEY,

    auction_id INT NOT NULL,

    bidder_id INT NOT NULL,

    bid_amount DECIMAL(10,2) NOT NULL,

    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (auction_id)
        REFERENCES auctions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (bidder_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE INDEX idx_auction_id
ON bids(auction_id);

CREATE INDEX idx_bidder_id
ON bids(bidder_id);

CREATE INDEX idx_status
ON auctions(status);INSERT INTO users(username,email,password)
VALUES
('john','john@gmail.com','password123'),
('alice','alice@gmail.com','password123'),
('bob','bob@gmail.com','password123');
INSERT INTO auctions
(
 title,
 description,
 starting_price,
 current_highest_bid,
 creator_id,
 end_time
)
VALUES
(
 'Gaming Laptop',
 'RTX 4060 Laptop',
 50000,
 50000,
 1,
 DATE_ADD(NOW(), INTERVAL 1 DAY)
);
INSERT INTO bids
(
 auction_id,
 bidder_id,
 bid_amount
)
VALUES
(
 1,
 2,
 55000
);
CREATE TABLE auction_participants (

    id INT AUTO_INCREMENT PRIMARY KEY,

    auction_id INT NOT NULL,

    user_id INT NOT NULL,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (auction_id)
        REFERENCES auctions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
ALTER TABLE auctions
ADD COLUMN winner_id INT NULL,
ADD CONSTRAINT fk_winner
FOREIGN KEY (winner_id)
REFERENCES users(id);

CREATE TABLE messages (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    auction_id INT NULL,

    title VARCHAR(120) NOT NULL,

    body TEXT NOT NULL,

    is_read TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (auction_id)
        REFERENCES auctions(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_messages_user_id
ON messages(user_id);
