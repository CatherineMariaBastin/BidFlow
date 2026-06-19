const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql =
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        db.query(
            sql,
            [username, email, hashedPassword],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Registration failed",
                        error: err.message
                    });
                }

                res.status(201).json({
                    message: "User registered successfully"
                });
            }
        );
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};