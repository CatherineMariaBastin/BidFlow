const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const auth = require("../middleware/authMiddleware");

router.get(
    "/",
    auth,
    profileController.getProfile
);

router.post(
    "/watchlist/:auctionId",
    auth,
    profileController.addToWatchlist
);

router.delete(
    "/watchlist/:auctionId",
    auth,
    profileController.removeFromWatchlist
);

module.exports = router;
