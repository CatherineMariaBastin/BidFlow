require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

// Database Connection
require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const bidRoutes = require("./routes/bidRoutes");
const messageRoutes = require("./routes/messageRoutes");
const {
    createMessage,
    ensureMessagesTable
} = require("./services/messageService");
const {
    endExpiredAuctions,
    placeBid,
    toAuctionRoom
} = require("./services/auctionService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.set("io", io);

const toUserRoom = (userId) => `user-${userId}`;

ensureMessagesTable().catch((error) => {
    console.error("Messages table setup failed:", error.message);
});

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("BidFlow Backend Running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/messages", messageRoutes);

io.on("connection", (socket) => {
    socket.on("authenticate", (token) => {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.join(toUserRoom(decoded.id));
        } catch (error) {
            socket.emit("authError", {
                message: "Invalid token"
            });
        }
    });

    socket.on("joinAuction", (auctionId) => {
        socket.join(toAuctionRoom(auctionId));
    });

    socket.on("leaveAuction", (auctionId) => {
        socket.leave(toAuctionRoom(auctionId));
    });

    socket.on("placeBid", async (payload, callback) => {
        try {
            const decoded = jwt.verify(
                payload.token,
                process.env.JWT_SECRET
            );

            const result = await placeBid({
                auctionId: payload.auction_id,
                bidderId: decoded.id,
                bidAmount: payload.bid_amount
            });

            io.to(toAuctionRoom(payload.auction_id)).emit(
                "newBid",
                result
            );

            if (callback) {
                callback({
                    ok: true,
                    ...result
                });
            }
        } catch (error) {
            if (callback) {
                callback({
                    ok: false,
                    message: error.message
                });
            }
        }
    });
});

const checkExpiredAuctions = async () => {
    try {
        const endedAuctions = await endExpiredAuctions();

        for (const auction of endedAuctions) {
            const {
                winner_id,
                ...auctionEndedPayload
            } = auction;

            io.to(toAuctionRoom(auction.auctionId)).emit(
                "auctionEnded",
                auctionEndedPayload
            );

            if (winner_id) {
                const winnerMessageText =
                    `Congratulations ${auction.winner}, you won "${auction.auctionTitle}" with a bid of Rs. ${auction.winning_bid}.`;
                let savedMessage = null;

                try {
                    savedMessage = await createMessage({
                        userId: winner_id,
                        auctionId: auction.auctionId,
                        title: "Auction Won",
                        body: winnerMessageText
                    });
                } catch (error) {
                    console.error("Winner message save failed:", error.message);
                }

                io.to(toUserRoom(winner_id)).emit(
                    "winnerMessage",
                    {
                        id: savedMessage ? savedMessage.id : null,
                        auctionId: auction.auctionId,
                        auctionTitle: auction.auctionTitle,
                        winner: auction.winner,
                        winning_bid: auction.winning_bid,
                        title: "Auction Won",
                        message: winnerMessageText
                    }
                );
            }
        }
    } catch (error) {
        console.error("Auction expiry check failed:", error.message);
    }
};

// Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

setInterval(checkExpiredAuctions, 10000);
