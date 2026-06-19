const db = require("../config/db");

exports.createAuction = (req, res) => {

    const {
        title,
        description,
        starting_price,
        end_time
    } = req.body;

    const creator_id = req.user.id;

    const sql = `
    INSERT INTO auctions
    (
        title,
        description,
        starting_price,
        current_highest_bid,
        creator_id,
        end_time
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            description,
            starting_price,
            starting_price,
            creator_id,
            end_time
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
        "SELECT * FROM auctions",
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
        "SELECT * FROM auctions WHERE id=?",
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