const db = require("../config/db");

const promiseDb = db.promise();

const toAuctionRoom = (auctionId) => `auction-${auctionId}`;

const getAuctionById = async (auctionId) => {
    const [rows] = await promiseDb.query(
        "SELECT * FROM auctions WHERE id = ?",
        [auctionId]
    );

    return rows[0] || null;
};

const getAuctionBids = async (auctionId) => {
    const [rows] = await promiseDb.query(
        `
        SELECT
            bids.*,
            users.username
        FROM bids
        JOIN users ON users.id = bids.bidder_id
        WHERE bids.auction_id = ?
        ORDER BY bids.bid_amount DESC
        `,
        [auctionId]
    );

    return rows;
};

const getTopBid = async (auctionId) => {
    const [rows] = await promiseDb.query(
        `
        SELECT bidder_id, bid_amount
        FROM bids
        WHERE auction_id = ?
        ORDER BY bid_amount DESC, bid_time ASC
        LIMIT 1
        `,
        [auctionId]
    );

    return rows[0] || null;
};

const endAuction = async (auctionId, auctionTitle = null) => {
    const topBid = await getTopBid(auctionId);

    await promiseDb.query(
        `
        UPDATE auctions
        SET status = 'ENDED', winner_id = ?
        WHERE id = ? AND status = 'ACTIVE'
        `,
        [topBid ? topBid.bidder_id : null, auctionId]
    );

    let winnerName = null;

    if (topBid) {
        const [users] = await promiseDb.query(
            "SELECT username FROM users WHERE id = ?",
            [topBid.bidder_id]
        );

        winnerName = users.length ? users[0].username : null;
    }

    return {
        auctionId,
        auctionTitle,
        winner_id: topBid ? topBid.bidder_id : null,
        winner: winnerName,
        winner_name: winnerName,
        winning_bid: topBid ? topBid.bid_amount : null
    };
};

const endExpiredAuctions = async () => {
    const [expiredAuctions] = await promiseDb.query(
        `
        SELECT id, title
        FROM auctions
        WHERE status = 'ACTIVE' AND end_time <= NOW()
        ORDER BY end_time ASC
        `
    );

    const endedAuctions = [];

    for (const auction of expiredAuctions) {
        const endedAuction = await endAuction(auction.id, auction.title);
        endedAuctions.push(endedAuction);
    }

    return endedAuctions;
};

const placeBid = async ({ auctionId, bidderId, bidAmount }) => {
    const parsedBid = Number(bidAmount);

    if (!Number.isFinite(parsedBid) || parsedBid <= 0) {
        const error = new Error("Bid amount must be a valid positive number");
        error.statusCode = 400;
        throw error;
    }

    await promiseDb.beginTransaction();

    try {
        const [auctions] = await promiseDb.query(
            "SELECT * FROM auctions WHERE id = ? FOR UPDATE",
            [auctionId]
        );

        if (auctions.length === 0) {
            const error = new Error("Auction not found");
            error.statusCode = 404;
            throw error;
        }

        const auction = auctions[0];

        if (auction.status !== "ACTIVE") {
            const error = new Error("Auction has ended");
            error.statusCode = 400;
            throw error;
        }

        if (new Date(auction.end_time).getTime() <= Date.now()) {
            const error = new Error("Auction time is over");
            error.statusCode = 400;
            throw error;
        }

        const currentHighestBid = Number(auction.current_highest_bid);

        if (parsedBid <= currentHighestBid) {
            const error = new Error("Bid must be higher than current bid");
            error.statusCode = 400;
            throw error;
        }

        const [result] = await promiseDb.query(
            `
            INSERT INTO bids
            (
                auction_id,
                bidder_id,
                bid_amount
            )
            VALUES (?, ?, ?)
            `,
            [auctionId, bidderId, parsedBid]
        );

        await promiseDb.query(
            `
            UPDATE auctions
            SET current_highest_bid = ?
            WHERE id = ?
            `,
            [parsedBid, auctionId]
        );

        await promiseDb.commit();

        return {
            bid: {
                id: result.insertId,
                auction_id: Number(auctionId),
                bidder_id: bidderId,
                bid_amount: parsedBid
            },
            current_highest_bid: parsedBid
        };
    } catch (error) {
        await promiseDb.rollback();
        throw error;
    }
};

module.exports = {
    endAuction,
    endExpiredAuctions,
    getAuctionBids,
    getAuctionById,
    placeBid,
    toAuctionRoom
};
