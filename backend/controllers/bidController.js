const db = require("../config/db");

exports.placeBid = (req, res) => {

    const {
        auction_id,
        bid_amount
    } = req.body;

    const bidder_id = req.user.id;

    db.query(
        "SELECT * FROM auctions WHERE id=?",
        [auction_id],
        (err, results) => {

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Auction not found"
                });
            }

            const auction = results[0];

            if (
                bid_amount <=
                auction.current_highest_bid
            ) {
                return res.status(400).json({
                    message:
                    "Bid must be higher than current bid"
                });
            }

            db.query(
                `
                INSERT INTO bids
                (
                    auction_id,
                    bidder_id,
                    bid_amount
                )
                VALUES (?, ?, ?)
                `,
                [
                    auction_id,
                    bidder_id,
                    bid_amount
                ],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: err.message
                        });
                    }

                    db.query(
                        `
                        UPDATE auctions
                        SET current_highest_bid=?
                        WHERE id=?
                        `,
                        [
                            bid_amount,
                            auction_id
                        ]
                    );

                    res.json({
                        message:
                        "Bid placed successfully"
                    });
                }
            );
        }
    );
};

exports.getAuctionBids = (req, res) => {

    db.query(
        `
        SELECT *
        FROM bids
        WHERE auction_id=?
        ORDER BY bid_amount DESC
        `,
        [req.params.auctionId],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.json(results);
        }
    );
};