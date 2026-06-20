const db = require("../config/db");
const { ensureMessagesTable } = require("../services/messageService");

const promiseDb = db.promise();

exports.getMessages = async (req, res) => {
    try {
        await ensureMessagesTable();

        const [messages] = await promiseDb.query(
            `
            SELECT
                messages.*,
                auctions.title AS auction_title
            FROM messages
            LEFT JOIN auctions ON auctions.id = messages.auction_id
            WHERE messages.user_id = ?
            ORDER BY messages.created_at DESC
            `,
            [req.user.id]
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await ensureMessagesTable();

        const [result] = await promiseDb.query(
            `
            UPDATE messages
            SET is_read = 1
            WHERE id = ? AND user_id = ?
            `,
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Message not found"
            });
        }

        res.json({
            message: "Message marked as read"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
