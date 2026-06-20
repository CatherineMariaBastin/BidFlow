const express = require("express");
const router = express.Router();

const auctionController =
require("../controllers/auctionController");

const auth =
require("../middleware/authMiddleware");

router.post(
    "/",
    auth,
    auctionController.createAuction
);

router.get(
    "/",
    auctionController.getAllAuctions
);

router.get(
    "/:id",
    auctionController.getAuctionById
);

router.delete(
    "/:id",
    auth,
    auctionController.deleteAuction
);

module.exports = router;
