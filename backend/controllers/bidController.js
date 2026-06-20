const {
    getAuctionBids,
    placeBid,
    toAuctionRoom
} = require("../services/auctionService");

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
        res.status(error.statusCode || 500).json({
            message: error.message
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
