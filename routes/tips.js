const express = require("express");
const router = express.Router();
const HealthTip = require("../models/HealthTip");

router.get("/", async (req, res) => {
    const tips = await HealthTip.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).send(tips);
});

module.exports = router;
