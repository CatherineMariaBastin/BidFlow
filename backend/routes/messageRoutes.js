const express = require("express");
const router = express.Router();

const messageController =
require("../controllers/messageController");

const auth =
require("../middleware/authMiddleware");

router.get(
    "/",
    auth,
    messageController.getMessages
);

router.patch(
    "/:id/read",
    auth,
    messageController.markAsRead
);

module.exports = router;
