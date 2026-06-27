const db = require("../config/db");

const promiseDb = db.promise();

const auctionSelect = `
    auctions.*,
    winner.username AS winner_name,
    creator.username AS creator_name,
    creator.email AS creator_email
`;

const auctionJoins = `
    LEFT JOIN users AS winner ON winner.id = auctions.winner_id
    LEFT JOIN users AS creator ON creator.id = auctions.creator_id
`;

exports.getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const [[user]] = await promiseDb.query(
            "SELECT id, username, email, created_at FROM users WHERE id = ?",
            [userId]
        );

        const [myAuctions] = await promiseDb.query(
            `
            SELECT ${auctionSelect}
            FROM auctions
            ${auctionJoins}
            WHERE auctions.creator_id = ?
            ORDER BY auctions.start_time DESC
            `,
            [userId]
        );

        const [myBids] = await promiseDb.query(
            `
            SELECT
                ${auctionSelect},
                MAX(bids.bid_amount) AS my_highest_bid,
                COUNT(bids.id) AS my_bid_count
            FROM bids
            JOIN auctions ON auctions.id = bids.auction_id
            ${auctionJoins}
            WHERE bids.bidder_id = ?
            GROUP BY auctions.id
            ORDER BY MAX(bids.bid_time) DESC
            `,
            [userId]
        );

        const [wonAuctions] = await promiseDb.query(
            `
            SELECT ${auctionSelect}
            FROM auctions
            ${auctionJoins}
            WHERE auctions.winner_id = ?
            ORDER BY auctions.end_time DESC
            `,
            [userId]
        );

        const [lostAuctions] = await promiseDb.query(
            `
            SELECT DISTINCT ${auctionSelect}
            FROM bids
            JOIN auctions ON auctions.id = bids.auction_id
            ${auctionJoins}
            WHERE bids.bidder_id = ?
                AND auctions.status = 'ENDED'
                AND (
                    auctions.winner_id IS NULL
                    OR auctions.winner_id <> ?
                )
            ORDER BY auctions.end_time DESC
            `,
            [userId, userId]
        );

        const [watchlist] = await promiseDb.query(
            `
            SELECT ${auctionSelect}
            FROM auction_watchlist
            JOIN auctions ON auctions.id = auction_watchlist.auction_id
            ${auctionJoins}
            WHERE auction_watchlist.user_id = ?
            ORDER BY auction_watchlist.created_at DESC
            `,
            [userId]
        );

        res.json({
            user,
            myAuctions,
            myBids,
            wonAuctions,
            lostAuctions,
            watchlist
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.addToWatchlist = async (req, res) => {
    try {
        await promiseDb.query(
            `
            INSERT IGNORE INTO auction_watchlist (auction_id, user_id)
            VALUES (?, ?)
            `,
            [req.params.auctionId, req.user.id]
        );

        res.status(201).json({
            message: "Auction added to watchlist"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.removeFromWatchlist = async (req, res) => {
    try {
        await promiseDb.query(
            `
            DELETE FROM auction_watchlist
            WHERE auction_id = ? AND user_id = ?
            `,
            [req.params.auctionId, req.user.id]
        );

        res.json({
            message: "Auction removed from watchlist"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
