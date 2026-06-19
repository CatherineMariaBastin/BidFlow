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

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid credentials"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.json({
                message: "Login successful",
                token
            });
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

