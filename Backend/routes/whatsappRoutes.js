const express = require("express");
const { checkNumbers } = require("../controllers/whatsappController");
const router = express.Router();

router.post("/check", checkNumbers);

module.exports = router;
