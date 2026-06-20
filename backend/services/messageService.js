const db = require("../config/db");

const promiseDb = db.promise();

const ensureMessagesTable = async () => {
    await promiseDb.query(
        `
        CREATE TABLE IF NOT EXISTS messages (
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
        )
        `
    );

    await promiseDb.query(
        "CREATE INDEX idx_messages_user_id ON messages(user_id)"
    ).catch((error) => {
        if (error.code !== "ER_DUP_KEYNAME") {
            throw error;
        }
    });
};

const createMessage = async ({
    userId,
    auctionId,
    title,
    body
}) => {
    await ensureMessagesTable();

    const [result] = await promiseDb.query(
        `
        INSERT INTO messages
        (
            user_id,
            auction_id,
            title,
            body
        )
        VALUES (?, ?, ?, ?)
        `,
        [userId, auctionId, title, body]
    );

    return {
        id: result.insertId,
        user_id: userId,
        auction_id: auctionId,
        title,
        body,
        is_read: 0,
        created_at: new Date()
    };
};

module.exports = {
    createMessage,
    ensureMessagesTable
};
