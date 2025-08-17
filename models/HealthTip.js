const mongoose = require("mongoose");

const HealthTipSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
        },
        details: {
            type: String,
        },
        category: {
            type: [String],
            default: [],
        },
        url: { type: String },
    },
    { timestamps: true }
);

const HealthTip =new mongoose.model("HealthTip", HealthTipSchema);

module.exports = HealthTip;
