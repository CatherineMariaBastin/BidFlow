const db = require("../config/db");

exports.createAuction = (req, res) => {

    const {
        title,
        description,
        starting_price,
        end_time
    } = req.body;

    const creator_id = req.user.id;
    const imageUrl = req.file
        ? `/uploads/auctions/${req.file.filename}`
        : null;

    const sql = `
    INSERT INTO auctions
    (
        title,
        description,
        starting_price,
        current_highest_bid,
        creator_id,
        end_time,
        image_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            description,
            starting_price,
            starting_price,
            creator_id,
            end_time,
            imageUrl
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.status(201).json({
                message: "Auction created"
            });
        }
    );
};

exports.getAllAuctions = (req, res) => {

    db.query(
        `
        SELECT
            auctions.*,
            winner.username AS winner_name,
            creator.username AS creator_name,
            creator.email AS creator_email
        FROM auctions
        LEFT JOIN users AS winner ON winner.id = auctions.winner_id
        LEFT JOIN users AS creator ON creator.id = auctions.creator_id
        `,
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

exports.getAuctionById = (req, res) => {

    db.query(
        `
        SELECT
            auctions.*,
            winner.username AS winner_name,
            creator.username AS creator_name,
            creator.email AS creator_email
        FROM auctions
        LEFT JOIN users AS winner ON winner.id = auctions.winner_id
        LEFT JOIN users AS creator ON creator.id = auctions.creator_id
        WHERE auctions.id = ?
        `,
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.json(results[0]);
        }
    );
};

exports.deleteAuction = async (req, res) => {
    const auctionId = req.params.id;
    const userId = req.user.id;
    const promiseDb = db.promise();

    try {
        const [auctions] = await promiseDb.query(
            "SELECT * FROM auctions WHERE id = ?",
            [auctionId]
        );

        if (auctions.length === 0) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        const auction = auctions[0];

        if (String(auction.creator_id) !== String(userId)) {
            return res.status(403).json({
                message: "Only the auction creator can delete this auction"
            });
        }

        if (auction.status !== "ENDED") {
            return res.status(400).json({
                message: "Auction can be deleted only after it ends"
            });
        }

        await promiseDb.beginTransaction();

        try {
            await promiseDb.query(
                "DELETE FROM bids WHERE auction_id = ?",
                [auctionId]
            );

            await promiseDb.query(
                "DELETE FROM auctions WHERE id = ?",
                [auctionId]
            );

            await promiseDb.commit();
        } catch (error) {
            await promiseDb.rollback();
            throw error;
        }

        res.json({
            message: "Auction deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
