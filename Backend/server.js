const express = require("express");
const cors = require("cors");
const whatsappRoutes = require("./routes/whatsappRoutes");
const startWhatsApp = require("./config/baileys");
const crypto = require("crypto"); // ✅ FIX: Import crypto
global.crypto = crypto; // ✅ FIX: Assign it globally

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/whatsapp", whatsappRoutes);
app.get("/", (req, res) => res.send("🚀 Welcome to WhatsApp API"));

// Ensure WhatsApp session starts before the server runs
startWhatsApp()
    .then(() => {
        app.listen(5000, () => console.log("🚀 Server running on port 5000"));
    })
    .catch(err => {
        console.error("❌ Failed to initialize WhatsApp:", err.message);
        process.exit(1); // Exit process if WhatsApp session fails
    });
