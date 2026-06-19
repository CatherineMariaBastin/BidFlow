const express = require("express");
const router = express.Router();

const bidController =
require("../controllers/bidController");

const auth =
require("../middleware/authMiddleware");

router.post(
    "/",
    auth,
    bidController.placeBid
);

router.get(
    "/:auctionId",
    bidController.getAuctionBids
);

module.exports = router;