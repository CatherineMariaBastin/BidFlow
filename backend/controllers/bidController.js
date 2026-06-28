const {
    getAuctionBids,
    placeBid,
    toAuctionRoom
} = require("../services/auctionService");
const { createMessage } = require("../services/messageService");

const toUserRoom = (userId) => `user-${userId}`;

const notifyFraudDetection = async (io, fraudDetection) => {
    if (!fraudDetection) {
        return;
    }

    const notifications = [
        {
            userId: fraudDetection.bidderId,
            title: "Bid Blocked",
            body: fraudDetection.bidderMessage,
            event: "fraudBidBlocked"
        }
    ];

    if (String(fraudDetection.creatorId) !== String(fraudDetection.bidderId)) {
        notifications.push({
            userId: fraudDetection.creatorId,
            title: "Suspicious Bid Blocked",
            body: fraudDetection.creatorMessage,
            event: "fraudBidBlocked"
        });
    }

    for (const notification of notifications) {
        let savedMessage = null;

        try {
            savedMessage = await createMessage({
                userId: notification.userId,
                auctionId: fraudDetection.auctionId,
                title: notification.title,
                body: notification.body
            });
        } catch (error) {
            console.error("Fraud message save failed:", error.message);
        }

        if (io) {
            io.to(toUserRoom(notification.userId)).emit(
                notification.event,
                {
                    id: savedMessage ? savedMessage.id : null,
                    auctionId: fraudDetection.auctionId,
                    auctionTitle: fraudDetection.auctionTitle,
                    title: notification.title,
                    message: notification.body,
                    rule: fraudDetection.rule,
                    reason: fraudDetection.reason,
                    bidAmount: fraudDetection.bidAmount
                }
            );
        }
    }
};

exports.placeBid = async (req, res) => {

    const {
        auction_id,
        bid_amount
    } = req.body;

    const bidder_id = req.user.id;

    try {
        const result = await placeBid({
            auctionId: auction_id,
            bidderId: bidder_id,
            bidAmount: bid_amount
        });

        const io = req.app.get("io");

        if (io) {
            io.to(toAuctionRoom(auction_id)).emit(
                "newBid",
                result
            );
        }

        res.json({
            message: "Bid placed successfully",
            ...result
        });
    } catch (error) {
        await notifyFraudDetection(
            req.app.get("io"),
            error.fraudDetection
        );

        res.status(error.statusCode || 500).json({
            message: error.message,
            fraud: error.fraudDetection
                ? {
                    rule: error.fraudDetection.rule,
                    reason: error.fraudDetection.reason
                }
                : undefined
        });
    }
};

exports.getAuctionBids = async (req, res) => {

    try {
        const bids = await getAuctionBids(req.params.auctionId);
        res.json(bids);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.notifyFraudDetection = notifyFraudDetection;
