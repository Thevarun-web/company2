const startWhatsApp = require("../config/baileys");

let sock = null;

// ✅ FIX: Ensure WhatsApp starts before processing numbers
const initializeWhatsApp = async () => {
    try {
        sock = await startWhatsApp();
        console.log("✅ WhatsApp session initialized successfully!");
    } catch (error) {
        console.error("❌ Failed to initialize WhatsApp session:", error.message);
    }
};

initializeWhatsApp();

const checkNumbers = async (req, res) => {
    try {
        const { numbers } = req.body;
        if (!numbers || !Array.isArray(numbers)) {
            return res.status(400).json({ error: "Invalid input. Expected an array of numbers." });
        }

        if (!sock) {
            return res.status(500).json({ error: "WhatsApp session not initialized. Please try again later." });
        }

        let results = [];
        for (let number of numbers) {
            try {
                let exists = await sock.onWhatsApp(number);
                results.push({ number, isOnWhatsApp: exists?.length > 0 });
            } catch (error) {
                console.error(`❌ Error checking ${number}:`, error.message);
                results.push({ number, isOnWhatsApp: false });
            }
        }

        res.json(results);
    } catch (error) {
        console.error("❌ Server error in checkNumbers:", error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

module.exports = { checkNumbers };
