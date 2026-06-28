const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../services/emailService");

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if email already exists
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: err.message,
                    });
                }

                if (results.length > 0) {
                    return res.status(400).json({
                        message: "Email already registered",
                    });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const verificationToken = crypto
                    .randomBytes(32)
                    .toString("hex");

                const sql = `
                    INSERT INTO users
                    (username, email, password, is_verified, verification_token)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        username,
                        email,
                        hashedPassword,
                        0,
                        verificationToken,
                    ],
                    async (err) => {
                        if (err) {
                            return res.status(500).json({
                                message: err.message,
                            });
                        }

                        const verificationLink =
                            `${process.env.CLIENT_URL}/verify/${verificationToken}`;

                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: "Verify your BidFlow account",
                            html: `
                                <h2>Welcome to BidFlow</h2>

                                <p>Please click the button below to verify your email.</p>

                                <a href="${verificationLink}">
                                    Verify Email
                                </a>
                            `,
                        });

                        res.status(201).json({
                            message:
                                "Registration successful. Please check your email to verify your account.",
                        });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({
            message: error.message,
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
            if (!user.is_verified) {
                return res.status(403).json({
                    message: "Please verify your email before logging in."
                });
            }

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


exports.verifyEmail = (req, res) => {
    const token = req.params.token;

    db.query(
        "SELECT id, is_verified FROM users WHERE verification_token = ?",
        [token],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            if (results.length === 0) {
                return res.status(400).json({
                    message: "Invalid or expired verification link."
                });
            }

            if (results[0].is_verified === 1) {
                return res.json({
                    message: "Email already verified."
                });
            }

            db.query(
                "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
                [results[0].id],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: err.message
                        });
                    }

                    res.json({
                        message: "Email verified successfully."
                    });
                }
            );
        }
    );
};