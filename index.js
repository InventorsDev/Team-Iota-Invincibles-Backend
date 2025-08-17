require("dotenv").config({ debug: true });
const express = require("express");
const tipRoutes = require("./routes/tips");
const { default: mongoose } = require("mongoose");
const syncHealthTips = require("./services/syncHealthTips");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1/tips", tipRoutes);

const startServer = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/naija_care`);
        console.log("Connected to MongoDB");

        const count = await mongoose.model("HealthTip").countDocuments();
        if (count === 0) {
            syncHealthTips();
        } else {
            console.log("Health tips already synced, skipping initial sync.");
        }
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
};

startServer();
